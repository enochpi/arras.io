/**
 * UI Manager - Handles all UI elements and interactions
 * Manages HUD, leaderboard, minimap, upgrade menu, and controls
 */

export class UIManager {
  private upgradeMenuVisible = false;
  private upgradePoints = 0;

  initialize(): void {
    this.createHUD();
    this.createLeaderboard();
    this.createMinimap();
    this.createUpgradeMenu();
    this.createControls();
    this.setupEventListeners();
  }

  private createHUD(): void {
    const hud = document.createElement('div');
    hud.className = 'stats-container';
    hud.innerHTML = `
      <div class="score-display">Score: 0</div>
      <div class="level-display">Level: 1</div>
      
      <div class="stat-bars">
        <div class="stat-bar health-bar">
          <span class="stat-bar-label">Health</span>
          <div class="stat-fill" style="width: 100%"></div>
          <div class="stat-text">100/100</div>
        </div>
        
        <div class="stat-bar xp-bar">
          <span class="stat-bar-label">Experience</span>
          <div class="stat-fill" style="width: 0%"></div>
          <div class="stat-text">0/100</div>
        </div>
      </div>
    `;
    document.getElementById('game-ui')?.appendChild(hud);
  }

  private createLeaderboard(): void {
    const leaderboard = document.createElement('div');
    leaderboard.id = 'leaderboard';
    leaderboard.innerHTML = '<h3>Leaderboard</h3>';
    document.getElementById('game-ui')?.appendChild(leaderboard);
  }

  private createMinimap(): void {
    const minimap = document.createElement('div');
    minimap.id = 'minimap';
    const canvas = document.createElement('canvas');
    canvas.width = 176;
    canvas.height = 176;
    minimap.appendChild(canvas);
    document.getElementById('game-ui')?.appendChild(minimap);
  }

  private createControls(): void {
    const controls = document.createElement('div');
    controls.id = 'controls';
    controls.innerHTML = `
      <h4>Controls</h4>
      <div><strong>WASD:</strong> Move</div>
      <div><strong>Mouse:</strong> Aim & Shoot</div>
      <div><strong>U:</strong> Upgrade Menu</div>
    `;
    document.getElementById('game-ui')?.appendChild(controls);
  }

  private createUpgradeMenu(): void {
    const upgradeMenu = document.createElement('div');
    upgradeMenu.id = 'upgrade-menu';
    upgradeMenu.className = 'hidden';
    upgradeMenu.innerHTML = `
      <h3>Choose Your Upgrade</h3>
      <div id="upgrade-options">
        <div class="upgrade-option" data-stat="health">
          <h4>Health Regen</h4>
          <p>Increase health regeneration rate</p>
        </div>
        <div class="upgrade-option" data-stat="damage">
          <h4>Bullet Damage</h4>
          <p>Deal more damage per shot</p>
        </div>
        <div class="upgrade-option" data-stat="speed">
          <h4>Movement Speed</h4>
          <p>Move faster across the battlefield</p>
        </div>
        <div class="upgrade-option" data-stat="reload">
          <h4>Reload Speed</h4>
          <p>Fire bullets more frequently</p>
        </div>
        <div class="upgrade-option" data-class="twin">
          <h4>Twin Cannon</h4>
          <p>Upgrade to dual barrels</p>
        </div>
        <div class="upgrade-option" data-class="sniper">
          <h4>Sniper</h4>
          <p>Long range, high damage</p>
        </div>
      </div>
    `;
    document.getElementById('game-ui')?.appendChild(upgradeMenu);
  }

  private setupEventListeners(): void {
    // Toggle upgrade menu with 'U' key
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyU') {
        this.toggleUpgradeMenu();
      }
      if (e.code === 'Escape') {
        this.hideUpgradeMenu();
      }
    });

    // Upgrade buttons
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.upgrade-option')) {
        const option = target.closest('.upgrade-option') as HTMLElement;
        const stat = option.getAttribute('data-stat');
        const tankClass = option.getAttribute('data-class');
        
        if (stat) {
          console.log(`Upgrading stat: ${stat}`);
          this.showNotification(`${stat.toUpperCase()} upgraded!`);
        }
        
        if (tankClass) {
          console.log(`Changing to tank class: ${tankClass}`);
          this.showNotification(`Evolved to ${tankClass.toUpperCase()}!`);
        }
        
        this.hideUpgradeMenu();
      }
    });
  }

  private toggleUpgradeMenu(): void {
    const menu = document.getElementById('upgrade-menu');
    if (menu?.classList.contains('hidden')) {
      this.showUpgradeMenu();
    } else {
      this.hideUpgradeMenu();
    }
  }

  private showUpgradeMenu(): void {
    const menu = document.getElementById('upgrade-menu');
    if (menu) {
      menu.classList.remove('hidden');
      this.upgradeMenuVisible = true;
    }
  }

  private hideUpgradeMenu(): void {
    const menu = document.getElementById('upgrade-menu');
    if (menu) {
      menu.classList.add('hidden');
      this.upgradeMenuVisible = false;
    }
  }

  private showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  }

  updateStats(stats: any): void {
    // Update score
    const scoreDisplay = document.querySelector('.score-display');
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${stats.score || 0}`;
    }
    
    // Update level
    const levelDisplay = document.querySelector('.level-display');
    if (levelDisplay) {
      levelDisplay.textContent = `Level: ${stats.level || 1}`;
    }
    
    // Update health bar
    const healthFill = document.querySelector('.health-bar .stat-fill') as HTMLElement;
    const healthText = document.querySelector('.health-bar .stat-text');
    if (healthFill && healthText) {
      const healthPercent = (stats.health / stats.maxHealth) * 100;
      healthFill.style.width = `${healthPercent}%`;
      healthText.textContent = `${Math.round(stats.health)}/${stats.maxHealth}`;
    }
    
    // Update XP bar
    const xpFill = document.querySelector('.xp-bar .stat-fill') as HTMLElement;
    const xpText = document.querySelector('.xp-bar .stat-text');
    if (xpFill && xpText) {
      const xpPercent = (stats.xp / stats.xpToNext) * 100;
      xpFill.style.width = `${xpPercent}%`;
      xpText.textContent = `${stats.xp}/${stats.xpToNext}`;
    }
  }

  updateLeaderboard(players: any[]): void {
    const leaderboard = document.getElementById('leaderboard');
    if (!leaderboard) return;
    
    const entries = players
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((player, index) => `
        <div class="leaderboard-entry ${player.isCurrentPlayer ? 'current-player' : ''}">
          <span>${index + 1}. ${player.name}</span>
          <span>${player.score}</span>
        </div>
      `).join('');
    
    leaderboard.innerHTML = `<h3>Leaderboard</h3>${entries}`;
  }
}
