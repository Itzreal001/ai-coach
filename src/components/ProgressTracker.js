import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { progressTracker } from '../utils/progressTracker';

const ProgressTracker = ({ futureData, userProgress, achievements, hideMilestoneButton = false }) => {
  const [progress, setProgress] = useState(userProgress || { milestones: [] });
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', targetDate: '' });

  useEffect(() => {
    if (userProgress) {
      setProgress(userProgress);
    } else {
      setProgress({ milestones: [] });
    }
  }, [userProgress]);

  const loadProgress = () => {
    if (userProgress) {
      setProgress(userProgress);
    } else {
      setProgress({ milestones: [] });
    }
  };

  const handleCompleteMilestone = (milestoneId) => {
    const updatedProgress = progressTracker.completeMilestone(milestoneId);
    if (updatedProgress) {
      setProgress(updatedProgress);
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.title.trim()) {
      const updatedProgress = progressTracker.addMilestone(newMilestone);
      if (updatedProgress) {
        setProgress(updatedProgress);
        setNewMilestone({ title: '', description: '', targetDate: '' });
        setShowAddMilestone(false);
      }
    }
  };

  const completed = progress.milestones ? progress.milestones.filter(m => m.completed).length : 0;
  const remaining = progress.milestones ? progress.milestones.length - completed : 0;
  const upcoming = progress.milestones ? progress.milestones.filter(m => !m.completed).length : 0;

  const stats = {
    progressPercentage: progress?.futuresGenerated ? Math.min(100, (progress.futuresGenerated * 20)) : 0,
    achievements: achievements || [],
    socialShares: progress?.socialShares || 0,
    totalProgress: Object.keys(progress).length,
    completed,
    remaining,
    upcoming
  };

  if (!progress || Object.keys(progress).length === 0) return null;

  return (
    <div className="progress-tracker">
      <motion.div
        className="progress-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Icon name="trend" size={24} />
        <h3>Progress Tracker</h3>
        <div className="progress-score">
          {stats?.progressPercentage}%
        </div>
      </motion.div>

      {/* Progress Stats */}
      {stats && (
        <motion.div
          className="progress-stats"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-item">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.remaining}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.achievements.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      <motion.div
        className="progress-bar-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${stats?.progressPercentage || 0}%` }}
          ></div>
        </div>
      </motion.div>

      {/* Milestones List */}
      <motion.div
        className="milestones-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="milestones-header">
          <h4>Your Milestones</h4>
          {!hideMilestoneButton && (
            <button
              className="add-milestone-btn"
              onClick={() => setShowAddMilestone(true)}
            >
              <Icon name="add" size={16} />
              Add Milestone
            </button>
          )}
        </div>

        <div className="milestones">
          {progress.milestones && progress.milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              className={`milestone-item ${milestone.completed ? 'completed' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className="milestone-checkbox">
                <button
                  onClick={() => handleCompleteMilestone(milestone.id)}
                  className={`checkbox ${milestone.completed ? 'checked' : ''}`}
                >
                  {milestone.completed && <Icon name="check" size={12} />}
                </button>
              </div>
              <div className="milestone-content">
                <h5>{milestone.title}</h5>
                <p>{milestone.description}</p>
                {milestone.targetDate && (
                  <span className="milestone-date">
                    Target: {new Date(milestone.targetDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {milestone.completed && (
                <Icon name="trophy" size={16} className="completed-icon" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Add Milestone Form */}
      <AnimatePresence>
        {showAddMilestone && (
          <motion.div
            className="add-milestone-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-content">
              <h4>Add New Milestone</h4>
              <input
                type="text"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
              />
              <textarea
                placeholder="Description (optional)"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
              />
              <input
                type="date"
                placeholder="Target date"
                value={newMilestone.targetDate}
                onChange={(e) => setNewMilestone({...newMilestone, targetDate: e.target.value})}
              />
              <div className="modal-actions">
                <button onClick={() => setShowAddMilestone(false)}>Cancel</button>
                <button onClick={handleAddMilestone} className="primary">Add Milestone</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements */}
      {stats?.achievements.length > 0 && (
        <motion.div
          className="achievements-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h4>Achievements</h4>
          <div className="achievements-grid">
            {stats.achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                className={`achievement ${achievement.type}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Icon 
                  name="trophy" 
                  size={20} 
                  className={`trophy-${achievement.type}`}
                />
                <div className="achievement-content">
                  <h5>{achievement.title}</h5>
                  <p>{achievement.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressTracker;