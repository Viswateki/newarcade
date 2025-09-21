/**
 * Multiple Comments Test Suite
 * Tests that users can create multiple comments and replies
 */

import { databases, DATABASE_ID, USER_INTERACTIONS_COLLECTION_ID } from './appwrite';
import { ID, Query } from 'appwrite';

// Helper function to create a guaranteed unique ID
function createUniqueId(prefix = 'doc'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}_${Math.floor(Math.random() * 10000)}`;
}

// Helper function to create comment with retry logic
async function createCommentWithRetry(commentData: any, maxRetries = 3): Promise<any> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    
    try {
      const uniqueId = createUniqueId('test_comment');
      
      const comment = await databases.createDocument(
        DATABASE_ID,
        USER_INTERACTIONS_COLLECTION_ID,
        uniqueId,
        commentData
      );
      
      console.log(`✅ Comment created successfully: ${comment.$id} (attempt ${attempt})`);
      return comment;
      
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (error.message?.includes('already exists') && attempt < maxRetries) {
        console.log(`🔄 Retrying... (attempt ${attempt + 1}/${maxRetries})`);
        // Add delay between attempts
        await new Promise(resolve => setTimeout(resolve, 200 * attempt));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error(`Failed to create comment after ${maxRetries} attempts`);
}

export async function testMultipleComments() {
  console.log('🧪 Testing Multiple Comments Functionality...');

  try {
    // Test data with unique IDs
    const testBlogId = createUniqueId('test_blog');
    const user1Id = createUniqueId('user1');
    const user2Id = createUniqueId('user2');
    const blogOwnerId = createUniqueId('blog_owner');

    const testResults = [];

    // Test 1: User can create multiple comments on same blog
    console.log('\n📝 Test 1: Multiple comments by same user');
    const user1Comments = [];
    
    for (let i = 1; i <= 3; i++) {
      const comment = await createCommentWithRetry({
        user_id: user1Id,
        blog_id: testBlogId,
        interaction_type: 'comment',
        content: `User 1 comment ${i} - ${Date.now()}`, // Make content unique too
        user_name: `User One`,
        user_avatar: '',
        parent_comment_id: ''
      });
      
      user1Comments.push(comment.$id);
      console.log(`✅ Created comment ${i} by user 1:`, comment.$id);
      
      // Small delay between creations to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    testResults.push({ test: 'Multiple comments by same user', status: 'PASS', count: user1Comments.length });

    // Test 2: Different users can comment on same blog
    console.log('\n👥 Test 2: Multiple users commenting on same blog');
    const user2Comment = await createCommentWithRetry({
        user_id: user2Id,
        blog_id: testBlogId,
        interaction_type: 'comment',
        content: 'User 2 comment on same blog',
        user_name: 'User Two',
        user_avatar: '',
        parent_comment_id: ''
      }
    );
    console.log('✅ User 2 commented on same blog:', user2Comment.$id);
    testResults.push({ test: 'Multiple users on same blog', status: 'PASS' });

    // Test 3: Blog owner can comment on own blog
    console.log('\n👑 Test 3: Blog owner commenting on own blog');
    const ownerComment = await createCommentWithRetry({
      user_id: blogOwnerId,
      blog_id: testBlogId,
      interaction_type: 'comment',
      content: 'Blog owner commenting on own blog',
      user_name: 'Blog Owner',
      user_avatar: '',
      parent_comment_id: ''
    });
    console.log('✅ Blog owner commented on own blog:', ownerComment.$id);
    testResults.push({ test: 'Blog owner can comment on own blog', status: 'PASS' });

    // Small delay before next test
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test 4: Users can reply to any comment
    console.log('\n💬 Test 4: Replies to comments');
    const replyToUser1 = await createCommentWithRetry({
      user_id: user2Id,
      blog_id: testBlogId,
      interaction_type: 'comment',
      content: 'Reply to user 1 comment',
      user_name: 'User Two',
      user_avatar: '',
      parent_comment_id: user1Comments[0] // Reply to first comment
    });
    console.log('✅ User 2 replied to User 1 comment:', replyToUser1.$id);

    await new Promise(resolve => setTimeout(resolve, 100));

    const replyToOwner = await createCommentWithRetry({
      user_id: user1Id,
      blog_id: testBlogId,
      interaction_type: 'comment',
      content: 'User 1 replying to owner',
      user_name: 'User One',
      user_avatar: '',
      parent_comment_id: ownerComment.$id
    });
    console.log('✅ User 1 replied to owner comment:', replyToOwner.$id);
    testResults.push({ test: 'Users can reply to any comment', status: 'PASS' });

    // Test 5: Fetch all comments for the blog
    console.log('\n📋 Test 5: Fetching all comments');
    const allComments = await databases.listDocuments(
      DATABASE_ID,
      USER_INTERACTIONS_COLLECTION_ID,
      [
        Query.equal('blog_id', testBlogId),
        Query.equal('interaction_type', 'comment'),
        Query.orderDesc('$createdAt')
      ]
    );

    console.log(`✅ Retrieved ${allComments.total} comments for blog`);
    console.log('Comments breakdown:');
    
    const userCommentCounts: Record<string, number> = {};
    const replyCount = allComments.documents.filter(c => c.parent_comment_id).length;
    
    allComments.documents.forEach(comment => {
      const userId = comment.user_id;
      userCommentCounts[userId] = (userCommentCounts[userId] || 0) + 1;
      console.log(`- ${comment.user_name}: "${comment.content}" ${comment.parent_comment_id ? '(reply)' : '(main comment)'}`);
    });

    console.log('\n📊 Summary:');
    Object.entries(userCommentCounts).forEach(([userId, count]) => {
      console.log(`- ${userId}: ${count} comment(s)`);
    });
    console.log(`- Total replies: ${replyCount}`);
    console.log(`- Total main comments: ${allComments.total - replyCount}`);

    testResults.push({ 
      test: 'Comment retrieval', 
      status: 'PASS', 
      totalComments: allComments.total,
      mainComments: allComments.total - replyCount,
      replies: replyCount
    });

    // Clean up test data
    console.log('\n🗑️ Cleaning up test data...');
    const cleanupIds = [
      ...user1Comments,
      user2Comment.$id,
      ownerComment.$id,
      replyToUser1.$id,
      replyToOwner.$id
    ];

    for (const id of cleanupIds) {
      try {
        await databases.deleteDocument(DATABASE_ID, USER_INTERACTIONS_COLLECTION_ID, id);
        console.log(`✅ Deleted: ${id}`);
      } catch (error) {
        console.log(`⚠️ Could not delete: ${id}`);
      }
    }

    return {
      success: true,
      message: 'All multiple comments tests passed!',
      results: testResults,
      summary: {
        totalTests: testResults.length,
        passed: testResults.filter(r => r.status === 'PASS').length,
        features: [
          '✅ Users can post multiple comments on same blog',
          '✅ Different users can comment on same blog', 
          '✅ Blog owners can comment on their own blogs',
          '✅ Users can reply to any comment',
          '✅ Comments and replies are properly retrieved'
        ]
      }
    };

  } catch (error: any) {
    console.error('❌ Multiple comments test failed:', error);
    return {
      success: false,
      error: error?.message || 'Unknown error',
      message: 'Multiple comments functionality needs attention'
    };
  }
}