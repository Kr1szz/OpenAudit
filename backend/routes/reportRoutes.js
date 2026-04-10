const router = require('express').Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/:id/download', authenticate, reportController.downloadReport);
router.get('/:id/share-link', authenticate, reportController.createShareLink);
router.get('/:id/public/:token/download', reportController.downloadPublicReport);

module.exports = router;
