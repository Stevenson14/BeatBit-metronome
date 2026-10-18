import JSZip from 'jszip';
import { SOURCE_FILES } from '../data/sourceBundle';

/**
 * Generates and downloads a complete, valid ZIP archive of all BeatBit source code
 * directly inside the browser using JSZip and Blob URL.
 * 
 * This avoids iframe download sandboxing issues, 0-byte downloads, or missing directory
 * headers that cause Windows/Mac to report "empty archive".
 */
export async function downloadSourceZip(): Promise<boolean> {
  try {
    const zip = new JSZip();

    // Add each file to the zip archive preserving folder structure
    for (const [filePath, content] of Object.entries(SOURCE_FILES)) {
      zip.file(filePath, content);
    }

    // Generate valid zip blob with DEFLATE compression
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6,
      },
    });

    // Create safe Blob download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'beatbit-metronome-source.zip';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);

    return true;
  } catch (error) {
    console.error('Failed to generate source zip with JSZip:', error);
    // Fallback: try direct public URL download
    try {
      const fallbackLink = document.createElement('a');
      fallbackLink.href = '/beatbit-metronome-source.zip';
      fallbackLink.download = 'beatbit-metronome-source.zip';
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      setTimeout(() => document.body.removeChild(fallbackLink), 1500);
      return true;
    } catch {
      return false;
    }
  }
}
