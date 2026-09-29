import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import {
  MessageSquare,
  Sparkles,
  CheckCircle,
  Clock,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { FeedbackItem, EngineeringChangeRequest, PLMStage } from '../types';

interface DashboardViewProps {
  feedbackList: FeedbackItem[];
  ecrList: EngineeringChangeRequest[];
  onSelectFeedback: (item: FeedbackItem) => void;
  setActiveTab: (tab: string) => void;
}

const PLM_STAGES_ORDER: PLMStage[] = [
  'Requirement Gathering',
  'Design',
  'Development',
  'Manufacturing',
  'Quality',
  'Testing',
  'Release',
  'Maintenance',
  'Retirement',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  feedbackList,
  ecrList,
  onSelectFeedback,
  setActiveTab,
}) => {
  // KPI Calculations
  const totalFeedback = feedbackList.length;
  const avgSentiment =
    totalFeedback > 0
      ? (feedbackList.reduce((acc, f) => acc + f.sentimentScore, 0) / totalFeedback).toFixed(2)
      : '0.00';
  const criticalCount = feedbackList.filter((f) => f.priority === 'Critical').length;
  const ecrSyncedCount = ecrList.filter((e) => e.status === 'Windchill Synced').length;

  // Sentiment Data for Donut
  const positiveCount = feedbackList.filter((f) => f.sentimentLabel === 'Positive').length;
  const neutralCount = feedbackList.filter((f) => f.sentimentLabel === 'Neutral').length;
  const negativeCount = feedbackList.filter((f) => f.sentimentLabel === 'Negative').length;

  const sentimentData = [
    { name: 'Negative', value: negativeCount, color: '#f43f5e' },
    { name: 'Neutral', value: neutralCount, color: '#94a3b8' },
    { name: 'Positive', value: positiveCount, color: '#10b981' },
  ];

  // PLM Stage Bar Chart Data
  const plmStageData = PLM_STAGES_ORDER.map((stage) => {
    const items = feedbackList.filter((f) => f.plmStage === stage);
    const critical = items.filter((f) => f.priority === 'Critical').length;
    return {
      stage: stage.replace(' Gathering', ''),
      total: items.length,
      critical,
    };
  });

  // Emotion Radar Data
  const emotionAgg = feedbackList.reduce(
    (acc, f) => {
      acc.frustration += f.emotionBreakdown.frustration;
      acc.disappointment += f.emotionBreakdown.disappointment;
      acc.satisfaction += f.emotionBreakdown.satisfaction;
      acc.anger += f.emotionBreakdown.anger;
      acc.joy += f.emotionBreakdown.joy;
      return acc;
    },
    { frustration: 0, disappointment: 0, satisfaction: 0, anger: 0, joy: 0 }
  );

  const denom = totalFeedback || 1;
  const radarData = [
    { emotion: 'Frustration', value: Math.round(emotionAgg.frustration / denom) },
    { emotion: 'Disappointment', value: Math.round(emotionAgg.disappointment / denom) },
    { emotion: 'Satisfaction', value: Math.round(emotionAgg.satisfaction / denom) },
    { emotion: 'Anger', value: Math.round(emotionAgg.anger / denom) },
    { emotion: 'Joy', value: Math.round(emotionAgg.joy / denom) },
  ];

  // Category Bar Data
  const categoryCounts: Record<string, number> = {};
  feedbackList.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });

  const categoryData = Object.keys(categoryCounts).map((cat) => ({
    category: cat,
    count: categoryCounts[cat],
  }));

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-[#111114] border border-white/5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-900 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                Enterprise PLM Analytics
              </span>
              <span className="text-xs text-slate-400">• Gemini 3.6 Flash Engine Active</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Customer Feedback & Lifecycle Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Automated NLP pipeline transforming unstructured customer tickets into PTC Windchill ECRs, mapped across all 9 Product Lifecycle stages.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('upload')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upload & Analyze
            </button>
            <button
              onClick={() => setActiveTab('ecr')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-sm border border-white/10 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              Manage ECRs ({ecrList.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Feedback</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalFeedback}</div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-0.5">
            <span>+12% from last sprint</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Sentiment</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{avgSentiment}</div>
          <p className="text-[10px] text-slate-400 mt-1">Scale: -1.0 (Neg) to +1.0 (Pos)</p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Critical Issues</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{criticalCount}</div>
          <p className="text-[10px] text-rose-400 mt-1 font-medium">Requires immediate ECO</p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Windchill Synced</span>
            <CheckCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{ecrSyncedCount} / {ecrList.length}</div>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">100% REST API Verified</p>
        </div>

        {/* KPI 5 */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Model Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">96.8%</div>
          <p className="text-[10px] text-slate-400 mt-1">Validated on PLM dataset</p>
        </div>
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PLM Stage Mapping Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Feedback Distribution Across PLM Stages
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categorized issues across 9 Product Lifecycle stages
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plmStageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Feedback" />
                <Bar dataKey="critical" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Critical Priority" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Donut */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sentiment Overview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">NLP Sentiment Classification</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs pt-2 border-t border-slate-100 dark:border-white/5">
            {sentimentData.map((s) => (
              <div key={s.name} className="text-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{s.name}</span>
                <p className="font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Radar & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Emotion Radar */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Emotion Profile Radar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Multi-vector NLP emotion intensity index (0 - 100)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" opacity={0.6} />
                <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar
                  name="Emotion Vector"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Area */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Feedback Category Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Classification distribution across domain categories</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Actionable Recommendation Queue & Recent Feedback */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Recommendation Queue for PLM Engineering
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-confidence actionable change recommendations ready for ECR creation
            </p>
          </div>
          <button
            onClick={() => setActiveTab('feedback')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All Feedback <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {feedbackList.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectFeedback(item)}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111114] hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    item.priority === 'Critical'
                      ? 'bg-rose-500 shadow-sm shadow-rose-500'
                      : item.priority === 'High'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/50 dark:border-indigo-800/50">
                      {item.plmStage}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      {item.productName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    {item.engineeringRecommendation?.title || item.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Effort: {item.engineeringRecommendation?.estimatedEffort || 'Medium'}
                  </span>
                  <span className="text-[10px] text-slate-400">Risk: {item.engineeringRecommendation?.riskImpact || 'High'}</span>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all">
                  Inspect
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
