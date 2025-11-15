class AudioManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.isMuted = false;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.7;
  }

  async loadSounds() {
    // In a real app, you'd load actual audio files
    this.sounds = {
      click: this.createOscillatorSound(800, 'square', 0.1),
      generate: this.createOscillatorSound(1200, 'sine', 0.3),
      success: this.createOscillatorSound(1500, 'triangle', 0.5),
      transition: this.createOscillatorSound(600, 'sawtooth', 0.4),
      whoosh: this.createSweepSound(400, 200, 0.3)
    };
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

  createSweepSound(startFreq, endFreq, duration) {
    return () => {
      if (this.isMuted) return;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);

      gainNode.gain.setValueAtTime(this.sfxVolume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };
  }

  playSound(soundName) {
    if (this.sounds[soundName] && !this.isMuted) {
      this.sounds[soundName]();
    }
  }

  playBackgroundMusic() {
    // For demo purposes, we'll create ambient music
    if (this.isMuted || this.backgroundMusic) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.backgroundMusic = audioContext;

    // Create ambient pad sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator1.frequency.value = 110;
    oscillator2.frequency.value = 220;
    oscillator1.type = 'sine';
    oscillator2.type = 'triangle';

    gainNode.gain.value = this.musicVolume * 0.3;

    oscillator1.start();
    oscillator2.start();
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.close();
      this.backgroundMusic = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    return this.isMuted;
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
  }

  setSfxVolume(volume) {
    this.sfxVolume = volume;
  }
}

export const audioManager = new AudioManager();