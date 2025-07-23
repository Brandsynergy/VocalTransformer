import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class AudioProcessor {
  async processVoice(inputPath: string, targetGender: 'male' | 'female'): Promise<string> {
    // Ensure the converted directory exists
    const convertedDir = path.join(path.dirname(inputPath), 'converted');
    try {
      if (!fs.existsSync(convertedDir)) {
        fs.mkdirSync(convertedDir, { recursive: true, mode: 0o755 });
      }
    } catch (error) {
      console.error('Error creating converted directory:', error);
      throw new Error('Failed to create output directory');
    }

    const outputPath = path.join(
      convertedDir,
      `converted-${path.basename(inputPath)}`
    );

    try {
      // Use FFmpeg with asetrate for pitch shifting
      // Female voice: increase pitch by making audio play faster, then resample back to original rate
      // Male voice: decrease pitch by making audio play slower, then resample back to original rate
      const pitchFactor = targetGender === 'female' ? 1.3 : 0.7;

      const command = `ffmpeg -y -i "${inputPath}" -af "asetrate=44100*${pitchFactor},aresample=44100" -acodec libmp3lame -q:a 2 "${outputPath}"`;

      console.log('Executing FFmpeg command:', command);
      const { stdout, stderr } = await execAsync(command);
      console.log('FFmpeg stdout:', stdout);
      console.log('FFmpeg stderr:', stderr);

      if (!fs.existsSync(outputPath)) {
        throw new Error('Output file was not created');
      }

      return outputPath;
    } catch (error) {
      console.error('FFmpeg processing error:', error);
      throw new Error('Failed to process audio');
    }
  }
}