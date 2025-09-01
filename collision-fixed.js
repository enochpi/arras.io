/**
 * Fixed Collision Detection System
 * Works with single-player game without server dependencies
 * Fixes the missing ShapeSystem integration issue
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
        collisions.push({
          type: 'player-shape',
          player: player,
          shapeIndex: i,
          shape: shape,
          damage: shape.damage || 5
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
      xpAwarded: 0
    };
    
    switch(collision.type) {
      case 'projectile-shape':
        // Apply damage to shape
        collision.shape.health -= collision.damage;
        result.damage = collision.damage;
        
        // Check if shape was destroyed
        if (collision.shape.health <= 0) {
          result.destroyed = true;
          result.xpAwarded = collision.shape.xp;
          
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
          
          // Push player away from shape
          const dx = collision.player.x - collision.shape.x;
          const dy = collision.player.y - collision.shape.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const pushForce = 5;
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
          results.push(result);
        }
      }
    }
    
    return results;
  }

  /**
   * Create particle effects for collisions
   * @param {Object} collision - Collision data
   * @param {Array} particles - Particles array to add to
   */
  createCollisionParticles(collision, particles) {
    if (!particles) return;
    
    switch(collision.type) {
      case 'projectile-shape':
        // Create explosion particles
        const shape = collision.shape;
        const particleCount = collision.destroyed ? 10 : 3;
        
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: shape.x,
            y: shape.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: shape.color,
            size: Math.random() * 5 + 2,
            lifetime: 1
          });
        }
        break;
        
      case 'player-shape':
        // Create collision particles
        const collisionX = (collision.player.x + collision.shape.x) / 2;
        const collisionY = (collision.player.y + collision.shape.y) / 2;
        
        for (let i = 0; i < 5; i++) {
          particles.push({
            x: collisionX,
            y: collisionY,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: '#FF0000',
            size: Math.random() * 3 + 1,
            lifetime: 1
          });
        }
        break;
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
      
      // Don't spawn too close to player
      if (distance < 200) return false;
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
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollisionSystem;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
  window.CollisionSystem = CollisionSystem;
}