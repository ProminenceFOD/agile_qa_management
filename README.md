# AQMS — Agile-Integrated Quality Management System

AQMS (Agile-Integrated Quality Management System) is a programmatic quality governance prototype designed to solve the structural delivery bottlenecks common in iterative Agile Scrum cycles. Validated against a SaaS organization case study in the Lagos tech ecosystem, the system introduces automated quality gates, risk-prioritized validation paths, and real-time defect telemetry.

---

## 🚀 The Core Bottlenecks & AQMS Solutions

| Case Study Problem | AQMS Technical Solution | Component / Heuristic |
| :--- | :--- | :--- |
| **The "Social Trust" Gap** <br>*(Coding ambiguous stories before requirements sign-off)* | **Quality Gate Validation** | `CriteriaValidator.tsx` <br> Programmatic lockout of Developer/Tester assignments until Acceptance Criteria pass Regex format validation (`Given/When/Then`) and receive explicit digital signatures from the PM and QA Reviewer. |
| **Testing by Guesswork** <br>*(Resource misallocation without data-driven prioritization)* | **Risk Matrix Engine** | `RiskMatrix.tsx` <br> Auto-scores module Risk Priority Numbers (RPN = Defect Frequency × Business Impact) to recommend mandatory testing protocols (Full Regression, Focused Functional, or Smoke Check). |
| **The "In Progress" Black Box** <br>*(Done/Not Done boards hiding defect rates)* | **Nuanced Kanban & Quality States Tracker** | `KanbanBoard.tsx`<br>`QualityBurnDown.tsx` <br> Transitions user stories through intermediate quality states (*Not Ready, Ready, In Development, In Testing, Tested, Bugs Found, Done*) and displays open bugs directly on task cards. |
| **Silent Data Archives** <br>*(Years of historical tracking logs remaining unutilized)* | **AI Test Recommendations Engine** | `TestRecommendations.tsx`<br>`DataManagement.tsx` <br> Enables CSV import of historical logs, utilizing a rule-based analysis heuristic to flag requirements coverage gaps and suggest test executions. |

---

## 🛠️ Technology Stack

* **Client Tier:** React (v18.3.1), TypeScript, Vite (v6.3.5), Tailwind CSS (v4) with custom semantic utility layers (`design-system.css`, `theme.css`).
* **Telemetry & Charts:** Recharts (v2) for SVG-based, responsive quality telemetry and sprint burndown tracking.
* **Serverless Backend:** Supabase serverless Edge Functions running the Hono web framework on Deno.
* **Data Persistence:** Supabase PostgreSQL KV Store utilizing a custom JSONB table (`kv_store_5a760dac`).
* **Sync Protocol:** Optimistic UI state updates executing synchronous `localStorage` cache writes to mitigate sandboxed iframe session loss, with non-blocking async REST sync loops.
* **Document Compiler Pipeline:** Offline Node.js scripts to compile Markdown files into stakeholder-ready formats (`PDF`, `DOCX`, `RTF`).

---

## 💻 Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) installed on your workstation.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd agile_qa_management
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the Vite hot-reloading development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Compiling Production Bundles
To package the application for hosting:
```bash
npm run build
```

---

## 📄 Build-Time Document Compiler Pipeline

The project includes offline scripts to compile markdown text into professional stakeholder reports:

* **Compile to Word Document (DOCX):**
  ```bash
  npx ts-node convert-to-docx.ts
  ```
* **Compile to PDF Document:**
  ```bash
  npx ts-node create-pdf.ts
  ```
* **Compile to Rich Text Format (RTF):**
  ```bash
  npx ts-node create-rtf.ts
  ```

---

## 🔑 Demo Access Credentials

The prototype contains configured credentials matching the case study roles:

| Role | Email | Password | Assigned Staff Profile |
| :--- | :--- | :--- | :--- |
| **Administrator / Head of QA** | `qa@aqms.com` | `password123` | Damilola Ogunlade |
| **Product Manager** | `pm@aqms.com` | `password123` | Sarah Johnson |
| **Scrum Master** | `sm@aqms.com` | `password123` | Mike Williams |

---

## 📚 Key Reference Citations
* **Amna, A. & Poels, G. (2022).** Risk-based testing in Agile software development: A systematic mapping study.
* **Ekechi, O. et al. (2024).** Quality assurance governance frameworks in emerging SaaS market sectors.
* **Forsgren, N., Humble, J. & Kim, G. (2021).** Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations.
* **Kasauli, R. et al. (2021).** Requirements engineering challenges in Agile software development.
* **Soares, M. et al. (2022).** Beyond task status: Surfacing quality state telemetry on Agile boards.