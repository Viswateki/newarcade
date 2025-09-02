'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import CardNav from './CardNav';

export default function NavigationWrapper() {
  const { user, loading, logout } = useAuth();
  const { theme, colors } = useTheme();

  // Don't render navigation while loading
  if (loading) {
    return null;
  }

  // If user is authenticated, show authenticated navigation with CardNav
  if (user) {
    const authenticatedNavItems = [
      {
        label: "Workspace",
        bgColor: "#0D0716",
        textColor: "#fff",
        links: [
          { label: "Dashboard", href: "/dashboard", ariaLabel: "Go to your dashboard" },
          { label: "My Blogs", href: "/blogs?author=me", ariaLabel: "View your published blogs" },
          { label: "Analytics", href: "/dashboard#analytics", ariaLabel: "View your content analytics" }
        ]
      },
      {
        label: "Create", 
        bgColor: "#170D27",
        textColor: "#fff",
        links: [
          { label: "Write Blog", href: "/create-blog", ariaLabel: "Create a new blog post" },
          { label: "Submit Tool", href: "/submit-tool", ariaLabel: "Submit a developer tool" },
          { label: "Share Resource", href: "/submit-tool", ariaLabel: "Share a helpful resource" }
        ]
      },
      {
        label: "Discover", 
        bgColor: "#1E1E2E",
        textColor: "#fff",
        links: [
          { label: "All Blogs", href: "/blogs", ariaLabel: "Browse all community blogs" },
          { label: "Tools", href: "/tools", ariaLabel: "Browse developer tools" },
          { label: "Trending", href: "/blogs?sort=trending", ariaLabel: "See trending content" }
        ]
      }
    ];

    return (
      <CardNav
        logo="/logo.svg"
        logoAlt="DevTools Hub Logo"
        items={authenticatedNavItems}
        baseColor={theme === 'dark' ? '#1a1f29' : '#fafbfc'}
        menuColor={theme === 'dark' ? '#f8f9fa' : '#1a1a1a'}
        buttonBgColor={theme === 'dark' ? '#dc2626' : '#dc2626'}
        buttonTextColor="#f8f9fa"
        ease="power3.out"
        user={user}
      />
    );
  }

  // Original nav items for non-authenticated users
  const publicNavItems = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Company", ariaLabel: "About Company" },
        { label: "Careers", ariaLabel: "About Careers" }
      ]
    },
    {
      label: "Content", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "All Blogs", href: "/blogs", ariaLabel: "Browse all community blogs" },
        { label: "Tools", href: "/tools", ariaLabel: "Browse developer tools" }
      ]
    },
    {
      label: "Community", 
      bgColor: "#1E1E2E",
      textColor: "#fff",
      links: [
        { label: "Featured", ariaLabel: "Featured Projects" },
        { label: "Case Studies", ariaLabel: "Project Case Studies" },
        { label: "Join Discord", ariaLabel: "Join our Discord community" }
      ]
    }
  ];

  return (
    <CardNav
      logo="/logo.svg"
      logoAlt="DevTools Hub Logo"
      items={publicNavItems}
      baseColor={theme === 'dark' ? '#1a1f29' : '#fafbfc'}
      menuColor={theme === 'dark' ? '#f8f9fa' : '#1a1a1a'}
      buttonBgColor={theme === 'dark' ? '#2a2f3a' : '#2a2a2a'}
      buttonTextColor="#f8f9fa"
      ease="power3.out"
    />
  );
}
