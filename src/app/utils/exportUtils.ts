export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const cell = row[header];
          // Handle arrays, objects, and special characters
          if (Array.isArray(cell)) {
            return `"${cell.join('; ')}"`;
          }
          if (typeof cell === 'object' && cell !== null) {
            return `"${JSON.stringify(cell)}"`;
          }
          if (
            typeof cell === 'string' &&
            (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
          ) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell ?? '';
        })
        .join(',')
    ),
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (
  data: Record<string, unknown>[],
  filename: string,
  title: string
) => {
  // Simple HTML table to PDF conversion
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f4f4f4; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              ${Object.keys(data[0] || {})
                .map((key) => `<th>${key}</th>`)
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${Object.values(row)
                  .map(
                    (value) => `
                  <td>${Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : (value ?? '')}</td>
                `
                  )
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

export const prepareStoryDataForExport = (stories: Record<string, unknown>[]) => {
  return stories.map((story) => ({
    'Story ID': story.id,
    Title: story.title,
    Priority: story.priority,
    Points: story.storyPoints || '',
    Sprint: story.sprint || '',
    Developer: story.assignedDeveloper || '',
    Tester: story.assignedTester || '',
    Status:
      story.acceptanceCriteria && story.qaSignOff && story.pmApproval
        ? 'Ready'
        : 'Locked',
    'AC Complete': story.acceptanceCriteria ? 'Yes' : 'No',
    'QA Signed': story.qaSignOff ? 'Yes' : 'No',
    'PM Approved': story.pmApproval ? 'Yes' : 'No',
    Dependencies: story.dependencies?.join('; ') || '',
    Created: new Date(story.createdAt).toLocaleDateString(),
  }));
};
