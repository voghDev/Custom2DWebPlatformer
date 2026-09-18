export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#5c94fc');
    this.add.rectangle(width / 2, height - 40, width, 80, 0x8b4513);
    this.add.rectangle(width / 2, height - 76, width, 8, 0x5a2d0c);

    this.add.text(width / 2, height / 6, 'SELECT YOUR CHARACTER', {
      fontFamily: 'monospace',
      fontSize: '30px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.statusText = this.add.text(width / 2, height / 2, 'Loading characters…', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 20, '← → CHOOSE   ENTER START   ESC BACK', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => this.scene.start('MenuScene'));

    this.discoverCharacters().then(files => this.loadAndBuild(files));
  }

  async discoverCharacters() {
    try {
      const res = await fetch('characters/', { headers: { Accept: 'text/html' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const seen = new Set();
      const files = [];
      for (const a of doc.querySelectorAll('a[href]')) {
        const raw = a.getAttribute('href') || '';
        const name = decodeURIComponent(raw.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || '');
        if (!name.toLowerCase().endsWith('.png')) continue;
        if (seen.has(name)) continue;
        seen.add(name);
        files.push(makeChoice(name));
      }
      if (files.length === 0) throw new Error('no PNGs listed');
      return files.sort((a, b) => a.filename.localeCompare(b.filename));
    } catch (err) {
      console.warn('Could not read characters/ directory listing, using shipped defaults:', err);
      return [makeChoice('male.png'), makeChoice('female.png')];
    }
  }

  loadAndBuild(files) {
    for (const f of files) {
      if (!this.textures.exists(f.key)) {
        this.load.image(f.key, `characters/${f.filename}`);
      }
    }
    this.load.once('complete', () => this.buildGrid(files));
    this.load.start();
  }

  buildGrid(files) {
    this.statusText.destroy();
    const { width, height } = this.scale;

    const maxPerRow = 4;
    const perRow = Math.min(files.length, maxPerRow);
    const rows = Math.ceil(files.length / perRow);
    const rowSpacing = 200;
    const gridTop = height / 2 - ((rows - 1) * rowSpacing) / 2;

    this.choices = files;
    this.entries = files.map((f, i) => {
      const row = Math.floor(i / perRow);
      const itemsInRow = Math.min(perRow, files.length - row * perRow);
      const col = i - row * perRow;
      const x = (width * (col + 1)) / (itemsInRow + 1);
      const y = gridTop + row * rowSpacing;

      const img = this.add.image(x, y, f.key).setOrigin(0.5);
      const label = this.add.text(x, y + 90, f.label, {
        fontFamily: 'monospace',
        fontSize: '20px',
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

    this.input.keyboard.on('keydown-LEFT',  () => this.move(-1));
    this.input.keyboard.on('keydown-A',     () => this.move(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.move(1));
    this.input.keyboard.on('keydown-D',     () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-SPACE', () => this.confirm());
  }

  move(delta) {
    if (!this.choices) return;
    this.selected = (this.selected + delta + this.choices.length) % this.choices.length;
    this.refresh();
  }

  refresh() {
    this.entries.forEach((e, i) => {
      const active = i === this.selected;
      const size = active ? 180 : 130;
      e.img.setDisplaySize(size, size);
      e.label.setColor(active ? '#ffd700' : '#ffffff');
    });
  }

  confirm() {
    const c = this.choices[this.selected];
    this.scene.start('GameScene', { character: c.key, characterFile: c.filename });
  }
}

function makeChoice(filename) {
  const key = filename.replace(/\.png$/i, '');
  return { filename, key, label: key.toUpperCase() };
}
