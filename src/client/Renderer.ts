import { GameState, Player, Projectile, Enemy, Vector2, TANK_CLASSES } from '../shared/types';
import { Camera } from './Camera';

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  renderBackground(camera: Camera): void {
    const ctx = this.ctx;
    const gridSize = 50;
    
    // Fill background
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw grid
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;

    const startX = Math.floor(camera.position.x / gridSize) * gridSize;
    const startY = Math.floor(camera.position.y / gridSize) * gridSize;

    for (let x = startX; x < camera.position.x + camera.width; x += gridSize) {
      const screenX = camera.worldToScreen({ x, y: 0 }).x;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, ctx.canvas.height);
      ctx.stroke();
    }

    for (let y = startY; y < camera.position.y + camera.height; y += gridSize) {
      const screenY = camera.worldToScreen({ x: 0, y }).y;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(ctx.canvas.width, screenY);
      ctx.stroke();
    }
  }

  renderPlayers(players: Map<string, Player>, camera: Camera, currentPlayerId: string | null): void {
    players.forEach(player => {
      const screenPos = camera.worldToScreen(player.position);
      this.drawTank(screenPos, player, player.id === currentPlayerId);
      this.drawPlayerInfo(screenPos, player);
    });
  }

  private drawTank(position: Vector2, player: Player, isCurrentPlayer: boolean): void {
    const ctx = this.ctx;
    const size = 25;

    ctx.save();
    ctx.translate(position.x, position.y);

    // Draw tank body
    ctx.fillStyle = player.color;
    ctx.strokeStyle = isCurrentPlayer ? '#FFD700' : '#333';
    ctx.lineWidth = isCurrentPlayer ? 3 : 2;
    
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw cannon based on tank class
    this.drawCannon(player.tankClass, player.rotation);

    // Draw health bar
    if (player.health < player.maxHealth) {
      this.drawHealthBar(position, player.health, player.maxHealth, size);
    }

    ctx.restore();
  }

  private drawCannon(tankClass: string, rotation: number): void {
    const ctx = this.ctx;
    
    ctx.rotate(rotation);
    ctx.fillStyle = '#666';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    switch (tankClass) {
      case TANK_CLASSES.BASIC:
        ctx.fillRect(15, -4, 25, 8);
        ctx.strokeRect(15, -4, 25, 8);
        break;
      
      case TANK_CLASSES.TWIN:
        ctx.fillRect(15, -6, 25, 4);
        ctx.strokeRect(15, -6, 25, 4);
        ctx.fillRect(15, 2, 25, 4);
        ctx.strokeRect(15, 2, 25, 4);
        break;
      
      case TANK_CLASSES.SNIPER:
        ctx.fillRect(15, -3, 35, 6);
        ctx.strokeRect(15, -3, 35, 6);
        break;
      
      case TANK_CLASSES.MACHINE_GUN:
        ctx.fillRect(15, -5, 20, 10);
        ctx.strokeRect(15, -5, 20, 10);
        break;
      
      case TANK_CLASSES.FLANK_GUARD:
        ctx.fillRect(15, -4, 25, 8);
        ctx.strokeRect(15, -4, 25, 8);
        ctx.fillRect(-40, -3, 25, 6);
        ctx.strokeRect(-40, -3, 25, 6);
        break;
    }
  }

  private drawHealthBar(position: Vector2, health: number, maxHealth: number, tankSize: number): void {
    const ctx = this.ctx;
    const barWidth = tankSize * 2;
    const barHeight = 4;
    const barY = -tankSize - 10;

    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

    // Health
    const healthPercent = health / maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
    ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
  }

  private drawPlayerInfo(position: Vector2, player: Player): void {
    const ctx = this.ctx;
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, position.x, position.y - 45);
    ctx.fillText(`Lv.${player.level}`, position.x, position.y - 32);
  }

  renderProjectiles(projectiles: Map<string, Projectile>, camera: Camera): void {
    projectiles.forEach(projectile => {
      const screenPos = camera.worldToScreen(projectile.position);
      this.drawProjectile(screenPos, projectile);
    });
  }

  private drawProjectile(position: Vector2, projectile: Projectile): void {
    const ctx = this.ctx;
    
    ctx.fillStyle = projectile.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.arc(position.x, position.y, projectile.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  renderEnemies(enemies: Map<string, Enemy>, camera: Camera): void {
    enemies.forEach(enemy => {
      const screenPos = camera.worldToScreen(enemy.position);
      this.drawEnemy(screenPos, enemy);
    });
  }

  private drawEnemy(position: Vector2, enemy: Enemy): void {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(enemy.rotation);

    // Draw enemy based on type
    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    switch (enemy.type) {
      case 'square':
        ctx.fillRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size);
        ctx.strokeRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size);
        break;
      
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(enemy.size/2, 0);
        ctx.lineTo(-enemy.size/2, -enemy.size/2);
        ctx.lineTo(-enemy.size/2, enemy.size/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      
      case 'pentagon':
        this.drawPolygon(5, enemy.size/2);
        break;
    }

    ctx.restore();

    // Draw health bar for damaged enemies
    if (enemy.health < enemy.maxHealth) {
      this.drawHealthBar(position, enemy.health, enemy.maxHealth, enemy.size);
    }
  }

  private drawPolygon(sides: number, radius: number): void {
    const ctx = this.ctx;
    const angle = (Math.PI * 2) / sides;
    
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const x = Math.cos(i * angle) * radius;
      const y = Math.sin(i * angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  renderUI(gameState: GameState, currentPlayerId: string | null): void {
    if (!currentPlayerId || !gameState.players.has(currentPlayerId)) return;

    const player = gameState.players.get(currentPlayerId)!;
    this.updateHUD(player);
    this.updateLeaderboard(gameState.leaderboard, currentPlayerId);
    this.renderMinimap(gameState, currentPlayerId);
  }

  private updateHUD(player: Player): void {
    const hud = document.getElementById('hud')!;
    hud.innerHTML = `
      <div class="score-display">Score: ${player.score.toLocaleString()}</div>
      <div class="level-display">Level: ${player.level}</div>
      <div class="tank-class">Class: ${player.tankClass}</div>
      
      <div class="stat-bar health-bar">
        <div class="stat-fill" style="width: ${(player.health / player.maxHealth) * 100}%"></div>
        <div class="stat-text">Health</div>
      </div>
      
      <div class="stat-bar shield-bar">
        <div class="stat-fill" style="width: ${(player.shield / player.maxShield) * 100}%"></div>
        <div class="stat-text">Shield</div>
      </div>
      
      <div class="stat-bar energy-bar">
        <div class="stat-fill" style="width: ${(player.energy / player.maxEnergy) * 100}%"></div>
        <div class="stat-text">Energy</div>
      </div>
    `;
  }

  private updateLeaderboard(leaderboard: Array<{id: string, name: string, score: number}>, currentPlayerId: string): void {
    const leaderboardEl = document.getElementById('leaderboard')!;
    const top10 = leaderboard.slice(0, 10);
    
    leaderboardEl.innerHTML = `
      <h3>Leaderboard</h3>
      ${top10.map((entry, index) => `
        <div class="leaderboard-entry ${entry.id === currentPlayerId ? 'current-player' : ''}">
          <span>${index + 1}. ${entry.name}</span>
          <span>${entry.score.toLocaleString()}</span>
        </div>
      `).join('')}
    `;
  }

  private renderMinimap(gameState: GameState, currentPlayerId: string): void {
    const minimap = document.getElementById('minimap')!;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 200;
    canvas.height = 200;
    
    // Clear minimap
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 200, 200);
    
    const scaleX = 200 / gameState.worldBounds.width;
    const scaleY = 200 / gameState.worldBounds.height;
    
    // Draw players
    gameState.players.forEach(player => {
      const x = player.position.x * scaleX;
      const y = player.position.y * scaleY;
      
      ctx.fillStyle = player.id === currentPlayerId ? '#FFD700' : player.color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw enemies
    gameState.enemies.forEach(enemy => {
      const x = enemy.position.x * scaleX;
      const y = enemy.position.y * scaleY;
      
      ctx.fillStyle = enemy.color;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    });
    
    minimap.innerHTML = '';
    minimap.appendChild(canvas);
  }
}
