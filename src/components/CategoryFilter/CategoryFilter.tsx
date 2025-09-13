import { ChevronLeft, ChevronRight } from "lucide-react";
import CategoryChip from "./CategoryChip";
import { useTheme } from '@/contexts/ThemeContext';

interface CategoryFilterProps {
  categories?: string[];
  activeCategory?: string;
  onCategoryClick?: (category: string) => void;
}

const CategoryFilter = ({
  categories = [
    "All",
    "Technology",
    "Programming",
    "Data Science",
    "AI & Machine Learning",
    "Web Development",
    "Mobile Development",
    "DevOps",
    "Design",
    "Startup",
    "Career",
    "Tutorial",
    "News",
    "Opinion",
    "Review",
  ],
  activeCategory = "All",
  onCategoryClick = () => {},
}: CategoryFilterProps) => {
  const { colors } = useTheme();
  
  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("category-scroll-container");
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div 
      className="sticky top-14 w-full h-14 z-40"
      style={{ backgroundColor: colors.background }}
    >
      <div className="relative flex items-center h-full max-w-4xl mx-auto px-6">
        {/* Left fade and scroll button */}
        <div 
          className="absolute left-0 h-full flex items-center pl-6 pr-8 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${colors.background} 50%, transparent 100%)`
          }}
        >
          <button
            onClick={() => scrollContainer("left")}
            className="flex-shrink-0 p-2 rounded-full transition-all duration-200 pointer-events-auto shadow-sm"
            style={{
              color: colors.foreground,
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.muted;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.card;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable categories container */}
        <div
          id="category-scroll-container"
          className="flex-1 overflow-x-auto scrollbar-hide mx-16 py-2"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
          }}
        >
          <div className="flex gap-3 px-8">
            {categories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                isActive={category === activeCategory}
                onClick={() => onCategoryClick(category)}
              />
            ))}
          </div>
        </div>

        {/* Right fade and scroll button */}
        <div 
          className="absolute right-0 h-full flex items-center pr-6 pl-8 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, ${colors.background} 50%, transparent 100%)`
          }}
        >
          <button
            onClick={() => scrollContainer("right")}
            className="flex-shrink-0 p-2 rounded-full transition-all duration-200 pointer-events-auto shadow-sm"
            style={{
              color: colors.foreground,
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.muted;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.card;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
