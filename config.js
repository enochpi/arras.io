/**
 * Game Configuration File - EXPANDED to 10000x10000 World!
 * Resolves server/client mismatch by establishing single-player mode as default
 * 
 * This file centralizes all game configuration to prevent conflicts between
 * different implementations (game.js, server.js, server/server.js)
 */

// ==================== GAME MODE CONFIGURATION ====================
const GAME_CONFIG = {
  // Game mode: 'single-player' or 'multiplayer'
  // This determines whether the game runs standalone or needs a server
  MODE: 'single-player',
  
  // ==================== WORLD CONFIGURATION ====================
  WORLD: {
    // MASSIVE WORLD SIZE - 10000x10000 for epic gameplay!
    WIDTH: 10000,
    HEIGHT: 10000,
    GRID_SIZE: 100,  // Increased grid size for better performance at this scale
    
    // Boundary settings
    BOUNDARY_DAMAGE: 5,      // Damage when hitting world edge
    BOUNDARY_PUSH_FORCE: 10  // Push back force from boundaries
  },
  
  // ==================== PLAYER CONFIGURATION ====================
  PLAYER: {
    // Starting stats
    DEFAULT_SIZE: 30,
    DEFAULT_SPEED: 4,        // Slightly faster for the larger world
    DEFAULT_HEALTH: 100,
    DEFAULT_REGEN_RATE: 0.1,
    
    // Spawn settings
    SPAWN_PROTECTION_TIME: 3000, // 3 seconds of invulnerability
    RESPAWN_DELAY: 3000,         // 3 seconds before respawn
    
    // Level system
    XP_PER_LEVEL: 100,
    UPGRADE_POINTS_PER_LEVEL: 1,
    HEALTH_BONUS_PER_LEVEL: 10,
    SPEED_BONUS_PER_LEVEL: 0.2
  },
  
  // ==================== PROJECTILE CONFIGURATION ====================
  PROJECTILE: {
    DEFAULT_SIZE: 10,
    DEFAULT_SPEED: 10,       // Faster projectiles for larger world
    DEFAULT_DAMAGE: 20,
    DEFAULT_LIFETIME: 3000,  // Longer lifetime for larger distances
    
    // Fire rates (milliseconds between shots)
    FIRE_RATE: {
      NORMAL: 250,
      RAPID: 100,
      SNIPER: 1000
    }
  },
  
  // ==================== SHAPES/ENEMY CONFIGURATION ====================
  SHAPES: {
    MAX_SHAPES: 400,  // Much more shapes for the massive world!
    SPAWN_RATE: 800,  // Faster spawning to populate the large area
    
    // Shape definitions with consistent stats
    TYPES: {
      triangle: {
        sides: 3,
        size: 25,
        health: 30,
        xp: 10,
        color: '#FF6B6B',
        speed: 1.2,      // Slightly faster for more dynamic gameplay
        damage: 5
      },
      square: {
        sides: 4,
        size: 30,
        health: 50,
        xp: 20,
        color: '#FFE66D',
        speed: 1.0,
        damage: 8
      },
      pentagon: {
        sides: 5,
        size: 35,
        health: 80,
        xp: 35,
        color: '#4ECDC4',
        speed: 0.8,
        damage: 10
      },
      hexagon: {
        sides: 6,
        size: 40,
        health: 120,
        xp: 50,
        color: '#A8E6CF',
        speed: 0.6,
        damage: 15
      },
      // NEW: Boss shapes for the expanded world
      octagon: {
        sides: 8,
        size: 60,
        health: 200,
        xp: 100,
        color: '#FF69B4',
        speed: 0.3,
        damage: 25
      },
      decagon: {
        sides: 10,
        size: 80,
        health: 350,
        xp: 200,
        color: '#8A2BE2',
        speed: 0.2,
        damage: 40
      }
    }
  },
  
  // ==================== NETWORK CONFIGURATION ====================
  NETWORK: {
    // Server endpoints (only used in multiplayer mode)
    SERVER_URL: process.env.GAME_SERVER_URL || 'http://localhost:3001',
    
    // Connection settings
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 1000,
    TIMEOUT: 10000,
    
    // Update rates
    CLIENT_UPDATE_RATE: 60,  // FPS for client
    SERVER_TICK_RATE: 30,    // Updates per second from server
    INPUT_SEND_RATE: 30      // Input updates per second to server
  },
  
  // ==================== PERFORMANCE CONFIGURATION ====================
  PERFORMANCE: {
    // Rendering optimizations for massive world
    ENABLE_PARTICLES: true,
    MAX_PARTICLES: 150,      // More particles for epic effects
    ENABLE_SHADOWS: true,
    ENABLE_ANTIALIAS: true,
    
    // Viewport culling margins (critical for 10000x10000 performance)
    CULL_MARGIN: 200,        // Larger culling margin
    RENDER_DISTANCE: 1500,   // Maximum render distance
    
    // FPS limits
    TARGET_FPS: 60,
    MIN_FPS: 30,
    
    // LOD (Level of Detail) settings for massive world
    LOD_DISTANCES: {
      HIGH: 500,    // Full detail within 500 units
      MEDIUM: 1000, // Reduced detail 500-1000 units
      LOW: 1500     // Minimal detail 1000-1500 units
    }
  },
  
  // ==================== UI CONFIGURATION ====================
  UI: {
    // HUD settings
    SHOW_FPS: true,
    SHOW_MINIMAP: true,
    SHOW_LEADERBOARD: true,
    SHOW_CONTROLS: true,
    SHOW_COORDINATES: true,  // Show player coordinates for navigation
    
    // Minimap settings (adjusted for massive world)
    MINIMAP_SIZE: 200,       // Larger minimap for better navigation
    MINIMAP_ZOOM: 0.02,      // Much smaller zoom level for 10000x10000
    
    // Notification settings
    NOTIFICATION_DURATION: 3000,
    LEVEL_UP_NOTIFICATION: true,
    KILL_NOTIFICATION: true,
    
    // Navigation aids for large world
    SHOW_COMPASS: true,
    SHOW_REGION_NAMES: true
  },
  
  // ==================== CONTROL CONFIGURATION ====================
  CONTROLS: {
    // Movement keys (multiple options)
    MOVE_UP: ['KeyW', 'ArrowUp'],
    MOVE_DOWN: ['KeyS', 'ArrowDown'],
    MOVE_LEFT: ['KeyA', 'ArrowLeft'],
    MOVE_RIGHT: ['KeyD', 'ArrowRight'],
    
    // Action keys
    SHOOT: 'MouseLeft',
    AUTO_SHOOT: 'KeyE',
    UPGRADE_MENU: 'KeyU',
    TOGGLE_MAP: 'KeyM',
    TOGGLE_STATS: 'Tab',
    
    // New navigation keys for large world
    SPRINT: 'ShiftLeft',     // Sprint mode for faster movement
    TELEPORT_HOME: 'KeyH',   // Return to spawn point
    
    // Mouse settings
    AIM_WITH_MOUSE: true,
    INVERT_Y_AXIS: false
  },
  
  // ==================== REGIONS SYSTEM (NEW for 10000x10000) ====================
  REGIONS: {
    // Divide the massive world into regions for better organization
    REGION_SIZE: 2000,       // Each region is 2000x2000
    REGIONS: {
      CENTER: { x: 5000, y: 5000, name: 'Central Plains', difficulty: 1 },
      NORTH: { x: 5000, y: 1000, name: 'Northern Wastes', difficulty: 3 },
      SOUTH: { x: 5000, y: 9000, name: 'Southern Marshes', difficulty: 3 },
      EAST: { x: 9000, y: 5000, name: 'Eastern Peaks', difficulty: 4 },
      WEST: { x: 1000, y: 5000, name: 'Western Forests', difficulty: 4 },
      NORTHEAST: { x: 8000, y: 2000, name: 'Frozen Tundra', difficulty: 5 },
      NORTHWEST: { x: 2000, y: 2000, name: 'Mystic Valley', difficulty: 5 },
      SOUTHEAST: { x: 8000, y: 8000, name: 'Volcanic Fields', difficulty: 5 },
      SOUTHWEST: { x: 2000, y: 8000, name: 'Dark Swamps', difficulty: 5 }
    }
  },
  
  // ==================== AUDIO CONFIGURATION ====================
  AUDIO: {
    ENABLED: false,  // Set to true when audio is implemented
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.5
  },
  
  // ==================== DEBUG CONFIGURATION ====================
  DEBUG: {
    ENABLED: false,
    SHOW_COLLISION_BOXES: false,
    SHOW_VELOCITIES: false,
    SHOW_COORDINATES: true,      // Useful for massive world navigation
    SHOW_NETWORK_STATS: false,
    SHOW_PERFORMANCE_STATS: true, // Important for large world performance
    SHOW_REGION_BORDERS: false,
    LOG_LEVEL: 'warn' // 'error', 'warn', 'info', 'debug'
  }
};

