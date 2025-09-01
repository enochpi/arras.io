/**
 * Enhanced Projectile System
 */

class Projectile {
  constructor(id, ownerId, position, velocity, damage = 20) {
    this.id = id;
    this.ownerId = ownerId;
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.damage = damage;
    this.lifetime = 2000; // 2 seconds
    this.createdAt = Date.now();
  }

  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    
    // Check if projectile has expired
    return (Date.now() - this.createdAt) < this.lifetime;
  }

  isOutOfBounds(worldWidth, worldHeight) {
    return this.position.x < -50 || 
           this.position.x > worldWidth + 50 ||
           this.position.y < -50 || 
           this.position.y > worldHeight + 50;
  }

  getClientData() {
    return {
      id: this.id,
      position: { ...this.position },
      velocity: { ...this.velocity },
      damage: this.damage,
      ownerId: this.ownerId
    };
  }
}

class ProjectileSystem {
  constructor() {
    this.projectiles = new Map();
    this.nextProjectileId = 1;
  }

  shoot(player, targetPos) {
    if (!player || !targetPos) return null;

    // Calculate direction
    const dx = targetPos.x - player.position.x;
    const dy = targetPos.y - player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return null;

    // Normalize and apply speed
    const projectileSpeed = 600;
    const velocity = {
      x: (dx / distance) * projectileSpeed,
      y: (dy / distance) * projectileSpeed
    };

    // Create projectile slightly in front of player
    const spawnDistance = 35;
    const spawnPos = {
      x: player.position.x + (dx / distance) * spawnDistance,
      y: player.position.y + (dy / distance) * spawnDistance
    };

    // Apply damage multiplier from player level
    const damage = 20 * (player.damageMultiplier || 1);

    const projectile = new Projectile(
      `proj_${this.nextProjectileId++}`,
      player.id,
      spawnPos,
      velocity,
      damage
    );

    this.projectiles.set(projectile.id, projectile);
    return projectile;
  }

  update(deltaTime, worldWidth, worldHeight) {
    const toRemove = [];

    this.projectiles.forEach((projectile, id) => {
      // Update projectile position
      if (!projectile.update(deltaTime)) {
        toRemove.push(id);
      }
      
      // Remove if out of bounds
      if (projectile.isOutOfBounds(worldWidth, worldHeight)) {
        toRemove.push(id);
      }
    });

    // Remove expired projectiles
    toRemove.forEach(id => this.projectiles.delete(id));
  }

  removeProjectile(id) {
    this.projectiles.delete(id);
  }

  getAllProjectiles() {
    const projectilesData = {};
    this.projectiles.forEach((projectile, id) => {
      projectilesData[id] = projectile.getClientData();
    });
    return projectilesData;
  }

  clear() {
    this.projectiles.clear();
  }
}

module.exports = { ProjectileSystem, Projectile };
