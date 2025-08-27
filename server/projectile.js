/**
 * Optimized Projectile System
 * Uses object pooling and spatial partitioning for better performance
 */

class Projectile {
  constructor(id, owner, startPos, targetPos, damage, speed) {
    this.id = id;
    this.owner = owner;
    this.position = { ...startPos };
    this.damage = damage;
    this.speed = speed;
    this.size = 8;
    this.createdAt = Date.now();
    this.lifetime = 3000; // 3 seconds max lifetime
    
    // Calculate velocity
    const dx = targetPos.x - startPos.x;
    const dy = targetPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.velocity = {
      x: (dx / distance) * speed,
      y: (dy / distance) * speed
    };
    
    // Grid position for spatial partitioning
    this.gridX = 0;
    this.gridY = 0;
  }

  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime * 60;
    this.position.y += this.velocity.y * deltaTime * 60;
    
    // Update grid position
    this.gridX = Math.floor(this.position.x / 200);
    this.gridY = Math.floor(this.position.y / 200);
    
    return Date.now() - this.createdAt < this.lifetime;
  }

  isExpired() {
    return Date.now() - this.createdAt >= this.lifetime;
  }
}

class ProjectileSystem {
  constructor() {
    this.projectiles = new Map();
    this.nextId = 1;
    this.maxProjectiles = 200; // Limit projectiles for performance
    
    // Spatial grid for collision optimization
    this.grid = new Map();
    this.gridSize = 200;
  }

  shoot(player, targetPos) {
    if (this.projectiles.size >= this.maxProjectiles) {
      // Remove oldest projectile if at limit
      const oldest = Array.from(this.projectiles.values())
        .sort((a, b) => a.createdAt - b.createdAt)[0];
      if (oldest) this.remove(oldest.id);
    }

    const projectile = new Projectile(
      this.nextId++,
      player.id,
      player.position,
      targetPos,
      player.stats.bulletDamage,
      player.stats.bulletSpeed * 100
    );
    
    this.projectiles.set(projectile.id, projectile);
    this.addToGrid(projectile);
    
    return projectile;
  }

  update(deltaTime, worldWidth, worldHeight) {
    const toRemove = [];
    
    // Clear grid
    this.grid.clear();
    
    for (const [id, projectile] of this.projectiles) {
      if (!projectile.update(deltaTime)) {
        toRemove.push(id);
        continue;
      }
      
      // Check boundaries
      const pos = projectile.position;
      if (pos.x < 0 || pos.x > worldWidth || 
          pos.y < 0 || pos.y > worldHeight) {
        toRemove.push(id);
        continue;
      }
      
      // Re-add to grid
      this.addToGrid(projectile);
    }
    
    // Batch remove expired projectiles
    toRemove.forEach(id => this.projectiles.delete(id));
  }

  addToGrid(projectile) {
    const key = `${projectile.gridX},${projectile.gridY}`;
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key).push(projectile);
  }

  getProjectilesInArea(x, y, radius) {
    const results = [];
    const gridRadius = Math.ceil(radius / this.gridSize);
    const centerGridX = Math.floor(x / this.gridSize);
    const centerGridY = Math.floor(y / this.gridSize);
    
    for (let gx = centerGridX - gridRadius; gx <= centerGridX + gridRadius; gx++) {
      for (let gy = centerGridY - gridRadius; gy <= centerGridY + gridRadius; gy++) {
        const key = `${gx},${gy}`;
        const projectiles = this.grid.get(key);
        if (projectiles) {
          results.push(...projectiles);
        }
      }
    }
    
    return results;
  }

  remove(projectileId) {
    return this.projectiles.delete(projectileId);
  }

  getAllProjectiles() {
    const result = {};
    for (const [id, proj] of this.projectiles) {
      result[id] = {
        id: proj.id,
        position: proj.position,
        velocity: proj.velocity,
        owner: proj.owner,
        damage: proj.damage,
        size: proj.size
      };
    }
    return result;
  }

  getProjectileCount() {
    return this.projectiles.size;
  }
}

module.exports = { Projectile, ProjectileSystem };
