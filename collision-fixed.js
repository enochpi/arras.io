/**
 * Fixed Collision Detection System
 * Works with single-player game without server dependencies
 * Includes enhanced effects for rare shapes (Green Radiant, Blue Radiant, Shadow)
 */

class CollisionSystem {
  constructor() {
    this.playerRadius = 25; // Player tank radius
    this.projectileRadius = 6; // Projectile radius
  }

  /**
   * Check collision between two circular objects
   * @param {Object} obj1 - First object with position {x, y} and radius
   * @param {Object} obj2 - Second object with position {x, y} and radius
   * @returns {boolean} True if collision detected
   */
  checkCircleCollision(obj1, obj2) {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (obj1.radius + obj2.radius);
  }

  /**
   * Check collision between a point and a circle
   * @param {Object} point - Point with x, y coordinates
   * @param {Object} circle - Circle with position {x, y} and radius
   * @returns {boolean} True if point is inside circle
   */
  checkPointCircleCollision(point, circle) {
    const dx = point.x - circle.position.x;
    const dy = point.y - circle.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < circle.radius;
  }

  /**
   * Check projectile collision with shapes (single-player)
   * @param {Array} projectiles - Array of projectiles
   * @param {Array} shapes - Array of shapes
   * @returns {Array} Array of collision events
   */
  checkProjectileShapeCollisions(projectiles, shapes) {
    const collisions = [];
    
    for (let i = 0; i < projectiles.length; i++) {
      const projectile = projectiles[i];
      
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        
        const projObj = {
          position: { x: projectile.x, y: projectile.y },
          radius: projectile.size || this.projectileRadius
        };
        
        const shapeObj = {
          position: { x: shape.x, y: shape.y },
          radius: shape.size
        };
        
        if (this.checkCircleCollision(projObj, shapeObj)) {
          collisions.push({
            type: 'projectile-shape',
            projectileIndex: i,
            projectile: projectile,
            shapeIndex: j,
            shape: shape,
            damage: projectile.damage
          });
        }
      }
    }
    
