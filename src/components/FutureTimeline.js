import React from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

const FutureTimeline = ({ timeline, onSceneChange }) => {
  const getMilestoneIcon = (milestone) => {
    if (milestone.includes('Growth') || milestone.includes('Success')) 
      return <Icon name="trend" size={16} />;
    if (milestone.includes('Dream') || milestone.includes('Achievement')) 
      return <Icon name="flag" size={16} />;
    if (milestone.includes('Change') || milestone.includes('Transformation')) 
      return <Icon name="magic" size={16} />;
    return <Icon name="calendar" size={16} />;
  };

  const handleTimelineClick = (index) => {
    console.log(`Timeline item ${index} clicked`);
    if (onSceneChange && typeof onSceneChange === 'function') {
      onSceneChange(index); // Use the same index for scenes
    }
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <Icon name="calendar" size={24} />
        <h2>Your Future Timeline</h2>
      </div>
      <div className="timeline">
        {timeline && timeline.map((event, index) => (
          <motion.div
            key={event.year || index}
            className="timeline-event"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            onClick={() => handleTimelineClick(index)}
          >
            <div className="timeline-year">
              <Icon name="calendar" size={16} />
              {event.year}
            </div>
            <div className="timeline-content">
              <div className="timeline-header-content">
                {getMilestoneIcon(event.milestone)}
                <h3>{event.title}</h3>
              </div>
              <p>{event.description}</p>
              <div className="timeline-meta">
                <span className="milestone">
                  <Icon name="flag" size={12} />
                  {event.milestone}
                </span>
                <span className="probability">
                  <Icon name="trend" size={12} />
                  {event.probability}% likely
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FutureTimeline;