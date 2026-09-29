import React, { useState } from 'react';
import {
  BrainCircuit,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Database,
  Search,
  Zap,
  Tag,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

export const AIPipelineView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const pipelineSteps = [
    {
      step: 1,
      name: 'Preprocessing',
      icon: FileCode,
      description: 'Cleans text, strips HTML tags, removes special symbols and noisy line breaks.',
      outputExample: 'Input: "Severe thermal cracking observed on rotor root!! <br>" -> Output: "severe thermal cracking observed on rotor root"',
    },
    {
      step: 2,
      name: 'Tokenization',
      icon: Layers,
      description: 'Splits raw cleaned string into discrete semantic token sequences using BERT WordPiece.',
      outputExample: 'Tokens: ["severe", "thermal", "crack", "##ing", "observed", "on", "rotor", "root"]',
    },
    {
      step: 3,
      name: 'Lemmatization & POS',
      icon: Tag,
      description: 'Applies spaCy morphological lemmatization and Part-of-Speech tagging to normalize verbs and nouns.',
      outputExample: 'Lemmas: [severe/ADJ, thermal/ADJ, crack/NOUN, observe/VERB, rotor/NOUN, root/NOUN]',
    },
    {
      step: 4,
      name: 'Embeddings Generation',
      icon: Database,
      description: 'Generates 768-dimensional dense vector embeddings via SentenceTransformers (all-MiniLM-L6-v2) stored in pgvector.',
      outputExample: 'Vector: [-0.0421, 0.1284, 0.8921, -0.3110, ... 768 dims]',
    },
    {
      step: 5,
      name: 'Sentiment Analysis',
      icon: Sparkles,
      description: 'Evaluates polarity using DistilBERT fine-tuned on industrial engineering feedback datasets.',
      outputExample: 'Sentiment Score: -0.82 | Polarity: Negative | Confidence: 98.4%',
    },
    {
      step: 6,
      name: 'Emotion Vector Detection',
      icon: BrainCircuit,
      description: 'Quantifies emotional dimensions across Frustration, Disappointment, Satisfaction, Anger, and Joy.',
      outputExample: 'Vector: { Frustration: 75%, Disappointment: 60%, Anger: 40%, Satisfaction: 5% }',
    },
    {
      step: 7,
      name: 'LDA Topic Modeling',
      icon: Search,
      description: 'Extracts latent thematic clusters and key n-grams using Latent Dirichlet Allocation.',
      outputExample: 'Topics: ["Blade Micro-Crack", "Thermal Fatigue", "Cooling Channel Geometry"]',
    },
    {
      step: 8,
      name: 'Issue Classification',
      icon: Layers,
      description: 'Classifies issue intent into Complaint, Feature Request, Bug Report, or Quality Defect.',
      outputExample: 'Primary Class: Quality Defect | Sub-class: Thermal Strain Anomaly',
    },
    {
      step: 9,
      name: 'Duplicate Cluster Detection',
      icon: Search,
      description: 'Performs cosine similarity search in pgvector database to identify identical or duplicate reports.',
      outputExample: 'Cosine Similarity: 0.942 -> Matched Duplicate Group: dup-turb-01',
    },
    {
      step: 10,
      name: 'Priority Scoring Algorithm',
      icon: Zap,
      description: 'Calculates priority using weighted matrix: (Sentiment x 0.3) + (Safety Impact x 0.4) + (Customer Tier x 0.3).',
      outputExample: 'Priority Score: 92/100 -> Classification: Critical Priority',
    },
    {
      step: 11,
      name: 'PLM Lifecycle Mapping',
      icon: Layers,
      description: 'Maps issue to exact PLM Stage (Requirement, Design, Development, Manufacturing, Quality, Testing, Release, Maintenance, Retirement).',
      outputExample: 'Target PLM Stage: Manufacturing (Component: Titanium Rotor Blade TURB-BLD-09)',
    },
    {
      step: 12,
      name: 'Recommendation & ECR Generation',
      icon: ShieldCheck,
      description: 'Gemini 3.6 Flash reasoning model generates structured Engineering Change Request (ECR) for PTC Windchill.',
      outputExample: 'Action: Modify investment casting mold geometry & apply YSZ thermal barrier coating.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-500" />
          AI Analysis Pipeline Architecture
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Interactive step-by-step inspector of the 12-stage NLP and PLM Mapping pipeline powered by Gemini 3.6 Flash.
        </p>
      </div>

      {/* Step Stepper Visualizer */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400">Step {step.step}</span>
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {step.name}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detailed View */}
        {pipelineSteps[activeStep] && (
          <div className="p-6 rounded-xl bg-slate-900 text-white space-y-4 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-xs font-bold">
                  Step {pipelineSteps[activeStep].step} of 12
                </span>
                <h3 className="text-base font-bold text-white">
                  {pipelineSteps[activeStep].name}
                </h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Latency: 14ms
              </span>
            </div>

            <p className="text-xs text-slate-300">
              {pipelineSteps[activeStep].description}
            </p>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-indigo-300">
              <span className="text-slate-500 block mb-1">// Pipeline Transformation Output:</span>
              {pipelineSteps[activeStep].outputExample}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
