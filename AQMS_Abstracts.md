# AQMS (Agile-Integrated Quality Management System) Thesis Abstracts

This document provides three alternative versions of the abstract for the AQMS project thesis, tailored to different formats and stylistic preferences (Structured, Narrative, and Condensed/Executive).

---

## Option 1: Structured Academic Abstract (Recommended)

_This format is highly preferred by engineering and technical departments as it clearly separates the research components._

**Background:** Software development organizations in emerging markets, such as the Lagos technology ecosystem, face severe delivery bottlenecks during iterative Agile Scrum cycles. Vague requirements, ad-hoc manual testing, and lack of visibility into intermediate quality states lead to a high volume of post-release defect leakage, often termed "technical debt." Traditional toolsets (e.g., Jira, Azure DevOps) act as passive trackers, allowing teams to bypass quality guidelines under release pressure.

**Objective:** This study designed, developed, and evaluated the Agile-Integrated Quality Management System (AQMS), a programmatic quality governance prototype that enforces quality gates at the transaction level rather than relying on social trust.

**Methodology:** Utilizing React, TypeScript, and a Supabase serverless database, a prototype was engineered with automated Gherkin regex validators, a Risk Priority Number (RPN) computation matrix, and a four-state quality burndown tracker. The system was validated using a case study baseline from a Yaba-based fintech organization. Evaluation was conducted through a controlled two-sprint simulation pilot (processing 25 user stories) and structured walkthroughs with the organization's Product Manager and Head of QA.

**Results:** Functional UAT testing yielded a 100% pass rate on core enforcement gates. Quantitative evaluation showed that AQMS reduced defect density from 0.87 to 0.11 bugs per story point and cut average story cycle times from 9.4 to 4.1 days. Process flow efficiency increased from 28.6% to 64.3%. A transitional 15% increase in Product Manager lead time for initial story creation was identified, alongside data-ingestion vulnerabilities regarding legacy CSV schema drift.

**Conclusion:** Programmatic, transaction-level quality enforcement successfully mitigates downstream defect escapes and aligns interdepartmental expectations. AQMS demonstrates that active system-level constraints are superior to passive reporting dashboards for technical debt control in fast-paced software engineering teams.

---

## Option 2: Narrative Computer Science Abstract

_A cohesive, single-paragraph narrative that flows logically from the problem definition to the conclusions. This is the standard format for IEEE and ACM publications._

Iterative Agile development methodologies often suffer from quality bottlenecks due to the "social trust" gap between requirements definition and engineering execution. While conventional project management platforms track development velocity, they fail to programmatically prevent the code-level intake of ambiguous user stories or the closure of tasks with active defects. This thesis presents the design, implementation, and evaluation of the Agile-Integrated Quality Management System (AQMS), a software governance prototype that enforces quality gates directly within the transaction workflow. Developed using a React and TypeScript frontend coupled with a Supabase PostgreSQL serverless backend, AQMS programmatically validates acceptance criteria formatting using regular expressions, calculates Risk Priority Numbers (RPN) to mandate testing protocols, and restricts Kanban board transitions when active bugs are present. The prototype was evaluated against historical data from a SaaS start-up in the Lagos technology ecosystem through a two-sprint simulation pilot (25 user stories) and walkthrough sessions with the firm's Product Manager and Head of QA. The results demonstrate that programmatic enforcement reduced defect density from 0.87 to 0.11 bugs per story point and accelerated average cycle times from 9.4 days to 4.1 days, resulting in a process flow efficiency improvement from 28.6% to 64.3%. While UAT revealed a transitional 15% increase in story-creation lead time for product managers and highlighted schema alignment challenges during CSV data ingestion, the study proves that active process enforcement is highly effective at reducing defect leakage and stabilizing sprint delivery.

---

## Option 3: Condensed Executive Summary Abstract

_A concise, high-impact version (under 200 words) ideal for presentation slides, defense booklets, or project overviews._

This project addresses downstream software delivery bottlenecks in Agile Scrum cycles by introducing the Agile-Integrated Quality Management System (AQMS), a prototype that replaces passive reporting with programmatic, transaction-level quality governance. Built on a React, TypeScript, and Supabase stack, AQMS implements automated Gherkin regex gates, a dynamic Risk Priority Number (RPN) calculation engine, and bug-blocking Kanban constraints. The system was validated against a case study baseline in the Lagos tech ecosystem via a two-sprint simulation of 25 user stories and stakeholder walkthroughs. The evaluation results show a significant drop in defect density (from 0.87 to 0.11 bugs per story point), a 56.4% reduction in average story cycle times (from 9.4 to 4.1 days), and an increase in flow efficiency from 28.6% to 64.3%. A transitional 15% increase in story-creation lead time was observed for product managers. This study demonstrates that enforcing quality constraints programmatically at the workflow level is an effective, sustainable method for preventing technical debt accumulation and optimizing test resource allocation.
