import React, { useState } from 'react';
import {
  FileCode2,
  Database,
  Workflow,
  Layers,
  Container,
  Terminal,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const dockerComposeYaml = `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - DATABASE_URL=postgresql://plm_user:plm_pass@postgres:5432/plm_db
      - REDIS_URL=redis://redis:6379/0
      - WINDCHILL_BASE_URL=https://windchill.enterprise-plm.net/Windchill
    depends_on:
      - postgres
      - redis
    restart: always

  postgres:
    image: ankane/pgvector:v0.5.1
    environment:
      POSTGRES_USER: plm_user
      POSTGRES_PASSWORD: plm_pass
      POSTGRES_DB: plm_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:`;

  const dockerfileCode = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`;

  const sqlSchemaCode = `-- PostgreSQL 16 + pgvector Schema for PLM Customer Feedback Analysis
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    version VARCHAR(32) NOT NULL,
    lifecycle_stage VARCHAR(64) NOT NULL,
    description TEXT,
    health_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bom_components (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    component_code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    revision VARCHAR(32) NOT NULL,
    material VARCHAR(255),
    current_stage VARCHAR(64) NOT NULL,
    status VARCHAR(64) DEFAULT 'Normal'
);

CREATE TABLE feedback_items (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    source VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) REFERENCES products(id),
    sentiment_score NUMERIC(4, 2),
    sentiment_label VARCHAR(32),
    frustration_pct INT,
    disappointment_pct INT,
    satisfaction_pct INT,
    category VARCHAR(64),
    priority VARCHAR(32),
    plm_stage VARCHAR(64),
    embedding vector(768), -- pgvector for duplicate detection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE engineering_change_requests (
    id VARCHAR(64) PRIMARY KEY,
    ecr_number VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    product_id VARCHAR(64) REFERENCES products(id),
    component_code VARCHAR(64),
    plm_stage VARCHAR(64) NOT NULL,
    priority VARCHAR(32) NOT NULL,
    status VARCHAR(64) DEFAULT 'Submitted',
    proposed_changes TEXT,
    windchill_ecr_number VARCHAR(64),
    synced_at TIMESTAMP
);`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-indigo-500" />
          Enterprise System Architecture & Deployment Blueprint
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Complete technical specifications including SQL Schemas, Docker Compose, Sequence Diagrams, and REST OpenAPI definitions.
        </p>
      </div>

      {/* Grid */}
      <div className="space-y-6">
        {/* Docker Setup Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Container className="w-4 h-4 text-indigo-500" />
              1. Docker Compose Setup (docker-compose.yml)
            </h3>
            <button
              onClick={() => copyToClipboard(dockerComposeYaml, 'compose')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
            >
              {copiedSection === 'compose' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'compose' ? 'Copied!' : 'Copy YAML'}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto border border-slate-800">
            <pre>{dockerComposeYaml}</pre>
          </div>
        </div>

        {/* Dockerfile Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-500" />
              2. Container Build Script (Dockerfile)
            </h3>
            <button
              onClick={() => copyToClipboard(dockerfileCode, 'df')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
            >
              {copiedSection === 'df' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'df' ? 'Copied!' : 'Copy Dockerfile'}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
            <pre>{dockerfileCode}</pre>
          </div>
        </div>

        {/* SQL Schema Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              3. PostgreSQL 16 + pgvector DDL Schema
            </h3>
            <button
              onClick={() => copyToClipboard(sqlSchemaCode, 'sql')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
            >
              {copiedSection === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'sql' ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800">
            <pre>{sqlSchemaCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
