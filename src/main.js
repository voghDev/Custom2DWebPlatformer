import MenuScene from './scenes/MenuScene.js';
import OptionsScene from './scenes/OptionsScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game',
  backgroundColor: '#5c94fc',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false,
    },
  },
  scene: [MenuScene, OptionsScene, CharacterSelectScene, GameScene],
};

new Phaser.Game(config);
