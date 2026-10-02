import React from 'react';

export const EventCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse flex flex-col">
      <div className="aspect-[16/10] bg-slate-200"></div>
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-6 bg-slate-200 rounded w-16"></div>
          <div className="h-8 bg-slate-200 rounded-xl w-24"></div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-6 py-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div key={cIdx} className="h-4 bg-slate-200 rounded w-full"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCardSkeleton;
