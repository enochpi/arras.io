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
    
    this.ctx.strokeStyle = 'rgba(100, 100, 120, 0.15)';
    this.ctx.lineWidth = 1;
    
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
  }

  renderPlayer(player: Player, isCurrentPlayer: boolean): void {
    const { x, y } = player.position;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(player.rotation);
    
    // Tank shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(3, 3, 22, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Tank body with gradient
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    if (isCurrentPlayer) {
      gradient.addColorStop(0, '#00D4FF');
      gradient.addColorStop(1, '#0082A3');
    } else {
      gradient.addColorStop(0, '#5CDB5C');
      gradient.addColorStop(1, '#388E3C');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Tank outline
    this.ctx.strokeStyle = isCurrentPlayer ? '#00B2E1' : '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Tank barrel with gradient
    const barrelGradient = this.ctx.createLinearGradient(0, -4, 0, 4);
    if (isCurrentPlayer) {
      barrelGradient.addColorStop(0, '#0099CC');
      barrelGradient.addColorStop(1, '#006688');
    } else {
      barrelGradient.addColorStop(0, '#449944');
      barrelGradient.addColorStop(1, '#336633');
    }
    
    this.ctx.fillStyle = barrelGradient;
    this.ctx.fillRect(0, -5, 35, 10);
    
    // Barrel outline
    this.ctx.strokeStyle = isCurrentPlayer ? '#005577' : '#225522';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, -5, 35, 10);
    
    this.ctx.restore();
    
    // Enhanced health bar
    this.renderHealthBar(x, y - 35, player.health, player.maxHealth, 50, 6);
    
    // Player name with shadow
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(player.name, x + 1, y - 39);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillText(player.name, x, y - 40);
    
    // Level indicator with glow
    this.ctx.shadowColor = '#FFD700';
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(`Lv.${player.level}`, x, y + 35);
    this.ctx.shadowBlur = 0;
  }

  renderProjectile(projectile: Projectile): void {
    const { x, y } = projectile.position;
    
    // Projectile trail
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(x - projectile.velocity.x * 0.5, y - projectile.velocity.y * 0.5);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    
    // Main bullet with gradient
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 5);
    gradient.addColorStop(0, '#FFFF00');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, '#FFA000');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Glow effect
    this.ctx.shadowColor = '#FFD700';
    this.ctx.shadowBlur = 15;
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  renderShape(shape: Shape): void {
    const { x, y } = shape.position;
    const sides = this.getShapeSides(shape.type);
    const color = this.getShapeColor(shape.type);
    
    this.ctx.save();
    this.ctx.translate(x, y);
    
    // Shape shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.save();
    this.ctx.translate(3, 3);
    this.drawPolygon(0, 0, shape.size + 2, sides);
    this.ctx.fill();
    this.ctx.restore();
    
    // Shape with gradient
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, shape.size);
    gradient.addColorStop(0, this.lightenColor(color, 20));
    gradient.addColorStop(1, color);
    
    this.ctx.fillStyle = gradient;
    this.ctx.strokeStyle = this.darkenColor(color, 20);
    this.ctx.lineWidth = 2;
    
    this.drawPolygon(0, 0, shape.size, sides);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Inner highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.drawPolygon(0, 0, shape.size * 0.7, sides);
    this.ctx.fill();
    
    this.ctx.restore();
    
    // Health bar for damaged shapes
    if (shape.health < shape.maxHealth) {
      this.renderHealthBar(x, y - shape.size - 10, shape.health, shape.maxHealth, shape.size * 1.5, 4);
    }
  }

  private renderHealthBar(x: number, y: number, health: number, maxHealth: number, width: number, height: number): void {
    const healthPercentage = health / maxHealth;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(x - width/2, y, width, height);
    
    // Health gradient
    const gradient = this.ctx.createLinearGradient(x - width/2, y, x + width/2, y);
    if (healthPercentage > 0.6) {
      gradient.addColorStop(0, '#4CAF50');
      gradient.addColorStop(1, '#8BC34A');
    } else if (healthPercentage > 0.3) {
      gradient.addColorStop(0, '#FF9800');
      gradient.addColorStop(1, '#FFB74D');
    } else {
      gradient.addColorStop(0, '#F44336');
      gradient.addColorStop(1, '#EF5350');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x - width/2, y, width * healthPercentage, height);
    
    // Border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - width/2, y, width, height);
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

  private getShapeColor(type: string): string {
    switch(type) {
      case 'triangle': return '#FF6B6B';
      case 'square': return '#FFE66D';
      case 'pentagon': return '#4ECDC4';
      case 'hexagon': return '#A8E6CF';
      default: return '#888888';
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

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
