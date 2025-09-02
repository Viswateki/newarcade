"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import CardNav from '@/components/CardNav';
import { navItems } from '../data';
import { useTheme } from '@/contexts/ThemeContext';
import { FiArrowRight, FiGlobe, FiUpload, FiServer, FiDatabase, FiSmartphone, FiCode, FiCloud, FiLayers, FiCheckCircle, FiInfo, FiBookOpen, FiArrowLeft } from 'react-icons/fi';

interface SectionProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

const Section: React.FC<SectionProps> = ({ title, subtitle, children, className = "" }) => (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300 ${className}`}>
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
            {subtitle && <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">{subtitle}</p>}
        </div>
        {children}
    </div>
);

interface StepCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    stepNumber: number;
}

const StepCard: React.FC<StepCardProps> = ({ icon, title, description, stepNumber }) => (
    <div className="relative bg-gray-50 dark:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {stepNumber}
        </div>
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{description}</p>
            </div>
        </div>
    </div>
);

interface PlatformCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    codeTypes: string[];
    color: string;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ icon, title, description, codeTypes, color }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 transition-all duration-300 hover:shadow-md border-l-4" style={{ borderLeftColor: color }}>
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{description}</p>
                <div className="flex flex-wrap gap-2">
                    {codeTypes.map((type, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-full border border-gray-200 dark:border-gray-500">
                            {type}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

interface RequirementItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isRequired: boolean;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ icon, title, description, isRequired }) => (
    <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isRequired ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">{title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${isRequired ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}`}>
                    {isRequired ? 'Required' : 'Recommended'}
                </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
        </div>
    </div>
);

