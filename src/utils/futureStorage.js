const DB_NAME = 'FutureSimulatorDB';
const DB_VERSION = 1;
const STORE_NAME = 'futures';

class FutureStorage {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('userName', 'userName', { unique: false });
        }
      };
    });
  }

  async saveFuture(userData, futureData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const futureRecord = {
        userData,
        futureData,
        timestamp: new Date().toISOString(),
        userName: userData.name,
        score: futureData.score
      };

      const request = store.add(futureRecord);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFutures(limit = 10) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev');
      const futures = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && count < limit) {
          futures.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(futures);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getFutureById(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFuture(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStatistics() {
    const futures = await this.getFutures(1000); // Get all futures for stats
    
    if (futures.length === 0) {
      return {
        totalFutures: 0,
        averageScore: 0,
        mostCommonCountry: 'N/A',
        mostCommonDream: 'N/A'
      };
    }

    const scores = futures.map(f => f.score);
    const countries = futures.map(f => f.userData.country);
    const dreams = futures.map(f => f.userData.dream);

    // Find most common country
    const countryCounts = countries.reduce((acc, country) => {
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const countryKeys = Object.keys(countryCounts);
    const mostCommonCountry = countryKeys.length > 0 ? countryKeys.reduce((a, b) =>
      countryCounts[a] > countryCounts[b] ? a : b
    ) : 'N/A';

    return {
      totalFutures: futures.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      mostCommonCountry,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
  }

  saveProgress(progressData) {
    try {
      localStorage.setItem('futureSimulatorProgress', JSON.stringify(progressData));
      return true;
    } catch (error) {
      console.error('Failed to save progress:', error);
      return false;
    }
  }

  getProgress() {
    try {
      const stored = localStorage.getItem('futureSimulatorProgress');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get progress:', error);
      return null;
    }
  }
}

export const futureStorage = new FutureStorage();