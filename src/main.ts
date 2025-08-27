/**
 * Main Entry Point - Initializes the Arras.io game
 */

import './style.css';
import { GameClient } from './client/GameClient';

// Create the main app structure
const app = document.getElementById('app');
if (app) {
  app.innerHTML = `
    <div id="game-container">
      <canvas id="gameCanvas"></canvas>
      <div id="game-ui"></div>
    </div>
  `;
}

// Initialize the game client
const gameClient = new GameClient();
gameClient.initialize();

// Handle window resize
window.addEventListener('resize', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

// Initial canvas setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
