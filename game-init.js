/**
 * Game Initializer
 * Handles game startup and prevents hardcoded server connections
 * Fixes the hardcoded localhost:3001 issue
 */

class GameInitializer {
  constructor() {
    this.mode = null;
    this.socket = null;
    this.game = null;
  }

  /**
   * Initialize the game based on configuration
   */
  async init() {
    console.log('🎮 Game Initializer Starting...');
    
    // Check if configuration exists
    if (typeof GAME_CONFIG === 'undefined') {
      console.error('❌ GAME_CONFIG not found! Make sure config.js is loaded first.');
      return false;
    }
    
    // Get game mode from configuration
    this.mode = GAME_CONFIG.MODE;
    console.log(`📋 Game Mode: ${this.mode}`);
    
    // Initialize based on mode
    if (this.mode === 'single-player') {
      return this.initSinglePlayer();
    } else if (this.mode === 'multiplayer') {
      return this.initMultiplayer();
    } else {
      console.error(`❌ Unknown game mode: ${this.mode}`);
      return false;
    }
  }

  /**
   * Initialize single-player mode
   */
  initSinglePlayer() {
    console.log('🎯 Initializing Single-Player Mode...');
    
    try {
      // Check if Game class exists from game.js
      if (typeof Game === 'undefined') {
        console.error('❌ Game class not found! Make sure game.js is loaded.');
        return false;
      }
      
      // Create game instance (game.js handles everything)
      this.game = new Game();
      console.log('✅ Single-player game started successfully!');
      
      // Add debug info
      if (GAME_CONFIG.DEBUG.ENABLED) {
        this.addDebugInfo();
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize single-player game:', error);
      return false;
    }
  }

  /**
   * Initialize multiplayer mode (with proper server URL handling)
   */
  initMultiplayer() {
    console.log('🌐 Initializing Multiplayer Mode...');
    
    // Get server URL from configuration (not hardcoded!)
    const serverUrl = this.getServerUrl();
    
    if (!serverUrl) {
      console.error('❌ No server URL configured for multiplayer mode');
      this.showServerConnectionError();
      return false;
    }
    
    console.log(`📡 Attempting to connect to server: ${serverUrl}`);
    
    // Check if socket.io is available
    if (typeof io === 'undefined') {
      console.error('❌ Socket.io not loaded. Add this to your HTML:');
      console.error('<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>');
      this.showMultiplayerError();
      return false;
    }
    
    try {
      // Connect to server with timeout
      this.socket = io(serverUrl, {
        timeout: GAME_CONFIG.NETWORK.TIMEOUT || 10000,
        reconnection: true,
        reconnectionAttempts: GAME_CONFIG.NETWORK.RECONNECT_ATTEMPTS || 5,
        reconnectionDelay: GAME_CONFIG.NETWORK.RECONNECT_DELAY || 1000
      });
      
      this.setupSocketHandlers();
      
      // Show connecting message
      this.showConnectingMessage(serverUrl);
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to connect to server:', error);
      this.showServerConnectionError();
      return false;
    }
  }

  /**
   * Get server URL from configuration or environment
   */
  getServerUrl() {
    // Priority order for server URL:
    // 1. URL parameter (for testing)
    // 2. Environment variable (for deployment)
    // 3. Configuration file
    // 4. Relative URL (assumes same domain)
    
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check URL parameter
    if (urlParams.has('server')) {
      return urlParams.get('server');
    }
    
    // Check if we're on localhost (development)
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      // Use configured development server
      return GAME_CONFIG.NETWORK.SERVER_URL || 'http://localhost:3001';
    }
    
    // For production, use relative URL (same domain)
    if (window.location.protocol === 'https:') {
      // Use secure WebSocket for HTTPS
      return `wss://${window.location.host}`;
    } else {
      // Use regular WebSocket for HTTP
      return `ws://${window.location.host}`;
    }
  }

  /**
   * Setup socket event handlers for multiplayer
   */
  setupSocketHandlers() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to server!');
      this.hideConnectingMessage();
      
