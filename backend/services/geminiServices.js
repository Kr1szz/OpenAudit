const fs = require('fs').promises;
const path = require('path');
const { GoogleGenAI } = require("@google/genai");
const { Mistral } = require('@mistralai/mistralai');
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function processReceipt(base64, mimeType, fileUrl = null) {
  try {
    let documentParam;
    if (fileUrl) {
      console.log(`[Mistral OCR] Using direct Cloudinary URL: ${fileUrl}`);
      documentParam = { type: "document_url", documentUrl: fileUrl };
    } else {
      console.log(`[Mistral OCR] Using base64 data URI wrapper`);
      const dataUrl = `data:${mimeType};base64,${base64}`;
      documentParam = { type: "document_url", documentUrl: dataUrl };
    }

    const response = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: documentParam
    });
    
    return response.pages.map(p => p.markdown).join('\n\n');
  } catch (err) {
    console.error(`[Mistral OCR Error]`, err);
    throw new Error(`Mistral OCR failed: ${err.message}`);
  }
}

const MODEL_ENV_VAR = 'GEMINI_MODEL';
const ALLOWED_CATEGORIES = new Set(['food', 'travel', 'office', 'medical', 'utilities', 'entertainment', 'other']);

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    case '.tiff':
    case '.tif':
      return 'image/tiff';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'image/*';
  }
}

function cleanInlineJson(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('No response text available to parse');
  }

  let cleaned = text.trim();
  cleaned = cleaned.replace(/```(?:json)?\s*/gi, '');
  cleaned = cleaned.replace(/```/g, '');
  cleaned = cleaned.replace(/^>\s?/gm, '');
  cleaned = cleaned.replace(/\r\n/g, '\n');

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  return cleaned.trim();
}

function parseJsonSafely(text) {
  const cleaned = cleanInlineJson(text);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const message = `Invalid JSON from Gemini response. Raw text: ${cleaned}`;
    const error = new Error(message);
    error.original = err;
    throw error;
  }
}

function maybeNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
}

function normalizeText(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function assertReceiptShape(receipt) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    throw new Error('Parsed receipt is not a valid object');
  }

  const vendor = normalizeText(receipt.vendor);
  const amount = maybeNumber(receipt.amount);
  const currency = normalizeText(receipt.currency).toUpperCase();
  const receipt_date = normalizeText(receipt.receipt_date);
  const timestamp = normalizeText(receipt.timestamp);
  const category = normalizeText(receipt.category).toLowerCase();
  const confidence_score = maybeNumber(receipt.confidence_score);

  // if (!vendor) {
  //   throw new Error('Missing or invalid vendor');
  // }
  // if (amount === null) {
  //   throw new Error('Missing or invalid amount');
  // }
  // if (currency !== 'INR') {
  //   throw new Error('Currency must be INR');
  // }
  // if (!/^\d{4}-\d{2}-\d{2}$/.test(receipt_date)) {
  //   throw new Error('receipt_date must be in YYYY-MM-DD format');
  // }
  // if (!ALLOWED_CATEGORIES.has(category)) {
  //   throw new Error(`category must be one of: ${Array.from(ALLOWED_CATEGORIES).join(', ')}`);
  // }
  // if (confidence_score === null) {
  //   throw new Error('Missing or invalid confidence_score');
  // }

  // if (!Array.isArray(receipt.items)) {
  //   throw new Error('Missing or invalid items array');
  // }

  const items = receipt.items.map((item, index) => {
    const name = normalizeText(item.name);
    const quantity = maybeNumber(item.quantity);
    const price = maybeNumber(item.price);
    return { name, quantity, price };
  });

  //   if (!name) {
  //     throw new Error(`Item at index ${index} is missing a name`);
  //   }
  //   if (quantity === null) {
  //     throw new Error(`Item at index ${index} has invalid quantity`);
  //   }
  //   if (price === null) {
  //     throw new Error(`Item at index ${index} has invalid price`);
  //   }

  return {
    vendor,
    amount,
    currency,
    receipt_date,
    timestamp,
    category,
    items,
    confidence_score,
  };
}

