export class ProgressTracker {
  constructor() {
    this.storageKey = 'futureSimulatorProgress';
  }

  // Save progress to localStorage
  saveProgress(userData, futureData, milestones = []) {
    const progress = {
      userData,
      futureData,
      milestones,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progressScore: this.calculateProgressScore(milestones)
    };

    localStorage.setItem(this.storageKey, JSON.stringify(progress));
    return progress;
  }

  // Load progress from localStorage
  loadProgress() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  // Add a new milestone
  addMilestone(milestone) {
    const progress = this.loadProgress();
    if (!progress) return null;

    const newMilestone = {
      id: Date.now().toString(),
      title: milestone.title,
      description: milestone.description,
      completed: false,
      createdAt: new Date().toISOString(),
      targetDate: milestone.targetDate,
      category: milestone.category || 'general'
    };

    progress.milestones.push(newMilestone);
    progress.updatedAt = new Date().toISOString();
    progress.progressScore = this.calculateProgressScore(progress.milestones);

    this.saveProgress(progress.userData, progress.futureData, progress.milestones);
    return progress;
  }

  // Mark milestone as completed
  completeMilestone(milestoneId) {
    const progress = this.loadProgress();
    if (!progress) return null;

    const milestone = progress.milestones.find(m => m.id === milestoneId);
    if (milestone) {
      milestone.completed = true;
      milestone.completedAt = new Date().toISOString();
      progress.updatedAt = new Date().toISOString();
      progress.progressScore = this.calculateProgressScore(progress.milestones);

      this.saveProgress(progress.userData, progress.futureData, progress.milestones);
      
      // Check for achievements
      this.checkAchievements(progress);
    }

    return progress;
  }

  // Calculate overall progress score
  calculateProgressScore(milestones) {
    if (!milestones.length) return 0;
    
    const completed = milestones.filter(m => m.completed).length;
    return Math.round((completed / milestones.length) * 100);
  }

  // Generate suggested milestones from future data
  generateSuggestedMilestones(futureData) {
    const suggestions = futureData.timeline.map((event, index) => ({
      title: `Prepare for ${event.title}`,
      description: `Start working towards your ${event.year} goal: ${event.title}`,
      targetDate: this.calculateTargetDate(event.year),
      category: 'preparation',
      priority: index === 0 ? 'high' : 'medium'
    }));

    return suggestions;
  }

  calculateTargetDate(futureYear) {
    const currentYear = new Date().getFullYear();
    const yearsDifference = futureYear - currentYear;
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + Math.floor(yearsDifference / 2));
    return targetDate.toISOString().split('T')[0];
  }

  // Achievement system
  checkAchievements(progress) {
    const achievements = [];
    const completedCount = progress.milestones.filter(m => m.completed).length;

    // First milestone achievement
    if (completedCount === 1 && !progress.achievements?.firstMilestone) {
      achievements.push({
        id: 'firstMilestone',
        title: 'First Step!',
        description: 'Completed your first milestone',
        unlockedAt: new Date().toISOString(),
        type: 'bronze'
      });
    }

    // Halfway achievement
    const totalMilestones = progress.milestones.length;
    if (completedCount >= Math.ceil(totalMilestones / 2) && !progress.achievements?.halfway) {
      achievements.push({
        id: 'halfway',
        title: 'Halfway There!',
        description: 'Completed half of your milestones',
        unlockedAt: new Date().toISOString(),
        type: 'silver'
      });
    }

    // All milestones achievement
    if (completedCount === totalMilestones && totalMilestones > 0 && !progress.achievements?.allComplete) {
      achievements.push({
        id: 'allComplete',
        title: 'Goal Getter!',
        description: 'Completed all your milestones',
        unlockedAt: new Date().toISOString(),
        type: 'gold'
      });
    }

    // Add achievements to progress
    if (achievements.length > 0) {
      progress.achievements = [...(progress.achievements || []), ...achievements];
      this.saveProgress(progress.userData, progress.futureData, progress.milestones);
    }

    return achievements;
  }

  // Get progress statistics
  getProgressStats() {
    const progress = this.loadProgress();
    if (!progress) return null;

    const totalMilestones = progress.milestones.length;
    const completed = progress.milestones.filter(m => m.completed).length;
    const upcoming = progress.milestones.filter(m => !m.completed);
    const overdue = upcoming.filter(m => {
      if (!m.targetDate) return false;
      return new Date(m.targetDate) < new Date();
    });

    return {
      total: totalMilestones,
      completed,
      remaining: totalMilestones - completed,
      progressPercentage: progress.progressScore,
      upcoming: upcoming.length,
      overdue: overdue.length,
      achievements: progress.achievements || []
    };
  }
}

export const progressTracker = new ProgressTracker();