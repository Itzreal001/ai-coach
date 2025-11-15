import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { exportManager } from '../utils/exportManager';

const ExportPanel = ({ userData, futureData, progressData, insights }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type) => {
    if (!userData || !futureData) return;
    
    setIsExporting(true);
    
    try {
      switch (type) {
        case 'pdf':
          await exportManager.exportToPDF(userData, futureData, progressData, insights);
          break;
        case 'calendar':
          exportManager.exportToCalendar(futureData);
          break;
        case 'vision-board':
          await exportManager.exportToImage(userData, futureData);
          break;
        case 'linkedin':
          exportManager.shareToLinkedIn(futureData, userData);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      title: 'PDF Report',
      description: 'Comprehensive report with insights and timeline',
      icon: 'description',
      color: '#ef4444'
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Add milestones to your calendar',
      icon: 'calendar',
      color: '#3b82f6'
    },
    {
      id: 'vision-board',
      title: 'Vision Board',
      description: 'Create an inspirational vision board',
      icon: 'dashboard',
      color: '#8b5cf6'
    },
    {
      id: 'linkedin',
      title: 'Share on LinkedIn',
      description: 'Share your future goals professionally',
      icon: 'linkedin',
      color: '#0a66c2'
    }
  ];

  return (
    <div className="export-panel">
      <motion.div
        className="export-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Icon name="download" size={24} />
        <h3>Export & Share</h3>
      </motion.div>

      <div className="export-options">
        {exportOptions.map((option, index) => (
          <motion.button
            key={option.id}
            className="export-option"
            onClick={() => handleExport(option.id)}
            disabled={isExporting}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="export-icon"
              style={{ backgroundColor: `${option.color}20`, borderColor: option.color }}
            >
              <Icon name={option.icon} size={20} style={{ color: option.color }} />
            </div>
            <div className="export-content">
              <h4>{option.title}</h4>
              <p>{option.description}</p>
            </div>
            {isExporting && option.id === 'pdf' && (
              <div className="loading-spinner small"></div>
            )}
          </motion.button>
        ))}
      </div>

      {isExporting && (
        <motion.div
          className="export-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="loading-spinner"></div>
          <p>Generating your export...</p>
        </motion.div>
      )}
    </div>
  );
};

export default ExportPanel;