import React from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

const FutureScore = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#f59e0b';
    if (score >= 70) return '#ef4444';
    return '#6b7280';
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "EXTRAORDINARY FUTURE!";
    if (score >= 80) return "AMAZING JOURNEY AHEAD!";
    if (score >= 70) return "SOLID PATH FORWARD!";
    return "UNIQUE OPPORTUNITIES AHEAD!";
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return <Icon name="trophy" size={32} />;
    if (score >= 80) return <Icon name="trend" size={32} />;
    if (score >= 70) return <Icon name="star" size={32} />;
    return <Icon name="award" size={32} />;
  };

  return (
    <motion.div 
      className="score-container"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
    >
      <div className="score-header">
        {getScoreIcon(score)}
        <h2>Future Potential Score</h2>
      </div>
      <div 
        className="score-circle"
        style={{ 
          background: `conic-gradient(${getScoreColor(score)} ${score}%, #374151 ${score}%)` 
        }}
      >
        <div className="score-inner">
          <span className="score-number">{score}</span>
          <span className="score-label">/100</span>
        </div>
      </div>
      <div className="score-message">
        {getScoreMessage(score)}
      </div>
    </motion.div>
  );
};

export default FutureScore;