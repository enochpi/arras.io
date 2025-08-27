/**
 * Collision Detection System
 * Handles all collision detection and resolution
 */

class CollisionSystem {
  constructor() {
    this.playerRadius = 25; // Player tank radius
    this.projectileRadius = 6; // Projectile radius
  }

  /**
   * Check collision between two circular objects
   * @param {Object} obj1 - First object with position and radius
   * @param {Object} obj2 - Second object with position and radius
   * @returns {boolean} True if collision detected
   */
  checkCircleCollision(obj1, obj2) {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (obj1.radius + obj2.radius);
  }

  /**
   * Check projectile collision with all players
   * @param {Map} projectiles - All active projectiles
   * @param {Map} players - All active players
   * @returns {Array} Array of collision events
   */
  checkProjectilePlayerCollisions(projectiles, players) {
    const collisions = [];
    
    for (const [projId, projectile] of projectiles) {
      for (const [playerId, player] of players) {
        // Skip collision with projectile owner
        if (projectile.playerId === playerId) continue;
        
        const projObj = {
          position: projectile.position,
          radius: this.projectileRadius
        };
        
        const playerObj = {
          position: player.position,
          radius: this.playerRadius
        };
        
        if (this.checkCircleCollision(projObj, playerObj)) {
          collisions.push({
            type: 'projectile-player',
            projectileId: projId,
            projectile: projectile,
            playerId: playerId,
            player: player,
            damage: projectile.damage
          });
        }
      }
    }
    
    return collisions;
  }

  /**
   * Process collision and apply effects
   * @param {Object} collision - Collision event data
   * @param {ProjectileSystem} projectileSystem - Projectile manager
   * @returns {Object} Collision result
   */
  processCollision(collision, projectileSystem) {
    const result = {
      playerHit: false,
      playerKilled: false,
      scoreAwarded: 0,
      shooterId: null
    };
    
    if (collision.type === 'projectile-player') {
      const { player, projectile, projectileId } = collision;
      
      // Apply damage to player
      player.health -= collision.damage;
      result.playerHit = true;
      result.shooterId = projectile.playerId;
      
      // Check if player was killed
      if (player.health <= 0) {
        player.health = 0;
        result.playerKilled = true;
        result.scoreAwarded = 100; // Points for kill
      }
      
      // Remove the projectile
      projectileSystem.removeProjectile(projectileId);
    }
    
    return result;
  }

  /**
   * Handle all collisions for this frame
   * @param {ProjectileSystem} projectileSystem - Projectile manager
   * @param {Map} players - All players
   * @returns {Array} Array of collision results
   */
  handleAllCollisions(projectileSystem, players) {
    const results = [];
    
    // Check projectile-player collisions
    const collisions = this.checkProjectilePlayerCollisions(
      projectileSystem.projectiles, 
      players
    );
    
    // Process each collision
    for (const collision of collisions) {
      const result = this.processCollision(collision, projectileSystem);
      results.push({
        ...result,
        hitPlayerId: collision.playerId,
        shooterPlayerId: collision.projectile.playerId
      });
    }
    
    return results;
  }

  /**
   * Award score to shooter for successful hits
   * @param {Array} collisionResults - Results from collision processing
   * @param {Map} players - All players
   */
  awardScores(collisionResults, players) {
    for (const result of collisionResults) {
      if (result.scoreAwarded > 0 && result.shooterPlayerId) {
        const shooter = players.get(result.shooterPlayerId);
        if (shooter) {
          shooter.score += result.scoreAwarded;
          
          // Level up check (every 500 points)
          const newLevel = Math.floor(shooter.score / 500) + 1;
          if (newLevel > shooter.level) {
            shooter.level = newLevel;
            shooter.maxHealth += 10; // Bonus health per level
            shooter.health = shooter.maxHealth; // Full heal on level up
          }
        }
      }
    }
  }
}

module.exports = CollisionSystem;
