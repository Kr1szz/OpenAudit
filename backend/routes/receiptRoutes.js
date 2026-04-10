const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware.js");
const { uploadReceipt, getAllReceipts } = require("../controllers/receiptController.js");
const upload = require("../middleware/upload.js"); // make sure this exists

router.post("/upload", authenticate, upload.single("receipt"), uploadReceipt);
router.get("/receipts", authenticate, getAllReceipts);

module.exports = router;