const LearnPage: React.FC = () => {
    const router = useRouter();
    const { theme } = useTheme();

    const submissionSteps = [
        {
            icon: <FiBookOpen />,
            title: "Prepare Your Tool",
            description: "Ensure your tool is fully developed, tested, and ready for public use. Document its features and functionality clearly."
        },
        {
            icon: <FiGlobe />,
            title: "Deploy Your Website",
            description: "Your tool must be deployed and accessible via a public URL. Choose from our recommended platforms based on your code type."
        },
        {
            icon: <FiUpload />,
            title: "Submit for Review",
            description: "Fill out our submission form with your tool details, deployment URL, and relevant documentation."
        },
        {
            icon: <FiCheckCircle />,
            title: "Review & Approval",
            description: "Our team will review your submission for quality, functionality, and compliance with our guidelines."
        }
    ];

    const requirements = [
        {
            icon: <FiGlobe />,
            title: "Deployed Website",
            description: "Your tool must be live and accessible via a public URL",
            isRequired: true
        },
        {
            icon: <FiCode />,
            title: "Source Code Quality",
            description: "Well-structured, documented, and maintainable code",
            isRequired: true
        },
        {
            icon: <FiBookOpen />,
            title: "Documentation",
            description: "Clear instructions on how to use your tool",
            isRequired: true
        },
        {
            icon: <FiCheckCircle />,
            title: "Testing",
            description: "Thoroughly tested functionality with minimal bugs",
            isRequired: false
        }
    ];

    const platforms = [
        {
            icon: <FiCode />,
            title: "Frontend Applications",
            description: "Perfect for React, Vue, Angular, and vanilla JavaScript applications",
            codeTypes: ["React", "Vue.js", "Angular", "HTML/CSS/JS", "Next.js", "Nuxt.js"],
            color: "#3B82F6"
        },
        {
            icon: <FiServer />,
            title: "Backend APIs",
            description: "Ideal for REST APIs, GraphQL servers, and microservices",
            codeTypes: ["Node.js", "Python", "Java", "Go", "PHP", "Ruby"],
            color: "#10B981"
        },
        {
            icon: <FiDatabase />,
            title: "Full-Stack Applications",
            description: "Complete applications with both frontend and backend components",
            codeTypes: ["MERN", "MEAN", "Django", "Rails", "Laravel", "Spring Boot"],
            color: "#8B5CF6"
        },
        {
            icon: <FiLayers />,
            title: "Machine Learning Models",
            description: "ML models, data science projects, and AI-powered applications",
            codeTypes: ["Python/Flask", "FastAPI", "Streamlit", "Gradio", "TensorFlow", "PyTorch"],
            color: "#F59E0B"
        },
        {
            icon: <FiSmartphone />,
            title: "Mobile Applications",
            description: "Cross-platform and native mobile applications",
            codeTypes: ["React Native", "Flutter", "Ionic", "Expo", "PWA"],
            color: "#EF4444"
        },
        {
            icon: <FiCloud />,
            title: "Cloud Functions",
            description: "Serverless functions and microservices deployed on cloud platforms",
            codeTypes: ["AWS Lambda", "Vercel Functions", "Netlify Functions", "Google Cloud Functions"],
            color: "#06B6D4"
        }
    ];

    return (
        <>
            {/* Navigation Header */}
            <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999 }}>
                <CardNav
                    logo="/logo.svg"
                    logoAlt="Company Logo"
                    items={navItems}
                    ease="power3.out"
                />
            </header>

            <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {/* Header with navigation spacing */}
                <div style={{ paddingTop: '80px' }}>
                    {/* Back Button */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                        <button 
                            onClick={() => router.back()}
                            className={`inline-flex items-center px-4 py-2 transition-colors duration-200 mb-6 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <FiArrowLeft className="mr-2" />
                            Back
                        </button>
                    </div>

                    {/* Hero Section */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center mb-16">
                            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Learn to <span className="text-blue-600 dark:text-blue-400">Contribute</span>
                            </h1>
                            <p className={`text-xl max-w-3xl mx-auto mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Discover how to submit your tools, understand deployment requirements, and get recommendations for the best platforms to showcase your code.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
                                    Start Learning
                                    <FiArrowRight className="ml-2" />
                                </button>
                                <button className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
                                    <FiInfo className="mr-2" />
                                    Quick Guide
                                </button>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {/* Section 1: How to Submit Tools */}
                            <Section 
                                title="How to Submit Your Tool" 
                                subtitle="Follow our step-by-step process to get your tool featured on our platform"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {submissionSteps.map((step, index) => (
                                        <StepCard
                                            key={index}
                                            stepNumber={index + 1}
                                            icon={step.icon}
                                            title={step.title}
                                            description={step.description}
                                        />
                                    ))}
                                </div>
                                
                                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                        Ready to Submit?
                                    </h3>
                                    <p className="text-blue-700 dark:text-blue-400 mb-4">
                                        Make sure you meet all requirements before submitting your tool for review.
                                    </p>
                                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                                        Submit Tool
                                        <FiArrowRight className="ml-2" />
                                    </button>
                                </div>
                            </Section>

                            {/* Section 2: Submission Requirements */}
                            <Section 
                                title="Submission Requirements" 
                                subtitle="Essential and recommended requirements for tool submission"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {requirements.map((requirement, index) => (
                                        <RequirementItem
                                            key={index}
                                            icon={requirement.icon}
                                            title={requirement.title}
                                            description={requirement.description}
                                            isRequired={requirement.isRequired}
                                        />
                                    ))}
                                </div>
                                
                                <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300 mb-2">
                                        <FiInfo className="inline mr-2" />
                                        Important Note
                                    </h3>
                                    <p className="text-amber-700 dark:text-amber-400">
                                        Your website must be deployed and accessible before submission. We cannot review tools that are not live and functional.
                                    </p>
                                </div>
                            </Section>

                            {/* Section 3: Platform Recommendations */}
                            <Section 
                                title="Deployment Platform Recommendations" 
                                subtitle="Choose the best platform for your code type and get expert recommendations for deployment"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {platforms.map((platform, index) => (
                                        <PlatformCard
                                            key={index}
                                            icon={platform.icon}
                                            title={platform.title}
                                            description={platform.description}
                                            codeTypes={platform.codeTypes}
                                            color={platform.color}
                                        />
                                    ))}
                                </div>
                                
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2">
                                            Free Deployment Options
                                        </h3>
                                        <p className="text-green-700 dark:text-green-400 text-sm mb-3">
                                            Great for getting started with zero cost
                                        </p>
                                        <ul className="text-green-600 dark:text-green-400 text-sm space-y-1">
                                            <li>• Vercel (Frontend)</li>
                                            <li>• Netlify (Static Sites)</li>
                                            <li>• GitHub Pages (Static)</li>
                                            <li>• Railway (Full-stack)</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">
                                            Enterprise Solutions
                                        </h3>
                                        <p className="text-purple-700 dark:text-purple-400 text-sm mb-3">
                                            For production-ready applications
                                        </p>
                                        <ul className="text-purple-600 dark:text-purple-400 text-sm space-y-1">
                                            <li>• AWS (Scalable)</li>
                                            <li>• Google Cloud (AI/ML)</li>
                                            <li>• Azure (Enterprise)</li>
                                            <li>• DigitalOcean (Simple)</li>
                                        </ul>
                                    </div>
                                </div>
                            </Section>

                            {/* Call to Action Section */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    Ready to Share Your Tool?
                                </h2>
                                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                                    Join our community of developers and share your amazing tools with the world. Get started today!
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <button 
                                        onClick={() => router.push('/tools')}
                                        className="inline-flex items-center px-6 py-3 bg-gray-50 text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        Browse Tools
                                        <FiArrowRight className="ml-2" />
                                    </button>
                                    <button className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200">
                                        Submit Your Tool
                                        <FiUpload className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LearnPage;
