import { parseLevel } from '../levelLoader.js';

const TILE = 32;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.characterKey = (data && data.character) || 'male';
    this.finished = false;
  }

  preload() {
    this.load.image('male', 'characters/male.png');
    this.load.image('female', 'characters/female.png');
    this.load.text('level-01', 'levels/level-01.txt');
  }

  create() {
    buildProceduralTextures(this);

    const level = parseLevel(this.cache.text.get('level-01'));
    const worldWidth = Math.max(level.width * TILE, this.scale.width);
    const worldHeight = level.height * TILE;

    this.cameras.main.setBackgroundColor('#5c94fc');
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight + 200);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    for (let i = 0; i < 6; i++) {
      const x = (i / 6) * worldWidth + 40;
      const y = 40 + (i % 2) * 60;
      this.add.image(x, y, 'cloud').setScrollFactor(0.4).setAlpha(0.9);
    }

    this.platforms = this.physics.add.staticGroup();
    let spawn = { x: TILE * 2, y: worldHeight - TILE * 3 };
    let goalPos = null;
    const enemyPositions = [];

    for (let y = 0; y < level.grid.length; y++) {
      const row = level.grid[y];
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        const px = x * TILE + TILE / 2;
        const py = y * TILE + TILE / 2;
        if (ch === 'X') {
          this.platforms.create(px, py, 'ground');
        } else if (ch === 'P') {
          spawn = { x: px, y: py };
        } else if (ch === 'G') {
          goalPos = { x: px, y: py };
        } else if (ch === 'E') {
          enemyPositions.push({ x: px, y: py });
        }
      }
    }

    this.player = this.physics.add.sprite(spawn.x, spawn.y, this.characterKey);
    this.player.setCollideWorldBounds(false);
    this.player.body.setSize(36, 60).setOffset(14, 3);
    this.physics.add.collider(this.player, this.platforms);

    this.enemies = this.physics.add.group();
    for (const e of enemyPositions) {
      const en = this.enemies.create(e.x, e.y, 'goomba');
      en.body.setSize(26, 24).setOffset(3, 4);
      en.setVelocityX(-60);
      en.setCollideWorldBounds(false);
    }
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyHit, null, this);

    if (goalPos) {
      this.goal = this.physics.add.staticSprite(goalPos.x, goalPos.y, 'flag');
      this.physics.add.overlap(this.player, this.goal, this.onGoalReached, null, this);
    }

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D,SPACE,ESC');

    this.hud = this.add.text(12, 10, '← → move   ↑ / SPACE jump   ESC quit', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 6, y: 3 },
    }).setScrollFactor(0);

    this.worldBottom = worldHeight;
  }

  update() {
    if (this.finished) return;

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const jump = this.cursors.up.isDown || this.cursors.space.isDown ||
                 this.wasd.W.isDown || this.wasd.SPACE.isDown;

    const speed = 200;
    if (left) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (jump && this.player.body.blocked.down) {
      this.player.setVelocityY(-450);
    }

    if (this.player.y > this.worldBottom + 80) {
      this.scene.restart({ character: this.characterKey });
      return;
    }

    this.enemies.children.iterate(en => {
      if (!en || !en.active) return;
      const dir = en.body.velocity.x < 0 ? -1 : 1;
      if (en.body.blocked.left) en.setVelocityX(60);
      else if (en.body.blocked.right) en.setVelocityX(-60);
      else if (en.body.blocked.down && !hasFloorAhead(this.platforms, en, dir)) {
        en.setVelocityX(-dir * 60);
      }
      if (en.y > this.worldBottom + 40) en.destroy();
    });

    if (this.wasd.ESC.isDown) {
      this.scene.start('MenuScene');
    }
  }

  onEnemyHit(player, enemy) {
    const stomping = player.body.velocity.y > 40 &&
                     player.body.bottom < enemy.body.top + 16;
    if (stomping) {
      enemy.destroy();
      player.setVelocityY(-260);
    } else {
      this.scene.restart({ character: this.characterKey });
    }
  }

  onGoalReached() {
    if (this.finished) return;
    this.finished = true;
    this.player.setVelocity(0, 0);

    const cam = this.cameras.main;
    this.add.text(cam.width / 2, cam.height / 2, 'LEVEL COMPLETE!', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0);

    this.time.delayedCall(2500, () => this.scene.start('MenuScene'));
  }
}

function hasFloorAhead(platforms, en, dir) {
  const aheadX = en.x + dir * (en.body.width / 2 + 4);
  const belowY = en.y + en.body.height / 2 + 6;
  let has = false;
  platforms.children.iterate(p => {
    if (!p || !p.body) return;
    if (aheadX >= p.body.left && aheadX <= p.body.right &&
        belowY >= p.body.top && belowY <= p.body.bottom) {
      has = true;
    }
  });
  return has;
}

function buildProceduralTextures(scene) {
  if (!scene.textures.exists('ground')) {
    const g = scene.add.graphics();
    g.fillStyle(0x8b4513, 1); g.fillRect(0, 0, TILE, TILE);
    g.fillStyle(0x6b3410, 1); g.fillRect(0, 0, TILE, 6);
    g.fillStyle(0x3b2418, 1); g.fillRect(0, 6, TILE, 1);
    g.fillStyle(0x6b3410, 1);
    g.fillRect(4, 12, 6, 4);
    g.fillRect(18, 18, 8, 4);
    g.fillRect(10, 24, 4, 4);
    g.lineStyle(1, 0x3b2418, 1); g.strokeRect(0, 0, TILE, TILE);
    g.generateTexture('ground', TILE, TILE);
    g.destroy();
  }

  if (!scene.textures.exists('goomba')) {
    const g = scene.add.graphics();
    g.fillStyle(0x000000, 1); g.fillEllipse(16, 20, 26, 22);
    g.fillStyle(0x8b4513, 1); g.fillEllipse(16, 20, 22, 18);
    g.fillStyle(0xffffff, 1); g.fillCircle(11, 17, 4); g.fillCircle(21, 17, 4);
    g.fillStyle(0x000000, 1); g.fillCircle(11, 17, 2); g.fillCircle(21, 17, 2);
    g.fillStyle(0x3b2418, 1); g.fillRect(7, 27, 8, 4); g.fillRect(17, 27, 8, 4);
    g.generateTexture('goomba', 32, 32);
    g.destroy();
  }

  if (!scene.textures.exists('flag')) {
    const g = scene.add.graphics();
    g.fillStyle(0xdddddd, 1); g.fillRect(4, 0, 3, TILE);
    g.fillStyle(0xff2020, 1); g.fillTriangle(7, 2, 28, 10, 7, 18);
    g.fillStyle(0xffd700, 1); g.fillCircle(5.5, 0, 3);
    g.generateTexture('flag', 32, TILE);
    g.destroy();
  }

  if (!scene.textures.exists('cloud')) {
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 24, 14);
    g.fillCircle(38, 20, 18);
    g.fillCircle(58, 24, 14);
    g.fillCircle(30, 14, 12);
    g.fillCircle(48, 14, 12);
    g.generateTexture('cloud', 80, 40);
    g.destroy();
  }
}