    return collisions;
  }

  /**
   * Check player collision with shapes (single-player)
   * @param {Object} player - Player object
   * @param {Array} shapes - Array of shapes
   * @returns {Array} Array of collision events
   */
  checkPlayerShapeCollisions(player, shapes) {
    const collisions = [];
    
    const playerObj = {
      position: { x: player.x, y: player.y },
      radius: this.playerRadius
    };
    
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      
      const shapeObj = {
        position: { x: shape.x, y: shape.y },
        radius: shape.size
      };
      
      if (this.checkCircleCollision(playerObj, shapeObj)) {
        // Increase damage for rare shapes
        let damageMultiplier = 1;
        if (shape.rarity === 'greenRadiant') damageMultiplier = 1.2;
        else if (shape.rarity === 'blueRadiant') damageMultiplier = 1.5;
        else if (shape.rarity === 'shadow') damageMultiplier = 2;
        
        collisions.push({
          type: 'player-shape',
          player: player,
          shapeIndex: i,
          shape: shape,
          damage: (shape.damage || 5) * damageMultiplier
        });
      }
    }
    
    return collisions;
  }

  /**
   * Check projectile collision with player (for multiplayer or AI enemies)
   * @param {Array} projectiles - Array of enemy projectiles
   * @param {Object} player - Player object
   * @returns {Array} Array of collision events
   */
  checkProjectilePlayerCollisions(projectiles, player) {
    const collisions = [];
    
    const playerObj = {
      position: { x: player.x, y: player.y },
      radius: this.playerRadius
    };
    
    for (let i = 0; i < projectiles.length; i++) {
      const projectile = projectiles[i];
      
      // Skip player's own projectiles
      if (projectile.ownerId === player.id) continue;
      
      const projObj = {
        position: { x: projectile.x, y: projectile.y },
        radius: projectile.size || this.projectileRadius
      };
      
      if (this.checkCircleCollision(projObj, playerObj)) {
        collisions.push({
          type: 'projectile-player',
          projectileIndex: i,
          projectile: projectile,
          player: player,
          damage: projectile.damage
        });
      }
    }
    
    return collisions;
  }

  /**
   * Process collision and apply effects (single-player version)
   * @param {Object} collision - Collision event data
   * @param {Object} gameState - Reference to game state for modifications
   * @returns {Object} Collision result
   */
  processCollision(collision, gameState) {
    const result = {
      type: collision.type,
      handled: false,
      destroyed: false,
      damage: 0,
      xpAwarded: 0,
      rarity: 'normal',
      shapeType: null
    };
    
    switch(collision.type) {
      case 'projectile-shape':
        // Apply damage to shape
        collision.shape.health -= collision.damage;
        result.damage = collision.damage;
        result.rarity = collision.shape.rarity || 'normal';
        result.shapeType = collision.shape.type;
        
        // Check if shape was destroyed
        if (collision.shape.health <= 0) {
          result.destroyed = true;
          result.xpAwarded = collision.shape.xp;
          
          // Log rare shape destruction
          if (collision.shape.rarity && collision.shape.rarity !== 'normal') {
            console.log(`💥 Destroyed ${collision.shape.rarity} ${collision.shape.type}! +${collision.shape.xp} points!`);
          }
          
          // Remove the shape
          if (gameState && gameState.shapes) {
            gameState.shapes.splice(collision.shapeIndex, 1);
          }
          
          // Remove the projectile
          if (gameState && gameState.projectiles) {
            gameState.projectiles.splice(collision.projectileIndex, 1);
          }
        } else {
          // Just remove the projectile (it hit but didn't destroy)
          if (gameState && gameState.projectiles) {
            gameState.projectiles.splice(collision.projectileIndex, 1);
          }
        }
        
        result.handled = true;
        break;
        
      case 'player-shape':
        // Player takes damage from collision with shape
        if (gameState && gameState.player) {
          gameState.player.health -= collision.damage;
          result.damage = collision.damage;
          result.rarity = collision.shape.rarity || 'normal';
          
          // Push player away from shape (stronger push for rare shapes)
          const pushMultiplier = collision.shape.rarity === 'shadow' ? 2 : 
                                collision.shape.rarity === 'blueRadiant' ? 1.5 : 
                                collision.shape.rarity === 'greenRadiant' ? 1.2 : 1;
          
          const dx = collision.player.x - collision.shape.x;
          const dy = collision.player.y - collision.shape.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const pushForce = 5 * pushMultiplier;
            collision.player.vx += (dx / distance) * pushForce;
            collision.player.vy += (dy / distance) * pushForce;
          }
        }
        
        result.handled = true;
        break;
        
      case 'projectile-player':
        // Player takes damage from enemy projectile
        if (gameState && gameState.player) {
          gameState.player.health -= collision.damage;
          result.damage = collision.damage;
          
          // Remove the projectile
          if (gameState.projectiles) {
            gameState.projectiles.splice(collision.projectileIndex, 1);
          }
        }
        
        result.handled = true;
        break;
    }
    
    return result;
  }

  /**
   * Handle all collisions for a single frame (single-player)
   * @param {Object} gameState - Current game state
   * @returns {Array} Array of collision results
   */
  handleAllCollisions(gameState) {
    const results = [];
    
    if (!gameState) return results;
    
    // Check projectile-shape collisions
    if (gameState.projectiles && gameState.shapes) {
      const projectileShapeCollisions = this.checkProjectileShapeCollisions(
        gameState.projectiles, 
        gameState.shapes
      );
      
      // Process from end to start to avoid index issues when removing
      for (let i = projectileShapeCollisions.length - 1; i >= 0; i--) {
        const collision = projectileShapeCollisions[i];
        const result = this.processCollision(collision, gameState);
        
        if (result.handled) {
          // Store shape info for particle effects
          result.shape = collision.shape;
          results.push(result);
          
          // Award XP to player if shape was destroyed
          if (result.destroyed && result.xpAwarded > 0 && gameState.player) {
            gameState.player.xp += result.xpAwarded;
            gameState.player.score += result.xpAwarded * 10;
          }
        }
      }
    }
    
    // Check player-shape collisions
    if (gameState.player && gameState.shapes) {
      const playerShapeCollisions = this.checkPlayerShapeCollisions(
        gameState.player, 
        gameState.shapes
      );
      
      for (const collision of playerShapeCollisions) {
        const result = this.processCollision(collision, gameState);
        if (result.handled) {
          result.shape = collision.shape;
          results.push(result);
        }
      }
    }
    
    return results;
  }

  /**
   * Create particle effects for collisions with rare shape support
   * @param {Object} collision - Collision data
   * @param {Array} particles - Particles array to add to
   */
  createCollisionParticles(collision, particles) {
    if (!particles) return;
    
    switch(collision.type) {
      case 'projectile-shape':
        const shape = collision.shape;
        if (!shape) return;
        
        // Determine particle count and properties based on rarity
        let particleCount = collision.destroyed ? 10 : 3;
        let particleSpeed = 5;
        let particleSize = { min: 2, max: 5 };
        let glowEffect = false;
        
        if (shape.rarity === 'greenRadiant') {
          particleCount = collision.destroyed ? 20 : 6;
          particleSpeed = 7;
          particleSize = { min: 3, max: 7 };
          glowEffect = true;
        } else if (shape.rarity === 'blueRadiant') {
          particleCount = collision.destroyed ? 30 : 10;
          particleSpeed = 9;
          particleSize = { min: 4, max: 9 };
          glowEffect = true;
        } else if (shape.rarity === 'shadow') {
          particleCount = collision.destroyed ? 40 : 15;
          particleSpeed = 11;
          particleSize = { min: 5, max: 11 };
          glowEffect = true;
        }
        
        // Create explosion particles
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
          const speed = particleSpeed * (0.5 + Math.random() * 0.5);
          
          const particle = {
            x: shape.x,
            y: shape.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: shape.particleColor || shape.color,
            size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min,
            lifetime: 1,
            glow: glowEffect,
            rarity: shape.rarity,
            fadeRate: shape.rarity === 'shadow' ? 0.01 : shape.rarity === 'blueRadiant' ? 0.015 : 0.02
          };
          
          // Add special effects for rare shapes
          if (shape.rarity === 'greenRadiant') {
            particle.trail = true;
            particle.pulseRate = 0.1;
          } else if (shape.rarity === 'blueRadiant') {
            particle.trail = true;
            particle.sparkle = true;
            particle.pulseRate = 0.08;
          } else if (shape.rarity === 'shadow') {
            particle.trail = true;
            particle.shadowAura = true;
            particle.spiralMotion = true;
          }
          
          particles.push(particle);
        }
        
        // Add extra burst effect for destroyed rare shapes
        if (collision.destroyed && shape.rarity !== 'normal') {
          // Create ring explosion
          const ringParticles = 20;
          for (let i = 0; i < ringParticles; i++) {
            const angle = (Math.PI * 2 * i) / ringParticles;
            particles.push({
              x: shape.x,
              y: shape.y,
              vx: Math.cos(angle) * particleSpeed * 1.5,
              vy: Math.sin(angle) * particleSpeed * 1.5,
              color: shape.glowColor || shape.particleColor,
              size: 2,
              lifetime: 1,
              glow: true,
              ring: true,
              fadeRate: 0.03
            });
          }
        }
        break;
        
      case 'player-shape':
        // Create collision particles with enhanced effects for rare shapes
        const collisionShape = collision.shape;
        if (!collisionShape) return;
        
        const collisionX = (collision.player.x + collisionShape.x) / 2;
        const collisionY = (collision.player.y + collisionShape.y) / 2;
        
        let impactParticles = 5;
        let impactColor = '#FF0000';
        
        if (collisionShape.rarity === 'greenRadiant') {
          impactParticles = 8;
          impactColor = '#FFFF00'; // Yellow impact
        } else if (collisionShape.rarity === 'blueRadiant') {
          impactParticles = 12;
          impactColor = '#00FFFF'; // Cyan impact
        } else if (collisionShape.rarity === 'shadow') {
          impactParticles = 16;
          impactColor = '#FF00FF'; // Magenta impact
        }
        
        for (let i = 0; i < impactParticles; i++) {
          particles.push({
            x: collisionX,
            y: collisionY,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: impactColor,
            size: Math.random() * 4 + 1,
            lifetime: 1,
            glow: collisionShape.rarity !== 'normal',
            fadeRate: 0.03
          });
        }
        break;
    }
  }

  /**
   * Update particle effects with enhanced behavior for rare particles
   * @param {Array} particles - Array of particles to update
   * @param {number} deltaTime - Time since last frame
   */
  updateParticles(particles, deltaTime) {
    if (!particles) return;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply special motion effects
      if (particle.spiralMotion) {
        const angle = Math.atan2(particle.vy, particle.vx);
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const newAngle = angle + 0.1;
        particle.vx = Math.cos(newAngle) * speed * 0.98;
        particle.vy = Math.sin(newAngle) * speed * 0.98;
      } else {
        // Normal friction
        particle.vx *= 0.98;
        particle.vy *= 0.98;
      }
      
      // Update lifetime
      particle.lifetime -= particle.fadeRate || 0.02;
      
      // Update size (shrink over time)
      particle.size *= 0.98;
      
      // Pulse effect for radiant particles
      if (particle.pulseRate) {
        particle.size *= (1 + Math.sin(Date.now() * particle.pulseRate) * 0.1);
      }
      
      // Remove dead particles
      if (particle.lifetime <= 0 || particle.size < 0.1) {
        particles.splice(i, 1);
      }
    }
  }

  /**
   * Check if position is safe (no collisions)
   * Used for spawning objects
   * @param {Object} position - Position to check {x, y}
   * @param {number} radius - Radius of object to spawn
   * @param {Array} shapes - Array of existing shapes
   * @param {Object} player - Player object
   * @returns {boolean} True if position is safe
   */
  isPositionSafe(position, radius, shapes, player) {
    // Check distance from player
    if (player) {
      const dx = position.x - player.x;
      const dy = position.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Don't spawn too close to player (extra distance for rare shapes)
      const minDistance = radius > 40 ? 300 : 200; // Larger safe zone for big shapes
      if (distance < minDistance) return false;
    }
    
    // Check distance from other shapes
    if (shapes) {
      for (const shape of shapes) {
        const dx = position.x - shape.x;
        const dy = position.y - shape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < radius + shape.size + 20) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Get damage multiplier based on shape rarity
   * @param {string} rarity - Shape rarity type
   * @returns {number} Damage multiplier
   */
  getRarityDamageMultiplier(rarity) {
    switch(rarity) {
      case 'greenRadiant': return 1.2;
      case 'blueRadiant': return 1.5;
      case 'shadow': return 2.0;
      default: return 1.0;
    }
  }

  /**
   * Get score multiplier based on shape rarity
   * @param {string} rarity - Shape rarity type
   * @returns {Object} Score multiplier range {min, max}
   */
  getRarityScoreMultiplier(rarity) {
    switch(rarity) {
      case 'greenRadiant': return { min: 75, max: 150 };
      case 'blueRadiant': return { min: 500, max: 1000 };
      case 'shadow': return { min: 1000, max: 1500 };
      default: return { min: 1, max: 1 };
    }
  }
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollisionSystem;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
  window.CollisionSystem = CollisionSystem;
}