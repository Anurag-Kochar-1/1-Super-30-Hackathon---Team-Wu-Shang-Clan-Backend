import express, { Request, Response } from 'express';
import multer from 'multer';
import { createClient } from '@deepgram/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express router
const router = express.Router();

// Configure Deepgram client
const deepgramApiKey = process.env.DEEPGRAM_API_KEY || '';
if (!deepgramApiKey) {
  console.error('DEEPGRAM_API_KEY is not set in environment variables');
  process.exit(1);
}

const deepgram = createClient(deepgramApiKey);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    console.log(uploadDir)
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Create upload middleware that accepts audio files
const upload = multer({
  storage,
  // fileFilter: (req, file, cb) => {
  //   if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/webm') {
  //     cb(null, true);
  //   } else {
  //     cb(new Error('Only WAV files are allowed'));
  //   }
  // }
});

/**
 * @route POST /api/transcribe
 * @desc Transcribe WAV audio file to text using Deepgram
 * @access Public
 */
router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.log(req.file)
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const filePath = req.file.path;

    // Read file as buffer
    const audioBuffer = fs.readFileSync(filePath);
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    );


    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      // Try with explicit Buffer typing
      Buffer.from(arrayBuffer),
      {
        model: 'nova-3',
        language: 'en',
        smart_format: true,
        punctuate: true,
        diarize: true,
        mimetype: req.file.mimetype  
      }
    );

    // Clean up - delete the file after processing
    fs.unlinkSync(filePath);

    if (error) {
      console.error('Deepgram transcription error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error during transcription',
        details: error.message
      });
    }

    // Return the transcription result
    return res.status(200).json({
      success: true,
      transcription: result.results?.channels[0]?.alternatives[0]?.transcript || '',
      confidence: result.results?.channels[0]?.alternatives[0]?.confidence || 0,
      fullResponse: result
    });
  } catch (error) {
    console.error('Error during transcription:', error);

    return res.status(500).json({
      success: false,
      error: 'Error processing audio file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;