/**
 * Shape System - Complete shape management for Arras.io
 * Handles spawning, updating, and managing all shapes in the game
 */

class ShapeSystem {
  constructor(worldWidth = 10000, worldHeight = 10000) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.shapes = [];
    this.maxShapes = 250; // For 10000x10000 world
    this.spawnRate = 1000; // milliseconds
    this.lastSpawnTime = Date.now();
    this.shapeIdCounter = 0;
    
    // Rarity system configuration
    this.rarityConfig = {
      normal: {
        chance: 1,
        xpMultiplier: 1,
        healthMultiplier: 1,
        sizeMultiplier: 1,
        glow: null,
        particleColor: null,
        name: 'Normal'
      },
      shiny: {
        chance: 0.01, // 1 in 100
        xpMultiplier: { min: 75, max: 150 },
        healthMultiplier: 1.5,
        sizeMultiplier: 1.1,
        glow: '#FFD700', // Gold glow
        particleColor: '#FFD700',
        name: 'Shiny'
      },
      legendary: {
        chance: 0.002, // 1 in 500
        xpMultiplier: { min: 400, max: 750 },
        healthMultiplier: 3,
        sizeMultiplier: 1.3,
        glow: '#00BFFF', // Blue shine
        particleColor: '#00BFFF',
        name: 'Legendary'
      },
      shadow: {
        chance: 0.001, // 1 in 1000
        xpMultiplier: { min: 800, max: 1200 },
        healthMultiplier: 5,
        sizeMultiplier: 1.5,
        glow: '#8B00FF', // Purple shadow aura
        particleColor: '#8B00FF',
        name: 'Shadow'
      }
    };
    
