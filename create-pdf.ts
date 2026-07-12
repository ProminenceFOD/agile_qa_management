import * as fs from 'fs';
import { jsPDF } from 'jspdf';

// Read markdown
const markdown = fs.readFileSync('./AQMS_Complete_Documentation.md', 'utf-8');
const lines = markdown.split('\n');

// Create PDF
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

let y = 20;
const pageHeight = 280;
const margin = 20;
const maxWidth = 170;

for (const line of lines) {
  // Check if we need a new page
  if (y > pageHeight) {
    doc.addPage();
    y = 20;
  }

  if (line.startsWith('# ')) {
    // Heading 1
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const text = line.substring(2);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 10 + 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
  } else if (line.startsWith('## ')) {
    // Heading 2
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const text = line.substring(3);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 8 + 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
  } else if (line.startsWith('### ')) {
    // Heading 3
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const text = line.substring(4);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 7 + 3;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
  } else if (line.startsWith('#### ')) {
    // Heading 4
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const text = line.substring(5);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 6 + 2;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
  } else if (line.startsWith('- ') || line.startsWith('* ')) {
    // Bullet point
    doc.setFont('helvetica', 'normal');
    const text = '• ' + line.substring(2);
    const lines = doc.splitTextToSize(text, maxWidth - 5);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5 + 2;
  } else if (line.match(/^\d+\. /)) {
    // Numbered list
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(line, maxWidth - 5);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5 + 2;
  } else if (line === '---') {
    // Horizontal rule
    y += 3;
    doc.line(margin, y, margin + maxWidth, y);
    y += 5;
  } else if (line.trim() !== '') {
    // Regular text
    doc.setFont('helvetica', 'normal');
    // Remove markdown formatting
    let text = line.replace(/\*\*(.+?)\*\*/g, '$1'); // Bold
    text = text.replace(/`(.+?)`/g, '$1'); // Code
    text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1'); // Links

    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 1;
  } else {
    // Empty line
    y += 4;
  }
}

// Save PDF
doc.save('AQMS_Complete_Documentation.pdf');
console.log('✅ PDF created: AQMS_Complete_Documentation.pdf');
const buffer = doc.output('arraybuffer');
fs.writeFileSync('./AQMS_Complete_Documentation.pdf', Buffer.from(buffer));
const stats = fs.statSync('./AQMS_Complete_Documentation.pdf');
console.log('📦 Size:', (stats.size / 1024).toFixed(2), 'KB');
