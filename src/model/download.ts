import { got } from 'got'
import { createWriteStream } from 'fs';
export const download = async (url, outputPath) => {
    const stream = createWriteStream(outputPath);
    got.stream(url).pipe(stream);
    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(`File downloaded: ${outputPath}`));
      stream.on('error', reject);
    });
  }