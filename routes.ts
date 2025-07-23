import type { Express } from "express";
import { createServer, type Server } from "http";
import { default as multer } from 'multer';
import { db } from "@db";
import { convertedSongs } from "@db/schema";
import path from "path";
import fs from "fs";
import express from 'express';
import { eq } from "drizzle-orm";
import { AudioProcessor } from "../client/src/lib/audio-processor";
import { execSync } from 'child_process';
import { tmpdir } from 'os';
import fetch from 'node-fetch'; // Added import for fetch API
import subscriptionRoutes from './routes/subscription';

// Ensure directories exist with proper permissions
const uploadsDir = path.join(process.cwd(), 'uploads');
const convertedDir = path.join(uploadsDir, 'converted');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
  }
  if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir, { recursive: true, mode: 0o755 });
  }
} catch (error) {
  console.error('Error creating directories:', error);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `song-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'audio/mpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export function registerRoutes(app: Express): Server {
  app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === '.mp3') {
        res.set('Content-Type', 'audio/mpeg');
      }
    }
  }));

  app.use('/uploads/converted', express.static(convertedDir, {
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === '.mp3') {
        res.set('Content-Type', 'audio/mpeg');
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET');
      }
    }
  }));

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const targetGender = req.body.targetGender || 'female';

    try {
      const song = await db.insert(convertedSongs).values({
        originalName: req.file.originalname,
        filePath: req.file.path,
        status: 'processing',
        convertedUrl: null
      }).returning();

      try {
        console.log('Starting audio conversion...', { songId: song[0].id });
        const processor = new AudioProcessor();
        const inputPath = req.file.path;

        console.log('Processing audio...', { songId: song[0].id, inputPath });
        const outputPath = await processor.processVoice(inputPath, targetGender);
        console.log('Audio processed successfully', { songId: song[0].id, outputPath });

        const convertedUrl = `/uploads/converted/converted-${path.basename(req.file.path)}`;
        await db.update(convertedSongs)
          .set({
            convertedUrl,
            status: 'completed'
          })
          .where(eq(convertedSongs.id, song[0].id));

        console.log('Conversion completed successfully', { songId: song[0].id, convertedUrl });
        res.json({ ...song[0], convertedUrl });
      } catch (error) {
        console.error('Conversion error:', error, { songId: song[0].id });
        await db.update(convertedSongs)
          .set({ status: 'failed' })
          .where(eq(convertedSongs.id, song[0].id));

        res.status(500).json({ message: 'Error processing audio file' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Error processing file' });
    }
  });

  app.get('/api/converted-songs', async (_req, res) => {
    try {
      const songs = await db.select()
        .from(convertedSongs)
        .orderBy(convertedSongs.createdAt);
      res.json(songs);
    } catch (error) {
      console.error('Fetch songs error:', error);
      res.status(500).json({ message: 'Error fetching songs' });
    }
  });

  // Updated delete endpoint with better error handling and logging
  app.delete('/api/converted-songs/:id', async (req, res) => {
    const songId = parseInt(req.params.id);
    console.log('Delete request received for song:', { songId });

    try {
      const song = await db.select()
        .from(convertedSongs)
        .where(eq(convertedSongs.id, songId))
        .limit(1);

      if (song.length === 0) {
        console.log('Song not found:', { songId });
        return res.status(404).json({ message: 'Song not found' });
      }

      const songData = song[0];
      console.log('Found song to delete:', { songId, songData });

      // Delete original file
      if (songData.filePath && fs.existsSync(songData.filePath)) {
        try {
          fs.unlinkSync(songData.filePath);
          console.log('Original file deleted:', { filePath: songData.filePath });
        } catch (error) {
          console.error('Error deleting original file:', error);
        }
      }

      // Delete converted file
      if (songData.convertedUrl) {
        const convertedPath = path.join(process.cwd(), songData.convertedUrl.replace(/^\/uploads/, 'uploads'));
        if (fs.existsSync(convertedPath)) {
          try {
            fs.unlinkSync(convertedPath);
            console.log('Converted file deleted:', { convertedPath });
          } catch (error) {
            console.error('Error deleting converted file:', error);
          }
        }
      }

      // Delete from database
      await db.delete(convertedSongs)
        .where(eq(convertedSongs.id, songId));
      console.log('Database record deleted:', { songId });

      res.json({ message: 'Song deleted successfully' });
    } catch (error) {
      console.error('Delete song error:', error);
      res.status(500).json({
        message: 'Error deleting song',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // New endpoint for speed-adjusted downloads
  app.get('/api/download/:id/:speed', async (req, res) => {
    const songId = parseInt(req.params.id);
    const speed = parseFloat(req.params.speed);

    if (isNaN(speed) || speed <= 0 || speed > 2) {
      return res.status(400).json({ message: 'Invalid speed parameter' });
    }

    try {
      const song = await db.select()
        .from(convertedSongs)
        .where(eq(convertedSongs.id, songId))
        .limit(1);

      if (song.length === 0) {
        return res.status(404).json({ message: 'Song not found' });
      }

      const inputPath = path.join(process.cwd(), song[0].convertedUrl.replace(/^\/uploads/, 'uploads'));
      if (!fs.existsSync(inputPath)) {
        return res.status(404).json({ message: 'Audio file not found' });
      }

      // Create a temporary file for the speed-adjusted version
      const tempDir = tmpdir();
      const outputFileName = `speed_adjusted_${Date.now()}.mp3`;
      const outputPath = path.join(tempDir, outputFileName);

      try {
        // Use FFmpeg to adjust the speed
        execSync(`ffmpeg -y -i "${inputPath}" -filter:a "atempo=${speed}" -vn "${outputPath}"`);

        // Set headers for download
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);

        // Stream the file
        const stream = fs.createReadStream(outputPath);
        stream.pipe(res);

        // Clean up the temporary file after streaming
        stream.on('end', () => {
          fs.unlink(outputPath, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });
        });
      } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({ message: 'Error processing audio file' });
      }
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Error downloading file' });
    }
  });

  // Register subscription routes
  app.use(subscriptionRoutes);


  // Add new license verification endpoint
  app.post('/api/verify-license', async (req, res) => {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ message: 'License key is required' });
    }

    try {
      // Make a request to Gumroad's API to verify the license
      const verifyUrl = `https://api.gumroad.com/v2/licenses/verify`;
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_permalink: 'tfclja',
          license_key: licenseKey,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return res.status(400).json({ message: 'Invalid license key' });
      }

      // If license is valid, return success
      res.json({
        success: true,
        message: 'License verified successfully'
      });
    } catch (error) {
      console.error('License verification error:', error);
      res.status(500).json({
        message: 'Error verifying license',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}