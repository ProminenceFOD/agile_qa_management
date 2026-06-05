import { toast } from 'sonner';

export function UseCaseDiagramPage() {
  const downloadJPG = () => {
    const svgElement = document.getElementById('use-case-svg');
    if (!svgElement) {
      toast.error('Unable to find diagram');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const width = 1400;
      const height = 900;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Unable to create canvas');
        return;
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            toast.error('Failed to create image');
            return;
          }
          const jpgUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = jpgUrl;
          link.download = 'aqms-use-case-diagram.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(jpgUrl);
          URL.revokeObjectURL(url);
          toast.success('JPG downloaded successfully!');
        }, 'image/jpeg', 0.95);
      };

      img.onerror = () => {
        toast.error('Failed to load diagram for conversion');
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      toast.error('Download failed. Please try right-clicking the diagram instead.');
      console.error('Download error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Use Case Diagram - AQMS
              </h1>
              <p className="text-gray-600">
                Visual representation of actor interactions and system use cases
              </p>
            </div>
            <button
              onClick={downloadJPG}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Download JPG
            </button>
          </div>

          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>To save:</strong> Click "Download JPG" button above to save as a high-quality JPG image
            </p>
          </div>

          <div className="flex justify-center items-center border border-gray-200 rounded-lg p-6 bg-white overflow-x-auto">
            <svg
              id="use-case-svg"
              width="1400"
              height="900"
              viewBox="0 0 1400 900"
              xmlns="http://www.w3.org/2000/svg"
              style={{ background: 'white', maxWidth: '100%', height: 'auto' }}
            >
              {/* System Boundary */}
              <rect x="250" y="80" width="1000" height="750" fill="none" stroke="#3B82F6" strokeWidth="3" rx="8" />
              <text x="750" y="120" textAnchor="middle" fill="#3B82F6" fontSize="18" fontWeight="600">
                AQMS - Automated Quality Management System
              </text>

              {/* Actor 1: Product Manager (Top-Left) */}
              <circle cx="100" cy="200" r="15" fill="none" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="100" y1="215" x2="100" y2="250" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="80" y1="230" x2="120" y2="230" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="100" y1="250" x2="85" y2="275" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="100" y1="250" x2="115" y2="275" stroke="#1F2937" strokeWidth="2.5" />
              <text x="100" y="300" textAnchor="middle" fill="#1F2937" fontSize="14" fontWeight="700">
                Product Manager
              </text>

              {/* Actor 2: QA Engineer (Middle-Left) */}
              <circle cx="100" cy="450" r="15" fill="none" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="100" y1="465" x2="100" y2="500" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="80" y1="480" x2="120" y2="480" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="100" y1="500" x2="85" y2="525" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="100" y1="500" x2="115" y2="525" stroke="#1F2937" strokeWidth="2.5" />
              <text x="100" y="550" textAnchor="middle" fill="#1F2937" fontSize="14" fontWeight="700">
                QA Engineer
              </text>

              {/* Actor 3: Scrum Master (Bottom-Right) */}
              <circle cx="1300" cy="700" r="15" fill="none" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="1300" y1="715" x2="1300" y2="750" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="1280" y1="730" x2="1320" y2="730" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="1300" y1="750" x2="1285" y2="775" stroke="#1F2937" strokeWidth="2.5" />
              <line x1="1300" y1="750" x2="1315" y2="775" stroke="#1F2937" strokeWidth="2.5" />
              <text x="1300" y="800" textAnchor="middle" fill="#1F2937" fontSize="14" fontWeight="700">
                Scrum Master
              </text>

              {/* Product Manager Use Cases (Blue - Top Row) */}
              <ellipse cx="400" cy="200" rx="110" ry="45" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2.5" />
              <text x="400" y="205" textAnchor="middle" fill="#1F2937" fontSize="13" fontWeight="600">
                Create User Story
              </text>

              <ellipse cx="650" cy="200" rx="120" ry="45" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2.5" />
              <text x="650" y="195" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Define Acceptance
              </text>
              <text x="650" y="210" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Criteria
              </text>

              <ellipse cx="950" cy="200" rx="120" ry="45" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2.5" />
              <text x="950" y="195" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Submit for QA
              </text>
              <text x="950" y="210" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Sign-Off
              </text>

              {/* QA Engineer Use Cases (Green - Left Side, Vertically Stacked) */}
              <ellipse cx="450" cy="330" rx="120" ry="45" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
              <text x="450" y="325" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Validate Acceptance
              </text>
              <text x="450" y="340" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Criteria
              </text>

              <ellipse cx="450" cy="450" rx="110" ry="45" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
              <text x="450" y="445" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Approve/Reject
              </text>
              <text x="450" y="460" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Story
              </text>

              <ellipse cx="450" cy="570" rx="110" ry="45" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
              <text x="450" y="565" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Record Defect
              </text>
              <text x="450" y="580" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Telemetry
              </text>

              <ellipse cx="700" cy="570" rx="110" ry="45" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
              <text x="700" y="560" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="600">
                Set Module Risk
              </text>
              <text x="700" y="575" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="600">
                Multipliers
              </text>

              <ellipse cx="700" cy="450" rx="110" ry="45" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
              <text x="700" y="445" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Link Test Cases
              </text>
              <text x="700" y="460" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                to Story
              </text>

              {/* Scrum Master Use Cases (Orange - Bottom-Right) */}
              <ellipse cx="1000" cy="620" rx="130" ry="45" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
              <text x="1000" y="610" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="600">
                View Quality Burn-Down
              </text>
              <text x="1000" y="625" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="600">
                Dashboard
              </text>

              <ellipse cx="1000" cy="720" rx="110" ry="45" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
              <text x="1000" y="715" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Monitor Sprint
              </text>
              <text x="1000" y="730" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
                Progress
              </text>

              <ellipse cx="700" cy="720" rx="120" ry="45" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
              <text x="700" y="710" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="600">
                Generate Risk Priority
              </text>
              <text x="700" y="725" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="600">
                Matrix
              </text>

              {/* Association Lines: Product Manager to Use Cases */}
              <line x1="180" y1="200" x2="290" y2="200" stroke="#374151" strokeWidth="2" />
              <line x1="180" y1="210" x2="530" y2="200" stroke="#374151" strokeWidth="2" />
              <line x1="180" y1="220" x2="830" y2="200" stroke="#374151" strokeWidth="2" />

              {/* Association Lines: QA Engineer to Use Cases (to LEFT edge) */}
              <line x1="180" y1="420" x2="330" y2="330" stroke="#374151" strokeWidth="2" />
              <line x1="180" y1="440" x2="340" y2="450" stroke="#374151" strokeWidth="2" />
              <line x1="180" y1="460" x2="340" y2="570" stroke="#374151" strokeWidth="2" />
              <line x1="180" y1="470" x2="590" y2="570" stroke="#374151" strokeWidth="2" />
              <line x1="180" y1="450" x2="590" y2="450" stroke="#374151" strokeWidth="2" />

              {/* Association Lines: Scrum Master to Use Cases */}
              <line x1="1240" y1="690" x2="1130" y2="620" stroke="#374151" strokeWidth="2" />
              <line x1="1240" y1="710" x2="1110" y2="720" stroke="#374151" strokeWidth="2" />
              <line x1="1240" y1="720" x2="820" y2="720" stroke="#374151" strokeWidth="2" />

              {/* <<include>> Relationships (Dashed Arrows with proper UML styling) */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="#059669" />
                </marker>
              </defs>

              {/* From Submit for QA Sign-Off to Validate Acceptance Criteria */}
              <line x1="880" y1="230" x2="540" y2="310" stroke="#059669" strokeWidth="2.5" strokeDasharray="8,4" markerEnd="url(#arrowhead)" />
              <text x="710" y="265" textAnchor="middle" fill="#059669" fontSize="12" fontWeight="600" fontStyle="italic">
                &lt;&lt;include&gt;&gt;
              </text>

              {/* From Validate Acceptance Criteria to Approve/Reject Story */}
              <line x1="450" y1="375" x2="450" y2="405" stroke="#059669" strokeWidth="2.5" strokeDasharray="8,4" markerEnd="url(#arrowhead)" />
              <text x="370" y="395" textAnchor="middle" fill="#059669" fontSize="12" fontWeight="600" fontStyle="italic">
                &lt;&lt;include&gt;&gt;
              </text>

              {/* Legend */}
              <rect x="250" y="850" width="1000" height="40" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5" rx="4" />
              <text x="750" y="875" textAnchor="middle" fill="#374151" fontSize="13" fontWeight="600">
                Legend: Stick Figure = Actor | Oval = Use Case | Solid Line = Association | Dashed Arrow = Include Relationship
              </text>
            </svg>
          </div>

          <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Use Case Diagram Components</h3>
            <div className="text-sm text-gray-700 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-blue-700">Product Manager</p>
                  <p className="text-xs text-gray-600">Creates stories, defines criteria, submits for QA</p>
                </div>
                <div>
                  <p className="font-semibold text-green-700">QA Engineer</p>
                  <p className="text-xs text-gray-600">Validates criteria, records defects, sets risks</p>
                </div>
                <div>
                  <p className="font-semibold text-orange-700">Scrum Master</p>
                  <p className="text-xs text-gray-600">Monitors dashboards, tracks progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
