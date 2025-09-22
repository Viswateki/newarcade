import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Github, Upload } from 'lucide-react';

interface UserProfileCardProps {
  image?: string;
  username?: string;
  name?: string;
  githubProfile?: string;
  onImageUpload?: (file: File) => void;
  className?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  image,
  username,
  name,
  githubProfile,
  onImageUpload,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCardClick = () => {
    // Open file picker
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleGithubClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (githubProfile) {
      window.open(githubProfile, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        ref={cardRef}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative w-[300px] h-[400px] rounded-[20px] overflow-hidden border-2 border-transparent transition-all duration-300 cursor-pointer hover:scale-105 ${className}`}
        style={{
          background: 'linear-gradient(145deg, #3B82F6, #1E40AF, #000)',
          '--spotlight-color': 'rgba(255,255,255,0.2)'
        } as React.CSSProperties}
      >
      {/* Spotlight Effect */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
        }}
      />

      {/* Upload Icon Overlay */}
      {isHovered && (
        <div className="absolute top-4 right-4 z-30 bg-black/50 rounded-full p-2 backdrop-blur-sm">
          <Upload className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Profile Image Section */}
      <div className="relative z-10 p-[10px] h-[280px]">
        <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-gray-200 dark:bg-gray-800">
          {image ? (
            <img 
              src={image} 
              alt={name || username || 'User'} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 text-white text-6xl font-bold">
              {(name || username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Upload hint overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-white text-center">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Click to upload image</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Info Section */}
      <div className="relative z-10 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-semibold truncate">
              {name || username || 'User'}
            </h3>
            {username && name && (
              <p className="text-blue-200 text-sm opacity-90">@{username}</p>
            )}
          </div>
          
          {/* GitHub Logo */}
          {githubProfile && (
            <button
              onClick={handleGithubClick}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              title="View GitHub Profile"
            >
              <Github className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
        
        <div className="text-sm text-blue-200 opacity-80">
          Dashboard User
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-5" />
    </div>
    </>
  );
};

export default UserProfileCard;