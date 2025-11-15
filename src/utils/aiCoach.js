import { chatGPTService } from './chatGPTService';

export class AICoach {
  constructor() {
    this.coachingData = this.loadCoachingData();
    this.dailyTips = this.generateDailyTips();
    this.useAI = true; // Toggle for AI-powered coaching
  }

  loadCoachingData() {
    const stored = localStorage.getItem('futureSimulatorCoach');
    return stored ? JSON.parse(stored) : {
      dailyCheckIns: [],
      motivationHistory: [],
      skillRecommendations: [],
      resourceSuggestions: [],
      progressAssessments: []
    };
  }

  saveCoachingData() {
    localStorage.setItem('futureSimulatorCoach', JSON.stringify(this.coachingData));
  }

  // Daily motivation and check-ins
  async getDailyMotivation(userData, progressData) {
    let message, action, affirmation;

    if (this.useAI) {
      try {
        // Use AI for personalized motivation
        message = await chatGPTService.generatePersonalizedMotivation(userData, progressData);
        action = await chatGPTService.generateActionSteps(userData, progressData);
        affirmation = await chatGPTService.generateAffirmation(userData);
      } catch (error) {
        console.warn('AI coaching failed, falling back to static responses:', error);
        // Fallback to static responses
        ({ message, action, affirmation } = this.getStaticDailyMotivation(userData, progressData));
      }
    } else {
      ({ message, action, affirmation } = this.getStaticDailyMotivation(userData, progressData));
    }

    const today = new Date().toDateString();

    // Track daily check-in
    this.coachingData.dailyCheckIns.push({
      date: today,
      motivation: message,
      progress: progressData?.progressPercentage || 0,
      mood: 'motivated'
    });

    this.saveCoachingData();

    return {
      message,
      action,
      affirmation
    };
  }

  getStaticDailyMotivation(userData, progressData) {
    const motivations = [
      "Every great journey begins with a single step. Your future is being shaped by today's actions.",
      "Dreams don't work unless you do. Your dedication is the bridge between your goals and accomplishments.",
      "The future belongs to those who believe in the beauty of their dreams. Keep pushing forward!",
      "Small progress is still progress. Celebrate every step toward your amazing future.",
      "Your potential is limitless. Each day brings new opportunities to move closer to your dreams.",
      "Success is the sum of small efforts repeated day in and day out. You're building something incredible.",
      "The only limit to your impact is your imagination and commitment. Dream big and act now!",
      "You are the author of your life story. Make today's chapter one you'll be proud to read later."
    ];

    const today = new Date().toDateString();
    const dailyMotivation = motivations[new Date().getDate() % motivations.length];

    return {
      message: dailyMotivation,
      action: this.getDailyAction(progressData),
      affirmation: this.generateAffirmation(userData.dream)
    };
  }

  getDailyAction(progressData) {
    const actions = [
      "Review your top milestone and identify one small step you can take today.",
      "Spend 5 minutes visualizing your success and how it will feel to achieve your dream.",
      "Share your progress with someone who supports your goals.",
      "Learn one new thing related to your dream today.",
      "Identify and remove one small obstacle standing in your way.",
      "Celebrate a recent success, no matter how small.",
      "Update your progress tracker with any new accomplishments.",
      "Research someone who has achieved a similar goal for inspiration."
    ];

    return actions[new Date().getDay()];
  }

  generateAffirmation(dream) {
    const affirmations = [
      `I am capable of achieving ${dream}.`,
      `Every day I move closer to making ${dream} a reality.`,
      `I have the power to create the future I envision with ${dream}.`,
      `My commitment to ${dream} grows stronger each day.`,
      `I am worthy of achieving ${dream} and living my best life.`,
      `Challenges are opportunities for growth on my path to ${dream}.`,
      `I attract the resources and people needed to achieve ${dream}.`
    ];

    return affirmations[Math.floor(Math.random() * affirmations.length)];
  }

