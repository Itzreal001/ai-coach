import OpenAI from 'openai';

class ChatGPTService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
      });
    } else {
      console.warn('OpenAI API key not found. ChatGPT features will be disabled.');
    }
  }

  async generateCoachingResponse(prompt, userData, context = {}) {
    if (!this.client) {
      return this.getFallbackResponse(prompt, userData);
    }

    try {
      const systemPrompt = this.buildSystemPrompt(userData, context);
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      return this.getFallbackResponse(prompt, userData);
    }
  }

  buildSystemPrompt(userData, context) {
    const { dream, age, profession, skills } = userData;
    const { coachingType, progressData } = context;

    return `You are an expert AI life coach specializing in helping people achieve their biggest dreams and goals.

User Profile:
- Dream: ${dream || 'Not specified'}
- Age: ${age || 'Not specified'}
- Profession: ${profession || 'Not specified'}
- Current Skills: ${skills ? skills.join(', ') : 'Not specified'}
- Progress Status: ${progressData ? `${progressData.progressPercentage}% complete` : 'Just starting'}

Your coaching style:
- Be encouraging, supportive, and realistic
- Provide actionable, specific advice
- Focus on the user's unique dream and circumstances
- Use positive psychology principles
- Keep responses concise but meaningful
- Adapt advice to user's age and life stage
- Consider their profession and existing skills

Current coaching context: ${coachingType || 'General motivation and guidance'}`;
  }

  getFallbackResponse(prompt, userData) {
    // Fallback responses when API is not available
    const fallbacks = {
      motivation: `Keep pushing forward toward your dream of ${userData.dream || 'success'}. Every step counts!`,
      progress: `You're making great progress! Stay consistent and focused on your goals.`,
      skills: `Continue developing the skills that will help you achieve ${userData.dream || 'your dreams'}.`,
      resources: `Seek out resources and communities that support your journey toward ${userData.dream || 'success'}.`
    };

    // Simple keyword matching for fallback
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('motivation')) return fallbacks.motivation;
    if (lowerPrompt.includes('progress')) return fallbacks.progress;
    if (lowerPrompt.includes('skill')) return fallbacks.skills;
    if (lowerPrompt.includes('resource')) return fallbacks.resources;

    return fallbacks.motivation;
  }

  async generatePersonalizedMotivation(userData, progressData) {
    const prompt = `Generate a personalized daily motivation message for someone working toward: ${userData.dream}.
    Consider their current progress (${progressData?.progressPercentage || 0}%) and make it encouraging and actionable.`;

    return this.generateCoachingResponse(prompt, userData, {
      coachingType: 'Daily Motivation',
      progressData
    });
  }

  async generateProgressCoaching(userData, progressData) {
    const prompt = `Provide specific coaching advice for someone ${progressData?.progressPercentage || 0}% toward their goal of ${userData.dream}.
    Include: 1) Current assessment, 2) 2-3 specific recommendations, 3) Encouraging message, 4) Any warnings if applicable.
    Format as JSON with keys: assessment, recommendations (array), encouragement, warnings (array or null).`;

    const response = await this.generateCoachingResponse(prompt, userData, {
      coachingType: 'Progress Coaching',
      progressData
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      // If JSON parsing fails, return structured fallback
      return {
        assessment: 'making_progress',
        recommendations: ['Stay consistent with your efforts', 'Track your daily progress', 'Celebrate small wins'],
        encouragement: 'You\'re on the right path! Keep going.',
        warnings: null
      };
    }
  }

  async generateSkillRecommendations(userData, dreamAnalysis) {
    const prompt = `Based on the dream "${userData.dream}", recommend 5-7 key skills this person should develop.
    Consider their current skills: ${userData.skills ? userData.skills.join(', ') : 'none specified'}.
    Include both foundational and advanced skills relevant to their goal.
    Format as JSON with keys: skills (array), priority (array of objects with skill, priority 1-100, timeframe).`;

    const response = await this.generateCoachingResponse(prompt, userData, {
      coachingType: 'Skill Development'
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback structure
      return {
        skills: ['Goal Setting', 'Time Management', 'Persistence', 'Planning', 'Adaptability'],
        priority: [
          { skill: 'Goal Setting', priority: 90, timeframe: '1-2 weeks' },
          { skill: 'Time Management', priority: 85, timeframe: '2-3 weeks' },
          { skill: 'Planning', priority: 80, timeframe: '1-2 weeks' }
        ]
      };
    }
  }

  async generateAffirmation(userData) {
    const prompt = `Create a powerful, personalized affirmation for someone pursuing: ${userData.dream}.
    Make it positive, present tense, and specific to their goal. Keep it to 1-2 sentences.`;

    return this.generateCoachingResponse(prompt, userData, {
      coachingType: 'Affirmation'
    });
  }

  async generateActionSteps(userData, progressData) {
    const prompt = `Suggest 3-5 specific, actionable steps this person can take today toward their dream of ${userData.dream}.
    Consider their current progress (${progressData?.progressPercentage || 0}%) and make them realistic and immediate.`;

    return this.generateCoachingResponse(prompt, userData, {
      coachingType: 'Daily Actions'
    });
  }
}

export const chatGPTService = new ChatGPTService();