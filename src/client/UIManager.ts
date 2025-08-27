export class UIManager {
  private notifications: HTMLElement[] = [];

  initialize(): void {
    this.createNotificationContainer();
    this.setupEventListeners();
  }

  private createNotificationContainer(): void {
    const container = document.createElement('div');
    container.id = 'notifications';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  private setupEventListeners(): void {
    // Listen for game events
    document.addEventListener('player-killed', (e: any) => {
      this.showNotification(`You killed ${e.detail.playerName}!`, 'success');
    });

    document.addEventListener('player-died', () => {
      this.showNotification('You died! Respawning...', 'error');
    });

    document.addEventListener('level-up', (e: any) => {
      this.showNotification(`Level Up! You are now level ${e.detail.level}`, 'success');
    });
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translateX(-50%) translateY(-20px);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: auto;
      font-weight: bold;
    `;

    const container = document.getElementById('notifications')!;
    container.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(-50%) translateY(0)';
      notification.style.opacity = '1';
    }, 10);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(-50%) translateY(-20px)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);

    this.notifications.push(notification);
  }

  private getNotificationColor(type: string): string {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'info': return '#2196F3';
      default: return '#666';
    }
  }

  updateConnectionStatus(connected: boolean): void {
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = connected ? 'Connected' : 'Disconnected';
      statusEl.className = connected ? 'connected' : 'disconnected';
    }
  }

  showDeathScreen(stats: any): void {
    const deathScreen = document.createElement('div');
    deathScreen.id = 'death-screen';
    deathScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    deathScreen.innerHTML = `
      <div style="text-align: center; color: white; background: rgba(0,0,0,0.9); padding: 40px; border-radius: 12px;">
        <h2 style="color: #F44336; margin-bottom: 20px;">You Died!</h2>
        <div style="margin: 20px 0;">
          <p>Final Score: ${stats.score.toLocaleString()}</p>
          <p>Level Reached: ${stats.level}</p>
          <p>Time Survived: ${stats.timeAlive}</p>
          <p>Enemies Killed: ${stats.kills}</p>
        </div>
        <button id="respawn-btn" style="padding: 12px 24px; background: #4CAF50; border: none; color: white; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Respawn
        </button>
      </div>
    `;

    document.body.appendChild(deathScreen);

    document.getElementById('respawn-btn')!.addEventListener('click', () => {
      document.body.removeChild(deathScreen);
      // Trigger respawn logic
    });
  }
}