      // Auto-join game
      const playerName = this.getPlayerName();
      this.socket.emit('join-game', { name: playerName });
    });
    
    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      this.showDisconnectedMessage();
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.showServerConnectionError();
    });
    
    this.socket.on('connect_timeout', () => {
      console.error('❌ Connection timeout');
      this.showServerConnectionError();
    });
  }

  /**
   * Get player name from localStorage or prompt
   */
  getPlayerName() {
    let name = localStorage.getItem('playerName');
    
    if (!name) {
      name = prompt('Enter your name:') || `Player${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem('playerName', name);
    }
    
    return name;
  }

  /**
   * UI Helper: Show connecting message
   */
  showConnectingMessage(serverUrl) {
    const message = document.createElement('div');
    message.id = 'connecting-message';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      border: 2px solid #00B2E1;
    `;
    message.innerHTML = `
      <h2>🔌 Connecting to Server...</h2>
      <p style="margin: 10px 0; color: #00B2E1;">${serverUrl}</p>
      <div class="spinner" style="
        width: 40px;
        height: 40px;
        border: 3px solid rgba(0, 178, 225, 0.3);
        border-top: 3px solid #00B2E1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      "></div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(message);
  }

  /**
   * UI Helper: Hide connecting message
   */
  hideConnectingMessage() {
    const message = document.getElementById('connecting-message');
    if (message) {
      message.remove();
    }
  }

  /**
   * UI Helper: Show server connection error
   */
  showServerConnectionError() {
    this.hideConnectingMessage();
    
    const error = document.createElement('div');
    error.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      border: 2px solid #FF4444;
      max-width: 400px;
    `;
    error.innerHTML = `
      <h2 style="color: #FF4444;">❌ Connection Failed</h2>
      <p style="margin: 15px 0;">Could not connect to game server.</p>
      <p style="margin: 15px 0; font-size: 14px; color: #AAA;">
        To play in single-player mode, add <code>?mode=single-player</code> to the URL
      </p>
      <button onclick="window.location.href = window.location.pathname + '?mode=single-player'" 
              style="
                background: #00B2E1;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px 5px;
              ">
        Play Single-Player
      </button>
      <button onclick="window.location.reload()" 
              style="
                background: #666;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                margin: 10px 5px;
              ">
        Retry Connection
      </button>
    `;
    document.body.appendChild(error);
  }

  /**
   * UI Helper: Show disconnected message
   */
  showDisconnectedMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    message.innerHTML = `
      <strong>⚠️ Disconnected from server</strong><br>
      <small>Attempting to reconnect...</small>
    `;
    document.body.appendChild(message);
    
    // Auto-remove after 5 seconds
    setTimeout(() => message.remove(), 5000);
  }

  /**
   * UI Helper: Show multiplayer error
   */
  showMultiplayerError() {
    const error = document.createElement('div');
    error.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
      border: 2px solid #FF4444;
    `;
    error.innerHTML = `
      <h2 style="color: #FF4444;">⚠️ Multiplayer Not Available</h2>
      <p style="margin: 15px 0;">Socket.io library is not loaded.</p>
      <p style="margin: 15px 0; font-size: 14px;">
        Running in single-player mode instead.
      </p>
      <button onclick="window.location.href = window.location.pathname + '?mode=single-player'; this.parentElement.remove();" 
              style="
                background: #00B2E1;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
              ">
        Continue in Single-Player
      </button>
    `;
    document.body.appendChild(error);
  }

  /**
   * Add debug information overlay
   */
  addDebugInfo() {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-info';
    debugDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #0F0;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      border-radius: 5px;
      z-index: 999;
    `;
    
    const updateDebug = () => {
      debugDiv.innerHTML = `
        <div>Mode: ${this.mode}</div>
        <div>World: ${GAME_CONFIG.WORLD.WIDTH}x${GAME_CONFIG.WORLD.HEIGHT}</div>
        <div>FPS: ${this.game?.fps || 0}</div>
        <div>Shapes: ${this.game?.state?.shapes?.length || 0}</div>
        <div>Projectiles: ${this.game?.state?.projectiles?.length || 0}</div>
      `;
    };
    
    document.body.appendChild(debugDiv);
    setInterval(updateDebug, 100);
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.GameInitializer = GameInitializer;
  
  // Auto-start game when everything is loaded
  window.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(() => {
      const initializer = new GameInitializer();
      initializer.init();
    }, 100);
  });
}