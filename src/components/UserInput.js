import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

const UserInput = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    country: '',
    dream: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.country && formData.dream) {
      onGenerate(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div 
      className="user-input-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="futuristic-header">
        <div className="header-icon">
          <Icon name="magic" size={48} />
        </div>
        <h1>AI Future Simulator</h1>
        <p>See your life in 1, 5, 10 years through advanced AI prediction</p>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        className="future-form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="input-group">
          <div className="input-label">
            <Icon name="user" size={20} />
            <label>Your Name</label>
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <div className="input-label">
            <Icon name="age" size={20} />
            <label>Your Age</label>
          </div>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Current age"
            min="1"
            max="100"
            required
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <div className="input-label">
            <Icon name="location" size={20} />
            <label>Your Country</label>
          </div>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Where you live"
            required
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <div className="input-label">
            <Icon name="dream" size={20} />
            <label>Your Biggest Dream</label>
          </div>
          <textarea
            name="dream"
            value={formData.dream}
            onChange={handleChange}
            placeholder="Describe your ultimate life goal..."
            rows="3"
            required
            disabled={isLoading}
          />
        </div>

        <motion.button
          type="submit"
          className={`generate-btn ${isLoading ? 'loading' : ''}`}
          whileHover={isLoading ? {} : { scale: 1.05 }}
          whileTap={isLoading ? {} : { scale: 0.95 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              Generating Your Future...
            </>
          ) : (
            <>
              <Icon name="magic" size={20} />
              Generate My Future
            </>
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default UserInput;