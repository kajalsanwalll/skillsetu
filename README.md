SkillSetu
---

AI-Powered Skill Intelligence & Opportunity Matching Platform


SkillSetu is a skill-based opportunity platform that connects students with internships, jobs, projects, research opportunities, and other career opportunities based on their actual skill readiness rather than relying only on resumes or degree titles.

It uses AI to understand industry requirements, maps them to a canonical skill taxonomy, evaluates a student's demonstrated skills and evidence, identifies skill gaps, and generates a personalized path toward becoming opportunity-ready.

🚀 Why SkillSetu?
---

Traditional recruitment often looks like:

Resume → Application → Shortlisting

SkillSetu introduces a more skill-centric approach:

Industry Demand → Skill Extraction → Skill DNA → Gap Analysis → Personalized Roadmap → Opportunity Matching → Application

Instead of simply telling a student:

"You are not qualified."

SkillSetu answers:

"Here is what you're missing, how strong you currently are, and what you can do to become ready."

✨ Key Features
---

🏢 Industry Opportunity Creation
--

Companies can create opportunities by entering a natural-language job description.

SkillSetu's AI extracts:

Required skills

Skill categories

Importance

Required competency levels

Skill weights

Optional / preferred skills

The extracted requirements can be reviewed and edited before publishing.

🤖 AI-Powered Job Description Extraction
---

Natural-language job descriptions can automatically be converted into structured opportunity requirements.

The system then maps extracted skills to SkillSetu's canonical skill taxonomy.

Development also supports a mock AI provider so the core product can be tested without depending entirely on external API availability.

🧬 Student Skill DNA
--

Every student has a Skill DNA representing their current capabilities.

SkillSetu tracks:

Skills

Competency levels

Claimed proficiency

Evidence

Assessments

Academic credentials

Projects

Experience

Rather than treating every claimed skill equally, SkillSetu uses evidence to estimate a student's trusted proficiency and confidence.

🔎 Skill Gap Analysis
---

For every opportunity, SkillSetu compares the student's current capabilities with the opportunity's requirements.

Skills are classified into categories such as:

Strong

Moderate

Gap

This provides an explainable breakdown of why a student is or isn't ready for an opportunity.

📊 Opportunity Match Score
---

Students receive an opportunity-specific match score based on multiple factors, including:

Skill alignment

Assessment performance

Experience

Career interests

Eligibility

The goal is to provide an interpretable measure of opportunity readiness rather than a simple keyword match.

🗺️ Personalized Roadmaps
---

When gaps are identified, SkillSetu generates a deterministic learning roadmap.

A roadmap can contain steps such as:

Strengthen Fundamentals

        ↓
Build an Intermediate Project

        ↓
Learn Advanced Concepts

        ↓
Build a Production-Level Project

        ↓
Demonstrate the Skill

Each step includes an estimated amount of effort.

The roadmap is generated from the student's actual gaps for the selected opportunity.

📚 Evidence & Verification
---

Students can attach evidence to their skills, including:

Assessments

Projects

Certifications

Internships

NPTEL credentials

Academic credentials

Self-reported evidence

Evidence contributes to the confidence of a student's skill assessment.

🎓 Academic Credentials
---

SkillSetu supports recording academic and external credentials as skill evidence.

The architecture is designed with future integrations such as:

NPTEL

Academic Bank of Credits

APAAR

DigiLocker

External credential verification and official academic-credit transfer are future integrations and are not claimed as fully automated by the current MVP.

📝 Applications
---

Students can apply directly to opportunities and track their application status.

Supported application states include:

APPLIED

   ↓

SHORTLISTED

   ↓

SELECTED

   ↓

COMPLETED

with rejection handled as an alternative outcome.

Industry users can review applicants and update application statuses.

👥 Industry Candidate Evaluation
---

Industry users can:

View applicants

See candidate match scores

Review skills

Review evidence

Inspect candidate profiles

