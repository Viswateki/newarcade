'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaStar, FaEdit, FaTrash, FaQuoteLeft } from 'react-icons/fa';
import { databaseService, Review } from '@/lib/database';

interface ReviewsSectionProps {
  user: any;
}

export default function ReviewsSection({ user }: ReviewsSectionProps) {
  const { colors } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (user?.$id) {
        setLoading(true);
        try {
          const userReviews = await databaseService.getUserReviews(user.$id);
          setReviews(userReviews);
        } catch (error) {
          console.error('Error fetching reviews:', error);
          setReviews([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReviews();
  }, [user?.$id]);

  const handleEditReview = (reviewId: string | undefined) => {
    if (reviewId) {
      // Navigate to edit review
      console.log('Edit review:', reviewId);
    }
  };

  const handleDeleteReview = async (reviewId: string | undefined) => {
    if (!reviewId) return;
    
    if (window.confirm('Are you sure you want to delete this review?')) {
      setReviews(reviews.filter(review => review.$id !== reviewId));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div 
        className="p-6 rounded-xl border animate-pulse"
        style={{ 
          backgroundColor: colors.card, 
          borderColor: colors.border 
        }}
      >
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-xl border transition-all duration-300 animate-slideInRight"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.border,
        color: colors.cardForeground 
      }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: colors.accent + '20' }}
        >
          <FaStar className="w-5 h-5" style={{ color: colors.accent }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">My Reviews</h3>
          <p className="text-sm opacity-70">{reviews.length} reviews written</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <FaQuoteLeft className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No reviews yet</h4>
            <p className="text-sm opacity-70">Share your experience with tools to help others make informed decisions</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div 
              key={review.$id}
              className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
              style={{ 
                backgroundColor: colors.background, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-base mb-1">{review.target_title}</h4>
                  {renderStars(review.rating)}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditReview(review.$id)}
                    className="p-2 rounded-lg transition-colors duration-200 hover:bg-blue-100"
                    title="Edit review"
                  >
                    <FaEdit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button 
                    onClick={() => handleDeleteReview(review.$id)}
                    className="p-2 rounded-lg transition-colors duration-200 hover:bg-red-100"
                    title="Delete review"
                  >
                    <FaTrash className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm mb-3 line-clamp-3" style={{ color: colors.cardForeground }}>
                "{review.comment}"
              </p>
              
              <div className="flex items-center justify-between text-xs opacity-60">
                <span>{formatDate(review.created_at)}</span>
                <span>{review.likes} likes</span>
              </div>
            </div>
          ))
        )}
      </div>

      {reviews.length > 0 && (
        <div className="mt-6 text-center">
          <button 
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: colors.accent }}
          >
            View all reviews →
          </button>
        </div>
      )}
    </div>
  );
}
