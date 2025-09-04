/**
 * Enhanced Shape System - Complete shape management for Arras.io
 * Handles spawning, updating, and managing all shapes including rare variants
 * Now includes: Green Radiant, Blue Radiant, and Shadow shapes!
 */

class ShapeSystem {
  constructor(worldWidth = 10000, worldHeight = 10000) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.shapes = [];
    this.maxShapes = 250;
    this.spawnRate = 200; // milliseconds
    this.lastSpawnTime = Date.now();
    this.shapeIdCounter = 0;
    
    // Base shape type definitions
    this.shapeTypes = {
      triangle: {
        sides: 3,
        size: 25,
        health: 30,
        maxHealth: 30,
        xp: 10,
        color: '#FF6B6B',
        particleColor: '#FF6B6B',
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
        particleColor: '#FFE66D',
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
        particleColor: '#4ECDC4',
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
        particleColor: '#A8E6CF',
        speed: 0.4,
        damage: 15,
        rotationSpeed: 0.008
      }
    };

    // Rare shape multipliers and properties
    this.rarityConfigs = {
      normal: {
        multiplier: { health: 1, xp: 1, damage: 1 },
        probability: 0.97, // 97% normal
        glowColor: null,
        hasGlow: false,
        hasRadiance: false,
        hasShadowAura: false
      },
      greenRadiant: {
        multiplier: { health: 2, xp: 5, damage: 1.5 },
        probability: 0.02, // 2% (1 in 50)
        glowColor: '#00FF00',
        hasGlow: true,
        hasRadiance: true,
        hasShadowAura: false,
        pulseSpeed: 0.1
      },
      blueRadiant: {
        multiplier: { health: 4, xp: 15, damage: 2 },
        probability: 0.008, // 0.8% (1 in 125)
        glowColor: '#00BFFF',
        hasGlow: true,
        hasRadiance: true,
        hasShadowAura: false,
        pulseSpeed: 0.08
      },
      shadow: {
        multiplier: { health: 8, xp: 30, damage: 3 },
        probability: 0.002, // 0.2% (1 in 500)
        glowColor: '#8B00FF',
        hasGlow: true,
        hasRadiance: false,
        hasShadowAura: true,
        pulseSpeed: 0.05
      }
    };
  }
  
  /**
   * Initialize shapes for game start
   */
  initialize(playerPosition) {
    this.shapes = [];
    console.log('🎲 ShapeSystem initialized with rare shapes!');
    console.log('📊 Spawn rates: Normal 97%, Green Radiant 2%, Blue Radiant 0.8%, Shadow 0.2%');
    
    // Spawn initial shapes
    for (let i = 0; i < Math.min(50, this.maxShapes); i++) {
      this.spawnShape(playerPosition);
    }
  }
  
  /**
   * Determine rarity based on probability
   */
  determineRarity() {
    const roll = Math.random();
    let cumulativeProbability = 0;
    
    // Check rarity in order of rarity (most common first)
    const rarities = ['normal', 'greenRadiant', 'blueRadiant', 'shadow'];
    
    for (const rarity of rarities) {
      cumulativeProbability += this.rarityConfigs[rarity].probability;
      if (roll <= cumulativeProbability) {
        return rarity;
      }
    }
    
    return 'normal'; // Fallback
  }
  
  /**
   * Create a shape with rarity system
   */
  createShape(type, x, y, forcedRarity = null) {
    const config = this.shapeTypes[type];
    if (!config) {
      console.error(`Unknown shape type: ${type}`);
      return null;
    }
    
    // Determine rarity
    const rarity = forcedRarity || this.determineRarity();
    const rarityConfig = this.rarityConfigs[rarity];
    
    // Apply rarity multipliers
    const health = Math.floor(config.health * rarityConfig.multiplier.health);
    const xp = Math.floor(config.xp * rarityConfig.multiplier.xp);
    const damage = Math.floor(config.damage * rarityConfig.multiplier.damage);
    
    // Determine colors based on rarity
    let shapeColor = config.color;
    let particleColor = config.particleColor;
    
    if (rarity === 'greenRadiant') {
      shapeColor = this.lightenColor(config.color, 30);
      particleColor = '#00FF00';
    } else if (rarity === 'blueRadiant') {
      shapeColor = this.adjustColorHue(config.color, 240); // Blue hue
      particleColor = '#00BFFF';
    } else if (rarity === 'shadow') {
      shapeColor = this.darkenColor(config.color, 50);
      particleColor = '#8B00FF';
    }
    
    const shape = {
      id: `shape_${this.shapeIdCounter++}`,
      type: type,
      rarity: rarity,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      size: config.size * (rarity === 'shadow' ? 1.2 : rarity === 'blueRadiant' ? 1.1 : 1),
      sides: config.sides,
      health: health,
      maxHealth: health,
      xp: xp,
      color: shapeColor,
      particleColor: particleColor,
      glowColor: rarityConfig.glowColor,
      damage: damage,
      angle: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * config.rotationSpeed,
      speed: config.speed,
      
      // Rare shape properties
      hasGlow: rarityConfig.hasGlow,
      hasRadiance: rarityConfig.hasRadiance,
      hasShadowAura: rarityConfig.hasShadowAura,
      pulseSpeed: rarityConfig.pulseSpeed || 0,
      pulsePhase: Math.random() * Math.PI * 2
    };
    
    // Log rare shape spawns
    if (rarity !== 'normal') {
      console.log(`✨ Spawned ${rarity} ${type} at (${Math.round(x)}, ${Math.round(y)}) - ${xp} XP!`);
    }
    
    return shape;
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
    const minDistance = 300;
    
    do {
      x = Math.random() * this.worldWidth;
      y = Math.random() * this.worldHeight;
      attempts++;
      
      if (attempts > 50) break; // Prevent infinite loop
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
   * Force spawn a rare shape (for testing or events)
   */
  spawnRareShape(rarity, playerPosition) {
    const types = Object.keys(this.shapeTypes);
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Find safe spawn location (further away for rare shapes)
    let x, y;
    let attempts = 0;
    const minDistance = 500;
    
    do {
      x = Math.random() * this.worldWidth;
      y = Math.random() * this.worldHeight;
      attempts++;
      
      if (attempts > 50) break;
    } while (
      playerPosition &&
      Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2)) < minDistance
    );
    
    const shape = this.createShape(type, x, y, rarity);
    
    if (shape) {
      this.shapes.push(shape);
      console.log(`🎯 Force spawned ${rarity} ${type}! Stats: ${shape.health} HP, ${shape.xp} XP`);
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
      
      // Update pulse phase for rare shapes
      if (shape.pulseSpeed > 0) {
        shape.pulsePhase += shape.pulseSpeed;
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
   * Get visual properties for rendering (includes rare shape effects)
   */
  getShapeVisualProperties(shape) {
    const props = {
      baseColor: shape.color,
      strokeWidth: 2,
      pulseAmount: 1,
      shadowBlur: 0
    };
    
    if (shape.rarity !== 'normal') {
      // Enhanced visuals for rare shapes
      props.strokeWidth = 3;
      
      // Pulsing effect
      if (shape.pulseSpeed > 0) {
        const pulseIntensity = Math.sin(shape.pulsePhase) * 0.1 + 1;
        props.pulseAmount = pulseIntensity;
      }
      
      // Glow effects
      if (shape.hasGlow) {
        props.shadowBlur = 15 + Math.sin(Date.now() * 0.01) * 5;
      }
      
      // Special color modifications for rare shapes
      if (shape.rarity === 'greenRadiant') {
        props.shadowBlur = 20;
      } else if (shape.rarity === 'blueRadiant') {
        props.shadowBlur = 25;
      } else if (shape.rarity === 'shadow') {
        props.shadowBlur = 30;
        props.baseColor = this.adjustColorAlpha(shape.color, 0.9);
      }
    }
    
    return props;
  }
  
  /**
   * Damage a shape and handle destruction
   */
  damageShape(shapeIndex, damage) {
    if (shapeIndex < 0 || shapeIndex >= this.shapes.length) return null;
    
    const shape = this.shapes[shapeIndex];
    shape.health -= damage;
    
    if (shape.health <= 0) {
      const result = {
        destroyed: true,
        xp: shape.xp,
        type: shape.type,
        rarity: shape.rarity,
        shape: shape // Include shape for particle effects
      };
      
      // Log rare shape destruction
      if (shape.rarity !== 'normal') {
        console.log(`💥 Destroyed ${shape.rarity} ${shape.type}! Awarded ${shape.xp} XP!`);
      }
      
      this.shapes.splice(shapeIndex, 1);
      return result;
    }
    
    return { destroyed: false, xp: 0, type: shape.type, rarity: shape.rarity, shape: shape };
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
   * Get statistics about current shapes including rarity breakdown
   */
  getStatistics() {
    const stats = {
      total: this.shapes.length,
      normal: 0,
      greenRadiant: 0,
      blueRadiant: 0,
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
   * Set max shapes (for difficulty adjustment)
   */
  setMaxShapes(max) {
    this.maxShapes = max;
  }
  
  /**
   * Set spawn rate
   */
  setSpawnRate(rate) {
    this.spawnRate = rate;
  }
  
  // ==================== COLOR UTILITY FUNCTIONS ====================
  
  /**
   * Lighten a hex color by percentage
   */
  lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }
  
  /**
   * Darken a hex color by percentage
   */
  darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 +
      (B > 0 ? B : 0))
      .toString(16).slice(1);
  }
  
  /**
   * Adjust color hue (simplified)
   */
  adjustColorHue(hex, targetHue) {
    // Simple hue adjustment - replace with more sophisticated HSL conversion if needed
    const hueColors = {
      240: '#4444FF', // Blue
      120: '#44FF44', // Green
      0: '#FF4444',   // Red
      60: '#FFFF44'   // Yellow
    };
    
    return hueColors[targetHue] || hex;
  }
  
  /**
   * Adjust color alpha (add transparency)
   */
  adjustColorAlpha(hex, alpha) {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = num >> 16;
    const G = num >> 8 & 0x00FF;
    const B = num & 0x0000FF;
    
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
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