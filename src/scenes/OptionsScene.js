export default class OptionsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OptionsScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#5c94fc');
    this.add.rectangle(width / 2, height - 40, width, 80, 0x8b4513);
    this.add.rectangle(width / 2, height - 76, width, 8, 0x5a2d0c);

    this.add.text(width / 2, height / 3, 'OPTIONS', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, '(coming soon)', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 20, 'PRESS ESC OR ENTER TO GO BACK', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const back = () => this.scene.start('MenuScene');
    this.input.keyboard.on('keydown-ESC', back);
    this.input.keyboard.on('keydown-ENTER', back);
    this.input.keyboard.on('keydown-SPACE', back);
    this.input.once('pointerdown', back);
  }
}