Understand skill alignment

Update application status

🧠 Competency Model
---

SkillSetu represents skill requirements using competency levels:

Level

Meaning

EXPOSURE

Basic familiarity

FOUNDATIONAL

Understands core concepts

INTERMEDIATE

Can independently work with the skill

ADVANCED

Can solve complex problems and design solutions

EXPERT

Deep expertise and strong practical mastery

These levels can be mapped internally to numeric thresholds for matching and gap calculations while keeping the product interface understandable through competency levels.

🔐 Authentication & Roles
---
SkillSetu uses Clerk for authentication and role-based access.

Supported roles:

STUDENT
INDUSTRY
FACULTY
ADMIN

Student

Skill DNA

Skills & evidence

Assessments

Opportunities

Match scores

Skill gaps

Roadmaps

Applications

Portfolio

Industry

Dashboard

Create opportunities

AI requirement extraction

Opportunity management

Applicant evaluation

Candidate profiles

Application status management

Faculty

Faculty functionality is part of the broader platform architecture and can be extended for academic participation and skill verification.

🛠️ Tech Stack
---

Frontend

Next.js

React

TypeScript

Tailwind CSS

Next.js App Router

Backend

Next.js API Routes

TypeScript

Prisma ORM

PostgreSQL

Neon

Authentication

Clerk

Role-based access control

AI

OpenAI API

Structured extraction using Zod schemas

Mock AI provider for development/testing

Storage

Cloudinary

Deployment

Vercel

Neon PostgreSQL

📁 Project Structure
---

app/
├── academy/
├── api/
│   ├── dev/
│   ├── industry/
│   │   ├── extract/
│   │   └── opportunities/
│   ├── skills/
│   ├── student/
│   │   ├── applications/
│   │   ├── credentials/
│   │   ├── evidence/
│   │   ├── gaps/
│   │   ├── opportunities/
│   │   ├── profile/
│   │   ├── roadmap/
│   │   ├── skill-dna/
│   │   └── skills/
│   └── users/
│       └── sync/
│
├── industry/
│   ├── dashboard/
│   ├── opportunities/
│   │   ├── new/
│   │   └── [id]/
│   └── ...
│
├── student/
│   ├── assessment/
│   ├── dashboard/
│   ├── gaps/
│   ├── opportunities/
│   ├── portfolio/
│   ├── roadmap/
│   └── skill-dna/
│
├── login/
├── signup/
├── setup/
└── onboarding/

lib/
├── matching/
├── gap-engine.ts
├── matching.ts
├── ai/
└── ...

prisma/
└── schema.prisma

🗄️ Data Model
---

The core data model revolves around students, skills, evidence, opportunities, and applications.

User
 │
 ├── StudentProfile
 │      │
 │      ├── StudentSkill
 │      │       └── Skill
 │      │
 │      ├── SkillEvidence
 │      │
 │      ├── Assessment
 │      │
 │      └── AcademicCredential
 │
 └── Application
          │
          ▼
     Opportunity
          │
          └── OpportunitySkill
                    │
                    └── Skill

Core entities include:
---

User

StudentProfile

Skill

StudentSkill

SkillEvidence

Assessment

AcademicCredential

Industry

Opportunity

OpportunitySkill

Application

Education

Experience

Project

🔄 Core API Flow

Industry

POST /api/industry/extract
        ↓
POST /api/industry/opportunities
        ↓
GET /api/industry/opportunities
        ↓
GET /api/industry/opportunities/[id]
        ↓
GET /api/industry/opportunities/[id]/applicants

Student

GET /api/student/profile
        ↓
POST /api/student/skills
        ↓
POST /api/student/evidence
        ↓
GET /api/student/opportunities
        ↓
GET /api/student/opportunities/[id]
        ↓
POST /api/student/roadmap
        ↓
POST /api/student/applications

🧮 Explainable Matching
---

SkillSetu is designed around explainability.

