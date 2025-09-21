import React, { useState, useContext } from 'react';
import { BlogComment } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';

// For now, we'll assume user data is passed as prop or use a simple auth state
// This will be properly integrated with your AuthContext later

interface User {
  $id?: string;
  id?: string;
  name?: string;
  username?: string;
}

interface CommentProps {
  comment: BlogComment;
  replies: BlogComment[];
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  currentUser?: User | null;
  depth?: number;
  maxDepth?: number;
}

export default function Comment({ 
  comment, 
  replies, 
  onReply, 
  onDelete,
  currentUser,
  depth = 0,
  maxDepth = 3
}: CommentProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.$id!, replyContent.trim());
      setReplyContent('');
      setShowReplyBox(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !comment.$id) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (confirmed) {
      try {
        await onDelete(comment.$id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Calculate left margin for nesting, with max depth limit
  const nestingLevel = Math.min(depth, maxDepth);
  const leftMargin = nestingLevel * 24; // 24px per level

  return (
    <div 
      className="border-l-2 border-gray-100 dark:border-gray-800 transition-colors duration-200"
      style={{ marginLeft: `${leftMargin}px` }}
    >
      <div className="pl-4 py-3">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {comment.user_name?.[0]?.toUpperCase() || comment.user_id?.[0]?.toUpperCase() || '?'}
            </div>
            
            {/* User name and timestamp */}
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {comment.user_name || 'Anonymous User'}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                {comment.$createdAt && formatDate(comment.$createdAt)}
              </span>
            </div>
          </div>

          {/* Delete button for comment owner */}
          {currentUser && onDelete && (currentUser.$id || currentUser.id) === comment.user_id && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete
            </button>
          )}
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {currentUser && depth < maxDepth && (
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium transition-colors"
            >
              {showReplyBox ? 'Cancel' : 'Reply'}
            </button>
          )}
          
          {replies.length > 0 && (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {/* Reply Form */}
        {showReplyBox && currentUser && (
          <form onSubmit={handleSubmitReply} className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={3}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {replyContent.length}/1000
              </span>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Render Replies Recursively */}
      {replies.length > 0 && (
        <div className="space-y-1">
          {replies.map((reply) => (
            <Comment
              key={reply.$id}
              comment={reply}
              replies={[]} // Will be populated by parent component
              onReply={onReply}
              onDelete={onDelete}
              currentUser={currentUser}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
}