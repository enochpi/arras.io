/**
 * UI Manager for HUD elements
 */

export class UIManager {
  private statsContainer!: HTMLElement;
  private leaderboard!: HTMLElement;
  private fpsCounter!: HTMLElement;
  private notificationContainer!: HTMLElement;
  
  initialize(): void {
    this.createUIElements();
  }
  
  private createUIElements(): void {
    // Stats container
    this.statsContainer = document.createElement('div');
    this.statsContainer.className = 'stats-container';
    this.statsContainer.innerHTML = `
      <div class="score-display">Score: 0</div>
      <div class="level-display">Level 1</div>
      <div class="stat-bars">
        <div class="stat-bar health-bar">
          <div class="stat-bar-label">HEALTH</div>
          <div class="stat-fill" style="width: 100%">
            <span class="stat-text">100/100</span>
          </div>
        </div>
        <div class="stat-bar xp-bar">
          <div class="stat-bar-label">EXPERIENCE</div>
          <div class="stat-fill" style="width: 0%">
            <span class="stat-text">0/100</span>
          </div>
        </div>
      </div>
    `;
    
    // Leaderboard
    this.leaderboard = document.createElement('div');
    this.leaderboard.id = 'leaderboard';
    this.leaderboard.innerHTML = `
      <h3>🏆 Leaderboard</h3>
      <div class="leaderboard-entries"></div>
    `;
    
    // FPS counter
    this.fpsCounter = document.createElement('div');
    this.fpsCounter.id = 'fps-counter';
    this.fpsCounter.textContent = 'FPS: 0';
    
    // Notification container
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'notification-container';
    
    // Append to game UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      gameUI.appendChild(this.statsContainer);
      gameUI.appendChild(this.leaderboard);
      gameUI.appendChild(this.fpsCounter);
      gameUI.appendChild(this.notificationContainer);
    }
  }
  
  updateStats(stats: {
    score: number;
    level: number;
    health: number;
    maxHealth: number;
    xp: number;
    xpToNext: number;
  }): void {
    // Update score
    const scoreDisplay = this.statsContainer.querySelector('.score-display');
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${stats.score.toLocaleString()}`;
    }
    
    // Update level
    const levelDisplay = this.statsContainer.querySelector('.level-display');
    if (levelDisplay) {
      levelDisplay.textContent = `Level ${stats.level}`;
    }
    
    // Update health bar
    const healthBar = this.statsContainer.querySelector('.health-bar .stat-fill') as HTMLElement;
    const healthText = this.statsContainer.querySelector('.health-bar .stat-text');
    if (healthBar && healthText) {
      const healthPercent = (stats.health / stats.maxHealth) * 100;
      healthBar.style.width = `${healthPercent}%`;
      healthText.textContent = `${Math.round(stats.health)}/${stats.maxHealth}`;
      
      // Change color based on health
      if (healthPercent > 60) {
        healthBar.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
      } else if (healthPercent > 30) {
        healthBar.style.background = 'linear-gradient(90deg, #FF9800, #FFB74D)';
      } else {
        healthBar.style.background = 'linear-gradient(90deg, #F44336, #EF5350)';
      }
    }
    
    // Update XP bar
    const xpBar = this.statsContainer.querySelector('.xp-bar .stat-fill') as HTMLElement;
    const xpText = this.statsContainer.querySelector('.xp-bar .stat-text');
    if (xpBar && xpText) {
      const xpPercent = (stats.xp / stats.xpToNext) * 100;
      xpBar.style.width = `${xpPercent}%`;
      xpText.textContent = `${stats.xp}/${stats.xpToNext}`;
    }
  }
  
  updateLeaderboard(entries: Array<{
    name: string;
    score: number;
    isCurrentPlayer: boolean;
  }>): void {
    const container = this.leaderboard.querySelector('.leaderboard-entries');
    if (!container) return;
    
    container.innerHTML = entries.slice(0, 10).map((entry, index) => `
      <div class="leaderboard-entry ${entry.isCurrentPlayer ? 'current-player' : ''}">
        <span class="leaderboard-rank">#${index + 1}</span>
        <span class="leaderboard-name">${this.escapeHtml(entry.name)}</span>
        <span class="leaderboard-score">${entry.score.toLocaleString()}</span>
      </div>
    `).join('');
  }
  
  /**
   * Update the FPS counter display
   * @param fps - Current frames per second
   */
  updateFPS(fps: number): void {
    this.fpsCounter.textContent = `FPS: ${fps}`;
    
    // Color code FPS based on performance
    if (fps >= 50) {
      this.fpsCounter.style.color = '#00FF00'; // Green for good performance
    } else if (fps >= 30) {
      this.fpsCounter.style.color = '#FFD700'; // Yellow for acceptable performance
    } else {
      this.fpsCounter.style.color = '#FF6B6B'; // Red for poor performance
    }
  }
  
  /**
   * Show a notification message to the player
   * @param message - The message to display
   * @param duration - How long to show the notification (default: 3000ms)
   */
  showNotification(message: string, duration: number = 3000): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add styles for the notification
    notification.style.cssText = `
      background: linear-gradient(135deg, rgba(0, 178, 225, 0.9), rgba(0, 100, 150, 0.9));
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
      transition: opacity 0.5s ease;
    `;
    
    this.notificationContainer.appendChild(notification);
    
    // Fade out and remove after duration
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, duration);
  }
  
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
