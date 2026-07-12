import * as fs from 'fs';
import { marked } from 'marked';
import HTMLtoDOCX from 'html-to-docx';

// Read markdown file
const markdown = fs.readFileSync('./AQMS_Documentation.md', 'utf-8');

// Convert markdown to HTML
const html = marked(markdown);

// Convert HTML to DOCX
HTMLtoDOCX(html, null, {
  table: { row: { cantSplit: true } },
  footer: true,
  pageNumber: true,
  font: 'Arial',
  fontSize: 11,
  complexScriptFontSize: 11,
  header: true,
  margins: {
    top: 1440,
    right: 1440,
    bottom: 1440,
    left: 1440,
  },
})
  .then((docx: any) => {
    fs.writeFileSync('./AQMS_Documentation.docx', docx);
    console.log('✅ Word document created: AQMS_Documentation.docx');
    const stats = fs.statSync('./AQMS_Documentation.docx');
    console.log('📦 Size:', (stats.size / 1024).toFixed(2), 'KB');
  })
  .catch((error: any) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
