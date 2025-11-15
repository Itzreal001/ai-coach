import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // ADDED AnimatePresence
import Icon from './Icon';
import { advancedAudioManager } from '../utils/advancedAudioManager';

const AudioControls = ({ isMuted, onToggleMute, onVolumeChange }) => { // ADDED props
  const [showVolumeControls, setShowVolumeControls] = useState(false);
  const [volumes, setVolumes] = useState({
    music: 30,
    sfx: 70,
    ambient: 20
  });

  useEffect(() => {
    // Set initial volumes
    advancedAudioManager.setMusicVolume(volumes.music / 100);
    advancedAudioManager.setSfxVolume(volumes.sfx / 100);
    advancedAudioManager.setAmbientVolume(volumes.ambient / 100);
  }, []);

  const toggleMute = () => {
    const muted = advancedAudioManager.toggleMute();
    onToggleMute(muted); // CALL THE PROP FUNCTION
  };

  const handleVolumeChange = (type, value) => {
    const volume = value / 100;
    setVolumes(prev => ({ ...prev, [type]: value }));

    switch (type) {
      case 'music':
        advancedAudioManager.setMusicVolume(volume);
        break;
      case 'sfx':
        advancedAudioManager.setSfxVolume(volume);
        break;
      case 'ambient':
        advancedAudioManager.setAmbientVolume(volume);
        break;
    }
    
    // CALL THE VOLUME CHANGE PROP
    if (onVolumeChange) {
      onVolumeChange(volume);
    }
  };

  const playTestSound = () => {
    advancedAudioManager.playSound('achievement');
  };

  return (
    <div className="audio-controls-container">
      <motion.button
        className="audio-toggle"
        onClick={toggleMute}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Icon name={isMuted ? "volumeMute" : "volumeUp"} size={24} />
      </motion.button>

      <motion.button
        className="audio-settings-btn"
        onClick={() => setShowVolumeControls(!showVolumeControls)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Icon name="settings" size={20} />
      </motion.button>

      <AnimatePresence>
        {showVolumeControls && (
          <motion.div
            className="volume-controls-panel"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="volume-control">
              <label>
                <Icon name="music" size={16} />
                Music
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volumes.music}
                onChange={(e) => handleVolumeChange('music', parseInt(e.target.value))}
              />
              <span>{volumes.music}%</span>
            </div>

            <div className="volume-control">
              <label>
                <Icon name="sfx" size={16} />
                Sound Effects
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volumes.sfx}
                onChange={(e) => handleVolumeChange('sfx', parseInt(e.target.value))}
              />
              <span>{volumes.sfx}%</span>
            </div>

            <div className="volume-control">
              <label>
                <Icon name="ambient" size={16} />
                Ambience
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volumes.ambient}
                onChange={(e) => handleVolumeChange('ambient', parseInt(e.target.value))}
              />
              <span>{volumes.ambient}%</span>
            </div>

            <button className="test-sound-btn" onClick={playTestSound}>
              <Icon name="play" size={14} />
              Test Sound
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioControls;