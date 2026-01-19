import React from 'react';

/**
 * Your Footer Component
 * Updated with Montserrat, blocky styling, and the current year (2026)
 */
export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#1a1f3a] via-[#111827] to-[#0f1629] border-t border-white/10 py-4 font-['Montserrat'] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-30" />
      <div className="flex justify-between items-center text-[#8b92b0] text-sm px-6 tracking-tighter uppercase font-black relative z-10">
        <div className="border border-white/10 px-2 py-1 hover:text-white transition-colors">
          © 2026 FSDZONES. All rights reserved.
        </div>
        <div className="bg-white/5 text-blue-400 px-2 py-1 border border-white/10">
          Free Journal
        </div>
      </div>
    </footer>
  );
}
