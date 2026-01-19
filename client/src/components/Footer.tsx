import React from 'react';

/**
 * Your Footer Component
 * Updated with Montserrat, blocky styling, and the current year (2026)
 */
export function Footer() {
  return (
    <footer className="bg-[#1e293b] border-t border-gray-700 py-4 font-['Montserrat']">
      <div className="flex justify-between items-center text-gray-500 text-sm px-6 tracking-tighter uppercase font-black">
        <div className="border-2 border-gray-700 px-2 py-1">
          © 2026 FSDZONES. All rights reserved.
        </div>
        <div className="bg-gray-700 text-slate-200 px-2 py-1">
          Free Journal
        </div>
      </div>
    </footer>
  );
}
