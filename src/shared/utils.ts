import { Vector2 } from './types';

// Mathematical utilities
export class MathUtils {
  static distance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static normalize(vector: Vector2): Vector2 {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: vector.x / length, y: vector.y / length };
  }

  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static angleToVector(angle: number): Vector2 {
    return {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
  }

  static vectorToAngle(vector: Vector2): number {
    return Math.atan2(vector.y, vector.x);
  }
}

// Color utilities
export class ColorUtils {
  static teamColors = {
    red: '#FF4444',
    blue: '#4444FF',
    green: '#44FF44',
    yellow: '#FFFF44'
  };

  static getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  static hexToRgb(hex: string): {r: number, g: number, b: number} {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
  }
}

// Game utilities
export class GameUtils {
  static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static isColliding(pos1: Vector2, size1: number, pos2: Vector2, size2: number): boolean {
    const distance = MathUtils.distance(pos1, pos2);
    return distance < (size1 + size2) / 2;
  }

  static wrapPosition(position: Vector2, worldWidth: number, worldHeight: number): Vector2 {
    return {
      x: ((position.x % worldWidth) + worldWidth) % worldWidth,
      y: ((position.y % worldHeight) + worldHeight) % worldHeight
    };
  }
}
