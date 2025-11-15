import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { advancedAnalytics } from '../utils/advancedAnalytics';

const AnalyticsDashboard = ({ userData, futureData, progressData }) => {
  const [analyticsReport, setAnalyticsReport] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userData && futureData) {
      const report = advancedAnalytics.generateAnalyticsReport(userData, futureData, progressData);
      setAnalyticsReport(report);
      
      // Track analytics view
      advancedAnalytics.trackEvent('analytics_viewed', {
        section: activeTab,
        userScore: futureData.score
      });
    }
  }, [userData, futureData, progressData, activeTab]);

  if (!analyticsReport) return null;

  const { summary, detailedAnalysis, recommendations } = analyticsReport;

  return (
    <div className="analytics-dashboard">
      <motion.div
        className="analytics-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Icon name="analytics" size={24} />
        <h3>Advanced Analytics</h3>
        <div className="confidence-badge">
          {summary.confidence} confidence
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        className="analytics-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {['overview', 'success', 'comparison', 'improvement', 'trends'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="metrics-grid">
            <div className="metric-card primary">
              <div className="metric-value">{summary.overallScore}/100</div>
              <div className="metric-label">Future Potential</div>
              <div className="metric-trend">Base Score</div>
            </div>

            <div className="metric-card success">
              <div className="metric-value">{summary.successProbability}%</div>
              <div className="metric-label">Success Probability</div>
              <div className="metric-trend">
                {summary.confidence === 'high' ? 'High Confidence' : 'Needs More Data'}
              </div>
            </div>

            <div className="metric-card engagement">
              <div className="metric-value">{Math.round(summary.engagementLevel)}%</div>
              <div className="metric-label">Engagement Level</div>
              <div className="metric-trend">
                {summary.engagementLevel >= 70 ? 'Highly Engaged' : 'Growing'}
              </div>
            </div>

            <div className="metric-card comparative">
              <div className="metric-value">
                {detailedAnalysis.comparativeInsights.peerComparison.percentile}%
              </div>
              <div className="metric-label">Peer Percentile</div>
              <div className="metric-trend">
                vs Similar Users
              </div>
            </div>
          </div>

          {/* Success Factors */}
          <div className="factors-section">
            <h4>Success Factor Analysis</h4>
            <div className="factors-grid">
              {Object.entries(detailedAnalysis.successFactors).map(([factor, score]) => (
                <div key={factor} className="factor-item">
                  <div className="factor-header">
                    <span className="factor-name">
                      {factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="factor-score">{score}%</span>
                  </div>
                  <div className="factor-bar">
                    <div 
                      className="factor-progress"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Probability Tab */}
      {activeTab === 'success' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="probability-breakdown">
            <h4>Success Probability Breakdown</h4>
            <div className="probability-circle">
              <div 
                className="probability-fill"
                style={{ 
                  background: `conic-gradient(#10b981 ${summary.successProbability}%, #374151 ${summary.successProbability}%)` 
                }}
              >
                <div className="probability-inner">
                  <span className="probability-value">{summary.successProbability}%</span>
                  <span className="probability-label">Success Probability</span>
                </div>
              </div>
            </div>

            <div className="probability-factors">
              {Object.entries(detailedAnalysis.successFactors).map(([factor, score]) => (
                <div key={factor} className="probability-factor">
                  <div className="factor-info">
                    <span className="factor-name">
                      {factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <span className="factor-weight">
                      {factor === 'basePotential' ? '40%' :
                       factor === 'dreamSpecificity' ? '20%' :
                       factor === 'timelineRealism' ? '20%' :
                       factor === 'currentProgress' ? '10%' : '10%'} weight
                    </span>
                  </div>
                  <div className="factor-contribution">
                    +{Math.round(score * 
                      (factor === 'basePotential' ? 0.4 :
                       factor === 'dreamSpecificity' ? 0.2 :
                       factor === 'timelineRealism' ? 0.2 :
                       factor === 'currentProgress' ? 0.1 : 0.1)
                    )}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="comparison-section">
            <h4>Peer Comparison</h4>
            
            <div className="comparison-metrics">
              <div className="comparison-item">
                <div className="comparison-label">Your Score</div>
                <div className="comparison-value">{detailedAnalysis.comparativeInsights.peerComparison.userScore}</div>
                <div className="comparison-bar your-score"></div>
              </div>
              
              <div className="comparison-item">
                <div className="comparison-label">Average Peer Score</div>
                <div className="comparison-value">
                  {detailedAnalysis.comparativeInsights.peerComparison.averagePeerScore}
                </div>
                <div 
                  className="comparison-bar peer-average"
                  style={{ width: `${detailedAnalysis.comparativeInsights.peerComparison.averagePeerScore}%` }}
                ></div>
              </div>
            </div>

            <div className="percentile-display">
              <div className="percentile-value">
                You're in the top {100 - detailedAnalysis.comparativeInsights.peerComparison.percentile}%
              </div>
              <div className="percentile-description">
                of users with similar profiles
              </div>
            </div>

            {/* Strengths & Opportunities */}
            <div className="strengths-opportunities">
              <div className="so-column">
                <h5>Your Strengths</h5>
                {detailedAnalysis.comparativeInsights.peerComparison.strengths.map((strength, index) => (
                  <div key={index} className="so-item strength">
                    <Icon name="check" size={14} />
                    {strength}
                  </div>
                ))}
              </div>
              
              <div className="so-column">
                <h5>Growth Opportunities</h5>
                {detailedAnalysis.comparativeInsights.peerComparison.opportunities.map((opportunity, index) => (
                  <div key={index} className="so-item opportunity">
                    <Icon name="trend" size={14} />
                    {opportunity}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Improvement Tab */}
      {activeTab === 'improvement' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="improvement-section">
            <h4>Data-Driven Improvement Areas</h4>
            
            <div className="improvement-list">
              {recommendations.map((rec, index) => (
                <div key={index} className="improvement-item">
                  <div className="improvement-header">
                    <div className="improvement-priority">
                      <span className={`priority-dot ${rec.priority}`}></span>
                      {rec.priority.toUpperCase()} PRIORITY
                    </div>
                    <div className="improvement-area">{rec.area}</div>
                  </div>
                  
                  <div className="improvement-content">
                    <div className="improvement-action">
                      <strong>Action:</strong> {rec.action}
                    </div>
                    <div className="improvement-details">
                      <div className="improvement-detail">
                        <Icon name="target" size={14} />
                        <strong>Target:</strong> {rec.target}
                      </div>
                      <div className="improvement-detail">
                        <Icon name="impact" size={14} />
                        <strong>Impact:</strong> {rec.impact}
                      </div>
                      <div className="improvement-detail">
                        <Icon name="calendar" size={14} />
                        <strong>Timeframe:</strong> {rec.timeframe}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="trends-section">
            <h4>Usage Trends & Patterns</h4>
            
            <div className="trends-grid">
              <div className="trend-card">
                <h5>Popular Features</h5>
                <div className="trend-list">
                  {detailedAnalysis.trends.popularFeatures.map((feature, index) => (
                    <div key={index} className="trend-item">
                      <span className="trend-name">{feature.feature}</span>
                      <span className="trend-count">{feature.count} uses</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="trend-card">
                <h5>Success Patterns</h5>
                <div className="pattern-list">
                  {detailedAnalysis.trends.successPatterns.map((pattern, index) => (
                    <div key={index} className="pattern-item">
                      <Icon name="insight" size={14} />
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>

              <div className="trend-card">
                <h5>Seasonal Trends</h5>
                <div className="seasonal-info">
                  <div className="seasonal-item">
                    <strong>Busiest Period:</strong> Month {detailedAnalysis.trends.seasonalTrends.busiestMonth}
                  </div>
                  <div className="seasonal-item">
                    <strong>Pattern:</strong> {detailedAnalysis.trends.seasonalTrends.seasonalPattern}
                  </div>
                </div>
              </div>

              <div className="trend-card">
                <h5>Common Challenges</h5>
                <div className="challenges-list">
                  {detailedAnalysis.comparativeInsights.commonChallenges.map((challenge, index) => (
                    <div key={index} className="challenge-item">
                      <Icon name="warning" size={14} />
                      {challenge}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;