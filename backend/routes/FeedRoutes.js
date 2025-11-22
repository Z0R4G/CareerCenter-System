const express = require('express');
const multer = require('multer');
const router = express.Router();

const { uploadPost, getPosts } = require('../controllers/FeedController');

// Configure Multer (RAM Storage)
const upload = multer({ storage: multer.memoryStorage() });

// Define the route
// 1. Path: /upload
// 2. Middleware: upload.single('myFile') -> Processes the file
// 3. Controller: uploadImage -> Handles the logic
router.post('/uploadpost', upload.single('file'), uploadPost);
router.get('/posts', getPosts);

module.exports = router;