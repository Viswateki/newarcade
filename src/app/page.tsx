"use client";
import React from 'react';
import NavigationWrapper from '@/components/NavigationWrapper';
import HeroSection from '@/components/HeroSection';
import { Marquee, ReviewCard } from '@/components/Marquee';
import { useTheme } from '@/contexts/ThemeContext';

const Page: React.FC = () => {
  const { colors } = useTheme();

  // Reviews data for the marquee
  const reviews = [
    {
      id: 1,
      name: "Viswagna Bramha",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=viswagna",
      rating: 5,
      review:
        "The AI tools are incredibly powerful and easy to use. I've been able to build complex projects in record time thanks to this platform.",
    },
    {
      id: 2,
      name: "Harsha Vardhan Kalla",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=harsha",
      rating: 5,
      review:
        "The blog section is a game-changer! The articles are well-written and provide so much insight into the latest trends and techniques in AI development.",
    },
    {
      id: 3,
      name: "Manohar Kota",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manohar",
      rating: 5,
      review:
        "I love the strong sense of community here. Everyone is so helpful and collaborative, and the support I've received has been invaluable.",
    },
    {
      id: 4,
      name: "Kishore",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kishore",
      rating: 5,
      review:
        "The AI tools are not just powerful, they're also thoughtfully designed. They've helped me streamline my workflow and focus on creativity.",
    },
    {
      id: 5,
      name: "Salman Shaik",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=salman",
      rating: 5,
      review:
        "The blog content is top-tier. I'm always looking forward to the new posts—they are always filled with practical examples and deep dives.",
    },
    {
      id: 6,
      name: "Gopi",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gopi",
      rating: 5,
      review:
        "This is more than just a platform; it's a community of innovators. The forums and channels for communication are truly fantastic.",
    },
  ];

  return (
    <>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: colors.background,
          color: colors.foreground
        }}
      >
        <NavigationWrapper />
        <HeroSection />

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 -mt-10">
          <div className="w-full space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold mb-6" style={{ color: colors.foreground }}>
                What Our Community Says
              </h2>
              <p className="text-lg opacity-70 max-w-2xl mx-auto" style={{ color: colors.muted }}>
                Join thousands of developers who are already building amazing things with our platform
              </p>
            </div>
            <Marquee direction="left" className="py-4" speed={30}>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  avatar={review.avatar}
                  name={review.name}
                  rating={review.rating}
                  review={review.review}
                />
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;