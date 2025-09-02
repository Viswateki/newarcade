import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

const Marquee = ({
  children,
  direction = "left",
  speed = 50,
  pauseOnHover = true,
  className = "",
}: MarqueeProps) => {
  const [contentWidth, setContentWidth] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { theme, colors } = useTheme();

  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth);
    }
  }, [children]);

  return (
    <div
      className={`overflow-hidden relative ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {/* Left fade gradient */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${colors.background}, transparent)`
        }}
      />
      
      {/* Right fade gradient */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${colors.background}, transparent)`
        }}
      />
      
      <div
        className={`flex min-w-full gap-4`}
        style={{
          transform: `translateX(${direction === "left" ? "-" : ""}${isPaused ? contentWidth / 4 : 0}px)`,
          animationName: `scroll-${direction}`,
          animationDuration: `${contentWidth / speed}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        <div ref={contentRef} className="flex gap-4 shrink-0">
          {children}
        </div>
        <div className="flex gap-4 shrink-0">{children}</div>
      </div>

      <style>
        {`
          @keyframes scroll-left {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            from { transform: translateX(-50%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
};

interface ReviewCardProps {
  avatar: string;
  name: string;
  rating: number;
  review: string;
}

const ReviewCard = ({ avatar, name, rating, review }: ReviewCardProps) => {
  const { colors, theme } = useTheme();
  
  return (
    <div className="w-80 p-6 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-105" 
         style={{ 
           backgroundColor: colors.card, 
           borderColor: colors.border,
           color: colors.cardForeground
         }}>
      <div className="flex items-center gap-3 mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover border-2"
          style={{ borderColor: colors.border }}
        />
        <div>
          <h3 className="font-semibold text-lg" style={{ 
            color: theme === 'light' ? '#1e293b' : colors.foreground 
          }}>{name}</h3>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : theme === 'light' ? "text-gray-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed" style={{ 
        color: theme === 'light' ? '#475569' : colors.muted 
      }}>{review}</p>
    </div>
  );
};

// Demo Component
export default function MarqueeDemo() {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      rating: 5,
      review:
        "This product exceeded my expectations! The quality is outstanding and the customer service was excellent.",
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      rating: 4,
      review:
        "Great value for money. Would definitely recommend to others looking for a reliable solution.",
    },
    {
      id: 3,
      name: "Emma Davis",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
      rating: 5,
      review:
        "Absolutely love it! The features are exactly what I needed, and it's so easy to use.",
    },
    {
      id: 4,
      name: "James Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      rating: 4,
      review:
        "Very impressed with the quality and attention to detail. A fantastic product overall.",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col gap-8 items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-center text-foreground mb-6">
            What Our Customers Say
          </h2>
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
  );
}

export { Marquee, ReviewCard };
