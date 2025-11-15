export class SocialManager {
  constructor() {
    this.storageKey = 'futureSimulatorCommunity';
  }

  initialize() {
    // Initialize community posts if not already done
    this.getCommunityPosts();
    return true;
  }

  // Share future to community feed
  shareToCommunity(userData, futureData, message = '') {
    const post = {
      id: Date.now().toString(),
      userId: this.generateUserId(userData.name),
      userName: userData.name,
      userAvatar: this.generateAvatar(userData.name),
      futureScore: futureData.score,
      dream: userData.dream,
      country: userData.country,
      message: message || `Just discovered my future potential! ${futureData.score}/100 🚀`,
      timelinePreview: futureData.timeline.slice(0, 2).map(event => ({
        year: event.year,
        title: event.title
      })),
      likes: 0,
      comments: [],
      shares: 0,
      createdAt: new Date().toISOString(),
      isPublic: true
    };

    // Save to local storage (in real app, this would be API call)
    this.savePost(post);
    return post;
  }

  generateUserId(name) {
    return `user_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }

  generateAvatar(name) {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
    const color = colors[name.length % colors.length];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    return {
      initials,
      color,
      type: 'generated'
    };
  }

  savePost(post) {
    const community = this.getCommunityPosts();
    community.posts.unshift(post);
    localStorage.setItem(this.storageKey, JSON.stringify(community));
  }

  getCommunityPosts() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default community posts for demo
    return {
      posts: [
        {
          id: '1',
          userId: 'user_alex_johnson',
          userName: 'Alex Johnson',
          userAvatar: { initials: 'AJ', color: '#3b82f6', type: 'generated' },
          futureScore: 87,
          dream: 'Build a sustainable tech startup that helps reduce carbon emissions',
          country: 'Canada',
          message: 'Excited to see my path to making a positive environmental impact! 🌍',
          timelinePreview: [
            { year: 2025, title: 'Tech Prototype Development' },
            { year: 2027, title: 'First Major Funding Round' }
          ],
          likes: 24,
          comments: [
            { user: 'Sarah Chen', text: 'Amazing goal! The world needs more sustainable tech.', likes: 3 }
          ],
          shares: 5,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isPublic: true
        },
        {
          id: '2',
          userId: 'user_maria_garcia',
          userName: 'Maria Garcia',
          userAvatar: { initials: 'MG', color: '#10b981', type: 'generated' },
          futureScore: 92,
          dream: 'Open a chain of community health centers in underserved areas',
          country: 'Mexico',
          message: 'My future is all about bringing healthcare to those who need it most! ❤️',
          timelinePreview: [
            { year: 2024, title: 'Medical Certification Completion' },
            { year: 2026, title: 'First Health Center Launch' }
          ],
          likes: 31,
          comments: [
            { user: 'Dr. James Wilson', text: 'Inspiring vision! Healthcare accessibility is crucial.', likes: 5 },
            { user: 'Lisa Park', text: 'This is exactly what our communities need!', likes: 2 }
          ],
          shares: 8,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          isPublic: true
        },
        {
          id: '3',
          userId: 'user_david_kim',
          userName: 'David Kim',
          userAvatar: { initials: 'DK', color: '#f59e0b', type: 'generated' },
          futureScore: 78,
          dream: 'Become a professional musician and tour the world',
          country: 'South Korea',
          message: 'Turning my passion for music into a lifelong career! 🎵',
          timelinePreview: [
            { year: 2025, title: 'First Album Release' },
            { year: 2028, title: 'International Tour' }
          ],
          likes: 18,
          comments: [
            { user: 'MusicLover42', text: 'Can\'t wait to hear your music! What genre?', likes: 1 }
          ],
          shares: 3,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          isPublic: true
        }
      ]
    };
  }

  // Like a post
  likePost(postId) {
    const community = this.getCommunityPosts();
    const post = community.posts.find(p => p.id === postId);
    if (post) {
      post.likes++;
      localStorage.setItem(this.storageKey, JSON.stringify(community));
    }
    return post;
  }

  // Add comment to post
  addComment(postId, commentText, userName = 'You') {
    const community = this.getCommunityPosts();
    const post = community.posts.find(p => p.id === postId);
    
    if (post) {
      const comment = {
        user: userName,
        text: commentText,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      
      post.comments.push(comment);
      localStorage.setItem(this.storageKey, JSON.stringify(community));
    }
    
    return post;
  }

  // Find similar dreams
  findSimilarDreams(userDream, limit = 5) {
    const community = this.getCommunityPosts();
    const allPosts = community.posts;
    
    // Simple keyword matching for similarity
    const userKeywords = this.extractKeywords(userDream);
    
    const similarPosts = allPosts.map(post => {
      const postKeywords = this.extractKeywords(post.dream);
      const commonKeywords = userKeywords.filter(keyword => 
        postKeywords.includes(keyword)
      );
      
      return {
        ...post,
        similarityScore: commonKeywords.length / Math.max(userKeywords.length, postKeywords.length),
        commonKeywords
      };
    }).filter(post => post.similarityScore > 0.3)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
    
    return similarPosts;
  }

  extractKeywords(text) {
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'a', 'an', 'my', 'your']);
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
  }

  // Get community statistics
  getCommunityStats() {
    const community = this.getCommunityPosts();
    const posts = community.posts;
    
    return {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
      totalComments: posts.reduce((sum, post) => sum + post.comments.length, 0),
      averageScore: Math.round(posts.reduce((sum, post) => sum + post.futureScore, 0) / posts.length),
      mostCommonCountry: this.getMostCommonCountry(posts),
      activeUsers: new Set(posts.map(post => post.userId)).size
    };
  }

  getMostCommonCountry(posts) {
    if (!posts || posts.length === 0) return 'Global';
    
    const countryCount = posts.reduce((acc, post) => {
      acc[post.country] = (acc[post.country] || 0) + 1;
      return acc;
    }, {});
    
    const keys = Object.keys(countryCount);
    if (keys.length === 0) return 'Global';
    
    return keys.reduce((a, b) => 
      countryCount[a] > countryCount[b] ? a : b
    );
  }

  // Future challenges (community goals)
  getCommunityChallenges() {
    return [
      {
        id: 'climate_challenge',
        title: 'Climate Action Champions',
        description: 'Join others working on environmental sustainability projects',
        participants: 142,
        goal: 'Reduce carbon footprint through innovative solutions',
        badge: '🌱',
        category: 'environment'
      },
      {
        id: 'education_challenge',
        title: 'Education for All',
        description: 'Support educational initiatives in underserved communities',
        participants: 89,
        goal: 'Improve access to quality education worldwide',
        badge: '📚',
        category: 'education'
      },
      {
        id: 'health_challenge',
        title: 'Global Health Heroes',
        description: 'Work towards better healthcare accessibility',
        participants: 67,
        goal: 'Make healthcare available to everyone',
        badge: '❤️',
        category: 'health'
      },
      {
        id: 'innovation_challenge',
        title: 'Tech Innovators',
        description: 'Create technology that solves real-world problems',
        participants: 203,
        goal: 'Develop impactful technological solutions',
        badge: '💡',
        category: 'technology'
      }
    ];
  }

  // Join a challenge
  joinChallenge(challengeId, userName) {
    const challenges = JSON.parse(localStorage.getItem('futureChallenges') || '{}');
    if (!challenges[challengeId]) {
      challenges[challengeId] = [];
    }
    
    if (!challenges[challengeId].includes(userName)) {
      challenges[challengeId].push(userName);
      localStorage.setItem('futureChallenges', JSON.stringify(challenges));
    }
    
    return challenges[challengeId];
  }
}

export const socialManager = new SocialManager();