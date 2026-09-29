import React, { useState } from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { FeedbackItem, PLMStage, PriorityLevel, SentimentType } from '../types';

interface FeedbackHubViewProps {
  feedbackList: FeedbackItem[];
  onSelectFeedback: (item: FeedbackItem) => void;
  setActiveTab: (tab: string) => void;
}

export const FeedbackHubView: React.FC<FeedbackHubViewProps> = ({
  feedbackList,
  onSelectFeedback,
  setActiveTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');

  // Filter logic
  const filtered = feedbackList.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStage = selectedStage === 'ALL' || f.plmStage === selectedStage;
    const matchesPriority = selectedPriority === 'ALL' || f.priority === selectedPriority;
    const matchesSentiment = selectedSentiment === 'ALL' || f.sentimentLabel === selectedSentiment;

    return matchesSearch && matchesStage && matchesPriority && matchesSentiment;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Customer Feedback Intelligence Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse, filter, and inspect analyzed customer tickets mapped to Product Lifecycle stages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ingest New Feedback
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, keywords, topics..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111114] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* PLM Stage Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111114] text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All PLM Stages</option>
              <option value="Requirement Gathering">Requirement Gathering</option>
              <option value="Design">Design</option>
              <option value="Development">Development</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Quality">Quality</option>
              <option value="Testing">Testing</option>
              <option value="Release">Release</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retirement">Retirement</option>
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111114] text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="w-full py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111114] text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#111114] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="py-3 px-4">Priority / Status</th>
                <th className="py-3 px-4">Title & Product</th>
                <th className="py-3 px-4">PLM Stage</th>
                <th className="py-3 px-4">Sentiment & Emotion</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Topics</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectFeedback(item)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  {/* Priority & Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          item.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-300/50'
                            : item.priority === 'High'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300/50'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <div className="text-[10px] text-slate-400">{item.status}</div>
                    </div>
                  </td>

                  {/* Title & Product */}
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {item.productName}
                    </p>
                  </td>

                  {/* PLM Stage */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                      {item.plmStage}
                    </span>
                  </td>

                  {/* Sentiment & Emotion */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.sentimentLabel === 'Positive'
                            ? 'bg-emerald-500'
                            : item.sentimentLabel === 'Negative'
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {item.sentimentScore > 0 ? `+${item.sentimentScore}` : item.sentimentScore}
                      </span>
                      <span className="text-[10px] text-slate-400">({item.sentimentLabel})</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                      {item.category}
                    </span>
                  </td>

                  {/* Topics */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {item.topics.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No customer feedback records match your active search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
