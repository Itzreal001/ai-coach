export class FuturePredictor {
  constructor(userData) {
    this.userData = userData;
    this.currentYear = new Date().getFullYear();
  }

  generateTimeline() {
    const { age, country, dream } = this.userData;
    
    console.log('Generating timeline for:', { age, country, dream });
    
    // Analyze dream complexity and type
    const dreamAnalysis = this.analyzeDream(dream);
    const countryFactors = this.getCountryFactors(country);
    const ageFactors = this.getAgeFactors(age);
    
    const timeline = this.buildTimeline(dreamAnalysis, countryFactors, ageFactors);
    
    console.log('Generated timeline:', timeline);
    return timeline;
  }

  analyzeDream(dream) {
    const keywords = {
      career: ['job', 'career', 'work', 'profession', 'business', 'company', 'startup'],
      education: ['study', 'learn', 'degree', 'university', 'college', 'master', 'phd'],
      personal: ['family', 'marry', 'children', 'house', 'home', 'travel', 'health'],
      creative: ['artist', 'writer', 'musician', 'create', 'paint', 'write', 'music'],
      financial: ['rich', 'wealth', 'money', 'invest', 'million', 'retire']
    };

    const categories = {};
    const dreamLower = dream.toLowerCase();

    Object.keys(keywords).forEach(category => {
      categories[category] = keywords[category].filter(keyword => 
        dreamLower.includes(keyword)
      ).length;
    });

    const categoryKeys = Object.keys(categories);
    const primaryCategory = categoryKeys.length > 0 ? categoryKeys.reduce((a, b) =>
      categories[a] > categories[b] ? a : b
    ) : 'personal';

    return {
      complexity: Math.min(dream.length / 10, 10),
      category: primaryCategory,
      specificity: this.calculateSpecificity(dream),
      urgency: this.calculateUrgency(this.userData.age)
    };
  }

  calculateSpecificity(dream) {
    const specificIndicators = ['by age', 'in 5 years', 'specific', 'exact', 'precise'];
    return specificIndicators.filter(indicator => 
      dream.toLowerCase().includes(indicator)
    ).length / specificIndicators.length;
  }

  calculateUrgency(age) {
    // Younger people have more time, creating different urgency patterns
    if (age < 25) return 0.3;
    if (age < 35) return 0.6;
    if (age < 50) return 0.8;
    return 0.9;
  }

  getCountryFactors(country) {
    const countryData = {
      'usa': { opportunity: 0.8, stability: 0.7, growth: 0.8 },
      'canada': { opportunity: 0.7, stability: 0.9, growth: 0.6 },
      'uk': { opportunity: 0.7, stability: 0.8, growth: 0.7 },
      'australia': { opportunity: 0.6, stability: 0.9, growth: 0.6 },
      'germany': { opportunity: 0.7, stability: 0.9, growth: 0.7 },
      'japan': { opportunity: 0.6, stability: 0.9, growth: 0.5 },
      'india': { opportunity: 0.9, stability: 0.6, growth: 0.9 },
      'china': { opportunity: 0.8, stability: 0.7, growth: 0.8 },
      'default': { opportunity: 0.5, stability: 0.5, growth: 0.5 }
    };

    const normalizedCountry = country.toLowerCase();
    return countryData[normalizedCountry] || countryData.default;
  }

  getAgeFactors(age) {
    return {
      riskTolerance: Math.max(0.1, 1 - (age / 100)),
      learningSpeed: Math.max(0.3, 1 - (age / 70)),
      networkPotential: age < 40 ? 0.8 : 0.5,
      experience: Math.min(age / 50, 1)
    };
  }

  buildTimeline(dreamAnalysis, countryFactors, ageFactors) {
    const baseProbability = this.calculateBaseProbability(dreamAnalysis, countryFactors, ageFactors);
    
    return [
      this.generateYear1Event(dreamAnalysis, baseProbability),
      this.generateYear3Event(dreamAnalysis, baseProbability),
      this.generateYear5Event(dreamAnalysis, baseProbability),
      this.generateYear10Event(dreamAnalysis, baseProbability)
    ];
  }

  calculateBaseProbability(dreamAnalysis, countryFactors, ageFactors) {
    let probability = 0.5;
    
    // Adjust based on dream specificity
    probability += dreamAnalysis.specificity * 0.2;
    
    // Country opportunities
    probability += countryFactors.opportunity * 0.15;
    
    // Age factors
    probability += ageFactors.riskTolerance * 0.1;
    probability += ageFactors.networkPotential * 0.05;
    
    return Math.min(probability, 0.95);
  }

  generateYear1Event(dreamAnalysis, baseProbability) {
    const events = {
      career: {
        title: "Career Acceleration",
        description: `You land a breakthrough opportunity in ${this.userData.country} that aligns with your ambitions.`,
        milestone: "Professional Growth"
      },
      education: {
        title: "Knowledge Expansion",
        description: "You enroll in advanced learning programs that open new intellectual horizons.",
        milestone: "Educational Milestone"
      },
      personal: {
        title: "Personal Transformation",
        description: "Significant life changes lead to improved relationships and self-discovery.",
        milestone: "Life Change"
      },
      creative: {
        title: "Creative Breakthrough",
        description: "Your artistic talents gain recognition and you find your unique voice.",
        milestone: "Creative Achievement"
      },
      financial: {
        title: "Financial Foundation",
        description: "Smart investments and opportunities create a stable financial platform.",
        milestone: "Wealth Building"
      }
    };

    const event = events[dreamAnalysis.category] || events.career;
    return {
      year: this.currentYear + 1,
      ...event,
      probability: Math.floor(baseProbability * 100)
    };
  }

  generateYear3Event(dreamAnalysis, baseProbability) {
    return {
      year: this.currentYear + 3,
      title: "Major Life Progress",
      description: `Your dedication to "${this.userData.dream}" starts yielding remarkable results.`,
      milestone: "Significant Achievement",
      probability: Math.floor(baseProbability * 85)
    };
  }

  generateYear5Event(dreamAnalysis, baseProbability) {
    return {
      year: this.currentYear + 5,
      title: "Dream Manifestation",
      description: `You're living the reality of "${this.userData.dream}" and inspiring others.`,
      milestone: "Dream Realized",
      probability: Math.floor(baseProbability * 75)
    };
  }

  generateYear10Event(dreamAnalysis, baseProbability) {
    return {
      year: this.currentYear + 10,
      title: "Legacy Establishment",
      description: `Your achievements in ${this.userData.country} create lasting impact beyond your initial dreams.`,
      milestone: "Legacy Built",
      probability: Math.floor(baseProbability * 65)
    };
  }

  calculateFutureScore() {
    const dreamAnalysis = this.analyzeDream(this.userData.dream);
    const countryFactors = this.getCountryFactors(this.userData.country);
    const ageFactors = this.getAgeFactors(this.userData.age);

    let score = 50;

    // Dream factors
    score += dreamAnalysis.specificity * 20;
    score += dreamAnalysis.complexity * 2;

    // External factors
    score += countryFactors.opportunity * 15;
    score += countryFactors.growth * 10;

    // Personal factors
    score += ageFactors.riskTolerance * 10;
    score += ageFactors.networkPotential * 5;

    return Math.min(Math.floor(score), 97);
  }
}