    // Shape type definitions with proper stats
    this.shapeTypes = {
      triangle: {
        sides: 3,
        size: 25,
        health: 30,
        maxHealth: 30,
        xp: 10,
        color: '#FF6B6B',
        speed: 1.2,
        damage: 5,
        rotationSpeed: 0.02
      },
      square: {
        sides: 4,
        size: 30,
        health: 50,
        maxHealth: 50,
        xp: 20,
        color: '#FFE66D',
        speed: 0.8,
        damage: 8,
        rotationSpeed: 0.015
      },
      pentagon: {
        sides: 5,
        size: 35,
        health: 80,
        maxHealth: 80,
        xp: 35,
        color: '#4ECDC4',
        speed: 0.6,
        damage: 10,
        rotationSpeed: 0.01
      },
      hexagon: {
        sides: 6,
        size: 40,
        health: 120,
        maxHealth: 120,
        xp: 50,
        color: '#A8E6CF',
        speed: 0.4,
        damage: 15,
        rotationSpeed: 0.008
      }
    };
  }
  
  /**
   * Initialize shapes for game start
   */
  initialize(playerPosition) {
    this.shapes = [];
    // Spawn initial shapes
    for (let i = 0; i < Math.min(30, this.maxShapes); i++) {
      this.spawnShape(playerPosition);
    }
  }
  
  /**
   * Determine rarity of a shape based on random chance
   */
  determineRarity() {
    const roll = Math.random();
    
    // Check from rarest to most common
    if (roll < this.rarityConfig.shadow.chance) {
      return 'shadow';
    } else if (roll < this.rarityConfig.legendary.chance) {
      return 'legendary';
    } else if (roll < this.rarityConfig.shiny.chance) {
      return 'shiny';
    }
    
    return 'normal';
  }
  
  /**
   * Get random multiplier value within range
   */
  getRandomMultiplier(range) {
    if (typeof range === 'number') return range;
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }
  
  /**
   * Create a new shape with rarity system
   */
  createShape(type, x, y) {
    const config = this.shapeTypes[type];
    if (!config) {
      console.error(`Unknown shape type: ${type}`);
      return null;
    }
    
    // Determine rarity
    const rarity = this.determineRarity();
    const rarityConfig = this.rarityConfig[rarity];
    
    // Calculate XP multiplier for this specific shape
    const xpMultiplier = this.getRandomMultiplier(rarityConfig.xpMultiplier);
    
    // Apply rarity modifiers
    const baseXP = config.xp;
    const modifiedXP = Math.floor(baseXP * xpMultiplier);
    const modifiedHealth = Math.floor(config.health * rarityConfig.healthMultiplier);
    const modifiedSize = Math.floor(config.size * rarityConfig.sizeMultiplier);
    
    // Log rare spawns
    if (rarity !== 'normal') {
      console.log(`🌟 ${rarityConfig.name} ${type} spawned! XP: ${modifiedXP}x (${xpMultiplier}x multiplier)`);
    }
    
    return {
      id: `shape_${this.shapeIdCounter++}`,
      type: type,
      rarity: rarity,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      size: modifiedSize,
      baseSize: config.size,
      sides: config.sides,
      health: modifiedHealth,
      maxHealth: modifiedHealth,
      xp: modifiedXP,
      baseXP: baseXP,
      xpMultiplier: xpMultiplier,
      color: config.color,
      glowColor: rarityConfig.glow,
      particleColor: rarityConfig.particleColor || config.color,
      damage: config.damage,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * config.rotationSpeed,
      speed: config.speed,
      // Visual effects for rare variants
      pulsePhase: Math.random() * Math.PI * 2,
      glowIntensity: rarity === 'shadow' ? 30 : rarity === 'legendary' ? 20 : rarity === 'shiny' ? 15 : 0
    };
  }
  
  /**
   * Spawn a random shape at a safe distance from player
   */
  spawnShape(playerPosition) {
    if (this.shapes.length >= this.maxShapes) return null;
    
    const types = Object.keys(this.shapeTypes);
    // Weighted spawning - more common shapes spawn more often
    const weights = [40, 30, 20, 10]; // triangle, square, pentagon, hexagon
    const randomWeight = Math.random() * 100;
    let typeIndex = 0;
    let weightSum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      weightSum += weights[i];
      if (randomWeight <= weightSum) {
        typeIndex = i;
        break;
      }
    }
    
    const type = types[typeIndex];
    
    // Find safe spawn location
    let x, y;
    let attempts = 0;
    const minDistance = 300; // Minimum distance from player
    
    do {
      x = Math.random() * this.worldWidth;
      y = Math.random() * this.worldHeight;
      attempts++;
      
      if (attempts > 50) {
        // If we can't find a good spot, spawn anywhere
        break;
      }
    } while (
      playerPosition &&
      Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2)) < minDistance
    );
    
    const shape = this.createShape(type, x, y);
    if (shape) {
      this.shapes.push(shape);
    }
    
    return shape;
  }
  
  /**
   * Update all shapes
   */
  update(deltaTime, playerPosition) {
    const now = Date.now();
    
    // Spawn new shapes periodically
    if (now - this.lastSpawnTime > this.spawnRate) {
      if (this.shapes.length < this.maxShapes) {
        this.spawnShape(playerPosition);
      }
      this.lastSpawnTime = now;
    }
    
    // Update each shape
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];
      
      // Update position
      shape.x += shape.vx;
      shape.y += shape.vy;
      
      // Rotate shape
      shape.angle += shape.rotationSpeed;
      
      // Update pulse effect for rare shapes
      if (shape.rarity !== 'normal') {
        shape.pulsePhase += 0.05;
      }
      
      // Bounce off world boundaries
      if (shape.x - shape.size < 0 || shape.x + shape.size > this.worldWidth) {
        shape.vx *= -1;
        shape.x = Math.max(shape.size, Math.min(this.worldWidth - shape.size, shape.x));
      }
      if (shape.y - shape.size < 0 || shape.y + shape.size > this.worldHeight) {
        shape.vy *= -1;
        shape.y = Math.max(shape.size, Math.min(this.worldHeight - shape.size, shape.y));
      }
      
      // Random movement changes occasionally
      if (Math.random() < 0.01) {
        const config = this.shapeTypes[shape.type];
        shape.vx = (Math.random() - 0.5) * config.speed;
        shape.vy = (Math.random() - 0.5) * config.speed;
      }
      
      // Remove dead shapes
      if (shape.health <= 0) {
        this.shapes.splice(i, 1);
      }
    }
  }
  
  /**
   * Damage a shape and return rewards
   */
  damageShape(shapeIndex, damage) {
    if (shapeIndex < 0 || shapeIndex >= this.shapes.length) return null;
    
    const shape = this.shapes[shapeIndex];
    shape.health -= damage;
    
    if (shape.health <= 0) {
      // Shape destroyed - return XP value and rarity info
      const xp = shape.xp;
      const rarity = shape.rarity;
      
      // Log destruction of rare shapes
      if (rarity !== 'normal') {
        console.log(`💀 ${this.rarityConfig[rarity].name} ${shape.type} destroyed! Awarded ${xp} XP!`);
      }
      
      this.shapes.splice(shapeIndex, 1);
      return { 
        destroyed: true, 
        xp: xp, 
        type: shape.type,
        rarity: rarity,
        xpMultiplier: shape.xpMultiplier,
        particleColor: shape.particleColor
      };
    }
    
    return { destroyed: false, xp: 0, type: shape.type, rarity: shape.rarity };
  }
  
  /**
   * Get shape at specific index
   */
  getShape(index) {
    return this.shapes[index] || null;
  }
  
  /**
   * Get all shapes
   */
  getAllShapes() {
    return this.shapes;
  }
  
  /**
   * Get shapes within a certain range (for rendering optimization)
   */
  getShapesInRange(x, y, range) {
    return this.shapes.filter(shape => {
      const dx = shape.x - x;
      const dy = shape.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
  }
  
  /**
   * Clear all shapes
   */
  clear() {
    this.shapes = [];
    this.shapeIdCounter = 0;
  }
  
  /**
   * Get shape count
   */
  getCount() {
    return this.shapes.length;
  }
  
  /**
   * Set max shapes (for difficulty adjustment)
   */
  setMaxShapes(max) {
    this.maxShapes = max;
  }
  
  /**
   * Get statistics about current shapes
   */
  getStatistics() {
    const stats = {
      total: this.shapes.length,
      normal: 0,
      shiny: 0,
      legendary: 0,
      shadow: 0,
      byType: {
        triangle: 0,
        square: 0,
        pentagon: 0,
        hexagon: 0
      }
    };
    
    this.shapes.forEach(shape => {
      stats[shape.rarity]++;
      stats.byType[shape.type]++;
    });
    
    return stats;
  }
  
  /**
   * Force spawn a rare shape (for testing or special events)
   */
  spawnRareShape(rarity, playerPosition) {
    const types = Object.keys(this.shapeTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Find safe spawn location
    let x, y;
    const minDistance = 500; // Spawn further away for rare shapes
    
    do {
      x = Math.random() * this.worldWidth;
      y = Math.random() * this.worldHeight;
    } while (
      playerPosition &&
      Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2)) < minDistance
    );
    
    // Temporarily override rarity determination
    const originalDetermineRarity = this.determineRarity;
    this.determineRarity = () => rarity;
    
    const shape = this.createShape(type, x, y);
    
    // Restore original function
    this.determineRarity = originalDetermineRarity;
    
    if (shape) {
      this.shapes.push(shape);
      console.log(`⚡ Force spawned ${rarity} ${type} at (${Math.round(x)}, ${Math.round(y)})`);
    }
    
    return shape;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShapeSystem;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
  window.ShapeSystem = ShapeSystem;
}