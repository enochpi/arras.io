/**
 * Enhanced Shape System - Complete shape management for Arras.io
 * NOW INCLUDES: Rainbow (1/5000) and Transgender (1/50000) ultra-rare shapes!
 * Features growing rainbow effects and transgender pride colors with massive rewards
 * COMPLETE VERSION WITH ALL VISUAL ENHANCEMENTS BUILT IN
 */

class ShapeSystem {
  constructor(worldWidth = 10000, worldHeight = 10000) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.shapes = [];
    this.maxShapes = 25000;
    this.spawnRate = 50; // milliseconds
    this.lastSpawnTime = Date.now();
    this.shapeIdCounter = 0;
    this.lastPlayerPosition = null;
    
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
      pulseIntensity: 1,
      
      // Rainbow-specific properties
      rainbowPhase: 0,
      rainbowColorIndex: 0,
      growthPhase: 0,
      currentGrowth: 1,
      glowIntensity: 1,
      
      // Transgender-specific properties
      transgenderColorIndex: 0,
      transgenderPhase: 0,
      
      // Distance tracking for shadow shapes
      distanceToPlayer: 0,
      
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
    
    // Show notification for rare spawns (with a small delay to avoid spam)
    if (rarity !== 'normal') {
      setTimeout(() => {
        this.showRareSpawnNotification(rarity, type, xp);
      }, 100);
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
   * Update visual properties for enhanced effects
   */
  updateShapeVisualProperties(shape) {
    // Calculate distance to player for shadow shapes
    if (this.lastPlayerPosition && shape.rarity === 'shadow') {
      const dx = shape.x - this.lastPlayerPosition.x;
      const dy = shape.y - this.lastPlayerPosition.y;
      shape.distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    }
    
    // Update animation phases for ultra-rare shapes
    if (shape.rarity === 'rainbow') {
      // Rainbow animation updates
      shape.rainbowPhase = (shape.rainbowPhase || 0) + 0.05;
      shape.growthPhase = (shape.growthPhase || 0) + 0.005;
      shape.currentGrowth = 1 + Math.sin(shape.growthPhase) * 0.2;
      
      // Cycle through rainbow colors more smoothly
      const colorIndex = Math.floor(shape.rainbowPhase) % this.rainbowColors.length;
      shape.color = this.rainbowColors[colorIndex];
      shape.particleColor = this.rainbowColors[(colorIndex + 1) % this.rainbowColors.length];
      shape.glowColor = this.rainbowColors[Math.floor(shape.rainbowPhase * 2) % this.rainbowColors.length];
      
      // Enhanced glow intensity for rainbow
      shape.glowIntensity = 0.8 + Math.sin(shape.rainbowPhase * 3) * 0.2;
    }
    
    if (shape.rarity === 'transgender') {
      // Transgender animation updates
      shape.transgenderPhase = (shape.transgenderPhase || 0) + 0.1;
      shape.currentGrowth = 1 + Math.sin(shape.pulsePhase || 0) * 0.15;
      
      // Cycle through transgender pride colors
      const colorIndex = Math.floor(shape.transgenderPhase) % this.transgenderColors.length;
      shape.color = this.transgenderColors[colorIndex];
      shape.particleColor = this.transgenderColors[(colorIndex + 2) % this.transgenderColors.length];
      
      // Alternating glow between blue and pink for legendary status
      const glowIndex = Math.floor(shape.transgenderPhase * 0.5) % 2;
      shape.glowColor = glowIndex === 0 ? '#55CDFC' : '#F7A8B8';
      
      // Enhanced glow intensity for legendary status
      shape.glowIntensity = 1.0 + Math.sin(shape.transgenderPhase * 4) * 0.3;
    }
    
    // Enhanced pulse effects for all rare shapes
    if (shape.pulseSpeed > 0) {
      shape.pulsePhase = (shape.pulsePhase || 0) + shape.pulseSpeed;
      shape.pulseIntensity = Math.sin(shape.pulsePhase) * 0.3 + 0.7;
    }
    
    // Enhanced glow for blue and green radiant
    if (shape.rarity === 'blueRadiant') {
      shape.glowIntensity = 0.6 + Math.sin(Date.now() * 0.008) * 0.2;
    }
    if (shape.rarity === 'greenRadiant') {
      shape.glowIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.2;
    }
  }
  
  /**
   * Update all shapes with enhanced visual effects
   */
  update(deltaTime, playerPosition) {
    const now = Date.now();
    
    // Store player position for distance calculations
    this.lastPlayerPosition = playerPosition;
    
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
      
      // Update visual properties for enhanced effects
      this.updateShapeVisualProperties(shape);
      
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
   * Enhanced notification system for rare shape spawns
   */
  showRareSpawnNotification(rarity, type, xp) {
    const notifications = {
      'rainbow': {
        message: `🌈 RAINBOW ${type.toUpperCase()} SPAWNED! 🌈`,
        className: 'rainbow-notification',
        duration: 3000
      },
      'transgender': {
        message: `🏳️‍⚧️ TRANSGENDER ${type.toUpperCase()} - LEGENDARY! 🏳️‍⚧️`,
        className: 'transgender-notification',
        duration: 4000
      },
      'shadow': {
        message: `☠️ SHADOW ${type.toUpperCase()} APPEARED! ☠️`,
        className: 'rare-notification',
        duration: 2500
      },
      'blueRadiant': {
        message: `✨ BLUE RADIANT ${type.toUpperCase()}! ✨`,
        className: 'rare-notification',
        duration: 2000
      },
      'greenRadiant': {
        message: `⭐ GREEN RADIANT ${type.toUpperCase()}! ⭐`,
        className: 'rare-notification',
        duration: 2000
      }
    };

    const notification = notifications[rarity];
    if (notification) {
      // Check if showEnhancedNotification function exists (from index.html)
      if (typeof showEnhancedNotification === 'function') {
        showEnhancedNotification(notification.message, notification.className);
      } else {
        // Fallback: create notification manually
        this.createFallbackNotification(notification.message, notification.className, notification.duration);
      }
    }
  }

  /**
   * Fallback notification system if showEnhancedNotification doesn't exist
   */
  createFallbackNotification(message, className, duration) {
    const notification = document.createElement('div');
    notification.className = `rare-notification ${className}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 140, 0, 0.9));
      border: 3px solid #FFD700;
      border-radius: 10px;
      padding: 15px 25px;
      font-size: 20px;
      font-weight: bold;
      color: #000;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
      z-index: 200;
      pointer-events: none;
      animation: rareNotify 2s ease-out forwards;
    `;
    
    // Special styling for ultra-rare shapes
    if (className === 'rainbow-notification') {
      notification.style.background = 'linear-gradient(135deg, #FF0000, #FF8000, #FFFF00, #00FF00, #0080FF, #8000FF)';
      notification.style.borderColor = '#FF0080';
    } else if (className === 'transgender-notification') {
      notification.style.background = 'linear-gradient(135deg, #55CDFC, #F7A8B8, #FFFFFF, #F7A8B8, #55CDFC)';
      notification.style.borderColor = '#55CDFC';
      notification.style.fontSize = '24px';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  }

  /**
   * Enhanced particle creation for ultra-rare destruction effects
   */
  createEnhancedDestructionParticles(shape, particles) {
    if (!particles) return;
    
    const particleCount = shape.rarity === 'transgender' ? 50 : 
                        shape.rarity === 'rainbow' ? 40 : 
                        shape.rarity === 'shadow' ? 30 : 
                        shape.rarity === 'blueRadiant' ? 20 : 
                        shape.rarity === 'greenRadiant' ? 15 : 10;
    
    const particleSpeed = shape.rarity === 'transgender' ? 12 : 
                         shape.rarity === 'rainbow' ? 10 : 8;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = particleSpeed * (0.5 + Math.random() * 0.5);
      
      const particle = {
        x: shape.x,
        y: shape.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: shape.particleColor || shape.color,
        size: Math.random() * 8 + 3,
        lifetime: 1,
        glow: shape.rarity !== 'normal',
        rarity: shape.rarity,
        fadeRate: shape.rarity === 'transgender' ? 0.008 : shape.rarity === 'rainbow' ? 0.01 : 0.02,
        
        // Special effects for ultra-rare particles
        trail: shape.rarity === 'rainbow' || shape.rarity === 'transgender',
        sparkle: shape.rarity === 'rainbow',
        spiralMotion: shape.rarity === 'transgender',
        pulseRate: shape.rarity === 'rainbow' ? 0.1 : shape.rarity === 'transgender' ? 0.08 : 0
      };
      
      particles.push(particle);
    }
    
    // Create additional burst effect for ultra-rare shapes
    if (shape.rarity === 'rainbow' || shape.rarity === 'transgender') {
      const burstParticles = 25;
      for (let i = 0; i < burstParticles; i++) {
        const angle = (Math.PI * 2 * i) / burstParticles;
        particles.push({
          x: shape.x,
          y: shape.y,
          vx: Math.cos(angle) * particleSpeed * 1.5,
          vy: Math.sin(angle) * particleSpeed * 1.5,
          color: shape.glowColor || shape.particleColor,
          size: 3,
          lifetime: 1.5,
          glow: true,
          ring: true,
          rarity: shape.rarity,
          fadeRate: 0.02
        });
      }
    }
  }

  /**
   * Enhanced destruction result processing
   */
  processDestructionResult(result, particles) {
    if (result.destroyed && result.shape) {
      // Create enhanced particles for the destruction
      this.createEnhancedDestructionParticles(result.shape, particles);
      
      // Log special destruction messages for ultra-rare shapes
      if (result.rarity === 'rainbow') {
        console.log(`🌈💥 RAINBOW ${result.type.toUpperCase()} DESTROYED! 💥🌈`);
        console.log(`💰 MASSIVE REWARD: ${result.xp} XP (${result.xp * 10} score points!)`);
        console.log(`🎉 Congratulations on destroying this 1/5000 rarity!`);
      } else if (result.rarity === 'transgender') {
        console.log(`🏳️‍⚧️💎 TRANSGENDER ${result.type.toUpperCase()} DESTROYED - LEGENDARY! 💎🏳️‍⚧️`);
        console.log(`💰 ULTIMATE REWARD: ${result.xp} XP (${result.xp * 10} score points!)`);
        console.log(`🌟 You just destroyed a 1/50,000 legendary shape! You're amazing!`);
      }
    }
    
    return result;
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
   * Enhanced statistics with visual effect indicators
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
    
    // Add visual effect indicators
    stats.hasUltraRareEffects = stats.rainbow > 0 || stats.transgender > 0;
    stats.hasRareEffects = stats.greenRadiant > 0 || stats.blueRadiant > 0 || stats.shadow > 0;
    stats.totalRareShapes = stats.greenRadiant + stats.blueRadiant + stats.shadow + stats.rainbow + stats.transgender;
    
    // Calculate rarity distribution percentages
    if (stats.total > 0) {
      stats.normalPercentage = ((stats.normal / stats.total) * 100).toFixed(1);
      stats.rarePercentage = ((stats.totalRareShapes / stats.total) * 100).toFixed(1);
    }
    
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

// ==================== ENHANCED VISUAL EFFECTS RENDERER ====================

/**
 * Enhanced Shape Visuals - Ultra-Rare Effects Renderer
 * Handles the spectacular visual effects for Rainbow and Transgender shapes
 * Plus enhanced effects for all rare shapes
 */
class EnhancedShapeVisuals {
  constructor() {
    this.rainbowTime = 0;
    this.transgenderTime = 0;
    this.particleTime = 0;
    this.glowIntensity = 0;
  }

  /**
   * Main enhanced shape renderer - called from game.js
   */
  static drawEnhancedShape(ctx, shape, distToPlayer) {
    const visuals = new EnhancedShapeVisuals();
    
    // Update animation times
    visuals.rainbowTime += 0.05;
    visuals.transgenderTime += 0.03;
    visuals.particleTime += 0.02;
    visuals.glowIntensity = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;

    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.angle || 0);

    // Apply special effects based on rarity
    switch(shape.rarity) {
      case 'rainbow':
        visuals.renderRainbowShape(ctx, shape);
        break;
      case 'transgender':
        visuals.renderTransgenderShape(ctx, shape);
        break;
      case 'shadow':
        visuals.renderShadowShape(ctx, shape, distToPlayer);
        break;
      case 'blueRadiant':
        visuals.renderBlueRadiantShape(ctx, shape);
        break;
      case 'greenRadiant':
        visuals.renderGreenRadiantShape(ctx, shape);
        break;
      default:
        visuals.renderNormalShape(ctx, shape);
        break;
    }

    ctx.restore();
  }

  /**
   * 🌈 RAINBOW SHAPE - Growing rainbow with spectacular effects
   */
  renderRainbowShape(ctx, shape) {
    const size = shape.size * (shape.currentGrowth || 1);
    const time = this.rainbowTime;
    
    // Rainbow background aura
    for (let i = 0; i < 5; i++) {
      const auraSize = size + (20 * (5 - i));
      const alpha = 0.1 + (i * 0.05);
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
      gradient.addColorStop(0, `rgba(255, 0, 128, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rotating rainbow rings
    for (let ring = 0; ring < 3; ring++) {
      ctx.save();
      ctx.rotate(time * (0.5 + ring * 0.2));
      
      const ringRadius = size + (ring * 15);
      const segments = 12;
      
      for (let i = 0; i < segments; i++) {
        const angle = (Math.PI * 2 * i) / segments;
        const hue = (time * 50 + i * 30 + ring * 60) % 360;
        
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.8)`;
        ctx.beginPath();
        ctx.arc(
          Math.cos(angle) * ringRadius,
          Math.sin(angle) * ringRadius,
          3 + ring, 0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();
    }

    // Main rainbow shape with cycling colors
    const colors = [
      '#FF0000', '#FF8000', '#FFFF00', '#00FF00', 
      '#0080FF', '#8000FF', '#FF0080'
    ];
    
    // Create multi-color gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    for (let i = 0; i < colors.length; i++) {
      const offset = (i / (colors.length - 1) + time * 0.1) % 1;
      gradient.addColorStop(offset, colors[i]);
    }

    // Intense glow effect
    ctx.shadowBlur = 40 + Math.sin(time * 2) * 20;
    ctx.shadowColor = shape.color;
    
    ctx.fillStyle = gradient;
    this.drawPolygon(ctx, shape.sides, size);
    ctx.fill();

    // Rainbow border with pulse
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `hsl(${(time * 100) % 360}, 100%, 50%)`;
    ctx.lineWidth = 6 + Math.sin(time * 3) * 2;
    ctx.stroke();

    // Sparkle particles
    this.renderRainbowSparkles(ctx, shape, time);
  }

  /**
   * 🏳️‍⚧️ TRANSGENDER SHAPE - Pride colors with legendary effects
   */
  renderTransgenderShape(ctx, shape) {
    const size = shape.size * (shape.currentGrowth || 1);
    const time = this.transgenderTime;
    
    // Transgender pride colors
    const prideColors = ['#55CDFC', '#F7A8B8', '#FFFFFF', '#F7A8B8', '#55CDFC'];
    
    // Legendary aura layers
    for (let i = 0; i < 8; i++) {
      const auraSize = size + (25 * (8 - i));
      const alpha = 0.15 - (i * 0.015);
      const colorIndex = Math.floor((time * 2 + i * 0.5)) % prideColors.length;
      
      const color = this.hexToRgba(prideColors[colorIndex], alpha);
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Orbiting pride flag stripes
    for (let orbit = 0; orbit < 5; orbit++) {
      ctx.save();
      ctx.rotate(time * (0.3 + orbit * 0.1));
      
      const orbitRadius = size + (orbit * 20);
      const stripeCount = 16;
      
      for (let i = 0; i < stripeCount; i++) {
        const angle = (Math.PI * 2 * i) / stripeCount;
        const colorIndex = (i + Math.floor(time * 5)) % prideColors.length;
        
        ctx.fillStyle = prideColors[colorIndex];
        ctx.beginPath();
        ctx.arc(
          Math.cos(angle) * orbitRadius,
          Math.sin(angle) * orbitRadius,
          4 + orbit, 0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();
    }

    // Main shape with pride gradient
    const gradient = ctx.createLinearGradient(-size, -size, size, size);
    for (let i = 0; i < prideColors.length; i++) {
      gradient.addColorStop(i / (prideColors.length - 1), prideColors[i]);
    }

    // Ultra-intense glow for legendary status
    ctx.shadowBlur = 60 + Math.sin(time * 4) * 30;
    ctx.shadowColor = prideColors[Math.floor(time * 3) % prideColors.length];
    
    ctx.fillStyle = gradient;
    this.drawPolygon(ctx, shape.sides, size);
    ctx.fill();

    // Legendary border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#FFD700'; // Gold border for legendary
    ctx.lineWidth = 8 + Math.sin(time * 5) * 3;
    ctx.stroke();

    // Additional pride flag border
    ctx.strokeStyle = prideColors[Math.floor(time * 2) % prideColors.length];
    ctx.lineWidth = 4;
    ctx.stroke();

    // Legendary sparkles and effects
    this.renderTransgenderSparkles(ctx, shape, time);
  }

  /**
   * ☠️ SHADOW SHAPE - Mysterious fading effects
   */
  renderShadowShape(ctx, shape, distToPlayer) {
    const size = shape.size;
    const time = Date.now() * 0.001;
    
    // Calculate visibility based on distance
    const maxDistance = 400;
    const minDistance = 100;
    let alpha = 1;
    
    if (distToPlayer > minDistance) {
      if (distToPlayer >= maxDistance) {
        alpha = 0.05;
      } else {
        const fadeRange = maxDistance - minDistance;
        const fadeProgress = (distToPlayer - minDistance) / fadeRange;
        alpha = Math.max(0.05, 1 - Math.pow(fadeProgress, 0.5));
      }
    }

    // Shadow aura
    for (let i = 0; i < 6; i++) {
      const auraSize = size + (15 * (6 - i));
      const auraAlpha = alpha * 0.1 * (6 - i) / 6;
      
      ctx.fillStyle = `rgba(139, 0, 255, ${auraAlpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadowy wisps
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate(time * 0.5 + i * Math.PI / 4);
      
      const wispDistance = size + 10 + Math.sin(time * 2 + i) * 5;
      const wispAlpha = alpha * 0.3;
      
      ctx.fillStyle = `rgba(139, 0, 255, ${wispAlpha})`;
      ctx.beginPath();
      ctx.arc(wispDistance, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Main shadow shape
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#8B00FF';
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, this.lightenColor(shape.color, 20));
    gradient.addColorStop(1, this.darkenColor(shape.color, 50));
    
    ctx.fillStyle = gradient;
    this.drawPolygon(ctx, shape.sides, size);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(139, 0, 255, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  }

  /**
   * ✨ BLUE RADIANT SHAPE - Electric blue effects
   */
  renderBlueRadiantShape(ctx, shape) {
    const size = shape.size;
    const time = Date.now() * 0.001;
    
    // Electric aura
    for (let i = 0; i < 4; i++) {
      const auraSize = size + (12 * (4 - i));
      const alpha = 0.2 - (i * 0.04);
      
      ctx.fillStyle = `rgba(0, 191, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Electric bolts
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((time * 2 + i * Math.PI / 3));
      
      const boltLength = size + 15;
      ctx.strokeStyle = '#00BFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(boltLength, Math.sin(time * 10) * 5);
      ctx.stroke();
      ctx.restore();
    }

    // Main shape
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#00BFFF';
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#4169E1');
    
    ctx.fillStyle = gradient;
    this.drawPolygon(ctx, shape.sides, size);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  /**
   * ⭐ GREEN RADIANT SHAPE - Nature energy effects
   */
  renderGreenRadiantShape(ctx, shape) {
    const size = shape.size;
    const time = Date.now() * 0.001;
    
    // Energy aura
    for (let i = 0; i < 3; i++) {
      const auraSize = size + (10 * (3 - i));
      const alpha = 0.15 - (i * 0.04);
      
      ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Energy particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + time;
      const distance = size + 8 + Math.sin(time * 3 + i) * 4;
      
      ctx.fillStyle = '#00FF00';
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        2, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // Main shape
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00FF00';
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, '#90EE90');
    gradient.addColorStop(1, '#228B22');
    
    ctx.fillStyle = gradient;
    this.drawPolygon(ctx, shape.sides, size);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  /**
   * Normal shape renderer
   */
  renderNormalShape(ctx, shape) {
    const size = shape.size;
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, this.lightenColor(shape.color, 30));
    gradient.addColorStop(1, shape.color);
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = this.darkenColor(shape.color, 30);
    ctx.lineWidth = 3;
    
    this.drawPolygon(ctx, shape.sides, size);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Render rainbow sparkles
   */
  renderRainbowSparkles(ctx, shape, time) {
    const sparkleCount = 20;
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkleCount + time * 2;
      const distance = shape.size + 20 + Math.sin(time * 4 + i) * 15;
      const sparkleSize = 2 + Math.sin(time * 6 + i) * 1;
      const hue = (time * 100 + i * 30) % 360;
      
      ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        sparkleSize, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  /**
   * Render transgender sparkles
   */
  renderTransgenderSparkles(ctx, shape, time) {
    const sparkleCount = 25;
    const prideColors = ['#55CDFC', '#F7A8B8', '#FFFFFF'];
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkleCount + time * 1.5;
      const distance = shape.size + 25 + Math.sin(time * 3 + i) * 20;
      const sparkleSize = 3 + Math.sin(time * 5 + i) * 2;
      const colorIndex = (i + Math.floor(time * 5)) % prideColors.length;
      
      ctx.fillStyle = prideColors[colorIndex];
      ctx.shadowBlur = 10;
      ctx.shadowColor = prideColors[colorIndex];
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        sparkleSize, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  /**
   * Enhanced particle renderer for rare destruction effects
   */
  static renderEnhancedParticle(ctx, particle) {
    ctx.save();
    ctx.globalAlpha = particle.lifetime;

    // Special effects for rare particles
    if (particle.rarity === 'rainbow') {
      // Rainbow particle with trail
      if (particle.trail) {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.vx * 3, particle.y - particle.vy * 3);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
      }
      
      // Rainbow cycling color
      const hue = (Date.now() * 0.1 + particle.x) % 360;
      particle.color = `hsl(${hue}, 100%, 60%)`;
      
      if (particle.glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
      }
      
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
    } else if (particle.rarity === 'transgender') {
      // Transgender pride particle effects
      const prideColors = ['#55CDFC', '#F7A8B8', '#FFFFFF'];
      const colorIndex = Math.floor(Date.now() * 0.005 + particle.x * 0.01) % prideColors.length;
      particle.color = prideColors[colorIndex];
      
      if (particle.shadowAura) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
      }
      
      if (particle.spiralMotion) {
        // Create spiral motion
        const spiral = Math.sin(Date.now() * 0.01 + particle.x * 0.1) * 3;
        particle.x += spiral;
        particle.y += spiral;
      }
      
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
    } else {
      // Standard particle rendering for other rarities
      if (particle.glow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
      }
      
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Helper: Draw polygon
   */
  drawPolygon(ctx, sides, size) {
    if (sides === 4) {
      ctx.rect(-size, -size, size * 2, size * 2);
      return;
    }
    
    const angle = (Math.PI * 2) / sides;
    ctx.beginPath();
    
    for (let i = 0; i < sides; i++) {
      const x = Math.cos(angle * i - Math.PI / 2) * size;
      const y = Math.sin(angle * i - Math.PI / 2) * size;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
  }

  /**
   * Helper: Lighten color
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
   * Helper: Darken color
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
   * Helper: Convert hex to rgba
   */
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShapeSystem;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
  window.ShapeSystem = ShapeSystem;
  window.EnhancedShapeVisuals = EnhancedShapeVisuals;
  
  // Global flag to indicate enhanced visuals are ready
  window.enhancedShapeVisualsReady = true;
  
  console.log('🌟 Complete Enhanced Shape System loaded!');
  console.log('✨ Ultra-rare shapes with enhanced visual properties');
  console.log('🎨 Rainbow and Transgender shapes will display spectacular effects!');
  console.log('🔧 Enhanced particle systems activated for rare destruction effects!');
  console.log('🎯 All visual enhancements built in and ready!');
}