Instead of returning only:

Match: 72%

the system can explain the underlying factors:

Node.js       → Strong
PostgreSQL    → Strong
REST APIs     → Strong
Docker        → Moderate
Redis         → Gap

Overall Readiness: 72%

This makes recommendations actionable for students and easier for industry users to understand.

🧪 Development
---

1. Clone the repository

git clone <your-repository-url>
cd skillsetu

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file:

DATABASE_URL="your-neon-database-url"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

OPENAI_API_KEY="your-openai-api-key"

CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

Do not commit .env or expose secret keys.

4. Generate Prisma Client

npx prisma generate

5. Run the development server

npm run dev

Open http://localhost:3000.

🏭 Production Build
--

Before deployment:

npm run build

The application is designed to be deployed on Vercel with Neon PostgreSQL.

Production deployment requires:

Production Clerk configuration

Production database

Correct environment variables

Valid domain configuration

Server-side API credentials

🎯 Demo Flow
---

A typical SkillSetu demonstration follows this flow:

Industry creates opportunity
            ↓
AI extracts required skills
            ↓
Student discovers opportunity
            ↓
Match score is calculated
            ↓
Skill gaps are identified
            ↓
Personalized roadmap is generated
            ↓
Student applies
            ↓
Industry reviews applicant
            ↓
Application status is updated

Example Opportunity

Backend Engineer Intern

Node.js        → Intermediate
Express.js     → Intermediate
PostgreSQL     → Intermediate
REST APIs      → Intermediate
TypeScript     → Intermediate
Docker         → Foundational
Redis          → Foundational

🧩 Design Principles
---

1. Skills over titles

A degree or job title should not be the only indicator of capability.

2. Evidence over claims

A demonstrated skill should carry more confidence than an unsupported self-declaration.

3. Explainability

Students should understand why they match or don't match an opportunity.

4. Actionability

A skill gap should lead to a concrete next step.

5. Opportunity-specific readiness

A student does not have one universal "readiness score."

Readiness depends on the requirements of the opportunity being considered.

🚧 Current Limitations
---

SkillSetu is currently an MVP/prototype.

Some capabilities are designed for future expansion, including:

Production-grade credential verification

Official APAAR / ABC / DigiLocker integrations

Advanced faculty workflows

Large-scale skill graph intelligence

Automated industry feedback loops

Persistent roadmap management

Advanced analytics and recommendation models

Large-scale production matching optimization

The current system prioritizes demonstrating the core skill intelligence → gap → roadmap → opportunity loop.

🔮 Future Roadmap
---

Phase 1 — Core Platform

Authentication

Role-based access

Student Skill DNA

Industry opportunities

AI skill extraction

Skill normalization

Opportunity matching

Gap analysis

Personalized roadmap

Applications

Industry applicant evaluation

Phase 2 — Intelligence

Advanced skill graph

Better recommendation models

Skill trend analysis

Industry demand analytics

More sophisticated evidence verification

Phase 3 — Academic Integration

NPTEL verification

DigiLocker integration

APAAR / ABC integration

Institution-side verification workflows

Phase 4 — Scale

Production-grade recommendation infrastructure

Analytics

Large-scale opportunity matching

Industry dashboards

Institutional partnerships

👩‍💻 Built With
---

Built as a full-stack engineering project exploring:

AI-powered information extraction

Skill normalization

Explainable recommendation systems

Evidence-based skill evaluation

Competency modeling

REST API design

Relational database modeling

Authentication and RBAC

Serverless architecture

Full-stack product development

📌 Project Status
---

MVP — Functional

The core SkillSetu workflow is implemented:

Create → Extract → Match → Analyze Gaps → Generate Roadmap → Apply → Evaluate

The platform is designed for further expansion into a larger skill intelligence ecosystem.

📄 License
---

This project is currently intended as a personal/academic project.

Add a formal license here if the repository is being released as open source.