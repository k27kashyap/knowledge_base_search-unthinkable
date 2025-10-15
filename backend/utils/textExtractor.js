import fs from 'fs/promises';

export async function extractText(filePath, fileType) {
  try {
    if (fileType === 'txt') {
      return await fs.readFile(filePath, 'utf-8');
    }
    
    if (fileType === 'pdf') {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const dataBuffer = await fs.readFile(filePath);
      const uint8Array = new Uint8Array(dataBuffer);
      
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
      });
      
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      let fullText = '';
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    }
    
    throw new Error('Unsupported file type');
  } catch (error) {
    throw new Error(`Error extracting text: ${error.message}`);
  }
}

export function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
  }
  
  return chunks;
}