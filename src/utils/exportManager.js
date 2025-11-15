// Export Manager for AI Future Simulator
class ExportManager {
  constructor() {
    this.supportedFormats = ['pdf', 'image', 'json', 'calendar', 'text'];
    this.initialized = false;
    this.init();
  }

  async init() {
    // Dynamically load dependencies if available
    try {
      // These will be available after npm install
      this.html2canvas = (await import('html2canvas')).default;
      this.jsPDF = (await import('jspdf')).default;
      this.initialized = true;
      console.log('Export manager initialized with full capabilities');
    } catch (error) {
      console.warn('Export dependencies not available. Using fallback methods.');
      this.initialized = false;
    }
  }

  // Main export method - handles all formats
  async exportData(format, data, options = {}) {
    const { userData, futureData, progressData, insights } = data;
    
    switch (format.toLowerCase()) {
      case 'pdf':
        return await this.exportToPDF(userData, futureData, progressData, insights, options);
      
      case 'image':
        return await this.exportToImage(userData, futureData, options);
      
      case 'json':
        return this.exportToJSON(userData, futureData, progressData, insights, options);
      
      case 'calendar':
        return this.exportToCalendar(futureData, options);
      
      case 'text':
        return this.exportToText(userData, futureData, insights, options);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // PDF Export with fallback
  async exportToPDF(userData, futureData, progressData, insights, options = {}) {
    if (!this.initialized) {
      console.warn('PDF export requires jspdf. Falling back to JSON export.');
      return this.exportToJSON(userData, futureData, progressData, insights, options);
    }

    try {
      const pdf = new this.jsPDF();
      const fileName = options.fileName || `Future-Report-${userData.name}-${new Date().getFullYear()}.pdf`;
      
      // Cover page
      this.addCoverPage(pdf, userData, futureData);
      pdf.addPage();
      
      // Executive summary
      this.addExecutiveSummary(pdf, userData, futureData);
      pdf.addPage();
      
      // Timeline details
      this.addTimelineDetails(pdf, futureData);
      
      // Insights if available
      if (insights && insights.length > 0) {
        pdf.addPage();
        this.addInsights(pdf, insights);
      }
      
      // Progress report if available
      if (progressData) {
        pdf.addPage();
        this.addProgressReport(pdf, progressData);
      }
      
      // Final page with call to action
      pdf.addPage();
      this.addConclusion(pdf, userData);
      
      pdf.save(fileName);
      return { success: true, fileName, format: 'pdf' };
      
    } catch (error) {
      console.error('PDF export failed:', error);
      return this.exportToJSON(userData, futureData, progressData, insights, options);
    }
  }

  addCoverPage(pdf, userData, futureData) {
    // Background
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 210, 297, 'F');
    
    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI FUTURE PREDICTION REPORT', 105, 60, { align: 'center' });
    
    // User info
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Prepared for: ${userData.name}`, 105, 90, { align: 'center' });
    
    // Score with visual impact
    pdf.setFontSize(48);
    pdf.setTextColor(59, 130, 246);
    pdf.text(`${futureData.score}/100`, 105, 140, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Future Potential Score', 105, 155, { align: 'center' });
    
    // Generated date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 250, { align: 'center' });
    
    // Watermark
    pdf.setTextColor(255, 255, 255, 0.1);
    pdf.setFontSize(72);
    pdf.text('FUTURE', 105, 180, { align: 'center' });
  }

  addExecutiveSummary(pdf, userData, futureData) {
    pdf.setFillColor(255, 255, 255);
    pdf.setTextColor(0, 0, 0);
    
    // Section title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 20, 30);
    
    // User information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const summaryLines = [
      `Name: ${userData.name}`,
      `Age: ${userData.age || 'Not specified'}`,
      `Location: ${userData.country || 'Global'}`,
      `Primary Focus: ${userData.dream || 'Personal Development'}`,
      `Future Potential Score: ${futureData.score}/100`,
      '',
      'This comprehensive report outlines your personalized future prediction',
      'based on advanced AI analysis of your goals, aspirations, and potential.',
      'The following timeline provides a strategic roadmap for achieving',
      'your dreams and maximizing your personal and professional growth.',
      '',
      'KEY AREAS OF FOCUS:'
    ];
    
    let yPosition = 50;
    summaryLines.forEach(line => {
      pdf.text(line, 20, yPosition);
      yPosition += 7;
    });
    
    // Key milestones
    futureData.timeline.slice(0, 3).forEach((event, index) => {
      pdf.text(`• ${event.year}: ${event.title}`, 25, yPosition + (index * 7));
    });
  }

  addTimelineDetails(pdf, futureData) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Future Timeline', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    let yPosition = 50;
    futureData.timeline.forEach((event, index) => {
      // Add new page if needed
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Year and title
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text(`${event.year}`, 20, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.text(` - ${event.title}`, 35, yPosition);
      
      // Description
      pdf.setFont('helvetica', 'normal');
      const descriptionLines = this.splitTextToLines(pdf, event.description, 160);
      descriptionLines.forEach((line, lineIndex) => {
        pdf.text(line, 20, yPosition + 10 + (lineIndex * 7));
      });
      
      // Metadata
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      pdf.text(`Milestone: ${event.milestone} | Probability: ${event.probability}%`, 20, yPosition + 10 + (descriptionLines.length * 7) + 5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      
      yPosition += 30 + (descriptionLines.length * 7);
    });
  }

  addInsights(pdf, insights) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Insights & Recommendations', 20, 30);
    
    pdf.setFontSize(12);
    
    let yPosition = 50;
    insights.forEach((insight, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Insight title
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text(insight.type ? insight.type.toUpperCase() : 'INSIGHT', 20, yPosition);
      
      // Insight content
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const messageLines = this.splitTextToLines(pdf, insight.message || insight.description, 160);
      messageLines.forEach((line, lineIndex) => {
        pdf.text(line, 20, yPosition + 10 + (lineIndex * 7));
      });
      
      // Recommended action
      if (insight.action) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(34, 197, 94);
        pdf.text(`Recommended: ${insight.action}`, 20, yPosition + 10 + (messageLines.length * 7) + 5);
      }
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 40 + (messageLines.length * 7);
    });
  }

  addProgressReport(pdf, progressData) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Progress Tracking', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Progress summary
    pdf.text(`Overall Progress: ${progressData.progressPercentage || 0}%`, 20, 50);
    pdf.text(`Completed Milestones: ${progressData.completed || 0}/${progressData.total || 0}`, 20, 60);
    
    // Simple progress bar
    const progressWidth = 150 * ((progressData.progressPercentage || 0) / 100);
    pdf.setFillColor(59, 130, 246);
    pdf.rect(20, 70, progressWidth, 8, 'F');
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, 70, 150, 8, 'S');
    
    let yPosition = 90;
    
    // Recent achievements
    if (progressData.achievements && progressData.achievements.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recent Achievements:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      progressData.achievements.slice(0, 5).forEach((achievement, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.text(`🏆 ${achievement.title}`, 25, yPosition);
        const descLines = this.splitTextToLines(pdf, achievement.description, 155);
        descLines.forEach((line, lineIndex) => {
          pdf.text(line, 25, yPosition + 7 + (lineIndex * 7));
        });
        
        yPosition += 20 + (descLines.length * 7);
      });
    }
  }

  addConclusion(pdf, userData) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Your Journey Ahead', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const conclusionLines = [
      'This future prediction is just the beginning of your journey.',
      'Remember that the most accurate predictor of future success',
      'is consistent action toward your goals.',
      '',
      'KEY NEXT STEPS:',
      '1. Review your timeline regularly',
      '2. Break down large goals into actionable steps',
      '3. Track your progress and adjust as needed',
      '4. Share your vision with supportive people',
      '5. Believe in your ability to achieve your dreams',
      '',
      `"The future belongs to those who believe in the beauty of their dreams."`,
      '― Eleanor Roosevelt',
      '',
      `Generated for ${userData.name} with 💙 by AI Future Simulator`
    ];
    
    let yPosition = 50;
    conclusionLines.forEach(line => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 30;
      }
      
      if (line.includes('KEY NEXT STEPS') || line.includes('Generated for')) {
        pdf.setFont('helvetica', 'bold');
      } else if (line.includes('"')) {
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(100, 100, 100);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
      }
      
      pdf.text(line, 20, yPosition);
      yPosition += 7;
    });
  }

  // Image export for vision boards
  async exportToImage(userData, futureData, options = {}) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = options.width || 1200;
      canvas.height = options.height || 800;
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('My Future Vision Board', canvas.width / 2, 80);
      
      // User's dream
      ctx.font = 'italic 36px Arial';
      const dreamLines = this.wrapText(ctx, userData.dream || 'Achieve my dreams', canvas.width - 200);
      dreamLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, 150 + (index * 45));
      });
      
      // Timeline events as cards
      let x = 100;
      let y = 250;
      const cardWidth = 300;
      const cardHeight = 150;
      const cardMargin = 30;
      
      futureData.timeline.forEach((event, index) => {
        if (x + cardWidth > canvas.width - 100) {
          x = 100;
          y += cardHeight + cardMargin;
        }
        
        // Card background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x, y, cardWidth, cardHeight);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardWidth, cardHeight);
        
        // Event content
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${event.year}`, x + 15, y + 30);
        
        ctx.font = '16px Arial';
        const titleLines = this.wrapText(ctx, event.title, cardWidth - 30);
        titleLines.forEach((line, lineIndex) => {
          ctx.fillText(line, x + 15, y + 55 + (lineIndex * 20));
        });
        
        // Description (truncated)
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        const desc = event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description;
        const descLines = this.wrapText(ctx, desc, cardWidth - 30);
        descLines.forEach((line, lineIndex) => {
          ctx.fillText(line, x + 15, y + 95 + (lineIndex * 15));
        });
        
        x += cardWidth + cardMargin;
      });
      
      // Footer
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Created by ${userData.name} • ${new Date().getFullYear()}`, canvas.width / 2, canvas.height - 30);
      
      // Download
      const link = document.createElement('a');
      const fileName = options.fileName || `vision-board-${userData.name}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL();
      link.click();
      
      return { success: true, fileName, format: 'image' };
      
    } catch (error) {
      console.error('Image export failed:', error);
      return { success: false, error: error.message };
    }
  }

  // JSON export for data portability
  exportToJSON(userData, futureData, progressData, insights, options = {}) {
    const exportData = {
      metadata: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        source: 'AI Future Simulator',
        format: 'json'
      },
      userData,
      futureData,
      ...(progressData && { progressData }),
      ...(insights && { insights }),
      exportInfo: {
        totalMilestones: futureData.timeline.length,
        futureScore: futureData.score,
        exportDate: new Date().toLocaleDateString()
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const fileName = options.fileName || `future-prediction-${userData.name}.json`;
    link.download = fileName;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    return { success: true, fileName, format: 'json' };
  }

  // Calendar export for timeline integration
  exportToCalendar(futureData, options = {}) {
    const icsEvents = futureData.timeline.map(event => {
      const eventDate = new Date();
      eventDate.setFullYear(event.year);
      eventDate.setMonth(0); // January
      eventDate.setDate(1); // 1st of month
      
      return [
        'BEGIN:VEVENT',
        `UID:${event.year}-${event.milestone}-${Date.now()}@futuresimulator`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `DTSTART;VALUE=DATE:${eventDate.getFullYear()}0101`,
        `DTEND;VALUE=DATE:${eventDate.getFullYear()}0102`,
        `CATEGORIES:FUTURE_MILESTONE`,
        `STATUS:CONFIRMED`,
        'END:VEVENT'
      ].join('\n');
    }).join('\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI Future Simulator//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...icsEvents,
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = options.fileName || `future-timeline-${new Date().getFullYear()}.ics`;
    link.download = fileName;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    return { success: true, fileName, format: 'calendar' };
  }

  // Text export for simple sharing
  exportToText(userData, futureData, insights, options = {}) {
    let textContent = `AI FUTURE PREDICTION REPORT\n`;
    textContent += `Generated for: ${userData.name}\n`;
    textContent += `Date: ${new Date().toLocaleDateString()}\n`;
    textContent += `Future Potential Score: ${futureData.score}/100\n\n`;
    
    textContent += `PRIMARY DREAM:\n${userData.dream}\n\n`;
    
    textContent += `FUTURE TIMELINE:\n`;
    futureData.timeline.forEach(event => {
      textContent += `[${event.year}] ${event.title}\n`;
      textContent += `  ${event.description}\n`;
      textContent += `  Milestone: ${event.milestone} | Probability: ${event.probability}%\n\n`;
    });
    
    if (insights && insights.length > 0) {
      textContent += `AI INSIGHTS:\n`;
      insights.forEach(insight => {
        textContent += `• ${insight.message || insight.description}\n`;
        if (insight.action) {
          textContent += `  Recommended: ${insight.action}\n`;
        }
      });
      textContent += `\n`;
    }
    
    textContent += `---\nGenerated by AI Future Simulator\n`;
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = options.fileName || `future-report-${userData.name}.txt`;
    link.download = fileName;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    return { success: true, fileName, format: 'text' };
  }

  // Utility methods
  splitTextToLines(pdf, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = pdf.getTextWidth(currentLine + " " + word);
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  // Get available export formats
  getSupportedFormats() {
    return this.supportedFormats;
  }

  // LinkedIn sharing
  shareToLinkedIn(futureData, userData) {
    try {
      const baseUrl = 'https://www.linkedin.com/sharing/share-offsite/';
      const title = encodeURIComponent(`My AI-Predicted Future: ${futureData.score}/100 Potential Score`);
      const summary = encodeURIComponent(
        `I just discovered my future potential using AI Future Simulator! ` +
        `My predicted score is ${futureData.score}/100. ` +
        `Check out my personalized timeline and see what the future holds. ` +
        `#FuturePrediction #AI #PersonalDevelopment`
      );

      // Create a summary of key milestones
      const keyMilestones = futureData.timeline.slice(0, 3).map(event =>
        `${event.year}: ${event.title}`
      ).join(' | ');

      const description = encodeURIComponent(
        `Key milestones in my journey: ${keyMilestones}. ` +
        `Discover your own future potential at AI Future Simulator!`
      );

      // For LinkedIn sharing, we create a URL that opens LinkedIn share dialog
      const shareUrl = `${baseUrl}?url=${encodeURIComponent(window.location.origin)}&title=${title}&summary=${summary}`;

      // Open LinkedIn share dialog in new window
      const shareWindow = window.open(
        shareUrl,
        'linkedin-share',
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );

      if (shareWindow) {
        // Focus the new window
        shareWindow.focus();
        return { success: true, platform: 'linkedin' };
      } else {
        // Fallback: try to open in same window
        window.location.href = shareUrl;
        return { success: true, platform: 'linkedin', fallback: true };
      }

    } catch (error) {
      console.error('LinkedIn share failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if format is supported
  isFormatSupported(format) {
    return this.supportedFormats.includes(format.toLowerCase());
  }
}

// Create and export singleton instance
export const exportManager = new ExportManager();