/**
 * Enhanced Collision Detection System
 * Handles projectile collisions with boundaries, players, and shapes
 */

class CollisionSystem {
  constructor() {
    this.playerRadius = 25;
    this.projectileRadius = 8;
  }

  /**
   * Check if two circles collide
   */
  checkCircleCollision(obj1, obj2) {
    if (!obj1.position || !obj2.position) return false;
    
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < (obj1.radius + obj2.radius);
  }

  /**
   * Check projectile collision with world boundaries
   */
  checkBoundaryCollision(projectile, worldWidth, worldHeight) {
    if (!projectile.position) return false;
    
    const pos = projectile.position;
    const radius = projectile.size;
    
    return (pos.x - radius <= 0 || pos.x + radius >= worldWidth ||
            pos.y - radius <= 0 || pos.y + radius >= worldHeight);
  }

  /**
   * Check all projectile collisions (players, shapes, boundaries)
   */
  checkCollisions(projectileSystem, players, shapeSystem, worldWidth, worldHeight) {
    const collisions = [];
    
    if (!projectileSystem || !projectileSystem.projectiles) return collisions;
    
    for (const [projId, projectile] of projectileSystem.projectiles) {
      if (!projectile) continue;
      
      // Check boundary collisions
      if (this.checkBoundaryCollision(projectile, worldWidth, worldHeight)) {
        collisions.push({
          type: 'boundary',
          projectileId: projId
        });
        continue;
      }
      
      // Check player collisions (skip owner)
      if (players && players.size > 0) {
        for (const [playerId, player] of players) {
          if (projectile.owner === playerId || !player) continue;
          
          const playerPos = player.position || { x: player.x || 0, y: player.y || 0 };
          
          const projObj = {
            position: projectile.position,
            radius: this.projectileRadius
          };
          
          const playerObj = {
            position: playerPos,
            radius: this.playerRadius
          };
          
          if (this.checkCircleCollision(projObj, playerObj)) {
            collisions.push({
              type: 'player-hit',
              projectileId: projId,
              playerId: playerId,
              damage: projectile.damage,
              shooterId: projectile.owner
            });
          }
        }
      }
      
      // Check shape collisions
      if (shapeSystem && shapeSystem.shapes) {
        for (const [shapeId, shape] of shapeSystem.shapes) {
          if (!shape) continue;
          
          const projObj = {
            position: projectile.position,
            radius: this.projectileRadius
          };
          
          const shapeObj = {
            position: shape.position,
            radius: shape.size
          };
          
          if (this.checkCircleCollision(projObj, shapeObj)) {
            collisions.push({
              type: 'shape-hit',
              projectileId: projId,
              shapeId: shapeId,
              damage: projectile.damage,
              shooterId: projectile.owner
            });
          }
        }
      }
    }
    
    return collisions;
  }

  /**
   * Process collision events
   */
  processCollisions(collisions, projectileSystem, players, shapeSystem) {
    const results = [];
    
    if (!collisions || !projectileSystem) return results;
    
    for (const collision of collisions) {
      if (collision.type === 'boundary') {
        projectileSystem.remove(collision.projectileId);
        results.push({ 
          type: 'boundary-hit', 
          projectileId: collision.projectileId 
        });
      }
      
      if (collision.type === 'player-hit' && players) {
        const player = players.get(collision.playerId);
        const shooter = players.get(collision.shooterId);
        
        if (player && shooter && typeof player.takeDamage === 'function') {
          const killed = player.takeDamage(collision.damage);
          const points = killed ? 100 : 25;
          
          if (typeof shooter.addScore === 'function') {
            shooter.addScore(points);
          }
          
          projectileSystem.remove(collision.projectileId);
          
          results.push({
            type: 'player-hit',
            playerId: collision.playerId,
            shooterId: collision.shooterId,
            damage: collision.damage,
            killed: killed,
            points: points
          });
        }
      }
      
      if (collision.type === 'shape-hit' && shapeSystem) {
        const shape = shapeSystem.getShape(collision.shapeId);
        const shooter = players ? players.get(collision.shooterId) : null;
        
        if (shape && shooter) {
          const destroyed = shape.takeDamage(collision.damage);
          
          if (destroyed) {
            // Award XP to shooter
            if (typeof shooter.addScore === 'function') {
              shooter.addScore(shape.xpReward);
            }
            
            // Remove destroyed shape
            shapeSystem.removeShape(collision.shapeId);
            
            results.push({
              type: 'shape-destroyed',
              shapeId: collision.shapeId,
              shooterId: collision.shooterId,
              xpAwarded: shape.xpReward,
              shapeType: shape.type
            });
          } else {
            results.push({
              type: 'shape-damaged',
              shapeId: collision.shapeId,
              shooterId: collision.shooterId,
              damage: collision.damage,
              remainingHealth: shape.health
            });
          }
          
          // Remove projectile
          projectileSystem.remove(collision.projectileId);
        }
      }
    }
    
    return results;
  }
}

module.exports = CollisionSystem;