  // Progress-based coaching
  async getProgressCoaching(progressData, userData) {
    let coaching;

    if (this.useAI) {
      try {
        coaching = await chatGPTService.generateProgressCoaching(userData, progressData);
      } catch (error) {
        console.warn('AI progress coaching failed, falling back to static responses:', error);
        coaching = this.getStaticProgressCoaching(progressData, userData);
      }
    } else {
      coaching = this.getStaticProgressCoaching(progressData, userData);
    }

    // Store progress assessment
    this.coachingData.progressAssessments.push({
      date: new Date().toISOString(),
      ...coaching
    });

    this.saveCoachingData();

    return coaching;
  }

  getStaticProgressCoaching(progressData, userData) {
    return {
      assessment: this.assessProgress(progressData),
      recommendations: this.generateProgressRecommendations(progressData),
      encouragement: this.getProgressEncouragement(progressData),
      warning: this.checkForWarningSigns(progressData)
    };
  }

  assessProgress(progressData) {
    if (!progressData) return 'beginning';

    const progress = progressData.progressPercentage;
    
    if (progress === 0) return 'beginning';
    if (progress < 25) return 'early_stages';
    if (progress < 50) return 'making_progress';
    if (progress < 75) return 'halfway_there';
    if (progress < 90) return 'nearing_completion';
    return 'almost_there';
  }

  generateProgressRecommendations(progressData) {
    const assessment = this.assessProgress(progressData);
    
    const recommendations = {
      beginning: [
        "Break your first milestone into even smaller, daily actions",
        "Set up a consistent routine for working on your goals",
        "Identify potential obstacles and plan how to overcome them"
      ],
      early_stages: [
        "Celebrate your early progress to build momentum",
        "Review and adjust your timeline if needed",
        "Connect with others who share similar goals"
      ],
      making_progress: [
        "Increase your weekly time commitment slightly",
        "Share your progress to stay accountable",
        "Learn advanced skills related to your goals"
      ],
      halfway_there: [
        "Review what's working well and do more of it",
        "Prepare for upcoming challenges",
        "Help someone else who's starting their journey"
      ],
      nearing_completion: [
        "Focus on finishing strong",
        "Plan your next goals after completion",
        "Document your journey to help others"
      ],
      almost_there: [
        "Maintain consistency until the finish line",
        "Prepare for life after goal completion",
        "Celebrate your incredible achievement"
      ]
    };

    return recommendations[assessment] || recommendations.beginning;
  }

  getProgressEncouragement(progressData) {
    const progress = progressData?.progressPercentage || 0;
    
    if (progress === 0) {
      return "The journey of a thousand miles begins with a single step. You've taken the most important one!";
    } else if (progress < 25) {
      return "Great start! Building momentum is key in the early stages. Keep going!";
    } else if (progress < 50) {
      return "You're building solid foundations. Consistency now will pay off greatly later!";
    } else if (progress < 75) {
      return "Halfway there! You've overcome many challenges already. The rest is within reach!";
    } else if (progress < 90) {
      return "You're in the final stretch! Your dedication is about to pay off in amazing ways!";
    } else {
      return "Almost there! Your perseverance is inspiring. Finish strong!";
    }
  }

  checkForWarningSigns(progressData) {
    if (!progressData) return null;

    const warnings = [];
    const lastProgress = this.getLastProgressUpdate();

    if (lastProgress && progressData.progressPercentage === lastProgress.percentage) {
      const daysStagnant = this.getDaysSince(lastProgress.date);
      if (daysStagnant > 7) {
        warnings.push(`No progress recorded for ${daysStagnant} days. Consider adjusting your approach.`);
      }
    }

    if (progressData.overdue > 0) {
      warnings.push(`You have ${progressData.overdue} overdue milestones. Let's reassess your timeline.`);
    }

    return warnings.length > 0 ? warnings : null;
  }

  getLastProgressUpdate() {
    const assessments = this.coachingData.progressAssessments;
    return assessments.length > 0 ? assessments[assessments.length - 1] : null;
  }

  getDaysSince(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    return Math.floor((today - date) / (1000 * 60 * 60 * 24));
  }

