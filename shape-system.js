/**
 * Enhanced Shape System - Complete shape management for Arras.io
 * NOW INCLUDES: Rainbow (1/5000) and Transgender (1/50000) ultra-rare shapes!
 * Features growing rainbow effects and transgender pride colors with massive rewards
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

    // Enhanced rarity system with new ultra-rare shapes!
    this.rarityConfigs = {
      normal: {
        multiplier: { health: 1, xp: 1, damage: 1, size: 1 },
        probability: 0.96998, // Adjusted to accommodate new rarities
        glowColor: null,
        hasGlow: false,
        hasRadiance: false,
        hasShadowAura: false,
        hasRainbowEffect: false,
        hasTransgenderEffect: false
      },
      greenRadiant: {
        multiplier: { health: 2, xp: 5, damage: 1.5, size: 1 },
        probability: 0.02, // 2% (1 in 50)
        glowColor: '#00FF00',
        hasGlow: true,
        hasRadiance: true,
        hasShadowAura: false,
        hasRainbowEffect: false,
        hasTransgenderEffect: false,
        pulseSpeed: 0.1
      },
      blueRadiant: {
        multiplier: { health: 4, xp: 15, damage: 2, size: 1 },
        probability: 0.008, // 0.8% (1 in 125)
        glowColor: '#00BFFF',
        hasGlow: true,
        hasRadiance: true,
        hasShadowAura: false,
        hasRainbowEffect: false,
        hasTransgenderEffect: false,
        pulseSpeed: 0.08
      },
      shadow: {
        multiplier: { health: 8, xp: 30, damage: 3, size: 1 },
        probability: 0.002, // 0.2% (1 in 500)
        glowColor: '#8B00FF',
        hasGlow: true,
        hasRadiance: false,
        hasShadowAura: true,
        hasRainbowEffect: false,
        hasTransgenderEffect: false,
        pulseSpeed: 0.05
      },
      // 🌈 NEW: Rainbow Shape - Ultra Rare!
      rainbow: {
        multiplier: { health: 15, xp: 750, damage: 5, size: 1.3 }, // XP 7500-15000 range
        probability: 0.0002, // 0.02% (1 in 5000)
        glowColor: '#FF0080', // Pink base glow
        hasGlow: true,
        hasRadiance: true,
        hasShadowAura: false,
        hasRainbowEffect: true,
        hasTransgenderEffect: false,
        pulseSpeed: 0.03,
        growthRate: 0.005, // Growing rainbow effect!
        maxGrowth: 1.5
      },
      // 🏳️‍⚧️ NEW: Transgender Shape - Legendary Rare!
      transgender: {
        multiplier: { health: 30, xp: 3500, damage: 10, size: 1.5 }, // XP 175000-350000 range
        probability: 0.00002, // 0.002% (1 in 50000)
        glowColor: '#55CDFC', // Trans blue
        hasGlow: true,
        hasRadiance: true,
        hasShadowAura: true,
        hasRainbowEffect: false,
        hasTransgenderEffect: true,
        pulseSpeed: 0.02,
        colorCycleSpeed: 0.1 // Cycles through trans pride colors
      }
    };

    // Rainbow color cycle for rainbow shapes
    this.rainbowColors = [
      '#FF0000', // Red
      '#FF8000', // Orange
      '#FFFF00', // Yellow
      '#00FF00', // Green
      '#0080FF', // Blue
      '#8000FF', // Purple
      '#FF0080'  // Pink
    ];

    // Transgender pride colors
    this.transgenderColors = [
      '#55CDFC', // Light blue
      '#F7A8B8', // Pink
      '#FFFFFF', // White
      '#F7A8B8', // Pink
      '#55CDFC'  // Light blue
    ];
  }
  
  /**
   * Initialize shapes for game start
   */
  initialize(playerPosition) {
    this.shapes = [];
    console.log('🎲 ShapeSystem initialized with ULTRA-RARE shapes!');
    console.log('📊 Spawn rates:');
    console.log('   Normal: 96.998%');
    console.log('   Green Radiant: 2% (1/50)');
    console.log('   Blue Radiant: 0.8% (1/125)');
    console.log('   Shadow: 0.2% (1/500)');
    console.log('   🌈 Rainbow: 0.02% (1/5000) - GROWING RAINBOW!');
    console.log('   🏳️‍⚧️ Transgender: 0.002% (1/50000) - LEGENDARY!');
    
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
    
    // Check rarity in order from most rare to most common
    const rarities = ['transgender', 'rainbow', 'shadow', 'blueRadiant', 'greenRadiant', 'normal'];
    
    for (const rarity of rarities) {
      cumulativeProbability += this.rarityConfigs[rarity].probability;
      if (roll <= cumulativeProbability) {
        return rarity;
      }
    }
    
    return 'normal'; // Fallback
  }
  
  /**
   * Create a shape with enhanced rarity system
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
    const size = Math.floor(config.size * rarityConfig.multiplier.size);
    
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
    } else if (rarity === 'rainbow') {
      // Rainbow starts with red but will cycle through all colors
      shapeColor = '#FF0000';
      particleColor = '#FF0080';
    } else if (rarity === 'transgender') {
      // Transgender starts with light blue
      shapeColor = '#55CDFC';
      particleColor = '#F7A8B8';
    }
    
    const shape = {
      id: `shape_${this.shapeIdCounter++}`,
      type: type,
      rarity: rarity,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      size: size,
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
      
      // Enhanced rare shape properties
      hasGlow: rarityConfig.hasGlow,
      hasRadiance: rarityConfig.hasRadiance,
      hasShadowAura: rarityConfig.hasShadowAura,
      hasRainbowEffect: rarityConfig.hasRainbowEffect,
      hasTransgenderEffect: rarityConfig.hasTransgenderEffect,
      pulseSpeed: rarityConfig.pulseSpeed || 0,
      pulsePhase: Math.random() * Math.PI * 2,
      
      // Rainbow-specific properties
      rainbowPhase: 0,
      rainbowColorIndex: 0,
      growthPhase: 0,
      currentGrowth: 1,
      
      // Transgender-specific properties
      transgenderColorIndex: 0,
      transgenderPhase: 0,
      
      // Creation time for special effects
      createdAt: Date.now()
    };
    
    // Log rare shape spawns with excitement!
    if (rarity === 'rainbow') {
      console.log(`🌈✨ RAINBOW ${type.toUpperCase()} SPAWNED! ✨🌈`);
      console.log(`📍 Location: (${Math.round(x)}, ${Math.round(y)})`);
      console.log(`💰 Worth: ${xp} XP (${xp * 10} score!)`);
      console.log(`🎯 This is a 1 in 5000 spawn!`);
    } else if (rarity === 'transgender') {
      console.log(`🏳️‍⚧️💎 TRANSGENDER ${type.toUpperCase()} - LEGENDARY! 💎🏳️‍⚧️`);
      console.log(`📍 Location: (${Math.round(x)}, ${Math.round(y)})`);
      console.log(`💰 Worth: ${xp} XP (${xp * 10} score!)`);
      console.log(`🌟 This is a 1 in 50,000 spawn - you're incredibly lucky!`);
    } else if (rarity !== 'normal') {
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
    
    // Find safe spawn location (further for ultra-rare shapes)
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
    const minDistance = rarity === 'transgender' ? 800 : rarity === 'rainbow' ? 600 : 500;
    
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
   * Update all shapes with enhanced visual effects
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
      
      // Update pulse phase for all rare shapes
      if (shape.pulseSpeed > 0) {
        shape.pulsePhase += shape.pulseSpeed;
      }
      
      // 🌈 RAINBOW SHAPE SPECIAL EFFECTS
      if (shape.hasRainbowEffect) {
        // Cycle through rainbow colors
        shape.rainbowPhase += 0.05;
        const colorIndex = Math.floor(shape.rainbowPhase) % this.rainbowColors.length;
        shape.color = this.rainbowColors[colorIndex];
        shape.particleColor = this.rainbowColors[(colorIndex + 1) % this.rainbowColors.length];
        
        // Growing effect - rainbow shapes grow and shrink
        shape.growthPhase += shape.growthRate || 0.005;
        const growthMultiplier = 1 + Math.sin(shape.growthPhase) * 0.2; // ±20% size variation
        shape.currentGrowth = growthMultiplier;
        
        // Enhanced glow that pulses with colors
        shape.glowColor = this.rainbowColors[Math.floor(shape.rainbowPhase * 2) % this.rainbowColors.length];
      }
      
      // 🏳️‍⚧️ TRANSGENDER SHAPE SPECIAL EFFECTS
      if (shape.hasTransgenderEffect) {
        // Cycle through transgender pride colors
        shape.transgenderPhase += shape.colorCycleSpeed || 0.1;
        const colorIndex = Math.floor(shape.transgenderPhase) % this.transgenderColors.length;
        shape.color = this.transgenderColors[colorIndex];
        shape.particleColor = this.transgenderColors[(colorIndex + 2) % this.transgenderColors.length];
        
        // Special glow effect that alternates between blue and pink
        const glowIndex = Math.floor(shape.transgenderPhase * 0.5) % 2;
        shape.glowColor = glowIndex === 0 ? '#55CDFC' : '#F7A8B8';
        
        // Ultra-intense pulse for legendary status
        shape.currentGrowth = 1 + Math.sin(shape.pulsePhase) * 0.15;
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
   * Get enhanced visual properties for rendering (with new ultra-rare effects)
   */
  getShapeVisualProperties(shape) {
    const props = {
      baseColor: shape.color,
      strokeWidth: 2,
      pulseAmount: 1,
      shadowBlur: 0,
      currentSize: shape.size
    };
    
    if (shape.rarity !== 'normal') {
      // Enhanced visuals for rare shapes
      props.strokeWidth = shape.rarity === 'transgender' ? 6 : shape.rarity === 'rainbow' ? 5 : 3;
      
      // Apply growth effects
      if (shape.currentGrowth) {
        props.currentSize = shape.size * shape.currentGrowth;
        props.pulseAmount = shape.currentGrowth;
      }
      
      // Pulsing effect
      if (shape.pulseSpeed > 0) {
        const pulseIntensity = Math.sin(shape.pulsePhase) * 0.1 + 1;
        props.pulseAmount *= pulseIntensity;
      }
      
      // Enhanced glow effects
      if (shape.hasGlow) {
        let baseGlow = 15;
        if (shape.rarity === 'rainbow') baseGlow = 35;
        else if (shape.rarity === 'transgender') baseGlow = 50;
        
        props.shadowBlur = baseGlow + Math.sin(Date.now() * 0.01) * 10;
      }
      
      // Rainbow-specific effects
      if (shape.hasRainbowEffect) {
        props.shadowBlur = 40 + Math.sin(shape.rainbowPhase) * 15;
        // Rainbow shapes get a multi-color glow
        props.rainbowGlow = true;
      }
      
      // Transgender-specific effects
      if (shape.hasTransgenderEffect) {
        props.shadowBlur = 60 + Math.sin(shape.pulsePhase) * 20;
        // Transgender shapes get an intense pride glow
        props.transgenderGlow = true;
        props.strokeWidth = 8; // Extra thick border for legendary status
      }
      
      // Shadow effects
      if (shape.rarity === 'shadow') {
        const distToPlayer = shape.distanceToPlayer || 1000;
        const maxVisibilityDistance = 400;
        const safeDistance = 100;
        
        let alpha;
        if (distToPlayer <= safeDistance) {
          alpha = 1;
        } else if (distToPlayer >= maxVisibilityDistance) {
          alpha = 0.05;
        } else {
          const fadeRange = maxVisibilityDistance - safeDistance;
          const fadeProgress = (distToPlayer - safeDistance) / fadeRange;
          const smoothFade = 1 - Math.pow(fadeProgress, 0.5);
          alpha = Math.max(0.05, smoothFade * 0.95 + 0.05);
        }
        
        props.baseColor = this.adjustColorAlpha(shape.color, alpha);
      }
    }
    
    return props;
  }
  
  /**
   * Damage a shape and handle destruction with enhanced rewards
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
      
      // Special destruction messages for ultra-rare shapes
      if (shape.rarity === 'rainbow') {
        console.log(`🌈💥 RAINBOW ${shape.type.toUpperCase()} DESTROYED! 💥🌈`);
        console.log(`💰 MASSIVE REWARD: ${shape.xp} XP (${shape.xp * 10} score points!)`);
        console.log(`🎉 Congratulations on finding this 1/5000 rarity!`);
      } else if (shape.rarity === 'transgender') {
        console.log(`🏳️‍⚧️💎 TRANSGENDER ${shape.type.toUpperCase()} DESTROYED - LEGENDARY! 💎🏳️‍⚧️`);
        console.log(`💰 ULTIMATE REWARD: ${shape.xp} XP (${shape.xp * 10} score points!)`);
        console.log(`🌟 You just destroyed a 1/50,000 legendary shape! You're amazing!`);
      } else if (shape.rarity !== 'normal') {
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
   * Get statistics about current shapes including new ultra-rare breakdown
   */
  getStatistics() {
    const stats = {
      total: this.shapes.length,
      normal: 0,
      greenRadiant: 0,
      blueRadiant: 0,
      shadow: 0,
      rainbow: 0,
      transgender: 0,
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