import { useState, useEffect } from 'react';

const TrendIcon = ({ trend }: { trend: 'positive' | 'negative' | 'neutral' }) => {
  if (trend === 'positive') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    );
  } else if (trend === 'negative') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    );
  } else {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    );
  }
};

const StatCard = ({ stat, index, isLoaded }: { stat: any, index: number, isLoaded: boolean }) => {
  return (
    <div
      className={`relative group bg-[#0f0f12] border border-[#1f1f23] rounded-xl p-6 transition-all duration-300 hover:border-[#3f3f46] hover:bg-[#141418] ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 100}px` }}
    >
      {/* Accent Line */}
      <div 
        className={`absolute top-0 left-6 right-6 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          stat.trend === 'positive' ? 'bg-emerald-500' : stat.trend === 'negative' ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />

      <div className="flex items-center gap-2 mb-4">
        <span className={`w-1.5 h-1.5 rounded-full ${
          stat.trend === 'positive' ? 'bg-emerald-500' : stat.trend === 'negative' ? 'bg-rose-500' : 'bg-amber-500'
        }`} />
        <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500">
          {stat.label}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold tracking-tight ${
          stat.trend === 'positive' ? 'text-emerald-400' : stat.trend === 'negative' ? 'text-rose-400' : 'text-amber-400'
        }`}>
          {stat.value}
        </span>
        {stat.unit && (
          <span className="text-zinc-600 text-sm font-medium uppercase tracking-wider">{stat.unit}</span>
        )}
      </div>
    </div>
  );
};

export function StatsCards({ stats }: { stats: any[] }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {stats.map((stat, index) => (
        <StatCard 
          key={index} 
          stat={stat} 
          index={index} 
          isLoaded={isLoaded} 
        />
      ))}
    </div>
  );
}
