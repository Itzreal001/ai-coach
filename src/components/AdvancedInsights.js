import React from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

const AdvancedInsights = ({ insights }) => {
  if (!insights) return null;

  const { keyFactors, riskAssessment, recommendations, confidence } = insights;

  return (
    <div className="advanced-insights">
      <motion.div
        className="insights-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Icon name="psychology" size={24} />
        <h3>AI Dream Analysis</h3>
      </motion.div>

      {/* Risk Assessment */}
      <motion.div 
        className="complexity-score"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="score-breakdown">
          <h4>Confidence Level: {confidence}%</h4>
          <div className="risk-assessment">
            <span className="risk-label">Risk Assessment:</span>
            <span className="risk-value">{riskAssessment}</span>
          </div>
        </div>
      </motion.div>

      {/* Key Factors */}
      <motion.div
        className="actionable-insights"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4>Key Success Factors</h4>
        <div className="insights-list">
          {Array.isArray(keyFactors) && keyFactors.map((factor, index) => (
            <motion.div
              key={index}
              className="insight-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Icon name="lightbulb" size={16} />
              <div className="insight-content">
                <p className="insight-message">{factor}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        className="skill-recommendations"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h4>Recommendations</h4>
        <div className="skills-grid">
          {Array.isArray(recommendations) && recommendations.map((rec, index) => (
            <motion.div
              key={index}
              className="skill-tag"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon name="target" size={14} />
              {rec}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedInsights;