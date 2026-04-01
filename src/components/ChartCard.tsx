'use client';

import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ChartCardProps {
  title: string;
  description?: string;
  useCases?: string[];
  children: React.ReactNode;
  controls?: React.ReactNode;
}

export default function ChartCard({ title, description, useCases, children, controls }: ChartCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {(description || useCases) && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="Toggle info"
            >
              <Info size={18} />
            </button>
          )}
        </div>
        {controls && (
          <div className="flex items-center gap-2 flex-wrap">{controls}</div>
        )}
      </div>
      {showInfo && (description || useCases) && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 text-sm text-gray-700">
          {description && <p className="mb-1">{description}</p>}
          {useCases && useCases.length > 0 && (
            <div className="mt-1">
              <span className="font-medium">Use cases: </span>
              {useCases.join(' · ')}
            </div>
          )}
        </div>
      )}
      <div className="p-4" style={{ minHeight: 400 }}>
        {children}
      </div>
    </div>
  );
}
