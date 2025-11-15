import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { socialManager } from '../utils/socialManager';

const CommunityFeed = ({ userData, futureData, onShare }) => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const community = socialManager.getCommunityPosts();
    setPosts(community.posts);
  };

  const handleLike = (postId) => {
    socialManager.likePost(postId);
    loadPosts(); // Refresh posts
  };

  const handleAddComment = (postId) => {
    if (newComment.trim()) {
      socialManager.addComment(postId, newComment, userData?.name || 'Anonymous');
      setNewComment('');
      loadPosts();
    }
  };

  const handleShareToCommunity = () => {
    if (userData && futureData) {
      socialManager.shareToCommunity(userData, futureData, shareMessage);
      setShowShareModal(false);
      setShareMessage('');
      loadPosts();
      
      if (onShare) {
        onShare();
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="community-feed">
      {/* Share to Community Button */}
      {userData && futureData && (
        <motion.div
          className="share-to-community"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button 
            className="share-community-btn"
            onClick={() => setShowShareModal(true)}
          >
            <Icon name="share" size={20} />
            Share Your Future with Community
          </button>
        </motion.div>
      )}

      {/* Community Posts */}
      <div className="posts-container">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            className="community-post"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Post Header */}
            <div className="post-header">
              <div 
                className="user-avatar"
                style={{ backgroundColor: post.userAvatar.color }}
              >
                {post.userAvatar.initials}
              </div>
              <div className="user-info">
                <h4>{post.userName}</h4>
                <span className="post-time">{formatTime(post.createdAt)}</span>
              </div>
              <div className="future-score-badge">
                {post.futureScore}/100
              </div>
            </div>

            {/* Post Content */}
            <div className="post-content">
              <p className="post-message">{post.message}</p>
              <div className="dream-preview">
                <strong>Dream:</strong> {post.dream}
              </div>
              <div className="country-tag">
                <Icon name="location" size={14} />
                {post.country}
              </div>
            </div>

            {/* Timeline Preview */}
            <div className="timeline-preview">
              <h5>Future Timeline:</h5>
              {post.timelinePreview.map((event, idx) => (
                <div key={idx} className="timeline-event-preview">
                  <span className="year">{event.year}</span>
                  <span className="title">{event.title}</span>
                </div>
              ))}
            </div>

            {/* Post Actions */}
            <div className="post-actions">
              <button 
                className="action-btn like-btn"
                onClick={() => handleLike(post.id)}
              >
                <Icon name="favorite" size={16} />
                {post.likes}
              </button>
              <button 
                className="action-btn comment-btn"
                onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
              >
                <Icon name="comment" size={16} />
                {post.comments.length}
              </button>
              <button className="action-btn share-btn">
                <Icon name="share" size={16} />
                {post.shares}
              </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {selectedPost?.id === post.id && (
                <motion.div
                  className="comments-section"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="comments-list">
                    {post.comments.map((comment, idx) => (
                      <div key={idx} className="comment">
                        <strong>{comment.user}:</strong> {comment.text}
                        <span className="comment-likes">
                          <Icon name="favorite" size={12} />
                          {comment.likes}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Comment */}
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <button onClick={() => handleAddComment(post.id)}>
                      <Icon name="send" size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="share-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Share Your Future</h3>
              <p>Inspire others by sharing your journey!</p>
              
              <textarea
                placeholder="Add a message to the community..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows="3"
              />
              
              <div className="preview-card">
                <div className="preview-header">
                  <div 
                    className="user-avatar"
                    style={{ backgroundColor: '#3b82f6' }}
                  >
                    {userData?.name?.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <strong>{userData?.name}</strong>
                    <div>Future Score: {futureData?.score}/100</div>
                  </div>
                </div>
                <p>{shareMessage || `Just discovered my future potential! ${futureData?.score}/100 🚀`}</p>
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowShareModal(false)}>Cancel</button>
                <button 
                  onClick={handleShareToCommunity}
                  className="primary"
                >
                  Share to Community
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityFeed;