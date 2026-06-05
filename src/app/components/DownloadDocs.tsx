import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function DownloadDocs() {
  const openPDF = () => {
    // Open PDF in new tab - works better in Figma Make environment
    const pdfUrl = '/AQMS_Complete_Documentation.pdf';
    window.open(pdfUrl, '_blank');
    toast.success('PDF opened in new tab! Right-click and "Save As" to download (157 pages, 267KB)');
  };

  const directDownload = async () => {
    try {
      const response = await fetch('/AQMS_Complete_Documentation.pdf');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'AQMS_Complete_Documentation.pdf';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      toast.success('Download started! Check your Downloads folder');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed - click "Open in New Tab" instead');
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
      {/* Primary: Open in new tab (works in all environments) */}
      <button
        onClick={openPDF}
        className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg flex items-center gap-3 font-semibold text-lg"
      >
        <ExternalLink className="w-6 h-6" />
        Open Documentation (PDF)
      </button>

      {/* Secondary: Try direct download */}
      <button
        onClick={directDownload}
        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-lg flex items-center gap-3 font-medium text-sm"
      >
        <Download className="w-5 h-5" />
        Try Direct Download
      </button>
    </div>
  );
}
