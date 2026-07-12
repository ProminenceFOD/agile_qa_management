import * as fs from 'fs';

// Read markdown
const markdown = fs.readFileSync('./AQMS_Documentation.md', 'utf-8');

// Convert to RTF with basic formatting
let rtf = '{\\rtf1\\ansi\\deff0\n';
rtf += '{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}}\n';
rtf += '{\\colortbl;\\red0\\green0\\blue0;\\red0\\green0\\blue255;}\n';
rtf += '\\viewkind4\\uc1\\pard\\f0\\fs22\n';

const lines = markdown.split('\n');

for (const line of lines) {
  if (line.startsWith('# ')) {
    // Heading 1
    rtf +=
      '\\fs36\\b ' +
      line.substring(2).replace(/[\\{}]/g, '\\$&') +
      '\\b0\\fs22\\par\\par\n';
  } else if (line.startsWith('## ')) {
    // Heading 2
    rtf +=
      '\\fs32\\b ' +
      line.substring(3).replace(/[\\{}]/g, '\\$&') +
      '\\b0\\fs22\\par\\par\n';
  } else if (line.startsWith('### ')) {
    // Heading 3
    rtf +=
      '\\fs28\\b ' +
      line.substring(4).replace(/[\\{}]/g, '\\$&') +
      '\\b0\\fs22\\par\n';
  } else if (line.startsWith('#### ')) {
    // Heading 4
    rtf +=
      '\\fs24\\b ' +
      line.substring(5).replace(/[\\{}]/g, '\\$&') +
      '\\b0\\fs22\\par\n';
  } else if (line.startsWith('- ') || line.startsWith('* ')) {
    // Bullet point
    rtf +=
      '\\tab\\bullet ' +
      line.substring(2).replace(/[\\{}]/g, '\\$&') +
      '\\par\n';
  } else if (line.match(/^\d+\. /)) {
    // Numbered list
    const text = line.replace(/^\d+\. /, '');
    rtf +=
      '\\tab ' +
      line.match(/^\d+/)?.[0] +
      '. ' +
      text.replace(/[\\{}]/g, '\\$&') +
      '\\par\n';
  } else if (line === '---') {
    // Horizontal rule
    rtf += '\\par\\qc________________________________________\\qj\\par\n';
  } else if (line.trim() !== '') {
    // Regular text - handle bold
    let text = line.replace(/[\\{}]/g, '\\$&');
    // Simple bold conversion
    text = text.replace(/\*\*(.+?)\*\*/g, '\\\\b $1\\\\b0');
    rtf += text + '\\par\n';
  } else {
    // Empty line
    rtf += '\\par\n';
  }
}

rtf += '}';

fs.writeFileSync('./AQMS_Documentation.rtf', rtf);
console.log('✅ RTF document created: AQMS_Documentation.rtf');
const stats = fs.statSync('./AQMS_Documentation.rtf');
console.log('📦 Size:', (stats.size / 1024).toFixed(2), 'KB');
console.log(
  '✅ This file will open in Microsoft Word, Google Docs, LibreOffice, etc.'
);
