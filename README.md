# AI-Based Customer Feedback Analysis for Product Lifecycle Management (PLM)

Enterprise-grade Product Lifecycle Intelligence platform that ingests customer feedback, applies multi-stage AI analysis, maps issues to PLM stages, recommends engineering solutions, and connects with PTC Windchill PLM.

---

## 🚀 How to Run Locally (`http://localhost:3000`)

You can run this application locally on your computer using either **Node.js** or **Docker**.

### Option 1: Run with Node.js (Recommended)

#### 1. Prerequisites
- **Node.js**: v18.x or v20.x+ ([Download Node.js](https://nodejs.org/))
- **npm** (comes with Node.js) or **pnpm** / **yarn**

#### 2. Clone or Download Repository
If using Git:
```bash
git clone <your-repository-url>
cd <repository-directory>
```

#### 3. Install Dependencies
```bash
npm install
```

#### 4. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key if you want live generative AI synthesis:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```
*(Note: If no API key is provided, the platform automatically utilizes its built-in rule and heuristic NLP pipelines for instant zero-config evaluation).*

#### 5. Start Development Server
```bash
npm run dev
```

#### 6. Open in Browser
Visit:
```
http://localhost:3000
```
Your full-stack application with Express backend APIs and React frontend is now running on your machine!

---

### Option 2: Run with Docker Compose (One-Click)

If you have Docker Desktop installed:

```bash
docker compose up --build
```

Then navigate to:
```
http://localhost:3000
```

To run in the background (detached mode):
```bash
docker compose up -d
```

To stop:
```bash
docker compose down
```

---

## 🛠 Available NPM Scripts

- `npm run dev`: Starts the full-stack Express server with Vite middleware on port 3000.
- `npm run build`: Bundles the React Vite frontend into `dist/` and compiles `server.ts` into `dist/server.cjs`.
- `npm start`: Runs the compiled production server (`node dist/server.cjs`).
- `npm run lint`: Runs TypeScript validation checks (`tsc --noEmit`).

---

## 📡 REST API Endpoints on Localhost

When running locally, you can query backend endpoints directly at `http://localhost:3000/api/*`:

- `GET  /api/health` — System status and store metrics
- `GET  /api/products` — Product catalog and associated BOM lines
- `GET  /api/feedback` — List all feedback with NLP classifications
- `POST /api/feedback/analyze` — Process feedback text through AI pipeline
- `POST /api/feedback/batch-csv` — Ingest CSV/tabular feedback datasets
- `GET  /api/ecr` — Engineering Change Requests queue
- `POST /api/ecr` — Generate new ECR with suggested PLM CAD/BOM actions
- `POST /api/windchill/sync` — Simulate or execute PTC Windchill REST synchronization
- `GET  /api/reports/summary` — Aggregate metrics for export (CSV, Excel, PDF)
- `GET  /api/audit` — Security & compliance audit trail
