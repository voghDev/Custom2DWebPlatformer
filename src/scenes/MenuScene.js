export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#5c94fc');
    this.add.rectangle(width / 2, height - 40, width, 80, 0x8b4513);
    this.add.rectangle(width / 2, height - 76, width, 8, 0x5a2d0c);

    for (let i = 0; i < 4; i++) {
      const cx = 80 + i * 200;
      const cy = 70 + (i % 2) * 20;
      this.add.circle(cx, cy, 22, 0xffffff);
      this.add.circle(cx + 20, cy - 4, 26, 0xffffff);
      this.add.circle(cx + 44, cy, 22, 0xffffff);
    }

    this.add.text(width / 2, height / 4, 'CUSTOM 2D\nWEB PLATFORMER', {
      fontFamily: 'monospace',
      fontSize: '44px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);

    this.items = [
      { label: 'START GAME', action: () => this.scene.start('CharacterSelectScene') },
      { label: 'OPTIONS', action: () => this.scene.start('OptionsScene') },
    ];

    this.selected = 0;
    this.itemTexts = this.items.map((it, i) => {
      const t = this.add.text(width / 2, height / 2 + 30 + i * 60, it.label, {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5);
      t.setInteractive({ useHandCursor: true })
        .on('pointerdown', () => { this.selected = i; this.confirm(); })
        .on('pointerover', () => { this.selected = i; this.refresh(); });
      return t;
    });

    this.pointer = this.add.text(0, 0, '▶', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.refresh();

    this.input.keyboard.on('keydown-UP', () => {
      this.selected = (this.selected + this.items.length - 1) % this.items.length;
      this.refresh();
    });
    this.input.keyboard.on('keydown-DOWN', () => {
      this.selected = (this.selected + 1) % this.items.length;
      this.refresh();
    });
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-SPACE', () => this.confirm());

    this.add.text(width / 2, height - 20, '↑ ↓ NAVIGATE   ENTER SELECT', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  refresh() {
    const t = this.itemTexts[this.selected];
    this.pointer.setPosition(t.x - t.width / 2 - 24, t.y);
    this.itemTexts.forEach((tx, i) => tx.setColor(i === this.selected ? '#ffd700' : '#ffffff'));
  }

  confirm() {
    this.items[this.selected].action();
  }
}
