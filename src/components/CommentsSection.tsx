import React, { useState, useEffect, useContext } from 'react';
import { BlogComment } from '@/lib/appwrite';
import { blogService } from '@/lib/blogService_new';
import Comment from './Comment';
import { Button } from '@/components/ui/button';

// We'll need to get the AuthContext from your existing context
// For now, we'll use a simple interface
interface User {
  $id?: string;
  id?: string;
  name?: string;
  username?: string;
}

interface CommentsSectionProps {
  blogId: string;
  currentUser?: User | null;
}

export default function CommentsSection({ blogId, currentUser }: CommentsSectionProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  // Load comments on component mount
  useEffect(() => {
    loadComments();
  }, [blogId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const [commentsData, count] = await Promise.all([
        blogService.getComments(blogId),
        blogService.getCommentsCount(blogId)
      ]);
      
      setComments(commentsData);
      setCommentsCount(count);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle top-level comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await blogService.addComment(
        blogId,
        currentUser.$id || currentUser.id || '',
        newCommentContent.trim(),
        currentUser.name || currentUser.username || 'Anonymous',
        '', // userAvatar - you can add this later
        undefined // No parent for top-level comments
      );

      setNewCommentContent('');
      // Reload comments to show the new one
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reply to a comment
  const handleReply = async (parentId: string, content: string) => {
    if (!currentUser) return;

    try {
      await blogService.addComment(
        blogId,
        currentUser.$id || currentUser.id || '',
        content,
        currentUser.name || currentUser.username || 'Anonymous',
        '', // userAvatar
        parentId
      );

      // Reload comments to show the new reply
      await loadComments();
    } catch (error) {
      console.error('Error submitting reply:', error);
      throw error; // Re-throw to be handled by Comment component
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    try {
      await blogService.deleteComment(commentId);
      // Reload comments to remove the deleted one
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  // Organize comments into a tree structure
  const organizeComments = (comments: BlogComment[]) => {
    const commentMap = new Map<string, BlogComment>();
    const topLevelComments: BlogComment[] = [];
    const repliesMap = new Map<string, BlogComment[]>();

    // First pass: create comment map and initialize replies
    comments.forEach(comment => {
      commentMap.set(comment.$id!, comment);
      if (!comment.parent_comment_id) {
        topLevelComments.push(comment);
      } else {
        if (!repliesMap.has(comment.parent_comment_id)) {
          repliesMap.set(comment.parent_comment_id, []);
        }
        repliesMap.get(comment.parent_comment_id)!.push(comment);
      }
    });

    return { topLevelComments, repliesMap };
  };

  const { topLevelComments, repliesMap } = organizeComments(comments);

  // Get replies for a specific comment
  const getReplies = (commentId: string): BlogComment[] => {
    return repliesMap.get(commentId) || [];
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Comments Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Comments ({commentsCount})
        </h3>
        
        {/* Top-level comment form */}
        {currentUser ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {currentUser.name?.[0]?.toUpperCase() || 
                 currentUser.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  rows={4}
                  maxLength={5000}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {newCommentContent.length}/5000
                  </span>
                  <Button
                    type="submit"
                    disabled={!newCommentContent.trim() || isSubmitting}
                    className="px-6 py-2"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400">
              <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </a>
              {' '}to join the conversation
            </p>
          </div>
        )}
      </div>

      {/* Comments List */}
      {topLevelComments.length > 0 ? (
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <Comment
              key={comment.$id}
              comment={comment}
              replies={getReplies(comment.$id!)}
              onReply={handleReply}
              onDelete={handleDeleteComment}
              currentUser={currentUser}
              depth={0}
              maxDepth={3}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No comments yet
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            Be the first to share your thoughts on this post!
          </p>
        </div>
      )}
    </div>
  );
}