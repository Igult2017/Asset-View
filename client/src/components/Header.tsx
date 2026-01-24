import { useState } from 'react';
import { useLocation, Link } from "wouter";
import { Plus, Menu, X, Settings } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'ANALYTICS', path: '/' },
    { name: 'OVERVIEW', path: '/overview' },
    { name: 'STRATEGY AUDIT', path: '/strategy-audit' },
    { name: 'DRAWDOWN', path: '/drawdown' },
    { name: 'TRADE VAULT', path: '/trade-vault' }
  ];

  return (
    <header 
      className="w-full bg-gradient-to-br from-[#1a1f3a] via-[#111827] to-[#0f1629] relative z-50 border-b-[1px] border-white/10 overflow-hidden"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Montserrat font is imported in index.css or App.tsx */}
      
      {/* Animated Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6] via-[#8b5cf6] to-transparent opacity-80" />
      
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between relative z-10">
        
        {/* Left: Logo & Desktop Nav */}
        <div className="flex items-center gap-8 lg:gap-12">
          {/* Logo Section */}
          <Link href="/">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <polyline 
                    points="0,16 8,16 10,8 14,24 18,12 22,20 26,16 32,16" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  />
                </svg>
              </div>
              <div className="text-white text-lg sm:text-xl font-[900] tracking-tighter italic group-hover:text-blue-400 transition-colors uppercase">FSDZONES</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`px-4 py-2 text-[11px] lg:text-[12px] font-[900] tracking-tight transition-all duration-300 relative cursor-pointer bg-transparent border-none outline-none ${
                    location === item.path 
                      ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-blue-500' 
                      : 'text-[#8b92b0] hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section: Button & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/log-entry">
            <button className="relative overflow-hidden group bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white px-4 sm:px-7 py-2.5 sm:py-3 text-[11px] sm:text-[13px] font-[900] tracking-tighter flex items-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] transition-all active:scale-95">
              <span className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 -translate-x-full" />
              <Plus className="hidden sm:block w-3.5 h-3.5" strokeWidth={3} />
              LOG ENTRY
            </button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-[#8b92b0] hover:text-white transition-all"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" strokeWidth={3} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={3} />
            )}
          </button>

          {/* Settings Button (Desktop) */}
          <button className="hidden md:flex w-11 h-11 bg-white/5 border border-white/10 items-center justify-center group hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300" />
            <Settings 
              className="w-6 h-6 text-[#8b92b0] group-hover:text-blue-400 group-hover:rotate-90 transition-all duration-500 ease-out relative z-10" 
            />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 border-t border-white/10' : 'max-h-0'}`}>
        <div className="flex flex-col p-4 gap-2 bg-[#0f1629]">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`w-full text-left px-4 py-3 text-[12px] font-[900] tracking-tight transition-all duration-300 ${
                  location === item.path 
                    ? 'text-white bg-blue-600/20 border-l-4 border-blue-500' 
                    : 'text-[#8b92b0] hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
