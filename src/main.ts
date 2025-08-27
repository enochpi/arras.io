import './style.css';
import { GameClient } from './client/GameClient';
import { UIManager } from './client/UIManager';
import { InputHandler } from './client/InputHandler';

// Initialize game components
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Initialize game systems
const gameClient = new GameClient(canvas, ctx);
const uiManager = new UIManager();
const inputHandler = new InputHandler(canvas, gameClient);

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gameClient.handleResize();
});

// Menu system
const menuScreen = document.getElementById('menu-screen')!;
const playButton = document.getElementById('playButton')!;
const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
const modeButtons = document.querySelectorAll('.mode-btn');

let selectedMode = 'ffa';

// Mode selection
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedMode = btn.getAttribute('data-mode')!;
  });
});

// Start game
playButton.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim() || 'Anonymous';
  menuScreen.style.display = 'none';
  gameClient.connect(playerName, selectedMode);
  gameClient.start();
});

// Initialize UI
uiManager.initialize();

console.log('Arras.io game initialized!');