  // Skill development recommendations
  async getSkillRecommendations(userData, futureData, dreamAnalysis) {
    let skillData;

    if (this.useAI) {
      try {
        const aiSkills = await chatGPTService.generateSkillRecommendations(userData, dreamAnalysis);
        skillData = {
          currentSkills: userData.skills || ['Planning & Organization', 'Time Management', 'Goal Setting'],
          recommendedSkills: aiSkills.skills,
          priority: aiSkills.priority,
          learningPath: this.createLearningPath(aiSkills.skills),
          resources: this.getSkillResources(aiSkills.skills)
        };
      } catch (error) {
        console.warn('AI skill recommendations failed, falling back to static responses:', error);
        skillData = this.getStaticSkillRecommendations(userData, futureData, dreamAnalysis);
      }
    } else {
      skillData = this.getStaticSkillRecommendations(userData, futureData, dreamAnalysis);
    }

    // Store recommendations
    this.coachingData.skillRecommendations.push({
      date: new Date().toISOString(),
      skills: skillData.recommendedSkills,
      priority: skillData.priority
    });

    this.saveCoachingData();

    return skillData;
  }

  getStaticSkillRecommendations(userData, futureData, dreamAnalysis) {
    const baseSkills = dreamAnalysis?.skills || [
      'Planning & Organization',
      'Time Management',
      'Goal Setting',
      'Persistence',
      'Adaptability'
    ];

    // Add context-specific skills
    const contextSkills = this.getContextSpecificSkills(userData, futureData);
    const allSkills = [...new Set([...baseSkills, ...contextSkills])];

    return {
      currentSkills: baseSkills,
      recommendedSkills: allSkills,
      learningPath: this.createLearningPath(allSkills),
      resources: this.getSkillResources(allSkills),
      priority: this.prioritizeSkills(allSkills, userData)
    };
  }

  getContextSpecificSkills(userData, futureData) {
    const skills = [];
    
    // Based on dream category
    const category = this.categorizeDream(userData.dream);
    const categorySkills = {
      career: ['Networking', 'Professional Development', 'Industry Knowledge'],
      education: ['Research Skills', 'Academic Writing', 'Critical Thinking'],
      personal: ['Self-Discipline', 'Emotional Intelligence', 'Health Management'],
      creative: ['Creative Thinking', 'Technical Skills', 'Portfolio Development'],
      financial: ['Financial Literacy', 'Investment Knowledge', 'Risk Management']
    };

    skills.push(...(categorySkills[category] || categorySkills.personal));

    // Based on timeline complexity
    if (futureData.timeline.length > 3) {
      skills.push('Project Management', 'Long-term Planning');
    }

    return skills;
  }

