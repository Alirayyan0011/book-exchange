'use client';

import React, { useEffect, useState } from 'react';

const Stats = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const stats = [
    {
      number: '15K+',
      label: 'Books Shared',
      description: 'Stories exchanged'
    },
    {
      number: '8K+',
      label: 'Happy Readers',
      description: 'Active community'
    },
    {
      number: '120+',
      label: 'Cities',
      description: 'Global reach'
    },
    {
      number: '98%',
      label: 'Satisfaction',
      description: 'User experience'
    }
  ];

  const AnimatedNumber = ({ number, isVisible }: { number: string, isVisible: boolean }) => {
    const [displayNumber, setDisplayNumber] = useState('0');

    useEffect(() => {
      if (isVisible) {
        const timeout = setTimeout(() => {
          setDisplayNumber(number);
        }, 200);
        return () => clearTimeout(timeout);
      }
    }, [isVisible, number]);

    return (
      <span className={`transition-all duration-1000 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
        {displayNumber}
      </span>
    );
  };

  return (
    <section id="stats-section" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-light text-slate-800 mb-6 tracking-tight">
            Trusted by Readers
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
            Join our growing community of book enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center transform transition-all duration-700 delay-${index * 100} ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <div className="text-3xl lg:text-4xl font-light text-slate-800 mb-2">
                <AnimatedNumber number={stat.number} isVisible={isVisible} />
              </div>
              <div className="text-sm font-normal text-slate-800 mb-1">
                {stat.label}
              </div>
              <div className="text-slate-500 text-xs font-light">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;