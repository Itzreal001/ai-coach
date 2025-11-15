export class AdvancedAIAnalysis {
  constructor(userData) {
    this.userData = userData;
  }

  // Advanced dream analysis with multiple factors
  analyzeDreamComplexity(dream) {
    const factors = {
      specificity: this.calculateSpecificity(dream),
      ambition: this.calculateAmbitionLevel(dream),
      realism: this.calculateRealism(dream),
      timeframe: this.calculateTimeframe(dream),
      resources: this.calculateResourceRequirements(dream)
    };

    const complexityScore = (
      factors.specificity * 0.2 +
      factors.ambition * 0.3 +
      factors.realism * 0.25 +
      factors.timeframe * 0.15 +
      factors.resources * 0.1
    );

    return {
      score: Math.min(complexityScore * 100, 100),
      factors,
      category: this.categorizeDream(dream),
      keywords: this.extractKeywords(dream)
    };
  }

  calculateSpecificity(dream) {
    const specificIndicators = [
      'by age', 'in 5 years', 'specific', 'exact', 'precise', 
      'by 2025', 'within', 'deadline', 'timeline', 'step by step'
    ];
    const matches = specificIndicators.filter(indicator => 
      dream.toLowerCase().includes(indicator)
    ).length;
    return matches / specificIndicators.length;
  }

  calculateAmbitionLevel(dream) {
    const ambitionWords = [
      'change the world', 'revolutionize', 'transform', 'pioneer',
      'first', 'biggest', 'largest', 'best', 'ultimate', 'dream'
    ];
    const matches = ambitionWords.filter(word => 
      dream.toLowerCase().includes(word)
    ).length;
    return Math.min(matches * 0.2, 1);
  }

  calculateRealism(dream) {
    // Simple realism check based on dream length and common patterns
    const dreamLength = dream.length;
    const hasActionWords = dream.match(/\b(will|going to|plan to|aim to)\b/gi);
    return Math.min((dreamLength / 500 + (hasActionWords ? 0.3 : 0)), 1);
  }

  calculateTimeframe(dream) {
    const timeWords = [
      'soon', 'immediately', 'now', 'quickly', 'fast',
      'long term', 'eventually', 'someday', 'future'
    ];
    const matches = timeWords.filter(word => 
      dream.toLowerCase().includes(word)
    ).length;
    return matches > 0 ? 0.7 : 0.3;
  }

  calculateResourceRequirements(dream) {
    const resourceWords = [
      'money', 'funding', 'investment', 'team', 'education',
      'degree', 'certificate', 'equipment', 'tools', 'resources'
    ];
    const matches = resourceWords.filter(word => 
      dream.toLowerCase().includes(word)
    ).length;
    return Math.min(matches * 0.15, 1);
  }

  categorizeDream(dream) {
    const categories = {
      career: ['job', 'career', 'promotion', 'business', 'startup', 'company'],
      education: ['learn', 'study', 'degree', 'university', 'course', 'education'],
      personal: ['family', 'marriage', 'children', 'home', 'travel', 'health'],
      creative: ['art', 'music', 'write', 'create', 'design', 'build'],
      financial: ['wealth', 'rich', 'money', 'invest', 'savings', 'retire'],
      social: ['help', 'community', 'volunteer', 'impact', 'change', 'support']
    };

    let bestCategory = 'personal';
    let highestScore = 0;

    Object.entries(categories).forEach(([category, keywords]) => {
      const score = keywords.filter(keyword => 
        dream.toLowerCase().includes(keyword)
      ).length;
      
      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    });

    return bestCategory;
  }

  extractKeywords(dream) {
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by']);
    const words = dream.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    return [...new Set(words)].slice(0, 10);
  }

  // Generate actionable insights
  generateActionableInsights(dreamAnalysis) {
    const insights = [];
    const { factors, category } = dreamAnalysis;

    if (factors.specificity < 0.3) {
      insights.push({
        type: 'specificity',
        message: 'Try making your dream more specific with clear milestones',
        priority: 'high',
        action: 'Break down your dream into smaller, measurable goals'
      });
    }

    if (factors.ambition > 0.7) {
      insights.push({
        type: 'ambition',
        message: 'Your dream shows high ambition! Consider breaking it into phases',
        priority: 'medium',
        action: 'Create a phased approach with short-term and long-term goals'
      });
    }

    if (factors.realism < 0.4) {
      insights.push({
        type: 'realism',
        message: 'Consider adding concrete steps to make your dream more achievable',
        priority: 'high',
        action: 'Research what others have done to achieve similar dreams'
      });
    }

    // Category-specific insights
    const categoryInsights = {
      career: 'Consider networking and skill development in your field',
      education: 'Research educational paths and required qualifications',
      personal: 'Focus on building habits and routines that support your goal',
      creative: 'Dedicate regular time for practice and skill development',
      financial: 'Create a financial plan and consider professional advice',
      social: 'Build connections with like-minded people and organizations'
    };

    insights.push({
      type: 'category',
      message: categoryInsights[category] || 'Focus on consistent daily progress',
      priority: 'medium',
      action: 'Set aside dedicated time each week for your dream'
    });

    return insights;
  }

  // Generate skill recommendations
  generateSkillRecommendations(dreamAnalysis) {
    const { category, keywords } = dreamAnalysis;
    const skillMap = {
      career: ['Leadership', 'Communication', 'Project Management', 'Networking'],
      education: ['Research', 'Critical Thinking', 'Time Management', 'Study Techniques'],
      personal: ['Self-discipline', 'Emotional Intelligence', 'Health Management', 'Relationship Building'],
      creative: ['Creativity', 'Technical Skills', 'Portfolio Development', 'Marketing'],
      financial: ['Financial Literacy', 'Investment Knowledge', 'Budgeting', 'Risk Management'],
      social: ['Community Engagement', 'Public Speaking', 'Organization', 'Empathy']
    };

    const baseSkills = skillMap[category] || ['Planning', 'Execution', 'Adaptability', 'Persistence'];
    
    // Add keyword-based skills
    const additionalSkills = keywords.slice(0, 2).map(keyword => 
      keyword.charAt(0).toUpperCase() + keyword.slice(1) + ' Skills'
    );

    return [...baseSkills, ...additionalSkills].slice(0, 6);
  }
}