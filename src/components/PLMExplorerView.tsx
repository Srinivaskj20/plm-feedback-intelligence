import React, { useState } from 'react';
import {
  Boxes,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { Product, ComponentBOM, PLMStage } from '../types';

interface PLMExplorerViewProps {
  products: Product[];
  bomList: ComponentBOM[];
}

const PLM_STAGES: PLMStage[] = [
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

export const PLMExplorerView: React.FC<PLMExplorerViewProps> = ({ products, bomList }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'prod-001');

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const productBOM = bomList.filter((b) => b.productId === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Boxes className="w-5 h-5 text-indigo-500" />
          Product Lifecycle & BOM Assembly Explorer
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inspect physical assembly BOM structures, track revision levels, and evaluate component health scores across PLM stages.
        </p>
      </div>

      {/* PLM Stages Process Flow Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] shadow-sm overflow-x-auto">
        <div className="flex items-center min-w-max gap-2">
          {PLM_STAGES.map((stage, idx) => {
            const isCurrentProductStage = activeProduct?.lifecycleStage === stage;
            return (
              <React.Fragment key={stage}>
                <div
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isCurrentProductStage
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[10px] opacity-70">0{idx + 1}</span>
                  <span>{stage}</span>
                </div>
                {idx < PLM_STAGES.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Product Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {products.map((p) => {
          const isSelected = p.id === selectedProductId;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#18181b] hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {p.code}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{p.version}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Health: {p.healthScore}%</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{p.lifecycleStage}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Product BOM Structure */}
      {activeProduct && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeProduct.name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  {activeProduct.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeProduct.description}</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Assembly Components</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeProduct.componentsCount} Parts</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Health Index</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeProduct.healthScore}%</span>
              </div>
            </div>
          </div>

          {/* BOM Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Component Code</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Revision</th>
                  <th className="py-2.5 px-3">Material Spec</th>
                  <th className="py-2.5 px-3">Current PLM Stage</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {productBOM.map((bom) => (
                  <tr key={bom.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {bom.componentCode}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{bom.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{bom.revision}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{bom.material}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                        {bom.currentStage}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bom.status === 'Redesign Required'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                            : bom.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        }`}
                      >
                        {bom.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
