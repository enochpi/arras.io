import { Player, Projectile } from './GameClient';

export interface Shape {
  id: string;
  type: string;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  size: number;
  color: string;
}

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  renderGrid(worldWidth: number, worldHeight: number): void {
    const gridSize = 50;
    
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.2;
    
    // Vertical lines
    for (let x = 0; x <= worldWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, worldHeight);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= worldHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(worldWidth, y);
      this.ctx.stroke();
    }
    
    this.ctx.globalAlpha = 1;
  }

  renderPlayer(player: Player, isCurrentPlayer: boolean): void {
    const { x, y } = player.position;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(player.rotation);
    
    // Tank body (circle)
    this.ctx.fillStyle = isCurrentPlayer ? '#00B2E1' : '#4CAF50';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Tank barrel
    this.ctx.fillStyle = isCurrentPlayer ? '#0082A3' : '#388E3C';
    this.ctx.fillRect(0, -4, 30, 8);
    
    this.ctx.restore();
    
    // Health bar
    const healthBarWidth = 50;
    const healthBarHeight = 6;
    const healthPercentage = player.health / player.maxHealth;
    
    // Background
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(x - healthBarWidth/2, y - 35, healthBarWidth, healthBarHeight);
    
    // Health
    this.ctx.fillStyle = healthPercentage > 0.6 ? '#4CAF50' : 
                        healthPercentage > 0.3 ? '#FF9800' : '#F44336';
    this.ctx.fillRect(x - healthBarWidth/2, y - 35, healthBarWidth * healthPercentage, healthBarHeight);
    
    // Player name
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(player.name, x, y - 40);
    
    // Level indicator
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`Lv.${player.level}`, x, y + 35);
  }

  renderProjectile(projectile: Projectile): void {
    const { x, y } = projectile.position;
    
    // Main bullet
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Glow effect
    this.ctx.strokeStyle = '#FFA000';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.6;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 6, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.globalAlpha = 1;
  }

  renderShape(shape: Shape): void {
    const { x, y } = shape.position;
    const sides = this.getShapeSides(shape.type);
    
    this.ctx.save();
    this.ctx.translate(x, y);
    
    // Draw shape
    this.ctx.fillStyle = shape.color;
    this.ctx.strokeStyle = this.darkenColor(shape.color);
    this.ctx.lineWidth = 2;
    
    this.drawPolygon(0, 0, shape.size, sides);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.restore();
    
    // Health bar for damaged shapes
    if (shape.health < shape.maxHealth) {
      const barWidth = shape.size * 1.5;
      const barHeight = 4;
      const healthPercentage = shape.health / shape.maxHealth;
      
      // Background
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(x - barWidth/2, y - shape.size - 10, barWidth, barHeight);
      
      // Health
      this.ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : '#F44336';
      this.ctx.fillRect(x - barWidth/2, y - shape.size - 10, barWidth * healthPercentage, barHeight);
    }
  }

  private getShapeSides(type: string): number {
    switch(type) {
      case 'triangle': return 3;
      case 'square': return 4;
      case 'pentagon': return 5;
      case 'hexagon': return 6;
      default: return 3;
    }
  }

  private drawPolygon(x: number, y: number, radius: number, sides: number): void {
    this.ctx.beginPath();
    
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    
    this.ctx.closePath();
  }

  private darkenColor(color: string): string {
    // Simple color darkening
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
