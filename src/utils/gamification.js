// Gamification System for AI Future Simulator
export class GamificationSystem {
  constructor() {
    this.storageKey = 'futureSimulatorGamification';
    this.achievements = this.loadAchievements();
    this.dailyChallenges = this.generateDailyChallenges();
  }

  // Load achievements from localStorage
  loadAchievements() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load gamification data:', error);
    }
    
    // Default structure
    return {
      points: 0,
      level: 1,
      achievements: [],
      dailyStreak: 0,
      lastLogin: null,
      completedChallenges: [],
      stats: {
        futuresGenerated: 0,
        scenesViewed: 0,
        socialShares: 0,
        milestonesReached: 0,
        totalTimeSpent: 0
      }
    };
  }

  // Save achievements to localStorage
  saveAchievements() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.achievements));
    } catch (error) {
      console.warn('Failed to save gamification data:', error);
    }
  }

  // Daily login streak system
  checkDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = this.achievements.lastLogin;

    if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastLogin === yesterday.toDateString()) {
        this.achievements.dailyStreak++;
        this.addPoints(10 * this.achievements.dailyStreak); // Bonus for streak
        this.unlockAchievement(`streak_${this.achievements.dailyStreak}`, `${this.achievements.dailyStreak} Day Streak`, 10);
      } else if (lastLogin !== today) {
        this.achievements.dailyStreak = 1;
        this.addPoints(10);
      }

      this.achievements.lastLogin = today;
      this.saveAchievements();
      this.checkStreakAchievements();
    }
  }

  // Check for streak-based achievements
  checkStreakAchievements() {
    const streak = this.achievements.dailyStreak;
    const streakAchievements = [
      { id: 'streak_7', required: 7, title: 'Weekly Warrior', points: 50, description: 'Login for 7 consecutive days' },
      { id: 'streak_30', required: 30, title: 'Monthly Master', points: 200, description: 'Login for 30 consecutive days' },
      { id: 'streak_90', required: 90, title: 'Quarterly Champion', points: 500, description: 'Login for 90 consecutive days' }
    ];

    streakAchievements.forEach(achievement => {
      if (streak >= achievement.required && !this.hasAchievement(achievement.id)) {
        this.unlockAchievement(achievement.id, achievement.title, achievement.points, achievement.description);
      }
    });
  }

  // Points and level system
  addPoints(points) {
    this.achievements.points += points;
    
    // Check level up (100 points per level)
    const newLevel = Math.floor(this.achievements.points / 100) + 1;
    if (newLevel > this.achievements.level) {
      const oldLevel = this.achievements.level;
      this.achievements.level = newLevel;
      this.unlockAchievement(`level_${newLevel}`, `Reached Level ${newLevel}`, 25, `Advanced to level ${newLevel}`);
      
      // Special rewards for milestone levels
      if (newLevel % 5 === 0) {
        this.addPoints(50); // Bonus points for every 5 levels
      }
    }
    
    this.saveAchievements();
    return points;
  }

  // Achievement system
  unlockAchievement(id, title, points = 25, description = '') {
    if (this.hasAchievement(id)) return null;

    const achievement = {
      id,
      title,
      description,
      points,
      unlockedAt: new Date().toISOString(),
      type: this.getAchievementType(points),
      rarity: this.getAchievementRarity(points)
    };

    this.achievements.achievements.push(achievement);
    this.addPoints(points);
    this.saveAchievements();

    console.log(`🎉 Achievement Unlocked: ${title} (+${points} points)`);
    return achievement;
  }

  hasAchievement(id) {
    return this.achievements.achievements.some(ach => ach.id === id);
  }

  getAchievementType(points) {
    if (points >= 200) return 'gold';
    if (points >= 100) return 'silver';
    return 'bronze';
  }

  getAchievementRarity(points) {
    if (points >= 200) return 'legendary';
    if (points >= 100) return 'rare';
    if (points >= 50) return 'uncommon';
    return 'common';
  }

  // Content-based achievements
  unlockContentAchievements(userData, futureData) {
    const contentAchievements = [
      {
        id: 'first_future',
        condition: () => this.achievements.stats.futuresGenerated >= 1,
        title: 'Future Visionary',
        points: 25,
        description: 'Generate your first future prediction'
      },
      {
        id: 'high_score',
        condition: () => futureData.score >= 90,
        title: 'Exceptional Potential',
        points: 50,
        description: 'Achieve a future score of 90 or higher'
      },
      {
        id: 'detailed_dream',
        condition: () => userData.dream && userData.dream.length > 100,
        title: 'Detailed Dreamer',
        points: 30,
        description: 'Write a detailed dream description (100+ characters)'
      },
      {
        id: 'multi_milestone',
        condition: () => futureData.timeline && futureData.timeline.length >= 4,
        title: 'Long-term Planner',
        points: 40,
        description: 'Create a timeline with 4 or more milestones'
      },
      {
        id: 'global_citizen',
        condition: () => userData.country && userData.country.length > 0,
        title: 'Global Citizen',
        points: 20,
        description: 'Set your location for personalized predictions'
      }
    ];

    contentAchievements.forEach(achievement => {
      if (achievement.condition() && !this.hasAchievement(achievement.id)) {
        this.unlockAchievement(achievement.id, achievement.title, achievement.points, achievement.description);
      }
    });
  }

  // Progress-based achievements
  unlockProgressAchievements(progressData) {
    const progressAchievements = [
      {
        id: 'first_milestone',
        condition: () => progressData.completed >= 1,
        title: 'First Step',
        points: 25,
        description: 'Complete your first milestone'
      },
      {
        id: 'halfway_progress',
        condition: () => progressData.progressPercentage >= 50,
        title: 'Halfway There',
        points: 50,
        description: 'Reach 50% progress on your goals'
      },
      {
        id: 'completed_all',
        condition: () => progressData.progressPercentage === 100 && progressData.total > 0,
        title: 'Goal Crusher',
        points: 100,
        description: 'Complete all your planned milestones'
      },
      {
        id: 'consistent_progress',
        condition: () => this.achievements.stats.milestonesReached >= 10,
        title: 'Consistent Achiever',
        points: 75,
        description: 'Reach 10 milestones across all predictions'
      }
    ];

    progressAchievements.forEach(achievement => {
      if (achievement.condition() && !this.hasAchievement(achievement.id)) {
        this.unlockAchievement(achievement.id, achievement.title, achievement.points, achievement.description);
      }
    });
  }

  // Social achievements
  unlockSocialAchievements(shareType) {
    this.achievements.stats.socialShares = (this.achievements.stats.socialShares || 0) + 1;
    
    const socialAchievements = [
      {
        id: 'first_share',
        condition: () => this.achievements.stats.socialShares >= 1,
        title: 'Social Sharer',
        points: 20,
        description: 'Share your first future prediction'
      },
      {
        id: 'multiple_share',
        condition: () => this.achievements.stats.socialShares >= 3,
        title: 'Social Butterfly',
        points: 40,
        description: 'Share your predictions 3 times'
      },
      {
        id: 'influencer',
        condition: () => this.achievements.stats.socialShares >= 10,
        title: 'Future Influencer',
        points: 100,
        description: 'Share your predictions 10 times'
      }
    ];

    socialAchievements.forEach(achievement => {
      if (achievement.condition() && !this.hasAchievement(achievement.id)) {
        this.unlockAchievement(achievement.id, achievement.title, achievement.points, achievement.description);
      }
    });
    
    this.saveAchievements();
  }

  // Stats tracking
  updateStats(key, value = 1) {
    this.achievements.stats[key] = (this.achievements.stats[key] || 0) + value;
    this.saveAchievements();
    
    // Check for stat-based achievements
    this.checkStatAchievements();
  }

  checkStatAchievements() {
    const stats = this.achievements.stats;
    const statAchievements = [
      {
        id: 'futures_explorer',
        condition: () => stats.futuresGenerated >= 5,
        title: 'Futures Explorer',
        points: 50,
        description: 'Generate 5 different future predictions'
      },
      {
        id: 'scene_master',
        condition: () => stats.scenesViewed >= 20,
        title: 'Scene Master',
        points: 75,
        description: 'View 20 different future scenes'
      },
      {
        id: 'milestone_expert',
        condition: () => stats.milestonesReached >= 25,
        title: 'Milestone Expert',
        points: 100,
        description: 'Reach 25 milestones across all predictions'
      }
    ];

    statAchievements.forEach(achievement => {
      if (achievement.condition() && !this.hasAchievement(achievement.id)) {
        this.unlockAchievement(achievement.id, achievement.title, achievement.points, achievement.description);
      }
    });
  }

  // Daily challenge system
  generateDailyChallenges() {
    const challenges = [
      {
        id: 'refine_dream',
        title: 'Dream Refinement',
        description: 'Add more details to your dream description',
        points: 25,
        type: 'editing',
        icon: 'edit'
      },
      {
        id: 'set_milestone',
        title: 'Milestone Setter',
        description: 'Add a new milestone to your progress tracker',
        points: 30,
        type: 'progress',
        icon: 'flag'
      },
      {
        id: 'explore_insights',
        title: 'Insight Explorer',
        description: 'Review your AI-generated insights',
        points: 20,
        type: 'learning',
        icon: 'insights'
      },
      {
        id: 'share_future',
        title: 'Future Ambassador',
        description: 'Share your prediction with others',
        points: 35,
        type: 'social',
        icon: 'share'
      }
    ];

    // Simple daily rotation based on date
    const today = new Date().getDate();
    return [challenges[today % challenges.length]];
  }

  getDailyChallenges() {
    return this.dailyChallenges;
  }

  completeChallenge(challengeId) {
    if (!this.achievements.completedChallenges.includes(challengeId)) {
      this.achievements.completedChallenges.push(challengeId);
      const challenge = this.dailyChallenges.find(c => c.id === challengeId);
      if (challenge) {
        this.addPoints(challenge.points);
      }
      this.saveAchievements();
      return true;
    }
    return false;
  }

  // Methods expected by App.js
  getAchievements() {
    return this.achievements.achievements;
  }

  checkAchievements(progressData) {
    const newAchievements = [];
    
    // Update stats from progress data
    if (progressData.futuresGenerated) {
      this.updateStats('futuresGenerated', progressData.futuresGenerated - (this.achievements.stats.futuresGenerated || 0));
    }
    
    if (progressData.scenesViewed) {
      this.updateStats('scenesViewed', progressData.scenesViewed - (this.achievements.stats.scenesViewed || 0));
    }
    
    // Check for basic achievements
    if ((this.achievements.stats.futuresGenerated || 0) >= 1 && !this.hasAchievement('first_future')) {
      newAchievements.push(this.unlockAchievement('first_future', 'Future Visionary', 25, 'Generate your first future prediction'));
    }
    
    if ((this.achievements.stats.futuresGenerated || 0) >= 3 && !this.hasAchievement('multiple_futures')) {
      newAchievements.push(this.unlockAchievement('multiple_futures', 'Future Explorer', 50, 'Generate 3 different future predictions'));
    }
    
    if ((this.achievements.stats.scenesViewed || 0) >= 5 && !this.hasAchievement('scene_explorer')) {
      newAchievements.push(this.unlockAchievement('scene_explorer', 'Scene Explorer', 30, 'View 5 different future scenes'));
    }
    
    return newAchievements.filter(ach => ach !== null);
  }

  // Leaderboard data (local simulation)
  getLeaderboard() {
    return [
      { name: 'Future Champion', level: 15, points: 1450, avatar: '👑', achievements: 28 },
      { name: 'Dream Achiever', level: 12, points: 1180, avatar: '⭐', achievements: 22 },
      { name: 'Goal Getter', level: 10, points: 950, avatar: '🚀', achievements: 18 },
      { name: 'Visionary', level: 8, points: 780, avatar: '🔮', achievements: 15 },
      { name: 'Planner', level: 6, points: 550, avatar: '📊', achievements: 12 }
    ];
  }

  // Get user stats for display
  getUserStats() {
    return {
      points: this.achievements.points,
      level: this.achievements.level,
      achievements: this.achievements.achievements.length,
      dailyStreak: this.achievements.dailyStreak,
      nextLevelPoints: this.achievements.level * 100 - this.achievements.points,
      stats: this.achievements.stats
    };
  }

  // Reset all data (for testing)
  resetData() {
    this.achievements = {
      points: 0,
      level: 1,
      achievements: [],
      dailyStreak: 0,
      lastLogin: null,
      completedChallenges: [],
      stats: {
        futuresGenerated: 0,
        scenesViewed: 0,
        socialShares: 0,
        milestonesReached: 0,
        totalTimeSpent: 0
      }
    };
    this.saveAchievements();
  }
}

// Create and export singleton instance
export const gamificationSystem = new GamificationSystem();
export const gamification = gamificationSystem;