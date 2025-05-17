const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const fileController = require('../controllers/fileController');

// Protected routes that require authentication
router.post('/upload', auth, fileController.uploadImage);
router.get('/images', auth, fileController.getImages);
router.delete('/images/:filename', auth, fileController.deleteImage);

module.exports = router; 