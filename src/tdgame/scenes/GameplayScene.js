import Phaser from 'phaser';

import { Constants } from '../Constants';
import { Bullet } from '../prefabs/Bullet';
import { Enemy } from '../prefabs/Enemy';
import { Gotchi } from '../prefabs/Gotchi';
import { Fireball } from '../prefabs/Fireball';
import { MK2Grenade } from '../prefabs/MK2Grenade';
import { M67Grenade } from '../prefabs/M67Grenade';
import { Explosion } from '../prefabs/Explosion';
import { Bolt } from '../prefabs/Bolt';

import { UIScene } from './UIScene';

import aavegotchiContractAbi from '../../abi/diamond.json';
import contract from '../../config/aavegotchiContract.json';
import { connectToMatic } from '../../util/MaticClient';

import gotchisMetadata from '../assets/gotchisMetadata.json';

import { Column, TextButton } from 'phaser-ui-tools';

import _ from 'lodash';

// wizard staff, aagent pistol, fireball, grenade
// basic collateral based attack

export class GameplayScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.GAMEPLAY
    })
  }

  init(data) {
    const _this = this;
    this.physics.world.setFPS(60);

    this.maticPOSClient = connectToMatic();
    this.aavegotchiContract = new this.maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, contract.address);

    this.gotchis = [];
    this.enemiesGroup = this.physics.add.group({
      immovable: true
    });

    console.log('init', data);
    this.musicOn = data.musicSettings.musicOn;
    this.music = data.musicSettings.music;
    this.music.setLoop(true);

    if(this.musicOn) {
      this.music.play();
    }

    this.speed = 1;
    this.paused = false;

    this.particles = this.add.particles('flares');
    this.particles.setDepth(2);

    this.gotchiCount = data.gotchiCount;
  }

  preload() {
  }

  move(position, moveBy, duration, target) {
    return {
      targets: target,
      x: position.x + moveBy.x,
      y: position.y + moveBy.y,
      duration: duration * Math.abs(moveBy.x + moveBy.y),
      paused: true
    };
  }

  spawnGotchi(tokenId, x, y) {
    const _this = this;
    let gotchi = new Gotchi({ scene: this, x: x, y: y, key: tokenId });
    this.gotchis.push(gotchi);

    var ourUi = this.scene.get(Constants.SCENES.UI);
    gotchi.on('pointerdown', function(pointer) {
      console.log('gotchi clicked', gotchi);
      ourUi.setGotchiPlacementVisibility(false);
      _this.gotchis.map(function(g, i) {
        g.hideRange();
      });
      ourUi.setGotchiUpgradeVisibility(true, gotchi);
    });

    this.initGotchiShooting(gotchi);


    if (!this.paused) {
      ourUi.setGotchiPlacementVisibility(false);
      ourUi.setGotchiUpgradeVisibility(true, gotchi);
    }
  }

  tweenComplete(tween, targets, custom) {
    let score = custom.scene.get(Constants.SCENES.UI).score;
    custom.scene.remove(Constants.SCENES.UI);
    custom.events.off('addScore');
    custom.events.off('resume');

    let gotchiKills = {};
    for (var i = 0; i < custom.gotchis.length; i++) {
      let gotchi = custom.gotchis[i];
      gotchiKills[gotchi.info.id] = {
        info: gotchi.info,
        kills: gotchi.kills
      };
    }

    custom.scene.start(Constants.SCENES.GAMEOVER, { score: score, musicSettings: { music: custom.music, musicOn: custom.musicOn }, gotchiCount: custom.gotchiCount, gotchisPlaced: custom.gotchis.length, timeElapsed: custom.timeElapsed, gotchiKills: gotchiKills });
  }

  spawnEnemy() {
    const _this = this;

    if (this.registry.customData.levelEnemies.length > this.spawnCount) {
      let e = this.registry.customData.levelEnemies[this.spawnCount];
      let key = e.id;

      let position = { x: -1 * 32, y: 2.5 * 32 };

      let frame = 0;
      if (gotchisMetadata.hasOwnProperty(key)) {
        frame = gotchisMetadata[key];
      }

      let enemy = new Enemy({ scene: this, x: position.x, y: position.y, texture: 'gotchis', frame: frame, gotchi: e });

      let tweens = [];
      let duration = Constants.scalars.enemyBasedSpeed;

      let movements = [ [7.5, 0], [0, 10], [10, 0], [0, 4], [1, 0], [0, 2], [6, 0], [0, -11], [-5, 0], [0, -1], [-6, 0], [0, -2], [-1, 0], [0, -2], [1, 0], [0, -1], [20, 0] ]

      movements.map(function(m, i) {
        let moveBy = { x: m[0] * 32, y: m[1] * 32 };

        let t = _this.move(position, moveBy, duration, enemy);

        if (i == movements.length - 1) {
          t.onComplete = _this.tweenComplete;
          t.onCompleteParams = _this;
        }

        tweens.push(t);

        position.x += moveBy.x;
        position.y += moveBy.y;
      });

      this.tweens.timeline({
        tweens: tweens
      });

      this.enemiesGroup.add(enemy);
      this.spawnCount++;

      console.log('spawn count', this.spawnCount, 'levelEnemies length', this.registry.customData.levelEnemies.length);
    }
  }

  initShooting() {
    this.playerBullets = this.physics.add.group();
    this.playerFireballs = this.physics.add.group();
    this.playerMk2Grenades = this.physics.add.group();
    this.playerM67Grenades = this.physics.add.group();
    this.explosions = this.physics.add.group();
  }

  initGotchiShooting(gotchi) {
    console.log('initGotchiShooting', gotchi);
    gotchi.shootingTimer = this.time.addEvent({ delay: gotchi.calculateAttackDelay(), callback: this.gotchiShoot, callbackScope: this, loop: true, args: [ gotchi ] });
    //todo reset timer with new speed on levelling
  }

  initSpawning() {
    this.spawnCount = 0;
    this.spawnEnemy();
    console.log('initSpawning', Constants.scalars.enemySpawnSpeeds);
    console.log('initSpawning', this.speed);
    console.log('initSpawning', Constants.scalars.enemySpawnSpeeds[this.speed - 1]);
    this.spawning = this.time.addEvent({ delay: Constants.scalars.enemySpawnSpeeds[this.speed - 1], callback: this.spawnEnemy, callbackScope: this, loop: true });
    this.timeElapsed = 0;
    this.gameTimer = this.time.addEvent({ delay: 1000, callback: this.updateGameTimer, callbackScope: this, loop: true });
  }

  gotchiShoot(g) {
    // console.log('gotchiShoot', g);

    const _this = this;

    let bullet = this.playerBullets.getFirstDead(false);
    let fireball = this.playerFireballs.getFirstDead(false);
    let mk2Grenade = this.playerMk2Grenades.getFirstDead(false);
    let m67Grenade = this.playerM67Grenades.getFirstDead(false);

    console.log('playerBullets', this.playerBullets.children);
    console.log('playerFireballs', this.playerFireballs.children);
    console.log('playerMk2Grenades', this.playerMk2Grenades.children);
    console.log('playerM67Grenades', this.playerM67Grenades.children);
    console.log('explosions', this.explosions.children);
    // console.log('activeEnemies', this.activeEnemies);
    console.log('enemiesGroup', this.enemiesGroup.children);

    if (!bullet) {
      // list of active enemies
      if (this.enemiesGroup.children.entries.length > 0) {
        // for each enemy
        let minDists = [];
        this.enemiesGroup.children.entries.map(function(e, i) {
          const dist = Phaser.Math.Distance.Between(g.x, g.y, e.x, e.y);
          // if in range
          if (dist <= g.range) {
            minDists.push( { dist: dist, spawnCount: g.spawnCount, gotchi: g, enemy: e });
          }
        });

        if (minDists.length > 0) {
          let bulletPath = _.orderBy(minDists, ['spawnCount', 'asc'])[0];
          let gotchi = bulletPath.gotchi;
          let e = bulletPath.enemy;
          let dist = bulletPath.dist;

          if (gotchi.isWeaponEquipped('fireball')) {
            fireball = new Fireball({ scene: _this, x: gotchi.x, y: gotchi.y, damage: gotchi.damage, gotchi: gotchi });
            _this.playerFireballs.add(fireball);
            _this.physics.accelerateToObject(fireball, e, Constants.scalars.bulletSpeed);

            if (_this.musicOn) {
              _this.fireballSound.play({ volume: 1, rate: 4});
            }
          } else if (gotchi.isWeaponEquipped('mk2grenade')) {
            mk2Grenade = new MK2Grenade({ scene: _this, x: gotchi.x, y: gotchi.y, damage: gotchi.damage, gotchi: gotchi });
            _this.playerMk2Grenades.add(mk2Grenade);
            _this.physics.accelerateToObject(mk2Grenade, e, Constants.scalars.grenadeSpeed);

            if (_this.musicOn) {
              _this.attackSound.play({ volume: 4});
            }
          } else if (gotchi.isWeaponEquipped('m67grenade')) {
            m67Grenade = new M67Grenade({ scene: _this, x: gotchi.x, y: gotchi.y, damage: gotchi.damage, gotchi: gotchi });
            _this.playerM67Grenades.add(m67Grenade);
            _this.physics.accelerateToObject(m67Grenade, e, Constants.scalars.grenadeSpeed);

            if (_this.musicOn) {
              _this.attackSound.play({ volume: 4});
            }
          }
          /*else if (gotchi.hasCommonWizardStaff()) {
            let bolt = new Bolt({ scene: _this, damage: gotchi.damage, gotchi: gotchi, enemy: e });
            bolt.gotchi.increaseHits();

            e.boltDamage(bolt);

            this.time.addEvent({ delay: 2000, callback: bolt.destroy, callbackScope: bolt, loop: false });

            // if (_this.musicOn) {
            //   _this.zapSound.play({ volume: 3});
            // }

          } else if (gotchi.hasLegendaryWizardStaff()) {

          }*/
          else {
            // console.log('damage', gotchi.damage, gotchi.xp, parseInt(gotchi.info.modifiedRarityScore));
            bullet = new Bullet({ scene: _this, x: gotchi.x, y: gotchi.y, damage: gotchi.damage, collateral: gotchi.info.collateral, gotchi: gotchi });
            _this.playerBullets.add(bullet);
            _this.physics.accelerateToObject(bullet, e, Constants.scalars.bulletSpeed);//300);//00);

            if (_this.musicOn) {
              _this.attackSound.play({ volume: 4});
            }
          }
        }
      }
    } else {
      bullet.reset(0, 0)
    }
  }

  create() {
    console.log('create GameplayScene');

    const _this = this;

    let tdMap = this.add.tilemap('td');

    let terrain = tdMap.addTilesetImage('terrain_atlas', 'terrain');
    let itemset = tdMap.addTilesetImage('items');

    this.floorLayer = tdMap.createStaticLayer('floor', terrain, 0, 0);
    this.topLayer = tdMap.createStaticLayer('top', terrain, 0, 0);

    this.scene.add(Constants.SCENES.UI, UIScene, true, { x: 0, y: 0 });

    this.initShooting();
    this.initSpawning();

    //  Grab a reference to the UI Scene
    var ourUi = this.scene.get(Constants.SCENES.UI);

    this.input.on('pointerdown', function(pointer) {
      const tile = _this.floorLayer.getTileAtWorldXY(pointer.x, pointer.y);

      var rect = { x: pointer.x, y: pointer.y, width: 32, height: 32 };
      var x = rect.x - (rect.width / 2);
      var y = rect.y - (rect.height / 2);
      var within = _this.physics.overlapRect(x, y, rect.width, rect.height);

      // console.log('onMapClick', tile, within, _this.musicSprite, _this.pausedSprite, _this.speedSprite);
      if (within.length == 0) {
        // gotchi not pressed

        // check if buttons pressed
        var musicOverlap = Phaser.Geom.Intersects.RectangleToRectangle(rect, _this.musicSprite.getBounds());
        var pausedOverlap = Phaser.Geom.Intersects.RectangleToRectangle(rect, _this.pausedSprite.getBounds());
        var speedOverlap = Phaser.Geom.Intersects.RectangleToRectangle(rect, _this.speedSprite.getBounds());
        var fullscreenOverlap = Phaser.Geom.Intersects.RectangleToRectangle(rect, _this.fullscreenButton.getBounds());
        // console.log('musicClicked', musicOverlap, 'pausedClicked', pausedOverlap, 'speedClicked', speedOverlap);

        if (!musicOverlap && !pausedOverlap && !speedOverlap) {
          ourUi.setGotchiPlacementVisibility(true);
          _this.gotchis.map(function(g, i) {
            g.hideRange();
          });
          ourUi.setGotchiUpgradeVisibility(false, null);
        }
      }
    });

    //  Listen for events from it
    ourUi.events.on('placeGotchi', function (gotchi) {
      _this.spawnGotchi(gotchi.gameObject.texture.key, gotchi.gameObject.x, gotchi.gameObject.y);
      if (_this.musicOn) {
        _this.placeSound.play({ volume: 5});
      }

      console.log('placeGotchi', _this.gotchis);
    }, this);

    if (this.musicOn) {
      this.musicSprite = this.add.sprite(50, 600, 'audio_on');
    } else {
      this.musicSprite = this.add.sprite(50, 600, 'audio_off');
    }
    this.musicSprite.setScale(0.8);
    this.musicSprite.setInteractive();
    this.musicSprite.on('pointerdown', function (pointer) {
        _this.toggleMusic();
    });

    this.attackSound = this.sound.add("audio_attack");
    this.damageSound = this.sound.add("audio_damage");
    this.pickupSound = this.sound.add("audio_pickup");
    this.placeSound = this.sound.add("audio_place");
    this.fireballSound = this.sound.add("audio_fireball");
    this.explosionSound = this.sound.add("audio_explosion");
    this.purchaseSound = this.sound.add("audio_purchase");

    this.pausedSprite = this.add.sprite(88, 600, 'playing');
    this.pausedSprite.setScale(0.8);
    this.pausedSprite.setInteractive();
    this.pausedSprite.on('pointerdown', function (pointer) {
      _this.paused = !_this.paused;

      if (_this.paused) {
        _this.pausedSprite.setTexture('paused');
        _this.scene.pause();
        _this.scene.launch(Constants.SCENES.PAUSED);
      }
    });

    this.events.on('resume', function () {
      console.log('Gameplay resumed');
      _this.paused = !_this.paused;
      _this.pausedSprite.setTexture('playing');
    });

    this.speedSprite = this.add.sprite(130, 600, 'button1');
    this.speedSprite.setScale(0.8);
    this.speedSprite.setInteractive();
    this.speedSprite.on('pointerdown', function (pointer) {
      if (_this.speed == 3) {
        _this.speed = 1;
      } else {
        _this.speed += 1;
      }

      if (_this.speed == 1) {
        _this.speedSprite.setTexture('button1');
        _this.tweens.timeScale = Constants.scalars.enemyTimescaleSpeeds[_this.speed-1];
      } else if (_this.speed == 2) {
        _this.speedSprite.setTexture('button2');
        _this.tweens.timeScale = Constants.scalars.enemyTimescaleSpeeds[_this.speed-1];
      } else if (_this.speed == 3) {
        _this.speedSprite.setTexture('button3');
        _this.tweens.timeScale = Constants.scalars.enemyTimescaleSpeeds[_this.speed-1];
      }

      _this.spawning.remove();
      _this.spawning = _this.time.addEvent({ delay: Constants.scalars.enemySpawnSpeeds[_this.speed - 1], callback: _this.spawnEnemy, callbackScope: _this, loop: true });
    });

    this.fullscreenButton = this.add.sprite(this.game.config.width - 26, 26, 'fullscreen');
    this.fullscreenButton.setInteractive();
    this.fullscreenButton.on('pointerdown', function (pointer) {
      _this.toggleFullscreen();
    });

    this.physics.world.addCollider(this.playerBullets, this.enemiesGroup, function(bullet, enemy) {
      bullet.gotchi.increaseHits();

      bullet.destroy();
      enemy.damage(bullet);

      if (_this.musicOn) {
        _this.damageSound.play({ volume: 3});
      }
    });

    this.physics.world.addCollider(this.playerFireballs, this.enemiesGroup, function(fireball, enemy) {
      fireball.gotchi.increaseHits();

      fireball.destroy();
      enemy.fireballDamage(fireball);

      if (_this.musicOn) {
        _this.damageSound.play({ volume: 3});
      }
    });

    this.anims.create({
      key: 'explode',
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
      frameRate: 24,
      repeat: 0,
      hideOnComplete: true,
    });

    this.physics.add.overlap(this.playerMk2Grenades, this.enemiesGroup, function(grenade, enemy) {
      if (!grenade.collided) {
        _this.time.addEvent({ delay: 20, callback: _this.grenadeExplode, callbackScope: _this, loop: false, args: [ grenade ] });
      }
      grenade.collided = true;
    });

    this.physics.add.overlap(this.playerM67Grenades, this.enemiesGroup, function(grenade, enemy) {
      if (!grenade.collided) {
        _this.time.addEvent({ delay: 20, callback: _this.grenadeExplode, callbackScope: _this, loop: false, args: [ grenade ] });
      }
      grenade.collided = true;
    });
  }

  grenadeExplode(grenade) {
    grenade.gotchi.increaseHits();

    let blastCircle = new Phaser.Geom.Circle(grenade.x, grenade.y, grenade.blastRadius);
    this.enemiesGroup.children.entries.map((e) => {
      if (Phaser.Geom.Intersects.CircleToRectangle(blastCircle, e.getBounds())) {
        e.grenadeDamage(grenade);
      }
    })

    let explosion = new Explosion({ scene: this, x: grenade.x, y: grenade.y, radius: grenade.blastRadius });
    this.explosions.add(explosion);
    explosion.play('explode');
    explosion.once('animationcomplete', () => {
      console.log('animationcomplete')
      explosion.destroy()
    })
    grenade.destroy();

    console.log('explode', grenade, 'at', grenade.x, grenade.y);

    if (this.musicOn) {
      this.explosionSound.play({ volume: 0.4});
    }
  }

  updateGameTimer() {
    var ourUi = this.scene.get(Constants.SCENES.UI);
    this.timeElapsed += 1;
    ourUi.timeText.text = `Timer: ${this.timeElapsed}`;
  }

  update() {
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;

    if (this.musicOn) {
      this.musicSprite.setTexture('audio_on');
      this.music.play();
    } else {
      this.musicSprite.setTexture('audio_off');
      this.music.stop();
    }
  }

  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }
}
