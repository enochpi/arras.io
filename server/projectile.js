/**
 * Projectile System
 * Handles bullet creation, movement, and lifecycle
 */

class Projectile {
  constructor(id, owner, startPos, direction, stats = {}) {
    this.id = id;
    this.owner = owner; // Player ID who shot this
    this.position = { x: startPos.x, y: startPos.y };
    this.direction = direction; // Angle in radians
    
    // Calculate velocity from direction and speed
    const bulletSpeed = stats.bulletSpeed || 5; // Default bullet speed
    const speed = bulletSpeed * 100; // Convert to pixels/second
    this.velocity = {
      x: Math.cos(direction) * speed,
      y: Math.sin(direction) * speed
    };
    
    this.damage = stats.bulletDamage || 25; // Default damage
    this.size = 8; // Bullet radius
    this.color = '#FFD700'; // Gold bullets
    this.maxAge = 2500; // 2.5 seconds lifetime
    this.createdAt = Date.now();
  }

  /**
   * Update projectile position
   * @param {number} deltaTime - Time since last update (seconds)
   */
  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  /**
   * Check if projectile should be removed
   * @param {number} worldWidth - World boundary
   * @param {number} worldHeight - World boundary
   * @returns {boolean} True if should be removed
   */
  shouldRemove(worldWidth, worldHeight) {
    const age = Date.now() - this.createdAt;
    
    // Remove if expired
    if (age > this.maxAge) return true;
    
    // Remove if out of bounds
    const margin = 50;
    if (this.position.x < -margin || this.position.x > worldWidth + margin) return true;
    if (this.position.y < -margin || this.position.y > worldHeight + margin) return true;
    
    return false;
  }

  /**
   * Get data for client rendering
   */
  getClientData() {
    return {
      id: this.id,
      position: this.position,
      size: this.size,
      color: this.color,
      owner: this.owner
    };
  }
}

class ProjectileSystem {
  constructor() {
    this.projectiles = new Map();
    this.nextId = 1;
  }

  /**
   * Create new projectile
   * @param {Player} player - Shooting player
   * @param {Object} mousePos - Target mouse position
   * @returns {Projectile} Created projectile
   */
  shoot(player, mousePos) {
    if (!mousePos || !player) return null;
    
    // Ensure player has position
    const playerPos = player.position || { x: player.x || 0, y: player.y || 0 };
    
    // Calculate shooting direction
    const dx = mousePos.x - 400; // Screen center offset
    const dy = mousePos.y - 400;
    const direction = Math.atan2(dy, dx);
    
    // Get player stats or use defaults
    const stats = player.stats || {
      bulletSpeed: 5,
      bulletDamage: 25
    };
    
    const projectile = new Projectile(
      this.nextId++,
      player.id,
      playerPos,
      direction,
      stats
    );
    
    this.projectiles.set(projectile.id, projectile);
    return projectile;
  }

  /**
   * Update all projectiles
   * @param {number} deltaTime - Time delta in seconds
   * @param {number} worldWidth - World boundary
   * @param {number} worldHeight - World boundary
   */
  update(deltaTime, worldWidth, worldHeight) {
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
   * Remove projectile by ID
   * @param {number} projectileId - ID to remove
   */
  remove(projectileId) {
    this.projectiles.delete(projectileId);
  }

  /**
   * Get projectile by ID
   * @param {number} projectileId - ID to get
   * @returns {Projectile|undefined} The projectile or undefined
   */
  get(projectileId) {
    return this.projectiles.get(projectileId);
  }
}

module.exports = { Projectile, ProjectileSystem };
