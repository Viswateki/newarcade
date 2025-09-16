"use client";
import React, { useRef, useState } from "react";
import { useTheme } from '@/contexts/ThemeContext';

interface FAQItem {
  q: string;
  a: string;
}

interface FaqsCardProps {
  faqsList: FAQItem;
  idx: number;
}

const FaqsCard: React.FC<FaqsCardProps> = ({ faqsList, idx }) => {
  const { colors, theme } = useTheme();
  const answerElRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(false);
  const [answerH, setAnswerH] = useState("0px");

  const handleOpenAnswer = () => {
    if (answerElRef.current) {
      const firstChild = answerElRef.current.childNodes[0] as HTMLElement;
      const answerElH = firstChild.offsetHeight;
      setState(!state);
      setAnswerH(`${answerElH + 20}px`);
    }
  };

  return (
    <div
      className="space-y-3 mt-5 overflow-hidden border-b transition-colors duration-300"
      key={idx}
      onClick={handleOpenAnswer}
      style={{ borderBottomColor: colors.border }}
    >
      <h4 
        className="cursor-pointer pb-5 flex items-center justify-between text-lg font-medium transition-colors duration-300"
        style={{ color: theme === 'dark' ? '#f8f9fa' : '#1a1a1a' }}
      >
        {faqsList.q}
        {state ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2 transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 12H4"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2 transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
      </h4>
      <div
        ref={answerElRef}
        className="duration-300"
        style={state ? { height: answerH } : { height: "0px" }}
      >
        <div>
          <p 
            className="transition-colors duration-300"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            {faqsList.a}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQSection: React.FC = () => {
  const { colors, theme } = useTheme();
  
  const faqsList: FAQItem[] = [
    {
      q: "What are some random questions to ask?",
      a: "That's exactly the reason we created this random question generator. There are hundreds of random questions to choose from so you're able to find the perfect random question.",
    },
    {
      q: "Do you include common questions?",
      a: "This generator doesn't include most common questions. The thought is that you can come up with common questions on your own so most of the questions in this generator.",
    },
    {
      q: "Can I use this for 21 questions?",
      a: "Yes! there are two ways that you can use this question generator depending on what you're after. You can indicate that you want 21 questions generated.",
    },
    {
      q: "Are these questions for girls or for boys?",
      a: "The questions in this generator are gender neutral and can be used to ask either male of females (or any other gender the person identifies with).",
    },
    {
      q: "What do you wish you had more talent doing?",
      a: "If you've been searching for a way to get random questions, you've landed on the correct webpage. We created the Random Question Generator to ask you as many random questions as your heart desires.",
    },
  ];

  return (
    <section 
      className="leading-relaxed max-w-screen-xl mt-12 mx-auto px-4 md:px-8 py-16 transition-colors duration-300"
      style={{ backgroundColor: theme === 'dark' ? '#0f1419' : '#fafbfc' }}
    >
      <div className="space-y-3 text-center">
        <h1 
          className="text-3xl font-semibold transition-colors duration-300"
          style={{ color: theme === 'dark' ? '#f8f9fa' : '#1a1a1a' }}
        >
          Frequently Asked Questions
        </h1>
        <p 
          className="text-lg max-w-lg mx-auto transition-colors duration-300"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
        >
          Answered all frequently asked questions, Still confused? feel free to
          contact us.
        </p>
      </div>
      <div className="mt-14 max-w-2xl mx-auto">
        {faqsList.map((item, idx) => (
          <FaqsCard key={idx} idx={idx} faqsList={item} />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
