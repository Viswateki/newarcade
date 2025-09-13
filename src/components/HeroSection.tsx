// components/HeroSection.js
import React from 'react';
import DecryptedText from './DecryptedText';
import GradientText from './GradientText';
import StarBorder from './StarBorder';
import { useTheme } from '@/contexts/ThemeContext';

export default function HeroSection() {
  const { colors, theme } = useTheme();

  return (
    <section 
      className="relative flex items-center justify-center w-full min-h-screen overflow-hidden transition-colors duration-300 pt-20"
      style={{ 
        backgroundColor: colors.background,
        color: colors.foreground 
      }}
    >
      {/* Background with a subtle gradient effect that adapts to theme */}
      <div 
        className="absolute inset-0 opacity-90 transition-colors duration-300"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(to bottom right, #0f1419, #1a1f29, #1e3a8a)'
            : 'linear-gradient(to bottom right, #f8fafc, #e2e8f0, #cbd5e1)'
        }}
      ></div>
      
      {/* Enhanced light effect from bottom for light theme */}
      {theme === 'light' && (
        <div 
          className="absolute inset-0 opacity-40 transition-colors duration-300"
          style={{
            background: 'radial-gradient(ellipse 800px 400px at center bottom, rgba(147, 197, 253, 0.6) 0%, rgba(59, 130, 246, 0.3) 40%, transparent 70%)'
          }}
        ></div>
      )}
      
      {/* Hero content container */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="max-w-4xl mx-auto text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
          <DecryptedText
            text="An arcade of AI "
            sequential={true}
            speed={70}
            revealDirection="center"
            className="transition-colors duration-300"
            style={{ 
              color: theme === 'dark' ? colors.foreground : '#1e293b',
              textShadow: theme === 'light' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
            }}
            encryptedClassName="text-blue-400"
            parentClassName="block"
            animateOn="view"
          />
        </h1>
        
        <div className="max-w-2xl mx-auto mb-8">
          <GradientText
            className="text-lg sm:text-xl md:text-2xl font-medium"
            colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
            animationSpeed={8}
          >
            explore tools. write blogs. join the community
          </GradientText>
        </div>

        {/* Call-to-action button */}
        <StarBorder
          as="button"
          className="mb-2 me-2"
          color="#00d4ff"
          speed="3s"
          thickness={2}
          onClick={() => window.location.href = '/signup'}
        >
          Get Started
        </StarBorder>
      </div>
      
      {/* Bottom fade transition */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, ${colors.background})`
        }}
      />
    </section>
  );
}