// ==================== CONFIGURATION HELPERS ====================

/**
 * Get the appropriate configuration based on game mode
 */
function getGameConfig() {
  // In single-player mode, we don't need network configuration
  if (GAME_CONFIG.MODE === 'single-player') {
    return {
      ...GAME_CONFIG,
      NETWORK: {
        ...GAME_CONFIG.NETWORK,
        SERVER_URL: null,
        RECONNECT_ATTEMPTS: 0
      }
    };
  }
  return GAME_CONFIG;
}

/**
 * Check if the game should run in single-player mode
 */
function isSinglePlayer() {
  return GAME_CONFIG.MODE === 'single-player';
}

/**
 * Check if the game should run in multiplayer mode
 */
function isMultiplayer() {
  return GAME_CONFIG.MODE === 'multiplayer';
}

/**
 * Get world dimensions
 */
function getWorldBounds() {
  return {
    width: GAME_CONFIG.WORLD.WIDTH,
    height: GAME_CONFIG.WORLD.HEIGHT
  };
}

/**
 * Get shape configuration by type
 */
function getShapeConfig(shapeType) {
  return GAME_CONFIG.SHAPES.TYPES[shapeType] || GAME_CONFIG.SHAPES.TYPES.square;
}

/**
 * Get control key for action
 */