function extractTextFromResponse(response) {
  if (!response) {
    return '';
  }

  if (typeof response === 'string') {
    return response;
  }

  if (typeof response.outputText === 'string' && response.outputText.trim()) {
    return response.outputText;
  }

  if (Array.isArray(response.output)) {
    for (const output of response.output) {
      if (typeof output.text === 'string' && output.text.trim()) {
        return output.text;
      }
      if (Array.isArray(output.content)) {
        for (const content of output.content) {
          if (typeof content.text === 'string' && content.text.trim()) {
            return content.text;
          }
        }
      }
    }
  }

  if (Array.isArray(response.candidates)) {
    for (const candidate of response.candidates) {
      if (typeof candidate.outputText === 'string' && candidate.outputText.trim()) {
        return candidate.outputText;
      }
      if (Array.isArray(candidate.content)) {
        for (const content of candidate.content) {
          if (typeof content.text === 'string' && content.text.trim()) {
            return content.text;
          }
        }
      }
    }
  }

  if (response?.result?.[0]?.content?.[0]?.text) {
    return response.result[0].content[0].text;
  }

  return JSON.stringify(response);
}

async function parseReceipt(filePath, mimeTypeOverride = null) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('filePath must be a non-empty string');
  }

  let fileBuffer;
  try {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const resp = await fetch(filePath);
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      fileBuffer = Buffer.from(await resp.arrayBuffer());
    } else {
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      fileBuffer = await fs.readFile(absolutePath);
    }
  } catch (err) {
    throw new Error(`Unable to read file at ${filePath}: ${err.message}`);
  }

  const mimeType = mimeTypeOverride || getMimeType(filePath);
  const base64 = fileBuffer.toString('base64');

  const fileUrlToPass = (filePath.startsWith('http://') || filePath.startsWith('https://')) ? filePath : null;

  // Step 1: Use Mistral OCR to extract Markdown from the document/image
  console.log('Sending file to Mistral OCR...');
  let mistralMarkdown = "";
  try {
    mistralMarkdown = await processReceipt(base64, mimeType, fileUrlToPass);
    console.log('Mistral OCR successfully extracted text.');
  } catch (err) {
    console.warn('Mistral OCR failed. Falling back to Gemini direct analysis without Mistral OCR context.', err.message);
  }

  const basePrompt = `You are an expert receipt parser. Extract data from the attached receipt document.

CRITICAL RULES:
1. CURRENCY CONVERSION: If the receipt amount is in any currency other than INR (e.g. USD, EUR, GBP, AED, etc.), you MUST convert it to Indian Rupees (INR) using approximate current exchange rates. For example: $10 USD ≈ 840 INR, €10 EUR ≈ 920 INR, £10 GBP ≈ 1060 INR. Always return the converted INR value in the "amount" field.
2. The "currency" field must ALWAYS be "INR" regardless of the original currency on the receipt.
3. The "receipt_date" must be in "YYYY-MM-DD" format regardless of how it appears on the receipt. If missing, return "".
4. Item prices must also be converted to INR.

Return this exact JSON shape:
{
  "vendor": "string",
  "amount": number,
  "currency": "INR",
  "receipt_date": "YYYY-MM-DD",
  "timestamp": "HH:MM:SS",
  "category": "food/travel/office/medical/utilities/entertainment/other",
  "items": [
    { "name": "string", "quantity": number, "price": number }
  ],
  "confidence_score": number
}`;

  const prompt = mistralMarkdown 
    ? `${basePrompt}\n\nAdditionally, here is an OCR extraction from Mistral. The text may have errors. Use the attached raw image to correct any handwriting missed by OCR.\n\nAnalyze the following Mistral OCR data AND the attached image, then return ONLY the JSON object:\n---\n${mistralMarkdown}\n---`
    : `${basePrompt}\n\nAnalyze the attached document directly, then return ONLY the JSON object.`;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: "v1"   // 🔥 THIS FIXES EVERYTHING
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // We use flash instead of flash-lite for better multimodal handwriting reasoning
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64,
              mimeType,
            },
          },
        ],
      },
    ],
  });

  const responseText = response.text;
  console.log('Raw response from Gemini:', JSON.stringify(response, null, 2));
  const parsed = parseJsonSafely(responseText);
  
  return assertReceiptShape(parsed);
}

async function runReceiptParseTest() {
  try {
    const samplePath = './uploads/sample.jpg';
    const result = await parseReceipt(samplePath);
    console.log('Receipt parse result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Receipt parse test failed:', err.message || err);
  }
}

module.exports = {
  parseReceipt,
};

if (require.main === module) {
  runReceiptParseTest();
}