'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Check } from 'lucide-react';

interface Slide {
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  highlights: string[];
  image: string;
  ctaText: string;
  ctaLink: string;
  bgClass: string;
  textColorClass: string;
  isDark: boolean;
}

export default function HomeHeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides: Slide[] = [
    {
      badge: '🔥 NEW PRODUCT LAUNCH',
      title: 'Tap. Share. Connect.',
      subtitle: 'Your Instagram on an NFC Keychain',
      price: 'From ₹150',
      highlights: [
        'Direct Social Profile Link',
        'No QR Code Scanning Required',
        'Compatible with iOS & Android',
      ],
      image: '/nfc_keychain_banner.png',
      ctaText: 'Design NFC Keychain',
      ctaLink: '/product/keychains',
      bgClass: 'bg-gradient-to-br from-yellow-50 via-yellow-100/50 to-yellow-50 border-b-2 border-primary',
      textColorClass: 'text-dark-charcoal',
      isDark: false,
    },
    {
      badge: '✨ BESTSELLER',
      title: 'Impress at First Glance.',
      subtitle: 'Premium Visiting Cards & Business Cards',
      price: 'From ₹90',
      highlights: [
        'Premium 350+ GSM Cardstock',
        'Sleek Matte & Glossy Finishes',
        'Spot UV & Metallic Foils Available',
      ],
      image: '/ai_model_visiting_card.png',
      ctaText: 'Create Business Card',
      ctaLink: '/product/standard-visiting-cards',
      bgClass: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white',
      textColorClass: 'text-white',
      isDark: true,
    },
    {
      badge: '👔 CORPORATE APPAREL',
      title: 'Wear Your Brand Pride.',
      subtitle: 'Premium Embroidered Polo T-Shirts',
      price: 'From ₹299',
      highlights: [
        '100% Breathable Pique Cotton',
        'High-density Machine Embroidery',
        'No Minimum Order Requirements',
      ],
      image: '/ai_model_polo_tshirt.png',
      ctaText: 'Order Team T-Shirts',
      ctaLink: '/product/mens-polo',
      bgClass: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white',
      textColorClass: 'text-white',
      isDark: true,
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  return (
    <section 
      className="relative overflow-hidden w-full h-[880px] sm:h-[980px] lg:h-[550px] border-b-2 border-primary select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Track */}
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={idx}
              className={`absolute top-0 left-0 w-full h-full flex items-center transition-all duration-700 ease-in-out ${slide.bgClass} ${
                isActive ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-8 pointer-events-none'
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8 lg:py-12">
                
                {/* 1. Left Content Area */}
                <div className="lg:col-span-7 space-y-4 lg:space-y-6 text-center lg:text-left flex flex-col justify-center h-full">
                  <div className={`inline-flex items-center gap-1.5 self-center lg:self-start px-3 py-1 rounded-full border-2 ${
                    slide.isDark ? 'border-primary bg-primary/10 text-primary' : 'border-primary bg-white text-dark-charcoal'
                  } text-[10px] font-black tracking-wider uppercase`}>
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    <span>{slide.badge}</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
                    {slide.title} <br/>
                    <span className={slide.isDark ? 'text-primary' : 'text-primary'}>
                      {slide.subtitle}
                    </span>
                  </h1>

                  <p className={`text-base font-bold uppercase tracking-wider ${slide.isDark ? 'text-yellow-400' : 'text-dark-charcoal'}`}>
                    Pricing: {slide.price}
                  </p>

                  <ul className="space-y-2 text-sm font-semibold max-w-md mx-auto lg:mx-0 text-left">
                    {slide.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2">
                        <div className={`p-0.5 rounded-full flex-shrink-0 ${slide.isDark ? 'bg-primary/20' : 'bg-primary/20'}`}>
                          <Check className="h-3.5 w-3.5 text-primary stroke-[3px]" />
                        </div>
                        <span className={slide.isDark ? 'text-neutral-300' : 'text-neutral-600'}>
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                    <Link 
                      href={slide.ctaLink} 
                      className="w-full sm:w-auto btn-primary py-3.5 px-8 text-sm font-black tracking-wider uppercase shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {slide.ctaText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link 
                      href="/catalog" 
                      className={`w-full sm:w-auto text-sm font-black tracking-wider uppercase text-center py-3.5 px-8 border-2 rounded-none transition-all duration-200 ${
                        slide.isDark 
                          ? 'border-white text-white hover:bg-white hover:text-black' 
                          : 'border-dark-charcoal text-dark-charcoal hover:bg-dark-charcoal hover:text-white'
                      }`}
                    >
                      Explore Catalog
                    </Link>
                  </div>
                </div>

                {/* 2. Right Mockup Card Area */}
                <div className="lg:col-span-5 relative flex items-center justify-center h-[260px] sm:h-[350px] lg:h-[400px] mt-6 lg:mt-0">
                  <div className="relative group w-56 h-[240px] sm:w-80 sm:h-[330px] lg:w-80 lg:h-[380px] bg-white border-4 border-primary shadow-2xl overflow-hidden transition-all duration-300 hover:rotate-0 hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.image}
                      alt={slide.subtitle}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Backdrop decoration */}
                  <div className="absolute -top-6 -right-6 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-primary/10 -z-10 blur-xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-primary/10 -z-10 blur-xl"></div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrow buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border-2 border-primary bg-white text-dark-charcoal hover:bg-primary transition-all duration-200 flex items-center justify-center rounded-none shadow-md"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-6 w-6 stroke-[3px]" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border-2 border-primary bg-white text-dark-charcoal hover:bg-primary transition-all duration-200 flex items-center justify-center rounded-none shadow-md"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-6 w-6 stroke-[3px]" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 border-2 border-primary rounded-none transition-all duration-200 ${
              idx === current ? 'bg-primary scale-125' : 'bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
