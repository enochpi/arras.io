export class UIManager {
  private upgradeMenuVisible = false;

  initialize(): void {
    this.createHUD();
    this.createLeaderboard();
    this.createMinimap();
    this.createUpgradeMenu();
    this.setupEventListeners();
  }

  private createHUD(): void {
    const hud = document.getElementById('hud')!;
    hud.innerHTML = `
      <div class="score-display">Score: 0</div>
      <div class="level-display">Level: 1</div>
      <div class="tank-class">Class: Basic</div>
      
      <div class="stat-bar health-bar">
        <div class="stat-fill"></div>
        <div class="stat-text">100/100</div>
      </div>
      
      <div class="stat-bar shield-bar">
        <div class="stat-fill"></div>
        <div class="stat-text">50/50</div>
      </div>
      
      <div class="stat-bar energy-bar">
        <div class="stat-fill"></div>
        <div class="stat-text">100/100</div>
      </div>
    `;
  }

  private createLeaderboard(): void {
    const leaderboard = document.getElementById('leaderboard')!;
    leaderboard.innerHTML = '<h3>Leaderboard</h3>';
  }

  private createMinimap(): void {
    const minimap = document.getElementById('minimap')!;
    const canvas = document.createElement('canvas');
    canvas.width = 196;
    canvas.height = 196;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    minimap.appendChild(canvas);
  }

  private createUpgradeMenu(): void {
    const upgradeMenu = document.getElementById('upgrade-menu')!;
    upgradeMenu.innerHTML = `
      <h3>Upgrade Tank</h3>
      <div class="upgrade-category">
        <h4>Stats</h4>
        <div class="upgrade-buttons">
          <button class="upgrade-btn" data-stat="health">Health Regen</button>
          <button class="upgrade-btn" data-stat="damage">Bullet Damage</button>
          <button class="upgrade-btn" data-stat="speed">Movement Speed</button>
          <button class="upgrade-btn" data-stat="reload">Reload Speed</button>
        </div>
      </div>
      <div class="upgrade-category">
        <h4>Tank Classes</h4>
        <div class="upgrade-buttons">
          <button class="upgrade-btn" data-class="twin">Twin</button>
          <button class="upgrade-btn" data-class="sniper">Sniper</button>
          <button class="upgrade-btn" data-class="machinegun">Machine Gun</button>
          <button class="upgrade-btn" data-class="flank">Flank Guard</button>
        </div>
      </div>
      <button id="close-upgrade-menu">Close</button>
    `;
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

    // Close upgrade menu button
    document.getElementById('close-upgrade-menu')?.addEventListener('click', () => {
      this.hideUpgradeMenu();
    });

    // Upgrade buttons
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const stat = target.getAttribute('data-stat');
        const tankClass = target.getAttribute('data-class');
        
        if (stat) {
          console.log(`Upgrading stat: ${stat}`);
          // TODO: Send upgrade request to server
        }
        
        if (tankClass) {
          console.log(`Changing to tank class: ${tankClass}`);
          // TODO: Send class change request to server
        }
      });
    });
  }

  private toggleUpgradeMenu(): void {
    if (this.upgradeMenuVisible) {
      this.hideUpgradeMenu();
    } else {
      this.showUpgradeMenu();
    }
  }

  private showUpgradeMenu(): void {
    const upgradeMenu = document.getElementById('upgrade-menu')!;
    upgradeMenu.style.display = 'block';
    this.upgradeMenuVisible = true;
  }

  private hideUpgradeMenu(): void {
    const upgradeMenu = document.getElementById('upgrade-menu')!;
    upgradeMenu.style.display = 'none';
    this.upgradeMenuVisible = false;
  }
}