  categorizeDream(dream) {
    const categories = {
      career: ['job', 'career', 'promotion', 'business', 'startup'],
      education: ['learn', 'study', 'degree', 'university', 'education'],
      personal: ['family', 'travel', 'health', 'home', 'relationship'],
      creative: ['art', 'music', 'write', 'create', 'design'],
      financial: ['wealth', 'rich', 'money', 'invest', 'savings']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => dream.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return 'personal';
  }

  prioritizeSkills(skills, userData) {
    return skills.map(skill => ({
      skill,
      priority: this.calculateSkillPriority(skill, userData),
      timeframe: this.getSkillTimeframe(skill)
    })).sort((a, b) => b.priority - a.priority);
  }

  calculateSkillPriority(skill, userData) {
    let priority = 50; // Base priority
    
    // Increase priority for foundational skills
    const foundationalSkills = ['Planning & Organization', 'Time Management', 'Goal Setting'];
    if (foundationalSkills.includes(skill)) priority += 20;
    
    // Adjust based on user age (different priorities for different life stages)
    if (userData.age < 25) {
      if (skill.includes('Learning') || skill.includes('Development')) priority += 15;
    } else if (userData.age > 40) {
      if (skill.includes('Management') || skill.includes('Leadership')) priority += 15;
    }
    
    return Math.min(priority, 100);
  }

  getSkillTimeframe(skill) {
    const timeframes = {
      'Planning & Organization': '1-2 weeks',
      'Time Management': '2-3 weeks',
      'Goal Setting': '1 week',
      'Networking': '1-2 months',
      'Professional Development': '3-6 months',
      'Technical Skills': '2-4 months'
    };

    return timeframes[skill] || '1-3 months';
  }

  createLearningPath(skills) {
    const foundational = skills.filter(skill => 
      ['Planning & Organization', 'Time Management', 'Goal Setting'].includes(skill)
    );
    
    const intermediate = skills.filter(skill => 
      !foundational.includes(skill) && !skill.includes('Advanced')
    );
    
    const advanced = skills.filter(skill => skill.includes('Advanced'));

    return {
      phase1: { name: 'Foundation', skills: foundational, duration: '2-4 weeks' },
      phase2: { name: 'Development', skills: intermediate, duration: '1-3 months' },
      phase3: { name: 'Mastery', skills: advanced, duration: '3-6 months' }
    };
  }

  getSkillResources(skills) {
    const resourceMap = {
      'Planning & Organization': [
        'Getting Things Done by David Allen',
        'Trello or Notion for task management',
        'Pomodoro Technique timer apps'
      ],
      'Time Management': [
        'Deep Work by Cal Newport',
        'RescueTime for activity tracking',
        'Time blocking techniques'
      ],
      'Goal Setting': [
        'Atomic Habits by James Clear',
        'SMART goals framework',
        'Habit tracking apps'
      ],
      'Networking': [
        'Never Eat Alone by Keith Ferrazzi',
        'LinkedIn learning courses',
        'Local professional groups'
      ]
    };

    return skills.reduce((resources, skill) => {
      if (resourceMap[skill]) {
        resources[skill] = resourceMap[skill];
      }
      return resources;
    }, {});
  }

  // Resource curation
  getPersonalizedResources(userData, futureData, progressData) {
    const resources = {
      articles: this.getRelevantArticles(userData.dream),
      books: this.getRecommendedBooks(userData.dream),
      courses: this.getOnlineCourses(userData.dream),
      tools: this.getProductivityTools(),
      communities: this.getRelevantCommunities(userData.dream)
    };

    // Store resource suggestions
    this.coachingData.resourceSuggestions.push({
      date: new Date().toISOString(),
      resources,
      userNeeds: this.assessUserNeeds(progressData)
    });

    this.saveCoachingData();

    return resources;
  }

  getRelevantArticles(dream) {
    const category = this.categorizeDream(dream);
    
    const articleMap = {
      career: [
        '5 Steps to Career Advancement in 2024',
        'Building a Professional Network That Works',
        'From Employee to Entrepreneur: Making the Leap'
      ],
      education: [
        'Effective Learning Strategies for Busy Adults',
        'Choosing the Right Educational Path',
        'Balancing Work and Study Successfully'
      ],
      personal: [
        'Building Habits That Last',
        'The Science of Motivation and Willpower',
        'Creating a Personal Development Plan'
      ]
    };

    return articleMap[category] || articleMap.personal;
  }

  getRecommendedBooks(dream) {
    const books = {
      'Atomic Habits by James Clear': 'Building good habits and breaking bad ones',
      'The 7 Habits of Highly Effective People by Stephen Covey': 'Personal and professional effectiveness',
      'Mindset by Carol Dweck': 'Developing a growth mindset',
      'Deep Work by Cal Newport': 'Focus and productivity in distracted world',
      'The Power of Now by Eckhart Tolle': 'Mindfulness and present moment awareness'
    };

    return books;
  }

  getOnlineCourses(dream) {
    const category = this.categorizeDream(dream);
    
    const courseMap = {
      career: [
        'LinkedIn Learning: Career Development Path',
        'Coursera: Project Management Professional',
        'Udemy: Leadership and Management Skills'
      ],
      education: [
        'Khan Academy: Various Subjects',
        'edX: University-level Courses',
        'Skillshare: Creative and Practical Skills'
      ],
      personal: [
        'MasterClass: Various Life Skills',
        'YouTube: Personal Development Channels',
        'Local Community College Courses'
      ]
    };

    return courseMap[category] || courseMap.personal;
  }

  getProductivityTools() {
    return [
      'Notion - All-in-one workspace',
      'Trello - Project management',
      'Forest - Focus timer',
      'Google Calendar - Scheduling',
      'Evernote - Note taking'
    ];
  }

  getRelevantCommunities(dream) {
    const category = this.categorizeDream(dream);
    
    const communityMap = {
      career: [
        'LinkedIn Professional Groups',
        'Industry-specific forums',
        'Local business networking events'
      ],
      education: [
        'Online study groups',
        'University alumni networks',
        'Subject-specific Discord servers'
      ],
      personal: [
        'Local hobby groups',
        'Online fitness communities',
        'Personal development forums'
      ]
    };

    return communityMap[category] || communityMap.personal;
  }

  assessUserNeeds(progressData) {
    if (!progressData) return ['getting_started'];

    const needs = [];
    
    if (progressData.progressPercentage < 25) {
      needs.push('building_momentum', 'establishing_routines');
    }
    
    if (progressData.overdue > 0) {
      needs.push('time_management', 'priority_setting');
    }
    
    if (progressData.progressPercentage >= 50) {
      needs.push('maintaining_consistency', 'advanced_planning');
    }

    return needs.length > 0 ? needs : ['continuous_improvement'];
  }

  // Weekly review and planning
  getWeeklyReview(progressData, userData) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const recentProgress = this.getProgressSince(weekStart);
    const achievements = this.getWeeklyAchievements(recentProgress);
    const challenges = this.getWeeklyChallenges(recentProgress);

    return {
      weekOverview: {
        startDate: weekStart.toISOString(),
        endDate: new Date().toISOString(),
        progressMade: progressData?.progressPercentage || 0
      },
      achievements,
      challenges,
      nextWeekFocus: this.getNextWeekFocus(achievements, challenges, userData),
      reflectionQuestions: this.getReflectionQuestions()
    };
  }

