const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware.js");
const { uploadReceipt, getAllReceipts, deleteReceipt } = require("../controllers/receiptController.js");
const upload = require("../middleware/upload.js"); // make sure this exists

router.post("/upload", authenticate, upload.single("receipt"), uploadReceipt);
router.get("/receipts", authenticate, getAllReceipts);
router.delete("/receipts/:id", authenticate, deleteReceipt);

module.exports = router;