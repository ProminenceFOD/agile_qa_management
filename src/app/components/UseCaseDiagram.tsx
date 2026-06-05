export function UseCaseDiagram() {
  return (
    <svg
      width="1200"
      height="800"
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: 'white' }}
    >
      {/* Title */}
      <text x="600" y="40" textAnchor="middle" fill="#1F2937" fontSize="24" fontWeight="700">
        AQMS Use Case Diagram
      </text>

      {/* System Boundary Rectangle */}
      <rect
        x="200"
        y="80"
        width="800"
        height="650"
        fill="none"
        stroke="#3B82F6"
        strokeWidth={3}
        rx="8"
      />

      {/* System Name Label */}
      <text x="600" y="110" textAnchor="middle" fill="#3B82F6" fontSize="16" fontWeight="600">
        AQMS - Automated Quality Management System
      </text>

      {/* ACTORS - Product Manager (Left) */}
      <circle cx="80" cy="250" r="12" fill="none" stroke="#1F2937" strokeWidth={2}/>
      <line x1="80" y1="262" x2="80" y2="290" stroke="#1F2937" strokeWidth={2}/>
      <line x1="65" y1="275" x2="95" y2="275" stroke="#1F2937" strokeWidth={2}/>
      <line x1="80" y1="290" x2="68" y2="310" stroke="#1F2937" strokeWidth={2}/>
      <line x1="80" y1="290" x2="92" y2="310" stroke="#1F2937" strokeWidth={2}/>
      <text x="80" y="330" textAnchor="middle" fill="#1F2937" fontSize="13" fontWeight="600">
        Product Manager
      </text>

      {/* ACTORS - QA Engineer (Left) */}
      <circle cx="80" cy="450" r="12" fill="none" stroke="#1F2937" strokeWidth={2}/>
      <line x1="80" y1="462" x2="80" y2="490" stroke="#1F2937" strokeWidth={2}/>
      <line x1="65" y1="475" x2="95" y2="475" stroke="#1F2937" strokeWidth={2}/>
      <line x1="80" y1="490" x2="68" y2="510" stroke="#1F2937" strokeWidth={2}/>
      <line x1="80" y1="490" x2="92" y2="510" stroke="#1F2937" strokeWidth={2}/>
      <text x="80" y="530" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="600">
        QA Engineer
      </text>

      {/* ACTORS - Scrum Master (Right) */}
      <circle cx="1120" cy="400" r="12" fill="none" stroke="#1F2937" strokeWidth={2}/>
      <line x1="1120" y1="412" x2="1120" y2="440" stroke="#1F2937" strokeWidth={2}/>
      <line x1="1105" y1="425" x2="1135" y2="425" stroke="#1F2937" strokeWidth={2}/>
      <line x1="1120" y1="440" x2="1108" y2="460" stroke="#1F2937" strokeWidth={2}/>
      <line x1="1120" y1="440" x2="1132" y2="460" stroke="#1F2937" strokeWidth={2}/>
      <text x="1120" y="480" textAnchor="middle" fill="#1F2937" fontSize="13" fontWeight="600">
        Scrum Master
      </text>

      {/* USE CASES - Row 1 (PM) */}

      {/* UC1: Create User Story */}
      <ellipse cx="350" cy="180" rx="100" ry="40" fill="#DBEAFE" stroke="#3B82F6" strokeWidth={2}/>
      <text x="350" y="185" textAnchor="middle" fill="#1F2937" fontSize="12" fontWeight="500">
        Create User Story
      </text>

      {/* UC2: Define Acceptance Criteria */}
      <ellipse cx="550" cy="180" rx="110" ry="40" fill="#DBEAFE" stroke="#3B82F6" strokeWidth={2}/>
      <text x="550" y="180" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Define Acceptance
      </text>
      <text x="550" y="195" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Criteria
      </text>

      {/* UC3: Submit for QA Sign-Off */}
      <ellipse cx="750" cy="180" rx="110" ry="40" fill="#DBEAFE" stroke="#3B82F6" strokeWidth={2}/>
      <text x="750" y="180" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Submit for QA
      </text>
      <text x="750" y="195" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Sign-Off
      </text>

      {/* USE CASES - Row 2 (QA) */}

      {/* UC4: Validate Criteria */}
      <ellipse cx="350" cy="320" rx="110" ry="40" fill="#D1FAE5" stroke="#10B981" strokeWidth={2}/>
      <text x="350" y="320" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Validate Acceptance
      </text>
      <text x="350" y="335" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Criteria
      </text>

      {/* UC5: Approve/Reject Story */}
      <ellipse cx="550" cy="320" rx="100" ry="40" fill="#D1FAE5" stroke="#10B981" strokeWidth={2}/>
      <text x="550" y="320" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Approve/Reject
      </text>
      <text x="550" y="335" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Story
      </text>

      {/* UC6: Record Defect Telemetry */}
      <ellipse cx="350" cy="450" rx="100" ry="40" fill="#D1FAE5" stroke="#10B981" strokeWidth={2}/>
      <text x="350" y="450" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Record Defect
      </text>
      <text x="350" y="465" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Telemetry
      </text>

      {/* UC7: Set Risk Multipliers */}
      <ellipse cx="550" cy="450" rx="100" ry="40" fill="#D1FAE5" stroke="#10B981" strokeWidth={2}/>
      <text x="550" y="445" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Set Module Risk
      </text>
      <text x="550" y="460" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Multipliers
      </text>

      {/* UC8: Link Test Cases */}
      <ellipse cx="750" cy="380" rx="100" ry="40" fill="#D1FAE5" stroke="#10B981" strokeWidth={2}/>
      <text x="750" y="380" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Link Test Cases
      </text>
      <text x="750" y="395" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        to Story
      </text>

      {/* USE CASES - Row 3 (Scrum Master) */}

      {/* UC9: View Dashboard */}
      <ellipse cx="850" cy="520" rx="110" ry="40" fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2}/>
      <text x="850" y="515" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        View Quality
      </text>
      <text x="850" y="530" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Burn-Down Dashboard
      </text>

      {/* UC10: Monitor Sprint Progress */}
      <ellipse cx="650" cy="600" rx="100" ry="40" fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2}/>
      <text x="650" y="600" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Monitor Sprint
      </text>
      <text x="650" y="615" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Progress
      </text>

      {/* UC11: Generate Risk Matrix */}
      <ellipse cx="850" cy="650" rx="100" ry="40" fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2}/>
      <text x="850" y="650" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Generate Risk
      </text>
      <text x="850" y="665" textAnchor="middle" fill="#1F2937" fontSize="11" fontWeight="500">
        Priority Matrix
      </text>

      {/* ASSOCIATIONS - Product Manager */}
      <line x1="140" y1="250" x2="250" y2="180" stroke="#6B7280" strokeWidth={1.5}/>
      <line x1="140" y1="270" x2="440" y2="180" stroke="#6B7280" strokeWidth={1.5}/>
      <line x1="140" y1="280" x2="640" y2="180" stroke="#6B7280" strokeWidth={1.5}/>

      {/* ASSOCIATIONS - QA Engineer */}
      <line x1="140" y1="420" x2="250" y2="320" stroke="#6B7280" strokeWidth={1.5}/>
      <line x1="140" y1="430" x2="450" y2="320" stroke="#6B7280" strokeWidth={1.5}/>
      <line x1="140" y1="450" x2="250" y2="450" stroke="#6B7280" strokeWidth={1.5}/>
      <line x1="140" y1="460" x2="450" y2="450" stroke="#6B7280" strokeWidth={1.5}/>
      <line x1="140" y1="440" x2="650" y2="380" stroke="#6B7280" strokeWidth={1.5}/>

      {/* ASSOCIATIONS - Scrum Master */}
      <line x1="1060" y1="400" x2="960" y2="520" stroke="#6B7280" strokeWidth={1.5}/>
      <line x1="1060" y1="420" x2="750" y2="600" stroke="#6B7280" strokeWidth={1.5}/>
      <line x1="1060" y1="430" x2="950" y2="650" stroke="#6B7280" strokeWidth={1.5}/>

      {/* Legend */}
      <rect x="220" y="730" width="760" height="50" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth={1} rx="4"/>
      <text x="240" y="755" fill="#6B7280" fontSize="12" fontWeight="600">
        Legend: Stick Figure = Actor | Oval = Use Case | Line = Association
      </text>
    </svg>
  );
}
