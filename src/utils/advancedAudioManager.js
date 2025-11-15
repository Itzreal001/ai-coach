export class AdvancedAudioManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.ambientSoundscapes = {};
    this.isMuted = false;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.7;
    this.ambientVolume = 0.2;
    this.currentScene = null;
  }

  async loadSounds() {
    // Sound effects
    this.sounds = {
      click: this.createOscillatorSound(800, 'square', 0.1),
      generate: this.createOscillatorSound(1200, 'sine', 0.3),
      success: this.createOscillatorSound(1500, 'triangle', 0.5),
      transition: this.createOscillatorSound(600, 'sawtooth', 0.4),
      achievement: this.createAchievementSound(),
      milestone: this.createMilestoneSound()
    };

    // Load ambient soundscapes
    await this.loadAmbientSoundscapes();
  }

  createOscillatorSound(freq, type, duration) {
    return () => {
      if (this.isMuted) return;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };
  }

  createAchievementSound() {
    return () => {
      if (this.isMuted) return;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
      oscillator1.frequency.exponentialRampToValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6
      oscillator2.frequency.exponentialRampToValueAtTime(1318.51, audioContext.currentTime + 0.3); // E6

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.5);
      oscillator2.stop(audioContext.currentTime + 0.5);
    };
  }

  createMilestoneSound() {
    return () => {
      if (this.isMuted) return;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const notes = [392.00, 493.88, 587.33, 698.46, 783.99]; // G4, B4, D5, F5, G5
      let currentTime = audioContext.currentTime;

      notes.forEach((freq, index) => {
        oscillator.frequency.setValueAtTime(freq, currentTime);
        gainNode.gain.setValueAtTime(index === 0 ? 0 : 0.001, currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.8, currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
        currentTime += 0.1;
      });

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    };
  }

  async loadAmbientSoundscapes() {
    // Different ambient sounds for each future scene
    this.ambientSoundscapes = {
      present: this.createAmbientSound('low', 'calm'),
      year1: this.createAmbientSound('medium', 'hopeful'),
      year3: this.createAmbientSound('medium', 'energetic'),
      year5: this.createAmbientSound('high', 'triumphant'),
      year10: this.createAmbientSound('veryHigh', 'epic')
    };
  }

  createAmbientSound(pitch, mood) {
    return () => {
      if (this.isMuted) return;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequencies based on pitch
      const baseFreq = {
        low: 110,
        medium: 220,
        high: 440,
        veryHigh: 880
      }[pitch] || 220;

      oscillator1.frequency.value = baseFreq;
      oscillator2.frequency.value = baseFreq * 1.5;

      // Set waveform based on mood
      const waveform = {
        calm: 'sine',
        hopeful: 'sine',
        energetic: 'triangle',
        triumphant: 'sawtooth',
        epic: 'square'
      }[mood] || 'sine';

      oscillator1.type = waveform;
      oscillator2.type = waveform;

      gainNode.gain.value = this.ambientVolume;

      oscillator1.start();
      oscillator2.start();

      return { oscillator1, oscillator2, gainNode, audioContext };
    };
  }

  playSound(soundName) {
    if (this.sounds[soundName] && !this.isMuted) {
      this.sounds[soundName]();
    }
  }

  playSceneAmbience(sceneIndex) {
    this.stopCurrentAmbience();

    const sceneNames = ['present', 'year1', 'year3', 'year5', 'year10'];
    const sceneName = sceneNames[sceneIndex] || 'present';
    
    if (this.ambientSoundscapes[sceneName] && !this.isMuted) {
      this.currentAmbience = this.ambientSoundscapes[sceneName]();
    }
  }

  stopCurrentAmbience() {
    if (this.currentAmbience) {
      this.currentAmbience.oscillator1.stop();
      this.currentAmbience.oscillator2.stop();
      this.currentAmbience.audioContext.close();
      this.currentAmbience = null;
    }
  }

  playBackgroundMusic() {
    if (this.isMuted || this.backgroundMusic) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.backgroundMusic = audioContext;

    // Create ambient pad with multiple oscillators for richer sound
    const oscillators = [];
    const frequencies = [110, 165, 220, 277, 330]; // Chord: Am

    frequencies.forEach(freq => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      gainNode.gain.value = this.musicVolume * 0.1;
      
      oscillator.start();
      oscillators.push({ oscillator, gainNode });
    });

    this.backgroundMusic.oscillators = oscillators;
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.oscillators?.forEach(({ oscillator }) => oscillator.stop());
      this.backgroundMusic.close();
      this.backgroundMusic = null;
    }
  }

  playVoiceAffirmation(messageType) {
    if (this.isMuted) return;

    const affirmations = {
      welcome: "Your future journey begins now. Dream big and believe in your potential.",
      progress: "Every step forward, no matter how small, brings you closer to your dreams.",
      achievement: "Congratulations! Your dedication is shaping an amazing future.",
      milestone: "Well done! This milestone proves your commitment to growth."
    };

    const message = affirmations[messageType] || "Keep moving forward toward your dreams.";
    
    // Use Web Speech API for voice (if available)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = this.sfxVolume;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      speechSynthesis.speak(utterance);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopBackgroundMusic();
      this.stopCurrentAmbience();
    } else {
      this.playBackgroundMusic();
      if (this.currentScene !== null) {
        this.playSceneAmbience(this.currentScene);
      }
    }
    
    return this.isMuted;
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.backgroundMusic?.oscillators) {
      this.backgroundMusic.oscillators.forEach(({ gainNode }) => {
        gainNode.gain.value = volume * 0.1;
      });
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = volume;
  }

  setAmbientVolume(volume) {
    this.ambientVolume = volume;
  }

  setCurrentScene(sceneIndex) {
    this.currentScene = sceneIndex;
    if (!this.isMuted) {
      this.playSceneAmbience(sceneIndex);
    }
  }
}

export const advancedAudioManager = new AdvancedAudioManager();