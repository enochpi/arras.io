/**
 * Game Configuration File
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
    // Standardized world size - EXPANDED to 6000x6000 for larger play area
    WIDTH: 6000,
    HEIGHT: 6000,
    GRID_SIZE: 50,
    
    // Boundary settings
    BOUNDARY_DAMAGE: 5,      // Damage when hitting world edge
    BOUNDARY_PUSH_FORCE: 10  // Push back force from boundaries
  },
  
  // ==================== PLAYER CONFIGURATION ====================
  PLAYER: {
    // Starting stats
    DEFAULT_SIZE: 30,
    DEFAULT_SPEED: 3,
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
    DEFAULT_SPEED: 8,
    DEFAULT_DAMAGE: 20,
    DEFAULT_LIFETIME: 2000,  // milliseconds
    
    // Fire rates (milliseconds between shots)
    FIRE_RATE: {
      NORMAL: 250,
      RAPID: 100,
      SNIPER: 1000
    }
  },
  
  // ==================== SHAPES/ENEMY CONFIGURATION ====================
  SHAPES: {
    MAX_SHAPES: 150,  // Increased for larger world
    SPAWN_RATE: 1500, // Faster spawning for larger world
    
    // Shape definitions with consistent stats
    TYPES: {
      triangle: {
        sides: 3,
        size: 25,
        health: 30,
        xp: 10,
        color: '#FF6B6B',
        speed: 1,
        damage: 5
      },
      square: {
        sides: 4,
        size: 30,
        health: 50,
        xp: 20,
        color: '#FFE66D',
        speed: 0.8,
        damage: 8
      },
      pentagon: {
        sides: 5,
        size: 35,
        health: 80,
        xp: 35,
        color: '#4ECDC4',
        speed: 0.6,
        damage: 10
      },
      hexagon: {
        sides: 6,
        size: 40,
        health: 120,
        xp: 50,
        color: '#A8E6CF',
        speed: 0.4,
        damage: 15
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
    // Rendering optimizations
    ENABLE_PARTICLES: true,
    MAX_PARTICLES: 100,
    ENABLE_SHADOWS: true,
    ENABLE_ANTIALIAS: true,
    
    // Viewport culling margins
    CULL_MARGIN: 100,
    
    // FPS limits
    TARGET_FPS: 60,
    MIN_FPS: 30
  },
  
  // ==================== UI CONFIGURATION ====================
  UI: {
    // HUD settings
    SHOW_FPS: true,
    SHOW_MINIMAP: true,
    SHOW_LEADERBOARD: true,
    SHOW_CONTROLS: true,
    
    // Minimap settings
    MINIMAP_SIZE: 180,
    MINIMAP_ZOOM: 0.1,
    
    // Notification settings
    NOTIFICATION_DURATION: 3000,
    LEVEL_UP_NOTIFICATION: true,
    KILL_NOTIFICATION: true
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
    
    // Mouse settings
    AIM_WITH_MOUSE: true,
    INVERT_Y_AXIS: false
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
    SHOW_COORDINATES: false,
    SHOW_NETWORK_STATS: false,
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
 * Apply configuration overrides from URL parameters
 * Useful for testing different configurations without changing code
 * Example: game.html?mode=multiplayer&debug=true&world_width=6000
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
  window.debugLog = debugLog;
  
  console.log('Game Configuration Loaded:', {
    mode: GAME_CONFIG.MODE,
    world: `${GAME_CONFIG.WORLD.WIDTH}x${GAME_CONFIG.WORLD.HEIGHT}`,
    debug: GAME_CONFIG.DEBUG.ENABLED
  });
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
    isDebugMode,
    debugLog
  };
}