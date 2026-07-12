import * as fs from 'fs';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

// Read the markdown file
const markdownContent = fs.readFileSync('./AQMS_Documentation.md', 'utf-8');

// Split by lines for processing
const lines = markdownContent.split('\n');

const docElements: any[] = [];
let inCodeBlock = false;
let codeBlockContent: string[] = [];

lines.forEach((line: string, index: number) => {
  // Handle code blocks
  if (line.startsWith('```')) {
    if (inCodeBlock) {
      // End of code block
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeBlockContent.join('\n'),
              font: 'Courier New',
              size: 20,
            }),
          ],
          spacing: { before: 200, after: 200 },
        })
      );
      codeBlockContent = [];
      inCodeBlock = false;
    } else {
      // Start of code block
      inCodeBlock = true;
    }
    return;
  }

  if (inCodeBlock) {
    codeBlockContent.push(line);
    return;
  }

  // Handle headings
  if (line.startsWith('# ')) {
    docElements.push(
      new Paragraph({
        text: line.substring(2),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );
  } else if (line.startsWith('## ')) {
    docElements.push(
      new Paragraph({
        text: line.substring(3),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );
  } else if (line.startsWith('### ')) {
    docElements.push(
      new Paragraph({
        text: line.substring(4),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      })
    );
  } else if (line.startsWith('#### ')) {
    docElements.push(
      new Paragraph({
        text: line.substring(5),
        heading: HeadingLevel.HEADING_4,
        spacing: { before: 150, after: 100 },
      })
    );
  }
  // Handle bold text
  else if (line.includes('**')) {
    const parts = line.split('**');
    const children = parts.map((part: string, i: number) => {
      if (i % 2 === 1) {
        return new TextRun({ text: part, bold: true });
      }
      return new TextRun({ text: part });
    });
    docElements.push(
      new Paragraph({
        children,
        spacing: { after: 100 },
      })
    );
  }
  // Handle bullet lists
  else if (line.startsWith('- ') || line.startsWith('* ')) {
    docElements.push(
      new Paragraph({
        text: line.substring(2),
        bullet: { level: 0 },
        spacing: { after: 50 },
      })
    );
  }
  // Handle numbered lists
  else if (/^\d+\.\s/.test(line)) {
    const text = line.replace(/^\d+\.\s/, '');
    docElements.push(
      new Paragraph({
        text: text,
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { after: 50 },
      })
    );
  }
  // Handle horizontal rules
  else if (line === '---') {
    docElements.push(
      new Paragraph({
        text: '________________________________________',
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      })
    );
  }
  // Regular paragraphs
  else if (line.trim() !== '') {
    // Remove markdown links but keep text
    let cleanLine = line.replace(/\[([^\]]+)\]([^)]+)\)/g, '$1');
    // Remove inline code backticks
    cleanLine = cleanLine.replace(/`([^`]+)`/g, '$1');

    docElements.push(
      new Paragraph({
        text: cleanLine,
        spacing: { after: 100 },
      })
    );
  } else {
    // Empty line for spacing
    docElements.push(new Paragraph({ text: '' }));
  }
});

// Create the document
const doc = new Document({
  sections: [
    {
      properties: {},
      children: docElements,
    },
  ],
  numbering: {
    config: [
      {
        reference: 'default-numbering',
        levels: [
          {
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: AlignmentType.LEFT,
          },
        ],
      },
    ],
  },
});

// Generate and save the document
Packer.toBuffer(doc)
  .then((buffer: Buffer) => {
    fs.writeFileSync('./AQMS_Documentation.docx', buffer);
    console.log('✅ Document created successfully: AQMS_Documentation.docx');
    console.log(
      '📄 File location: /workspaces/default/code/AQMS_Documentation.docx'
    );
    console.log('📦 File size:', (buffer.length / 1024).toFixed(2), 'KB');
  })
  .catch((error: Error) => {
    console.error('❌ Error creating document:', error);
    process.exit(1);
  });
