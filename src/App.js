import { useState, useEffect } from 'react';
import './App.css';
import UserInput from './components/UserInput';
import FutureTimeline from './components/FutureTimeline';
import EnhancedThreeScene from './components/EnhancedThreeScene';
import FutureScore from './components/FutureScore';
import SocialShare from './components/SocialShare';
import { FuturePredictor } from './utils/aiPredictor';
import { audioManager } from './utils/audioManager';
import { futureStorage } from './utils/futureStorage';
import Icon from './components/Icon';

// Import the ACTUAL components from your file structure
import AdvancedInsights from './components/AdvancedInsights';
import AICoachPanel from './components/AICoachPanel';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ARViewer from './components/ARViewer';
import AudioControls from './components/AudioControls';
import CommunityFeed from './components/CommunityFeed';
import ExportPanel from './components/ExportPanel';
import ProgressTracker from './components/ProgressTracker';
import ProfessionalBackground from './components/ProfessionalBackground';

// Import the remaining utility files - FIXED IMPORTS
import { gamificationSystem } from './utils/gamification';
import { socialManager } from './utils/socialManager';
import { progressTracker } from './utils/progressTracker';

function App() {
  const [userData, setUserData] = useState(null);
  const [futureData, setFutureData] = useState(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState('main');
  const [showAICoach, setShowAICoach] = useState(false);
  const [userProgress, setUserProgress] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [showContentLoaded, setShowContentLoaded] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', targetDate: '' });

  useEffect(() => {
    // Initialize all managers
    audioManager.loadSounds();
    audioManager.playBackgroundMusic();
    
    // Load user progress and achievements
    const savedProgress = futureStorage.getProgress();
    if (savedProgress) {
      setUserProgress(savedProgress);
    }
    
    const userAchievements = gamificationSystem.getAchievements();
    setAchievements(userAchievements);
    
    // Initialize social features
    socialManager.initialize();
  }, []);

  // Safe scene change handler
  const handleSceneChange = (newSceneIndex) => {
    console.log('Changing scene to:', newSceneIndex);
    
    if (!futureData || !futureData.scenes) {
      console.warn('No scenes available to change to');
      return;
    }
    
    const maxSceneIndex = futureData.scenes.length - 1;
    const safeSceneIndex = Math.max(0, Math.min(newSceneIndex, maxSceneIndex));
    
    console.log(`Scene change: ${newSceneIndex} -> ${safeSceneIndex} (max: ${maxSceneIndex})`);
    
    if (safeSceneIndex !== currentScene) {
      setCurrentScene(safeSceneIndex);
      audioManager.playSound('transition');
      
      // Update gamification progress
      updateGamification('scenesViewed', safeSceneIndex + 1);
    }
  };

  const generateFuture = async (data) => {
    setIsLoading(true);
    setUserData(data);
    audioManager.playSound('generate');
    
    // Show loading animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const predictor = new FuturePredictor(data);
      const timeline = predictor.generateTimeline();
      const score = predictor.calculateFutureScore();
      const advancedInsights = predictor.generateAdvancedInsights();
      
      console.log('AI Generated data:', { timeline, score, advancedInsights });
      
      // Ensure we have valid data
      const safeTimeline = validateTimeline(timeline, data);
      const safeScore = validateScore(score);
      const safeScenes = generate3DScenes(data, safeTimeline);
      const safeInsights = validateInsights(advancedInsights);
      
      const generatedFuture = {
        timeline: safeTimeline,
        score: safeScore,
        scenes: safeScenes,
        insights: safeInsights,
        timestamp: new Date().toISOString()
      };
      
      setFutureData(generatedFuture);
      setCurrentScene(0);
      
      // Save data and update gamification
      await futureStorage.saveFuture(data, generatedFuture);
      updateGamification('futuresGenerated', (userProgress.futuresGenerated || 0) + 1);
      updateGamification('lastGenerated', new Date().toISOString());
      
      // Check for new achievements
      const newAchievements = gamificationSystem.checkAchievements(userProgress);
      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements]);
        newAchievements.forEach(achievement => {
          audioManager.playSound('achievement');
        });
      }
      
    } catch (error) {
      console.error('Failed to generate future:', error);
      setFutureData(getFallbackFutureData(data));
    } finally {
      setIsLoading(false);
    }
  };

  // VALIDATION FUNCTIONS - ADDED THESE
  const validateTimeline = (timeline, userData) => {
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0) {
      console.warn('Invalid timeline, using default');
      return getDefaultTimeline(userData);
    }
    
    return timeline.map((item, index) => ({
      year: item.year || new Date().getFullYear() + index + 1,
      title: item.title || `Future Milestone ${index + 1}`,
      description: item.description || `Your journey continues in ${userData.country}.`,
      milestone: item.milestone || 'Progress',
      probability: item.probability || 75
    }));
  };

  const validateScore = (score) => {
    if (typeof score !== 'number' || isNaN(score)) {
      console.warn('Invalid score, using default');
      return 75;
    }
    return Math.max(0, Math.min(100, score));
  };

  const validateInsights = (insights) => {
    if (!insights) {
      return {
        keyFactors: ['Career Growth', 'Personal Development', 'Opportunity Timing'],
        riskAssessment: 'Low to Moderate',
        recommendations: ['Focus on skill development', 'Build professional network'],
        confidence: 85
      };
    }
    return insights;
  };

  const getDefaultTimeline = (userData) => {
    const currentYear = new Date().getFullYear();
    return [
      {
        year: currentYear + 1,
        title: "New Beginnings",
        description: `You start making progress toward your dream of ${userData.dream} in ${userData.country}.`,
        milestone: "First Steps",
        probability: 85
      },
      {
        year: currentYear + 3,
        title: "Significant Growth",
        description: "Your efforts begin to show remarkable results and opportunities multiply.",
        milestone: "Major Progress",
        probability: 72
      },
      {
        year: currentYear + 5,
        title: "Dream Realization",
        description: `You achieve significant milestones related to ${userData.dream}.`,
        milestone: "Goal Achieved",
        probability: 68
      }
    ];
  };

  const getFallbackFutureData = (userData) => {
    const timeline = getDefaultTimeline(userData);
    return {
      timeline,
      score: 78,
      scenes: generate3DScenes(userData, timeline),
      insights: validateInsights(null)
    };
  };

  const generate3DScenes = (userData, timeline) => {
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0) {
      return [{
        title: "Your Future Journey",
        description: "Your personalized timeline is being prepared...",
        color: "#3b82f6"
      }];
    }
    
    return timeline.map((event, index) => ({
      title: event.title || `Year ${event.year}`,
      description: event.description || 'Your future unfolds...',
      color: getSceneColor(index),
      year: event.year
    }));
  };

  const getSceneColor = (index) => {
    const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
    return colors[index % colors.length];
  };

  const updateGamification = (key, value) => {
    const newProgress = {
      ...userProgress,
      [key]: value
    };
    setUserProgress(newProgress);
    futureStorage.saveProgress(newProgress);
    
    // Check for achievements after update
    const newAchievements = gamificationSystem.checkAchievements(newProgress);
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  // ADDED MISSING FUNCTION
  const toggleAudio = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  // ADDED MISSING FUNCTION
  const resetSimulation = () => {
    setFutureData(null);
    setUserData(null);
    setCurrentScene(0);
    setActiveView('main');
    setShowAICoach(false);
    audioManager.playSound('reset');
  };

  // Function to handle view changes with loading feedback
  const handleViewChange = async (newView) => {
    if (newView === activeView) return; // Don't change if already active

    setIsViewLoading(true);
    setShowContentLoaded(false);
    audioManager.playSound('transition');

    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    setActiveView(newView);
    setIsViewLoading(false);

    // Show success indicator
    setShowContentLoaded(true);
    setTimeout(() => setShowContentLoaded(false), 2000);
  };

  const shareToSocial = async (platform) => {
    try {
      const shareData = {
        futureData,
        userData,
        achievements
      };
      await socialManager.share(platform, shareData);
      updateGamification('socialShares', (userProgress.socialShares || 0) + 1);
    } catch (error) {
      console.error('Social share failed:', error);
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.title.trim()) {
      const updatedProgress = progressTracker.addMilestone(newMilestone);
      if (updatedProgress) {
        setUserProgress(updatedProgress);
        setNewMilestone({ title: '', description: '', targetDate: '' });
        setShowAddMilestone(false);
      }
    }
  };

  // ADDED MISSING FUNCTION
  const renderMainContent = () => {
    switch (activeView) {
      case 'analytics':
        return (
          <AnalyticsDashboard 
            futureData={futureData}
            userData={userData}
            userProgress={userProgress}
            onBack={() => setActiveView('main')}
          />
        );
      
      case 'ar':
        return (
          <ARViewer
            futureData={futureData}
            userData={userData}
          />
        );
      
      case 'community':
        return (
          <CommunityFeed 
            userData={userData}
            futureData={futureData}
            achievements={achievements}
            onShare={shareToSocial}
            onBack={() => setActiveView('main')}
          />
        );
      
      case 'export':
        return (
          <ExportPanel
            futureData={futureData}
            userData={userData}
            progressData={userProgress}
            insights={futureData.insights}
          />
        );
      
      default:
        return (
          <div className="future-display">
            {/* Left Side - Future Timeline/Predictions */}
            <div className="timeline-container">
              <FutureTimeline
                timeline={futureData.timeline}
                onSceneChange={handleSceneChange}
                currentScene={currentScene}
              />
            </div>

            {/* Center - 3D Scene + Milestone Button */}
            <div className="scene-with-milestone">
              <EnhancedThreeScene
                scenes={futureData.scenes}
                currentScene={currentScene}
              />

              {/* Milestone Button under the 3D scene */}
              <div className="milestone-button-container">
                <button
                  className="add-milestone-btn"
                  onClick={() => setShowAddMilestone(true)}
                >
                  <Icon name="add" size={20} />
                  Add Milestone
                </button>
              </div>
            </div>

            {/* Right Side - Side Panel */}
            <div className="side-panel">
              <FutureScore score={futureData.score} />
              <AdvancedInsights insights={futureData.insights} />
              <ProgressTracker
                futureData={futureData}
                userProgress={userProgress}
                achievements={achievements}
                hideMilestoneButton={true}
              />
              <SocialShare
                futureData={futureData}
                userData={userData}
                onShare={shareToSocial}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {/* Use the actual ProfessionalBackground component */}
      <ProfessionalBackground />
      
      <div className="container">
        {/* Audio Controls */}
        <AudioControls 
          isMuted={isMuted}
          onToggleMute={toggleAudio}
          onVolumeChange={(volume) => audioManager.setSfxVolume(volume)}
        />

        {/* AI Coach Toggle */}
        <button 
          className="ai-coach-toggle"
          onClick={() => setShowAICoach(!showAICoach)}
        >
          <Icon name="smartToy" size={24} />
          AI Coach
          {achievements.length > 0 && (
            <span className="achievement-badge">{achievements.length}</span>
          )}
        </button>

        {!futureData ? (
          <UserInput onGenerate={generateFuture} isLoading={isLoading} />
        ) : (
          <>
            {/* Navigation Bar */}
            <nav className="app-navigation">
              <button
                className={`nav-btn ${activeView === 'main' ? 'active' : ''} ${isViewLoading ? 'loading' : ''}`}
                onClick={() => handleViewChange('main')}
                disabled={isViewLoading}
              >
                <Icon name="dashboard" size={20} />
                Timeline
                {isViewLoading && activeView !== 'main' && <div className="loading-indicator"></div>}
              </button>
              <button
                className={`nav-btn ${activeView === 'analytics' ? 'active' : ''} ${isViewLoading ? 'loading' : ''}`}
                onClick={() => handleViewChange('analytics')}
                disabled={isViewLoading}
              >
                <Icon name="analytics" size={20} />
                Analytics
                {isViewLoading && activeView !== 'analytics' && <div className="loading-indicator"></div>}
              </button>
              <button
                className={`nav-btn ${activeView === 'ar' ? 'active' : ''} ${isViewLoading ? 'loading' : ''}`}
                onClick={() => handleViewChange('ar')}
                disabled={isViewLoading}
              >
                <Icon name="viewInAr" size={20} />
                AR View
                {isViewLoading && activeView !== 'ar' && <div className="loading-indicator"></div>}
              </button>
              <button
                className={`nav-btn ${activeView === 'community' ? 'active' : ''} ${isViewLoading ? 'loading' : ''}`}
                onClick={() => handleViewChange('community')}
                disabled={isViewLoading}
              >
                <Icon name="groups" size={20} />
                Community
                {userProgress.socialShares > 0 && (
                  <span className="nav-badge">{userProgress.socialShares}</span>
                )}
                {isViewLoading && activeView !== 'community' && <div className="loading-indicator"></div>}
              </button>
              <button
                className={`nav-btn ${activeView === 'export' ? 'active' : ''} ${isViewLoading ? 'loading' : ''}`}
                onClick={() => handleViewChange('export')}
                disabled={isViewLoading}
              >
                <Icon name="download" size={20} />
                Export
                {isViewLoading && activeView !== 'export' && <div className="loading-indicator"></div>}
              </button>

              <button className="reset-btn" onClick={resetSimulation} disabled={isViewLoading}>
                <Icon name="refresh" size={20} />
                New Simulation
              </button>
            </nav>

            {/* Main Content Area */}
            <div className="main-content-area">
              {isViewLoading ? (
                <div className="content-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading content...</p>
                </div>
              ) : (
                <>
                  {renderMainContent()}
                  <div className={`content-loaded-indicator ${showContentLoaded ? 'show' : ''}`}>
                    Content loaded successfully
                  </div>
                </>
              )}
            </div>

            {/* AI Coach Panel */}
            {showAICoach && (
              <AICoachPanel
                userData={userData}
                futureData={futureData}
                progressData={userProgress}
              />
            )}

            {/* Add Milestone Modal */}
            {showAddMilestone && (
              <div className="add-milestone-modal">
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;