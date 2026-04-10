const router = require('express').Router();
const taxController = require('../controllers/taxController');
const { authenticate } = require('../middleware/authMiddleware');
router.post('/calculate', authenticate, taxController.calculateTax);
router.post('/save', authenticate, taxController.saveTax);
router.get('/history', authenticate, taxController.getHistory);
router.delete('/history/:id', authenticate, taxController.deleteTax);
router.delete('/history', authenticate, taxController.clearHistory);
module.exports = router;