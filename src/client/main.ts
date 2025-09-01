/**
 * Main entry point for the enhanced Arras.io client
 */

import { GameClient } from './GameClient';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Initializing Enhanced Arras.io...');
  
  // Create and initialize game client
  const gameClient = new GameClient();
  gameClient.initialize();
  
  // Add version info
  console.log('📦 Version: 2.0.0 - Enhanced Edition');
  console.log('🌍 Features: Expanded World, Auto-Shoot, Visual Upgrades');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('⏸️ Game paused (tab hidden)');
  } else {
    console.log('▶️ Game resumed (tab visible)');
  }
});
