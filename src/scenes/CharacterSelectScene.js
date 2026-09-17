export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  preload() {
    this.load.image('male', 'characters/male.png');
    this.load.image('female', 'characters/female.png');
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#5c94fc');
    this.add.rectangle(width / 2, height - 40, width, 80, 0x8b4513);
    this.add.rectangle(width / 2, height - 76, width, 8, 0x5a2d0c);

    this.add.text(width / 2, height / 5, 'SELECT YOUR CHARACTER', {
      fontFamily: 'monospace',
      fontSize: '30px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.choices = [
      { key: 'male', label: 'MALE', x: width * 0.32 },
      { key: 'female', label: 'FEMALE', x: width * 0.68 },
    ];

    this.entries = this.choices.map((c, i) => {
      const y = height / 2;
      const img = this.add.image(c.x, y, c.key).setOrigin(0.5);
      const label = this.add.text(c.x, y + 120, c.label, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5);

      img.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { this.selected = i; this.confirm(); })
        .on('pointerover', () => { this.selected = i; this.refresh(); });

      return { img, label };
    });

    this.selected = 0;
    this.refresh();

    this.input.keyboard.on('keydown-LEFT', () => { this.selected = 0; this.refresh(); });
    this.input.keyboard.on('keydown-RIGHT', () => { this.selected = 1; this.refresh(); });
    this.input.keyboard.on('keydown-A', () => { this.selected = 0; this.refresh(); });
    this.input.keyboard.on('keydown-D', () => { this.selected = 1; this.refresh(); });
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-SPACE', () => this.confirm());
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));

    this.add.text(width / 2, height - 20, '← → CHOOSE   ENTER START   ESC BACK', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  refresh() {
    this.entries.forEach((e, i) => {
      const active = i === this.selected;
      const size = active ? 200 : 150;
      e.img.setDisplaySize(size, size);
      e.label.setColor(active ? '#ffd700' : '#ffffff');
    });
  }

  confirm() {
    const c = this.choices[this.selected];
    this.scene.start('GameScene', { character: c.key });
  }
}
