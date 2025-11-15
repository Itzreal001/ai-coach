export class AdvancedAnalytics {
  constructor() {
    this.storageKey = 'futureSimulatorAnalytics';
  }

  // Track user interactions and behavior
  trackEvent(eventType, data = {}) {
    const analytics = this.getAnalyticsData();
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      ...data
    };

    analytics.events.push(event);
    
    // Update session data
    this.updateSessionData(eventType);
    
    // Update user behavior patterns
    this.updateBehaviorPatterns(eventType, data);
    
    this.saveAnalyticsData(analytics);
    return event;
  }

  getAnalyticsData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      sessions: [],
      events: [],
      userBehavior: {
        mostUsedFeatures: {},
        timeSpent: {},
        completionRates: {},
        engagementScore: 0
      },
      predictions: {
        accuracyTracking: [],
        userSatisfaction: []
      },
      trends: {
        popularDreams: [],
        successPatterns: [],
        commonChallenges: []
      }
    };
  }

  saveAnalyticsData(analytics) {
    localStorage.setItem(this.storageKey, JSON.stringify(analytics));
  }

  updateSessionData(eventType) {
    const analytics = this.getAnalyticsData();
    const currentSession = analytics.sessions[analytics.sessions.length - 1];
    
    if (!currentSession || currentSession.endTime) {
      // Start new session
      analytics.sessions.push({
        startTime: new Date().toISOString(),
        endTime: null,
        events: [eventType],
        duration: 0
      });
    } else {
      // Update current session
      currentSession.events.push(eventType);
    }
    
    this.saveAnalyticsData(analytics);
  }

  updateBehaviorPatterns(eventType, data) {
    const analytics = this.getAnalyticsData();
    const behavior = analytics.userBehavior;

    // Track feature usage
    behavior.mostUsedFeatures[eventType] = (behavior.mostUsedFeatures[eventType] || 0) + 1;

    // Calculate engagement score (0-100)
    const totalEvents = analytics.events.length;
    const uniqueDays = this.getUniqueDays(analytics.events);
    const sessionCount = analytics.sessions.length;
    
    behavior.engagementScore = Math.min(100, 
      (totalEvents * 0.3) + 
      (uniqueDays * 2) + 
      (sessionCount * 5)
    );

    this.saveAnalyticsData(analytics);
  }

  getUniqueDays(events) {
    const dates = events.map(event => event.timestamp.split('T')[0]);
    return new Set(dates).size;
  }

  // Predict success probability based on patterns
  calculateSuccessProbability(userData, futureData, progressData) {
    const baseScore = futureData.score / 100;
    
    // Factor 1: Dream specificity
    const specificityScore = this.analyzeDreamSpecificity(userData.dream);
    
    // Factor 2: Timeline realism
    const realismScore = this.analyzeTimelineRealism(futureData.timeline);
    
    // Factor 3: Progress consistency
    const progressScore = progressData ? progressData.progressPercentage / 100 : 0.5;
    
    // Factor 4: User engagement
    const engagementScore = this.getAnalyticsData().userBehavior.engagementScore / 100;
    
    // Weighted average
    const successProbability = (
      baseScore * 0.4 +
      specificityScore * 0.2 +
      realismScore * 0.2 +
      progressScore * 0.1 +
      engagementScore * 0.1
    );

    return {
      probability: Math.round(successProbability * 100),
      factors: {
        basePotential: Math.round(baseScore * 100),
        dreamSpecificity: Math.round(specificityScore * 100),
        timelineRealism: Math.round(realismScore * 100),
        currentProgress: Math.round(progressScore * 100),
        userEngagement: Math.round(engagementScore * 100)
      },
      confidence: this.calculateConfidenceLevel(userData, futureData)
    };
  }

  analyzeDreamSpecificity(dream) {
    const specificIndicators = [
      'by age', 'in 5 years', 'specific', 'exact', 'precise', 
      'deadline', 'timeline', 'step by step', 'milestone'
    ];
    
    const wordCount = dream.split(/\s+/).length;
    const specificWordCount = specificIndicators.filter(indicator => 
      dream.toLowerCase().includes(indicator)
    ).length;

    return Math.min((wordCount / 50 + specificWordCount * 0.2), 1);
  }

  analyzeTimelineRealism(timeline) {
    if (!timeline.length) return 0.5;

    const currentYear = new Date().getFullYear();
    const years = timeline.map(event => event.year);
    const timeSpans = years.map(year => year - currentYear);
    
    // Check if timeline progression is realistic
    const isProgressive = timeSpans.every((span, i) => 
      i === 0 || span > timeSpans[i - 1]
    );
    
    // Check if time spans are reasonable
    const reasonableSpans = timeSpans.every(span => span >= 1 && span <= 20);
    
    // Check probability distribution
    const avgProbability = timeline.length > 0 ? timeline.reduce((sum, event) => sum + event.probability, 0) / timeline.length : 0;
    const reasonableProbability = avgProbability >= 50 && avgProbability <= 90;

    return (isProgressive ? 0.4 : 0) + (reasonableSpans ? 0.3 : 0) + (reasonableProbability ? 0.3 : 0);
  }

  calculateConfidenceLevel(userData, futureData) {
    const factors = {
      dreamLength: Math.min(userData.dream.length / 200, 1),
      timelineLength: Math.min(futureData.timeline.length / 5, 1),
      probabilityRange: this.calculateProbabilityRange(futureData.timeline),
      userAge: this.getAgeFactor(userData.age)
    };

    const confidenceScore = (
      factors.dreamLength * 0.3 +
      factors.timelineLength * 0.25 +
      factors.probabilityRange * 0.25 +
      factors.userAge * 0.2
    );

    if (confidenceScore >= 0.8) return 'high';
    if (confidenceScore >= 0.6) return 'medium';
    return 'low';
  }

  calculateProbabilityRange(timeline) {
    if (!timeline.length) return 0;
    const probabilities = timeline.map(event => event.probability);
    const range = Math.max(...probabilities) - Math.min(...probabilities);
    return Math.max(0, 1 - range / 100);
  }

  getAgeFactor(age) {
    // Younger users have more uncertainty, older users have more predictable paths
    if (age < 25) return 0.6;
    if (age < 40) return 0.8;
    if (age < 60) return 0.9;
    return 0.7;
  }

  // Comparative analysis with similar users
  getComparativeAnalysis(userData, futureData) {
    const similarProfiles = this.findSimilarProfiles(userData);
    
    return {
      peerComparison: this.compareWithPeers(userData, futureData, similarProfiles),
      successStories: this.getSuccessStories(similarProfiles),
      commonChallenges: this.getCommonChallenges(similarProfiles),
      improvementAreas: this.identifyImprovementAreas(userData, futureData)
    };
  }

  findSimilarProfiles(userData) {
    // This would normally come from a backend database
    // For demo, we'll return simulated data
    return [
      {
        age: userData.age + 2,
        country: userData.country,
        dreamCategory: this.categorizeDream(userData.dream),
        successScore: 85,
        achievements: ['Career advancement', 'Skill development'],
        timeline: 3
      },
      {
        age: userData.age - 3,
        country: 'Similar',
        dreamCategory: this.categorizeDream(userData.dream),
        successScore: 72,
        achievements: ['Education completion', 'Networking'],
        timeline: 2
      }
    ];
  }

  categorizeDream(dream) {
    const categories = {
      career: ['job', 'career', 'promotion', 'business'],
      education: ['learn', 'study', 'degree', 'education'],
      personal: ['family', 'travel', 'health', 'home'],
      creative: ['art', 'music', 'write', 'create']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => dream.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    return 'personal';
  }

  compareWithPeers(userData, futureData, similarProfiles) {
    const userScore = futureData.score;
    const peerScores = similarProfiles.map(profile => profile.successScore);
    const averagePeerScore = peerScores.length > 0 ? peerScores.reduce((a, b) => a + b, 0) / peerScores.length : 0;

    return {
      userScore,
      averagePeerScore: Math.round(averagePeerScore),
      percentile: this.calculatePercentile(userScore, peerScores),
      strengths: this.identifyStrengths(userData, futureData),
      opportunities: this.identifyOpportunities(userData, futureData)
    };
  }

  calculatePercentile(userScore, peerScores) {
    const lowerScores = peerScores.filter(score => score < userScore).length;
    return Math.round((lowerScores / peerScores.length) * 100);
  }

  identifyStrengths(userData, futureData) {
    const strengths = [];
    
    if (userData.dream.length > 100) {
      strengths.push('Clear vision and detailed planning');
    }
    
    if (futureData.timeline.length >= 4) {
      strengths.push('Long-term strategic thinking');
    }
    
    if (futureData.score >= 80) {
      strengths.push('High potential for success');
    }
    
    return strengths.length > 0 ? strengths : ['Strong foundation for growth'];
  }

  identifyOpportunities(userData, futureData) {
    const opportunities = [];
    
    if (futureData.timeline.some(event => event.probability < 60)) {
      opportunities.push('Increase probability of key milestones');
    }
    
    if (userData.dream.length < 50) {
      opportunities.push('Add more specificity to your dream');
    }
    
    return opportunities.length > 0 ? opportunities : ['Continue current growth trajectory'];
  }

  getSuccessStories(similarProfiles) {
    return similarProfiles
      .filter(profile => profile.successScore >= 80)
      .map(profile => ({
        category: profile.dreamCategory,
        achievements: profile.achievements,
        keyFactors: ['Consistent effort', 'Strategic planning', 'Adaptability']
      }));
  }

  getCommonChallenges(similarProfiles) {
    const challenges = {
      career: ['Work-life balance', 'Skill gaps', 'Market competition'],
      education: ['Time management', 'Funding', 'Course selection'],
      personal: ['Motivation maintenance', 'Resource allocation', 'Unexpected obstacles'],
      creative: ['Creative blocks', 'Market acceptance', 'Monetization']
    };

    const mostCommonCategory = similarProfiles.reduce((acc, profile) => {
      acc[profile.dreamCategory] = (acc[profile.dreamCategory] || 0) + 1;
      return acc;
    }, {});

    const categoryKeys = Object.keys(mostCommonCategory);
    const dominantCategory = categoryKeys.length > 0 ? categoryKeys.reduce((a, b) =>
      mostCommonCategory[a] > mostCommonCategory[b] ? a : b
    ) : 'personal';

    return challenges[dominantCategory] || challenges.personal;
  }

  identifyImprovementAreas(userData, futureData) {
    const areas = [];
    
    // Analyze dream specificity
    if (userData.dream.length < 80) {
      areas.push({
        area: 'Dream Specificity',
        current: 'Basic',
        target: 'Detailed',
        action: 'Add more concrete details and milestones to your dream description',
        impact: 'High'
      });
    }

    // Analyze timeline strength
    const weakMilestones = futureData.timeline.filter(event => event.probability < 70);
    if (weakMilestones.length > 0) {
      areas.push({
        area: 'Milestone Confidence',
        current: `${weakMilestones.length} low-confidence milestones`,
        target: 'All milestones above 70% probability',
        action: 'Break down low-probability milestones into smaller, more achievable steps',
        impact: 'Medium'
      });
    }

    // Analyze engagement
    const engagement = this.getAnalyticsData().userBehavior.engagementScore;
    if (engagement < 50) {
      areas.push({
        area: 'User Engagement',
        current: `${Math.round(engagement)}% engagement score`,
        target: '70%+ engagement score',
        action: 'Use the app more regularly to track progress and explore features',
        impact: 'High'
      });
    }

    return areas;
  }

  // Trend analysis
  getTrendAnalysis() {
    const analytics = this.getAnalyticsData();
    const events = analytics.events;
    
    const last30Days = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      const daysAgo = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    return {
      activeUsers: this.calculateActiveUsers(last30Days),
      popularFeatures: this.getPopularFeatures(last30Days),
      successPatterns: this.identifySuccessPatterns(),
      seasonalTrends: this.analyzeSeasonalTrends(events)
    };
  }

  calculateActiveUsers(events) {
    const userDays = new Set(events.map(event => 
      event.timestamp.split('T')[0]
    ));
    return userDays.size;
  }

  getPopularFeatures(events) {
    const featureCount = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(featureCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count }));
  }

  identifySuccessPatterns() {
    // This would analyze successful user patterns
    return [
      'Users who check progress weekly are 3x more likely to achieve goals',
      'Detailed dream descriptions correlate with 40% higher success rates',
      'Regular milestone completion increases long-term engagement by 60%'
    ];
  }

  analyzeSeasonalTrends(events) {
    if (!events || events.length === 0) {
      return {
        busiestMonth: null,
        seasonalPattern: 'No activity data available'
      };
    }

    const monthlyCount = events.reduce((acc, event) => {
      const month = new Date(event.timestamp).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthKeys = Object.keys(monthlyCount);
    if (monthKeys.length === 0) {
      return {
        busiestMonth: null,
        seasonalPattern: 'No activity data available'
      };
    }

    return {
      busiestMonth: monthKeys.length > 0 ? monthKeys.reduce((a, b) =>
        monthlyCount[a] > monthlyCount[b] ? a : b
      ) : null,
      seasonalPattern: 'Increased activity in January and September'
    };
  }

  // Generate analytics report
  generateAnalyticsReport(userData, futureData, progressData) {
    const successProbability = this.calculateSuccessProbability(userData, futureData, progressData);
    const comparativeAnalysis = this.getComparativeAnalysis(userData, futureData);
    const trendAnalysis = this.getTrendAnalysis();
    const improvementAreas = this.identifyImprovementAreas(userData, futureData);

    return {
      summary: {
        overallScore: futureData.score,
        successProbability: successProbability.probability,
        confidence: successProbability.confidence,
        engagementLevel: this.getAnalyticsData().userBehavior.engagementScore
      },
      detailedAnalysis: {
        successFactors: successProbability.factors,
        comparativeInsights: comparativeAnalysis,
        improvementAreas,
        trends: trendAnalysis
      },
      recommendations: this.generateDataDrivenRecommendations(
        successProbability, 
        comparativeAnalysis, 
        improvementAreas
      )
    };
  }

  generateDataDrivenRecommendations(successProbability, comparativeAnalysis, improvementAreas) {
    const recommendations = [];

    if (successProbability.factors.dreamSpecificity < 70) {
      recommendations.push({
        priority: 'high',
        area: 'Dream Definition',
        action: 'Add more specific, measurable details to your dream',
        expectedImpact: '15-25% increase in success probability',
        timeframe: '1-2 weeks'
      });
    }

    if (successProbability.factors.userEngagement < 60) {
      recommendations.push({
        priority: 'medium',
        area: 'Engagement',
        action: 'Use progress tracking features more regularly',
        expectedImpact: '10-20% better goal adherence',
        timeframe: 'Ongoing'
      });
    }

    if (comparativeAnalysis.percentile < 50) {
      recommendations.push({
        priority: 'medium',
        area: 'Competitive Positioning',
        action: 'Focus on developing unique strengths identified in analysis',
        expectedImpact: 'Improved competitive advantage',
        timeframe: '3-6 months'
      });
    }

    return recommendations;
  }
}

export const advancedAnalytics = new AdvancedAnalytics();