function getControlKey(action) {
  const key = GAME_CONFIG.CONTROLS[action];
  return Array.isArray(key) ? key : [key];
}

/**
 * Check if debug mode is enabled
 */
function isDebugMode() {
  return GAME_CONFIG.DEBUG.ENABLED;
}

/**
 * Log debug message if debug mode is enabled
 */
function debugLog(message, level = 'info') {
  if (!isDebugMode()) return;
  
  const levels = ['error', 'warn', 'info', 'debug'];
  const configLevel = levels.indexOf(GAME_CONFIG.DEBUG.LOG_LEVEL);
  const messageLevel = levels.indexOf(level);
  
  if (messageLevel <= configLevel) {
    console[level](`[DEBUG] ${message}`);
  }
}

/**
 * Get current region based on position
 */
function getCurrentRegion(x, y) {
  const regions = GAME_CONFIG.REGIONS.REGIONS;
  const regionSize = GAME_CONFIG.REGIONS.REGION_SIZE;
  
  // Find the closest region center
  let closestRegion = null;
  let closestDistance = Infinity;
  
  for (const [key, region] of Object.entries(regions)) {
    const distance = Math.sqrt(
      Math.pow(x - region.x, 2) + Math.pow(y - region.y, 2)
    );
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestRegion = { ...region, key };
    }
  }
  
  return closestRegion;
}

/**
 * Apply configuration overrides from URL parameters
 * Useful for testing different configurations without changing code
 * Example: game.html?mode=multiplayer&debug=true&world_width=10000
 */
function applyURLConfigOverrides() {
  const params = new URLSearchParams(window.location.search);
  
  // Game mode override
  if (params.has('mode')) {
    const mode = params.get('mode');
    if (mode === 'single-player' || mode === 'multiplayer') {
      GAME_CONFIG.MODE = mode;
      console.log(`Game mode set to: ${mode}`);
    }
  }
  
  // Debug mode override
  if (params.has('debug')) {
    GAME_CONFIG.DEBUG.ENABLED = params.get('debug') === 'true';
    console.log(`Debug mode: ${GAME_CONFIG.DEBUG.ENABLED}`);
  }
  
  // World size override
  if (params.has('world_width')) {
    const width = parseInt(params.get('world_width'));
    if (!isNaN(width) && width > 0) {
      GAME_CONFIG.WORLD.WIDTH = width;
      console.log(`World width set to: ${width}`);
    }
  }
  
  if (params.has('world_height')) {
    const height = parseInt(params.get('world_height'));
    if (!isNaN(height) && height > 0) {
      GAME_CONFIG.WORLD.HEIGHT = height;
      console.log(`World height set to: ${height}`);
    }
  }
  
  // Server URL override (for multiplayer testing)
  if (params.has('server')) {
    GAME_CONFIG.NETWORK.SERVER_URL = params.get('server');
    console.log(`Server URL set to: ${GAME_CONFIG.NETWORK.SERVER_URL}`);
  }
  
  // Performance testing overrides
  if (params.has('max_shapes')) {
    const maxShapes = parseInt(params.get('max_shapes'));
    if (!isNaN(maxShapes) && maxShapes > 0) {
      GAME_CONFIG.SHAPES.MAX_SHAPES = maxShapes;
      console.log(`Max shapes set to: ${maxShapes}`);
    }
  }
}

// ==================== INITIALIZATION ====================

// Apply URL overrides when the script loads
if (typeof window !== 'undefined') {
  applyURLConfigOverrides();
  
  // Make configuration available globally
  window.GAME_CONFIG = GAME_CONFIG;
  window.getGameConfig = getGameConfig;
  window.isSinglePlayer = isSinglePlayer;
  window.isMultiplayer = isMultiplayer;
  window.getWorldBounds = getWorldBounds;
  window.getShapeConfig = getShapeConfig;
  window.getCurrentRegion = getCurrentRegion;
  window.debugLog = debugLog;
  
  console.log('🌍 MASSIVE WORLD Game Configuration Loaded:', {
    mode: GAME_CONFIG.MODE,
    world: `${GAME_CONFIG.WORLD.WIDTH}x${GAME_CONFIG.WORLD.HEIGHT}`,
    regions: Object.keys(GAME_CONFIG.REGIONS.REGIONS).length,
    maxShapes: GAME_CONFIG.SHAPES.MAX_SHAPES,
    debug: GAME_CONFIG.DEBUG.ENABLED
  });
  
  console.log('🚀 Epic 10000x10000 world ready for exploration!');
}

// Export for Node.js/module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GAME_CONFIG,
    getGameConfig,
    isSinglePlayer,
    isMultiplayer,
    getWorldBounds,
    getShapeConfig,
    getControlKey,
    getCurrentRegion,
    isDebugMode,
    debugLog
  };
}