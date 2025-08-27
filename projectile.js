/**
 * Projectile System
 * Handles bullet creation, movement, and lifecycle management
 */

class Projectile {
  constructor(id, playerId, startPos, targetPos, playerColor) {
    this.id = id;
    this.playerId = playerId;
    this.position = { x: startPos.x, y: startPos.y };
    
    // Calculate direction and velocity
    const angle = Math.atan2(
      targetPos.y - 400, // Screen center offset
      targetPos.x - 400
    );
    
    this.velocity = {
      x: Math.cos(angle) * 500, // 500 pixels/second
      y: Math.sin(angle) * 500
    };
    
    this.damage = 25;
    this.size = 6;
    this.color = playerColor;
    this.maxLifetime = 3000; // 3 seconds
    this.createdAt = Date.now();
  }

  /**
   * Update projectile position
   * @param {number} deltaTime - Time since last update (ms)
   */
  update(deltaTime) {
    const deltaSeconds = deltaTime / 1000;
    
    this.position.x += this.velocity.x * deltaSeconds;
    this.position.y += this.velocity.y * deltaSeconds;
  }

  /**
   * Check if projectile should be removed
   * @param {number} worldWidth - World boundary
   * @param {number} worldHeight - World boundary
   * @returns {boolean} True if should be removed
   */
  shouldRemove(worldWidth, worldHeight) {
    const age = Date.now() - this.createdAt;
    
    // Remove if too old
    if (age > this.maxLifetime) return true;
    
    // Remove if out of bounds
    if (this.position.x < 0 || this.position.x > worldWidth) return true;
    if (this.position.y < 0 || this.position.y > worldHeight) return true;
    
    return false;
  }

  /**
   * Get client data for networking
   */
  getClientData() {
    return {
      id: this.id,
      position: this.position,
      size: this.size,
      color: this.color,
      playerId: this.playerId
    };
  }
}

class ProjectileSystem {
  constructor() {
    this.projectiles = new Map();
    this.nextId = 1;
  }

  /**
   * Create new projectile from player
   * @param {Player} player - Shooting player
   * @param {Object} targetPos - Mouse position
   * @returns {Projectile} Created projectile
   */
  createProjectile(player, targetPos) {
    const projectile = new Projectile(
      this.nextId++,
      player.id,
      player.position,
      targetPos,
      player.color
    );
    
    this.projectiles.set(projectile.id, projectile);
    return projectile;
  }

  /**
   * Update all projectiles
   * @param {number} deltaTime - Time delta
   * @param {number} worldWidth - World boundary
   * @param {number} worldHeight - World boundary
   */
  updateProjectiles(deltaTime, worldWidth, worldHeight) {
    for (const [id, projectile] of this.projectiles) {
      projectile.update(deltaTime);
      
      if (projectile.shouldRemove(worldWidth, worldHeight)) {
        this.projectiles.delete(id);
      }
    }
  }

  /**
   * Get all projectiles for client
   */
  getAllProjectiles() {
    const result = {};
    for (const [id, projectile] of this.projectiles) {
      result[id] = projectile.getClientData();
    }
    return result;
  }

  /**
   * Remove specific projectile (for collisions)
   * @param {string} projectileId - ID to remove
   */
  removeProjectile(projectileId) {
    this.projectiles.delete(projectileId);
  }
}

module.exports = { Projectile, ProjectileSystem };
