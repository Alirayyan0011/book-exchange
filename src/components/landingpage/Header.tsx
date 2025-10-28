'use client';

import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-light text-slate-800 tracking-wide hover:text-slate-600 transition-colors">
              BookShare
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-10">
            <a href="#home" className="text-slate-600 hover:text-slate-800 transition-colors font-light text-sm">
              Home
            </a>
            <a href="#features" className="text-slate-600 hover:text-slate-800 transition-colors font-light text-sm">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-800 transition-colors font-light text-sm">
              How It Works
            </a>
            <a href="#contact" className="text-slate-600 hover:text-slate-800 transition-colors font-light text-sm">
              Contact
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-800 px-6 py-2 rounded-full transition-colors font-light text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-slate-800 text-white px-6 py-2 rounded-full hover:bg-slate-900 transition-all duration-300 font-light text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;