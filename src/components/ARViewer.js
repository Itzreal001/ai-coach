import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { arManager } from '../utils/arManager';

const ARViewer = ({ futureData, userData }) => {
  const [arStatus, setArStatus] = useState('idle'); // idle, loading, active, error
  const [arSession, setArSession] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startARExperience = async () => {
    setArStatus('loading');
    
    try {
      if (arManager.isSupported) {
        const session = await arManager.initializeAR();
        setArSession(session);
        setArStatus('active');
      } else {
        // Fallback to simulation
        const simulation = arManager.simulateAR(futureData);
        setSimulationData(simulation);
        setArStatus('simulation');
      }
    } catch (error) {
      console.error('AR failed:', error);
      setArStatus('error');
    }
  };

  const stopARExperience = () => {
    if (arSession) {
      arSession.session.end();
      setArSession(null);
    }
    setArStatus('idle');
    setSimulationData(null);
  };

  const captureARScreenshot = async () => {
    if (canvasRef.current) {
      const imageUrl = await arManager.captureARScene(canvasRef.current);
      
      // Download the image
      const link = document.createElement('a');
      link.download = `ar-future-${userData.name}.png`;
      link.href = imageUrl;
      link.click();
    }
  };

  const instructions = arManager.getARInstructions();

  // Handle case where data is not available yet
  if (!futureData || !futureData.timeline || !userData) {
    return (
      <div className="ar-viewer">
        <motion.div
          className="ar-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Icon name="3d" size={24} />
          <h3>AR Future Experience</h3>
          <div className="ar-status loading">
            Loading future data...
          </div>
        </motion.div>
        <div className="ar-loading">
          <div className="loading-spinner"></div>
          <p>Please complete your future simulation first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-viewer">
      <motion.div
        className="ar-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Icon name="3d" size={24} />
        <h3>AR Future Experience</h3>
        <div className={`ar-status ${arStatus}`}>
          {arStatus === 'idle' && 'Ready to Start'}
          {arStatus === 'loading' && 'Loading AR...'}
          {arStatus === 'active' && 'AR Active'}
          {arStatus === 'simulation' && 'Simulation Mode'}
          {arStatus === 'error' && 'AR Unavailable'}
        </div>
      </motion.div>

      {/* AR Instructions */}
      <motion.div
        className="ar-instructions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h4>{instructions.title}</h4>
        <div className="instruction-steps">
          {instructions.steps.map((step, index) => (
            <div key={index} className="instruction-step">
              <div className="step-number">{index + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
        
        {!arManager.isSupported && (
          <div className="ar-warning">
            <Icon name="warning" size={16} />
            <p>Full AR experience requires a compatible device</p>
          </div>
        )}
      </motion.div>

      {/* AR Controls */}
      <motion.div
        className="ar-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {arStatus === 'idle' && (
          <button className="start-ar-btn" onClick={startARExperience}>
            <Icon name="play" size={20} />
            Start AR Experience
          </button>
        )}

        {(arStatus === 'active' || arStatus === 'simulation') && (
          <div className="active-ar-controls">
            <button className="capture-btn" onClick={captureARScreenshot}>
              <Icon name="camera" size={18} />
              Capture Scene
            </button>
            <button className="stop-ar-btn" onClick={stopARExperience}>
              <Icon name="stop" size={18} />
              Stop AR
            </button>
          </div>
        )}

        {arStatus === 'loading' && (
          <div className="ar-loading">
            <div className="loading-spinner"></div>
            <p>Initializing AR experience...</p>
          </div>
        )}

        {arStatus === 'error' && (
          <div className="ar-error">
            <Icon name="error" size={24} />
            <p>AR is not available on this device</p>
            <button onClick={() => setArStatus('idle')}>Try Simulation</button>
          </div>
        )}
      </motion.div>

      {/* AR Visualization Area */}
      {(arStatus === 'active' || arStatus === 'simulation') && (
        <motion.div
          className="ar-visualization"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {arStatus === 'simulation' && simulationData && (
            <div className="ar-simulation">
              <div className="simulation-view">
                {/* Simulated AR view with future timeline */}
                <div className="simulation-scene">
                  {simulationData.visualization.timelineObjects.map((obj, index) => (
                    <div
                      key={obj.id}
                      className="ar-object"
                      style={{
                        left: `${50 + obj.position.x * 20}%`,
                        top: `${50 + obj.position.y * 20}%`,
                        backgroundColor: obj.color,
                        transform: `scale(${obj.size})`
                      }}
                    >
                      <div className="object-label">
                        {obj.year}: {obj.title}
                      </div>
                    </div>
                  ))}
                  
                  {/* Connection lines */}
                  {simulationData.visualization.connections.map((conn, index) => (
                    <div
                      key={index}
                      className="connection-line"
                      style={{
                        left: `${50 + simulationData.visualization.timelineObjects[conn.from].position.x * 20}%`,
                        top: '50%',
                        width: `${Math.abs(conn.to - conn.from) * 10}%`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="simulation-instructions">
                <h5>Simulation Instructions:</h5>
                {simulationData.instructions.map((instruction, idx) => (
                  <p key={idx}>• {instruction}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Hidden canvas for AR rendering */}
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }}
          />
        </motion.div>
      )}

      {/* Future Objects Preview */}
      <motion.div
        className="future-objects-preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h4>Your Future in AR</h4>
        <div className="objects-grid">
          {futureData.timeline.map((event, index) => (
            <div key={index} className="future-object-preview">
              <div 
                className="object-color"
                style={{ backgroundColor: arManager.getColorForYear(event.year) }}
              ></div>
              <div className="object-info">
                <strong>{event.year}</strong>
                <span>{event.title}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ARViewer;