import React from 'react';
import { FiTool, FiBookOpen, FiUpload, FiStar, FiTrendingUp, FiUsers, FiZap } from 'react-icons/fi';
import { ReactElement } from 'react';

export const navItems = [
    {
        label: "About",
        bgColor: "#170D27",
        textColor: "#fff",
        links: [
            { label: "Company", href: "/about/company", ariaLabel: "About Company" },
            { label: "Careers", href: "/about/careers", ariaLabel: "About Careers" }
        ]
    },
    {
        label: "Explore",
        bgColor: "#170D27",
        textColor: "#fff",
        links: [
            { label: "Submit Tool", href: "/tools/featured", ariaLabel: "Submit Tool" },
            { label: "Browse Tools", href: "/tools", ariaLabel: "Browse Tools" },
            { label: "Learn", href: "/learn", ariaLabel: "Learning Resources" },
            { label: "Blogs", href: "/blogs", ariaLabel: "Read Blog Posts" }
        ]
    },
    {
        label: "Contact",
        bgColor: "#271E37",
        textColor: "#fff",
        links: [
            { label: "Email", href: "mailto:contact@company.com", ariaLabel: "Email us" },
            { label: "Twitter", href: "https://twitter.com/company", ariaLabel: "Twitter" },
            { label: "LinkedIn", href: "https://linkedin.com/company/company", ariaLabel: "LinkedIn" }
        ]
    }
];

export const toolsCategories = [
    {
        icon: <FiTool className="w-8 h-8" />,
        title: "Development Tools",
        description: "Essential tools for modern software development",
        count: "150+ tools",
        color: "from-[#170D27] to-[#271E37]",
        gradient: "from-gray-50 to-gray-100"
    },
    {
        icon: <FiBookOpen className="w-8 h-8" />,
        title: "Learning Resources",
        description: "Tutorials, courses, and documentation",
        count: "200+ resources",
        color: "from-[#170D27] to-[#271E37]",
        gradient: "from-gray-50 to-gray-100"
    },
    {
        icon: <FiUpload className="w-8 h-8" />,
        title: "Submit Your Tool",
        description: "Share your creation with the community",
        count: "Free submission",
        color: "from-[#170D27] to-[#271E37]",
        gradient: "from-gray-50 to-gray-100"
    }
];

export const featuredTools = [
    { name: "CodeFlow Pro", description: "Advanced code editor with AI assistance", rating: 4.9, users: "2.5K" },
    { name: "DevOps Hub", description: "Complete CI/CD pipeline management", rating: 4.8, users: "1.8K" },
    { name: "DataViz Studio", description: "Interactive data visualization platform", rating: 4.7, users: "1.2K" },
    { name: "API Gateway", description: "Secure API management and monitoring", rating: 4.6, users: "3.1K" }
];

export const heroStats = [
    { icon: <FiUsers className="w-6 h-6 text-white" />, label: "10K+ Active Users" },
    { icon: <FiZap className="w-6 h-6 text-white" />, label: "500+ Tools Available" },
    { icon: <FiStar className="w-6 h-6 text-white" />, label: "4.9/5 Rating" }
];

export const learningPaths = [
    { title: "Frontend Development Fundamentals", progress: 85, color: "from-[#170D27] to-[#271E37]" },
    { title: "Backend Architecture & APIs", progress: 72, color: "from-[#170D27] to-[#271E37]" },
    { title: "DevOps & CI/CD Pipeline", progress: 68, color: "from-[#170D27] to-[#271E37]" },
    { title: "Data Science & Machine Learning", progress: 45, color: "from-[#170D27] to-[#271E37]" }
];

export const communityFeatures = [
    { title: "Developer Forums", description: "Ask questions, share solutions, and learn from peers", members: "5K+ members", icon: <FiUsers className="w-6 h-6" /> },
    { title: "Code Reviews", description: "Get feedback on your code and improve your skills", reviews: "2K+ reviews", icon: <FiTool className="w-6 h-6" /> },
    { title: "Hackathons", description: "Participate in coding challenges and win prizes", events: "Monthly events", icon: <FiZap className="w-6 h-6" /> },
    { title: "Mentorship", description: "Connect with experienced developers for guidance", mentors: "100+ mentors", icon: <FiStar className="w-6 h-6" /> }
];

export const platformStats = [
    { number: "10K+", label: "Active Users", icon: <FiUsers className="w-12 h-12 mx-auto mb-4 text-[#170D27]" /> },
    { number: "500+", label: "Tools Available", icon: <FiTool className="w-12 h-12 mx-auto mb-4 text-[#271E37]" /> },
    { number: "1K+", label: "Learning Resources", icon: <FiBookOpen className="w-12 h-12 mx-auto mb-4 text-[#271E37]" /> },
    { number: "50+", label: "Expert Contributors", icon: <FiStar className="w-12 h-12 mx-auto mb-4 text-[#271E37]" /> }
];
