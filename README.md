# Pathwise

Pathwise is an evidence-aware academic and career guidance prototype for computing students. It supports entry from any semester, independent career tabs, one combined semester plan, live learning assistance, opportunity discovery, and a review-before-commit semester rollover. Seeded histories are explicitly synthetic.

## Run locally

```powershell
npm install
npm run dev
```

Open the URL printed by Next.js. Development mode compiles routes on first use, so the first click on a new route can be slower. For demo-like performance, use:

```powershell
npm run preview
```

Copy `.env.example` to `.env.local` and set the integrations you use. `.env.local` is ignored by Git.

## Integrations

- `FIRECRAWL_API_KEY`: live opportunity discovery and public curriculum-page extraction through Firecrawl v2.
- `AI_MODEL`: required for live AI. The model ID is configuration, not hardcoded.
- `AI_PROVIDER=vertex`: uses Vertex AI with Google Application Default Credentials. Also set `GOOGLE_VERTEX_PROJECT` and optionally `GOOGLE_VERTEX_LOCATION`.
- `AI_GATEWAY_API_KEY`: alternative Vercel AI Gateway authentication when `AI_PROVIDER` is not `vertex`.
- `GOOGLE_CLOUD_PROJECT`: enables Firestore-backed state. Without it, local development persists sessions as ignored JSON files in `data/`.

The UI never substitutes fixture text for a failed live integration.

## Where AI is used

1. **Daily Learning** streams an explanation, example, practice question, and at most one allow-listed learning resource. The interaction is saved after generation completes.
2. **Opportunity preparation** generates a short checklist grounded in the opportunity title and known eligibility. When AI is unavailable, the backend returns a clearly generic checklist rather than pretending it read unknown requirements.

Firecrawl—not the language model—discovers opportunity pages and extracts public curriculum-page text. Prerequisite evaluation, pending-result handling, credit deduplication, deadline state, ownership, version checks, and semester commits are deterministic code. The current compact curriculum/course mapping is a labeled synthetic demo fixture; expanding AI-based structured curriculum extraction is a documented next step.

## Background processing

PDF/URL document ingestion, Firecrawl opportunity discovery, and AI preparation checklists are queued by the server. The initial request returns `202 Accepted`; the app polls job state silently and displays a toast when work finishes or fails. Jobs expose real stages rather than fake progress.

For a multi-instance Cloud Run production deployment, move execution from Next.js `after()` to Cloud Tasks while retaining the same persisted job records. Firestore already provides durable application state when configured.

## Verification

```powershell
npm run typecheck
npm test
npm run build
```

Tests cover unknown, pending, and unmet prerequisites; cross-path plan deduplication; idempotent rollover; final-term completion; and expired deadlines.

## Architecture

- Next.js App Router UI and Node.js route handlers
- local JSON persistence for development; Firestore adapter for Cloud Run
- Vercel AI SDK with Vertex AI or AI Gateway provider selection
- Firecrawl v2 REST API for bounded public web extraction/search
- `pdf-parse` for text-based PDFs; image-only PDFs report OCR as unavailable
- HTTP-only session identifier with owner-scoped state

No academic graph is exposed in the frontend. Course relationships and prerequisite rules remain backend data.

## Data sources and licenses

- Firecrawl API: public web retrieval; retrieved pages retain their original owners and terms.
- Example NITK CSE curriculum index: <https://cse.l3.nitk.ac.in/programmes/ug>. The bundled subset is synthetic and not asserted as an applicable official curriculum.
- NPTEL course index: <https://www.nptel.ac.in/courses>.
- MDN Learn: <https://developer.mozilla.org/en-US/docs/Learn> (Mozilla content terms apply).
- Google Machine Learning Crash Course: <https://developers.google.com/machine-learning/crash-course>.
- Open Source Guides: <https://opensource.guide/how-to-contribute/> (CC BY 4.0 for website content).
- Papers with Code: <https://paperswithcode.com/> (site/source licenses apply).
- Firecrawl was a visual inspiration only; no Firecrawl logo or proprietary artwork is copied.

Dependencies retain their upstream licenses. No confidential student records should be used in this prototype.

## Known limits

- One compact computing-program fixture is included; cohort applicability must be confirmed.
- OCR, SIS/LMS integration, authoritative CGPA conversion, and automatic applications are not implemented.
- Discovered opportunity records remain `unverified` until exact dates, eligibility, and official status are reviewed.
- Local JSON storage is for development only; Cloud Run should use Firestore and Cloud Tasks.
