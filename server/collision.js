/**
 * Collision System with spatial partitioning
 */

class CollisionSystem {
  constructor() {
    this.cellSize = 200; // Size of spatial grid cells
  }

  checkCollisions(projectileSystem, players, shapeSystem, worldWidth, worldHeight) {
    const collisions = [];
    
    // Create spatial grid
    const grid = this.createSpatialGrid(
      projectileSystem.projectiles,
      players,
      shapeSystem.shapes,
      worldWidth,
      worldHeight
    );
    
    // Check projectile-player collisions
    projectileSystem.projectiles.forEach(projectile => {
      const nearbyEntities = this.getNearbyEntities(grid, projectile.position);
      
      // Check against players
      nearbyEntities.players.forEach(player => {
        if (player.id !== projectile.ownerId && this.checkCircleCollision(
          projectile.position, 5,
          player.position, 20
        )) {
          collisions.push({
            type: 'projectile-player',
            projectile: projectile,
            player: player
          });
        }
      });
      
      // Check against shapes
      nearbyEntities.shapes.forEach(shape => {
        if (this.checkCircleCollision(
          projectile.position, 5,
          shape.position, shape.size
        )) {
          collisions.push({
            type: 'projectile-shape',
            projectile: projectile,
            shape: shape
          });
        }
      });
    });
    
    // Check player-shape collisions
    players.forEach(player => {
      const nearbyShapes = this.getNearbyEntities(grid, player.position).shapes;
      
      nearbyShapes.forEach(shape => {
        if (this.checkCircleCollision(
          player.position, 20,
          shape.position, shape.size
        )) {
          collisions.push({
            type: 'player-shape',
            player: player,
            shape: shape
          });
        }
      });
    });
    
    return collisions;
  }

  createSpatialGrid(projectiles, players, shapes, worldWidth, worldHeight) {
    const grid = {};
    
    // Helper to get grid key
    const getGridKey = (x, y) => {
      const gridX = Math.floor(x / this.cellSize);
      const gridY = Math.floor(y / this.cellSize);
      return `${gridX},${gridY}`;
    };
    
    // Add players to grid
    players.forEach(player => {
      const key = getGridKey(player.position.x, player.position.y);
      if (!grid[key]) grid[key] = { players: [], shapes: [], projectiles: [] };
      grid[key].players.push(player);
    });
    
    // Add shapes to grid
    shapes.forEach(shape => {
      const key = getGridKey(shape.position.x, shape.position.y);
      if (!grid[key]) grid[key] = { players: [], shapes: [], projectiles: [] };
      grid[key].shapes.push(shape);
    });
    
    // Add projectiles to grid
    projectiles.forEach(projectile => {
      const key = getGridKey(projectile.position.x, projectile.position.y);
      if (!grid[key]) grid[key] = { players: [], shapes: [], projectiles: [] };
      grid[key].projectiles.push(projectile);
    });
    
    return grid;
  }

  getNearbyEntities(grid, position) {
    const entities = { players: [], shapes: [], projectiles: [] };
    
    // Check surrounding cells
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const gridX = Math.floor(position.x / this.cellSize) + dx;
        const gridY = Math.floor(position.y / this.cellSize) + dy;
        const key = `${gridX},${gridY}`;
        
        if (grid[key]) {
          entities.players.push(...grid[key].players);
          entities.shapes.push(...grid[key].shapes);
          entities.projectiles.push(...grid[key].projectiles);
        }
      }
    }
    
    return entities;
  }

  checkCircleCollision(pos1, radius1, pos2, radius2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius1 + radius2;
  }

  processCollisions(collisions, projectileSystem, players, shapeSystem) {
    const results = [];
    
    collisions.forEach(collision => {
      if (collision.type === 'projectile-player') {
        const killed = collision.player.takeDamage(collision.projectile.damage);
        projectileSystem.removeProjectile(collision.projectile.id);
        
        if (killed) {
          // Award XP to shooter
          const shooter = players.get(collision.projectile.ownerId);
          if (shooter) {
            shooter.addXP(100 + collision.player.level * 20);
          }
        }
        
        results.push({
          type: 'player-hit',
          playerId: collision.player.id,
          damage: collision.projectile.damage,
          killed: killed
        });
      } else if (collision.type === 'projectile-shape') {
        const destroyed = shapeSystem.damageShape(collision.shape.id, collision.projectile.damage);
        projectileSystem.removeProjectile(collision.projectile.id);
        
        if (destroyed) {
          // Award XP to shooter
          const shooter = players.get(collision.projectile.ownerId);
          if (shooter) {
            const xpReward = shapeSystem.getShapeXPReward(collision.shape.type);
            shooter.addXP(xpReward);
            
            results.push({
              type: 'shape-destroyed',
              shapeType: collision.shape.type,
              xpAwarded: xpReward
            });
          }
        }
      } else if (collision.type === 'player-shape') {
        // Push player away from shape
        const dx = collision.player.position.x - collision.shape.position.x;
        const dy = collision.player.position.y - collision.shape.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const pushForce = 5;
          collision.player.velocity.x += (dx / distance) * pushForce;
          collision.player.velocity.y += (dy / distance) * pushForce;
        }
      }
    });
    
    return results;
  }
}

module.exports = CollisionSystem;
