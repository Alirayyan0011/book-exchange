'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-blue-50/40 z-10" />
        <div
          className="w-full h-[120%] bg-cover bg-center bg-no-repeat opacity-60"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`,
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 flex items-center justify-center h-full">
        <div className="text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-slate-800 mb-8 leading-tight tracking-tight"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          >
            Share Books,
            <br />
            <span className="text-blue-500 font-normal">Share Stories</span>
          </h1>

          <p
            className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          >
            A minimalist platform for book lovers to discover, exchange, and share their favorite reads with a global community.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            style={{
              transform: `translateY(${scrollY * 0.05}px)`,
            }}
          >
            <Link
              href="/register"
              className="bg-slate-800 hover:bg-slate-900 text-white px-10 py-4 rounded-full text-lg font-light transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-block"
            >
              Start Exchange
            </Link>
            <Link
              href="/login"
              className="border border-slate-300 text-slate-700 hover:bg-slate-50 px-10 py-4 rounded-full text-lg font-light transition-all duration-300 inline-block"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </div>

      {/* Minimal Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center">
          <div className="w-px h-16 bg-slate-300 mb-2"></div>
          <div className="text-slate-500 text-sm font-light">Scroll</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;