  getProgressSince(date) {
    return this.coachingData.progressAssessments.filter(assessment => 
      new Date(assessment.date) >= date
    );
  }

  getWeeklyAchievements(recentProgress) {
    if (recentProgress.length === 0) return ['Getting started with your future planning'];
    
    return recentProgress
      .filter(assessment => assessment.assessment !== 'beginning')
      .map(assessment => `Progress in ${assessment.assessment.replace('_', ' ')}`);
  }

  getWeeklyChallenges(recentProgress) {
    const challenges = [];
    
    if (recentProgress.length === 0) {
      challenges.push('Establishing consistent daily habits');
    }
    
    const stagnations = recentProgress.filter(assessment => 
      assessment.warning && assessment.warning.length > 0
    );
    
    if (stagnations.length > 0) {
      challenges.push('Overcoming progress plateaus');
    }

    return challenges.length > 0 ? challenges : ['Maintaining current momentum'];
  }

  getNextWeekFocus(achievements, challenges, userData) {
    const focusAreas = [];
    
    if (achievements.length === 0) {
      focusAreas.push('Build foundational habits and routines');
    } else if (challenges.includes('Overcoming progress plateaus')) {
      focusAreas.push('Break through current obstacles');
    } else {
      focusAreas.push('Build on recent successes');
      focusAreas.push('Tackle next milestone with renewed energy');
    }

    focusAreas.push(`Stay connected to your dream: "${userData.dream}"`);

    return focusAreas;
  }

  getReflectionQuestions() {
    return [
      "What was my most significant accomplishment this week?",
      "What challenge taught me the most?",
      "How did I move closer to my dream?",
      "What will I do differently next week?",
      "What support do I need to continue progressing?"
    ];
  }

  // Generate daily tips
  generateDailyTips() {
    const tips = [
      "Start your day by reviewing one key goal. This sets positive intention.",
      "Break large tasks into 25-minute focused sessions with short breaks.",
      "Celebrate small wins daily - they add up to big achievements.",
      "Visualize your success before starting work - it boosts motivation.",
      "Keep a 'progress journal' to track insights and improvements.",
      "Share your goals with someone who will hold you accountable.",
      "Review your 'why' when motivation dips - reconnect with your purpose.",
      "Schedule 'future planning' time weekly - consistency builds success.",
      "Learn one new thing daily related to your goals - compound knowledge.",
      "Practice gratitude for current progress - it fuels future achievement."
    ];

    return tips;
  }

  getDailyTip() {
    const today = new Date().getDate();
    return this.dailyTips[today % this.dailyTips.length];
  }
}

export const aiCoach = new AICoach();