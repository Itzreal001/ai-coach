import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { aiCoach } from '../utils/aiCoach';

const AICoachPanel = ({ userData, futureData, progressData, dreamAnalysis }) => {
  const [coachingData, setCoachingData] = useState(null);
  const [activeSection, setActiveSection] = useState('motivation');
  const [isTyping, setIsTyping] = useState(false);

  const loadCoachingData = useCallback(async () => {
    try {
      const motivation = await aiCoach.getDailyMotivation(userData, progressData);
      const progressCoaching = progressData ? await aiCoach.getProgressCoaching(progressData, userData) : null;
      const skillRecommendations = await aiCoach.getSkillRecommendations(userData, futureData, dreamAnalysis);
      const resources = aiCoach.getPersonalizedResources(userData, futureData, progressData);
      const weeklyReview = aiCoach.getWeeklyReview(progressData, userData);
      const dailyTip = aiCoach.getDailyTip();

      setCoachingData({
        motivation,
        progressCoaching,
        skillRecommendations,
        resources,
        weeklyReview,
        dailyTip
      });
    } catch (error) {
      console.error('Error loading coaching data:', error);
      // Fallback to basic data
      setCoachingData({
        motivation: { message: 'Keep working toward your dreams!', action: 'Take one step today', affirmation: 'I am capable of achieving my goals.' },
        progressCoaching: null,
        skillRecommendations: null,
        resources: aiCoach.getPersonalizedResources(userData, futureData, progressData),
        weeklyReview: null,
        dailyTip: aiCoach.getDailyTip()
      });
    }
  }, [userData, futureData, progressData, dreamAnalysis]);

  // Add loading state for async operations
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadCoachingData();
      setIsLoading(false);
    };

    if (userData) {
      loadData();
    }
  }, [userData, futureData, progressData, dreamAnalysis, loadCoachingData]);

  if (!coachingData || isLoading) {
    return (
      <div className="ai-coach-panel">
        <div className="coach-loading">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Your AI coach is preparing personalized guidance...</p>
        </div>
      </div>
    );
  }

  const simulateTyping = async (callback) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    callback();
    setIsTyping(false);
  };

  return (
    <div className="ai-coach-panel">
      <motion.div
        className="coach-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="coach-avatar">
          <Icon name="psychology" size={24} />
        </div>
        <div className="coach-info">
          <h3>Your AI Coach</h3>
          <p>Personalized guidance for your journey</p>
        </div>
        <div className="coach-status">
          <div className="status-dot"></div>
          Online
        </div>
      </motion.div>

      {/* Daily Tip */}
      <motion.div
        className="daily-tip"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Icon name="lightbulb" size={16} />
        <span>Coach's Tip: {coachingData.dailyTip}</span>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        className="coach-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { id: 'motivation', label: 'Motivation', icon: 'favorite' },
          { id: 'progress', label: 'Progress', icon: 'trend' },
          { id: 'skills', label: 'Skills', icon: 'school' },
          { id: 'resources', label: 'Resources', icon: 'library' },
          { id: 'weekly', label: 'Weekly Review', icon: 'calendar' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`coach-tab ${activeSection === tab.id ? 'active' : ''}`}
            onClick={() => simulateTyping(() => setActiveSection(tab.id))}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="coach-typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Your coach is thinking...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {!isTyping && (
          <motion.div
            key={activeSection}
            className="coach-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Motivation Section */}
            {activeSection === 'motivation' && (
              <div className="motivation-section">
                <div className="motivation-message">
                  {coachingData.motivation.message}
                </div>
                <div className="coach-action">
                  <strong>Today's Action:</strong> {coachingData.motivation.action}
                </div>
                <div className="affirmation">
                  <Icon name="format_quote" size={20} />
                  {coachingData.motivation.affirmation}
                </div>
              </div>
            )}

            {/* Progress Coaching */}
            {activeSection === 'progress' && coachingData.progressCoaching && (
              <div className="progress-coaching">
                <div className="progress-assessment">
                  <h4>Progress Assessment</h4>
                  <div className={`assessment-badge ${coachingData.progressCoaching.assessment}`}>
                    {coachingData.progressCoaching.assessment.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="coach-encouragement">
                  {coachingData.progressCoaching.encouragement}
                </div>

                <div className="progress-recommendations">
                  <h5>Recommendations</h5>
                  {coachingData.progressCoaching.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation">
                      <Icon name="check" size={14} />
                      {rec}
                    </div>
                  ))}
                </div>

                {coachingData.progressCoaching.warning && (
                  <div className="progress-warnings">
                    <h5>Attention Needed</h5>
                    {coachingData.progressCoaching.warning.map((warning, index) => (
                      <div key={index} className="warning">
                        <Icon name="warning" size={14} />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skills Development */}
            {activeSection === 'skills' && (
              <div className="skills-section">
                <h4>Skill Development Path</h4>
                
                <div className="current-skills">
                  <h5>Current Focus Areas</h5>
                  <div className="skills-list">
                    {coachingData.skillRecommendations.currentSkills.map((skill, index) => (
                      <div key={index} className="skill-tag current">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="recommended-skills">
                  <h5>Recommended Skills</h5>
                  <div className="skills-priority">
                    {coachingData.skillRecommendations.priority.map((item, index) => (
                      <div key={index} className="priority-skill">
                        <div className="skill-name">{item.skill}</div>
                        <div className="skill-priority">
                          <div 
                            className="priority-bar"
                            style={{ width: `${item.priority}%` }}
                          ></div>
                          <span className="priority-text">{item.timeframe}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="learning-path">
                  <h5>Learning Path</h5>
                  {Object.entries(coachingData.skillRecommendations.learningPath).map(([phase, data]) => (
                    <div key={phase} className="learning-phase">
                      <div className="phase-header">
                        <strong>{data.name}</strong>
                        <span className="phase-duration">{data.duration}</span>
                      </div>
                      <div className="phase-skills">
                        {data.skills.map((skill, idx) => (
                          <span key={idx} className="phase-skill">{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Section */}
            {activeSection === 'resources' && (
              <div className="resources-section">
                <h4>Personalized Resources</h4>

                <div className="resource-category">
                  <h5>📚 Recommended Books</h5>
                  <div className="resource-list">
                    {Object.entries(coachingData.resources.books).map(([book, description]) => (
                      <div key={book} className="resource-item">
                        <strong>{book}</strong>
                        <p>{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="resource-category">
                  <h5>🎓 Online Courses</h5>
                  <div className="resource-list">
                    {coachingData.resources.courses.map((course, index) => (
                      <div key={index} className="resource-item">
                        {course}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="resource-category">
                  <h5>🛠️ Productivity Tools</h5>
                  <div className="resource-list">
                    {coachingData.resources.tools.map((tool, index) => (
                      <div key={index} className="resource-item">
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="resource-category">
                  <h5>👥 Communities</h5>
                  <div className="resource-list">
                    {coachingData.resources.communities.map((community, index) => (
                      <div key={index} className="resource-item">
                        {community}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Review */}
            {activeSection === 'weekly' && (
              <div className="weekly-review">
                <h4>Weekly Review & Planning</h4>

                <div className="week-overview">
                  <h5>This Week's Progress</h5>
                  <div className="overview-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {coachingData.weeklyReview.weekOverview.progressMade}%
                      </span>
                      <span className="stat-label">Progress Made</span>
                    </div>
                  </div>
                </div>

                <div className="achievements-challenges">
                  <div className="ac-column">
                    <h5>🎉 Achievements</h5>
                    {coachingData.weeklyReview.achievements.map((achievement, index) => (
                      <div key={index} className="ac-item achievement">
                        <Icon name="check" size={14} />
                        {achievement}
                      </div>
                    ))}
                  </div>
                  <div className="ac-column">
                    <h5>🎯 Challenges</h5>
                    {coachingData.weeklyReview.challenges.map((challenge, index) => (
                      <div key={index} className="ac-item challenge">
                        <Icon name="warning" size={14} />
                        {challenge}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="next-week-focus">
                  <h5>Next Week's Focus</h5>
                  {coachingData.weeklyReview.nextWeekFocus.map((focus, index) => (
                    <div key={index} className="focus-item">
                      <Icon name="target" size={14} />
                      {focus}
                    </div>
                  ))}
                </div>

                <div className="reflection-questions">
                  <h5>Reflection Questions</h5>
                  {coachingData.weeklyReview.reflectionQuestions.map((question, index) => (
                    <div key={index} className="reflection-question">
                      {question}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICoachPanel;