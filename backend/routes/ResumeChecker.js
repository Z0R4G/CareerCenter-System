const express = require('express');
const multer = require('multer');
const router = express.Router();

const { uploadresume, getmyresume } = require('../controllers/ResumeCheckerController');

// Configure Multer (RAM Storage)
const upload = multer({ storage: multer.memoryStorage() });

// Define the route
// 1. Path: /uploadresume
// 2. Middleware: upload.single('myFile') -> Processes the file
// 3. Controller: uploadresume -> Handles the logic
router.post('/uploadresume/:student_id', upload.single('file'), uploadresume);
router.get('/getmyresume/:student_id', getmyresume);
router.get('/getmyserume/:student_id', getmyresume);
module.exports = router;