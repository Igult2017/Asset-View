import React from 'react';

/**
 * Your Footer Component
 * Updated with Montserrat, blocky styling, and the current year (2026)
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0e27] py-4 font-['Montserrat'] relative">
      <div className="flex justify-between items-center text-[#8b92b0] text-sm px-6 tracking-tighter uppercase font-black relative z-10">
        <div className="hover:text-white transition-colors">
          © {currentYear} FSDZONES.
        </div>
      </div>
    </footer>
  );
}
