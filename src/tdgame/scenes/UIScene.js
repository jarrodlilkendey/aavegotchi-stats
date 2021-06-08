import Phaser from 'phaser';

import { Constants } from '../Constants';
import { Bullet } from '../prefabs/Bullet';

import { graphAddressToCollateralSpriteKey } from '../../util/Collateral';

import _ from 'lodash';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.UI
    });

    Phaser.Scene.call(this, { key: Constants.SCENES.UI, active: true });
  }

  init() {
    // this.phsyics.startSystem(Phaser.Phsyics.ARCADE);
    this.score = 0;
    this.ghst = 0;
  }

  preload() {
  }

  gotchiOverlap(gameObject, overlapObject) {
    // console.log('gotchiOverlap', gameObject, overlapObject);
    gameObject.setTint(0xff0000);
    gameObject.droppable = false;
  }

  resetWeaponLabels(gotchi) {
    let weaponIds = ['collateral', 'mk2grenade', 'm67grenade', 'fireball'];
    let labels = [this.collateralText, this.mk2GrenadeText, this.m67GrenadeText, this.fireballText];
    let prices = [-1, Constants.prices.mk2grenade, Constants.prices.m67grenade, Constants.prices.fireball];

    for (var i = 0; i < weaponIds.length; i++) {
      let weapon = weaponIds[i];
      if (gotchi.isWeaponEquipped(weapon)) {
        labels[i].text = 'Equipped';
      } else if (gotchi.isWeaponOwned(weapon)) {
        labels[i].text = 'Owned';
      } else {
        labels[i].text = `${prices[i]} GHST`;
      }
    }
  }

  resetUpgradeButtons(gotchi) {
    if (gotchi.upgradePoints > 0) {
      this.energyUpgrade.setTexture('upgrade_enabled');
      this.aggressionUpgrade.setTexture('upgrade_enabled');
      this.spookinessUpgrade.setTexture('upgrade_enabled');
      this.brainSizeUpgrade.setTexture('upgrade_enabled');
    } else {
      this.energyUpgrade.setTexture('upgrade_disabled');
      this.aggressionUpgrade.setTexture('upgrade_disabled');
      this.spookinessUpgrade.setTexture('upgrade_disabled');
      this.brainSizeUpgrade.setTexture('upgrade_disabled');
    }
  }

  attemptPurchase(weaponId) {
    let prices = {
      'mk2grenade': Constants.prices.mk2grenade,
      'm67grenade': Constants.prices.m67grenade,
      'fireball': Constants.prices.fireball,
    };

    if (this.ghst >= prices[weaponId]) {
      this.selectedGotchi.purchaseWeapon(weaponId);
      this.ghst -= prices[weaponId];

      var ourGame = this.scene.get(Constants.SCENES.GAMEPLAY);
      if (ourGame.musicOn) {
        ourGame.purchaseSound.play({ volume: 1 });
      }
    }
  }

  create() {
    console.log('create UIScene');

    const _this = this;

    this.panel = this.add.graphics();

    this.panel2 = this.add.graphics();
    this.panel2.fillStyle(0xffcc33, 1);
    this.panel2.fillRect(790, 80, 220, 550);

    this.gotchiRange = this.add.graphics();
    this.gotchiRange.lineStyle(0.5, 0xffffff);

    this.physics.world.enable(this.panel);
    this.panel.body.setSize(220, 550)
    this.panel.body.reset(790, 80);
    this.panel.fillRect(790, 80, 220, 550);

    this.uiRect = new Phaser.Geom.Rectangle(790, 80, 220, 550);

    //  Our Text object to display the Score
    // let enemiesRemaining = this.registry.customData.myEnemies.length + this.registry.customData.svgsToGet.length;
    let enemiesRemaining = this.registry.customData.levelEnemies.length; // + this.registry.customData.svgsToGet.length;
    let yPosition = 80;
    var scoreText = this.add.text(800, yPosition, `Score: 0`, { font: '30px m5x7', fill: '#000000' });
    var enemiesText = this.add.text(800, yPosition += 20, `Enemies: ${enemiesRemaining}`, { font: '30px m5x7', fill: '#000000' });
    this.timeText = this.add.text(800, yPosition += 20, 'Timer: 0', { font: '30px m5x7', fill: '#000000' });
    this.ghstText = this.add.text(800, yPosition += 20, 'GHST: 0', { font: '30px m5x7', fill: '#000000' });

    this.yourGotchisText = this.add.text(800, yPosition += 30, 'Place Gotchis', { font: '30px m5x7', fill: '#000000' });
    this.gotchiPlacementGroup = this.add.group();

    this.upgradeGotchiText = this.add.text(800, yPosition, 'Upgrade Gotchi', { font: '30px m5x7', fill: '#000000' });
    this.gotchiNameText = this.add.text(800, yPosition += 30, 'Gotchi', { font: '30px m5x7', fill: '#000000' });
    this.hitsText = this.add.text(800, yPosition += 30, 'HITS', { font: '24px m5x7', fill: '#000000' });
    this.killsText = this.add.text(800, yPosition += 20, 'KILLS', { font: '24px m5x7', fill: '#000000' });
    this.speedText = this.add.text(800, yPosition += 20, 'SPEED', { font: '24px m5x7', fill: '#000000' });
    this.damageText = this.add.text(800, yPosition += 20, 'DAMAGE', { font: '24px m5x7', fill: '#000000' });
    this.rangeText = this.add.text(800, yPosition += 20, 'RANGE', { font: '24px m5x7', fill: '#000000' });
    this.xpPerKillText = this.add.text(800, yPosition += 20, 'XP PER KILL', { font: '24px m5x7', fill: '#000000' });

    this.xpProgressText = this.add.text(800, yPosition += 30, 'LEVEL UP PROGRESS', { font: '24px m5x7', fill: '#000000' });
    this.upgradePointsText = this.add.text(800, yPosition += 20, 'UPGRADE POINTS', { font: '24px m5x7', fill: '#000000' });

    this.energyText = this.add.text(800, yPosition += 30, 'ENERGY', { font: '24px m5x7', fill: '#000000' });
    this.energyUpgrade = this.add.sprite(970, yPosition += 10, 'upgrade_disabled').setInteractive();
    this.energyUpgrade.setScale(0.35);
    this.energyUpgradeText = this.add.text(947, yPosition - 9, 'UPGRADE', { font: '17px m5x7', fill: '#ffffff' });

    this.aggressionText = this.add.text(800, yPosition += 10, 'AGGRESSION', { font: '24px m5x7', fill: '#000000' });
    this.aggressionUpgrade = this.add.sprite(970, yPosition += 10, 'upgrade_disabled').setInteractive();
    this.aggressionUpgrade.setScale(0.35);
    this.aggressionUpgradeText = this.add.text(947, yPosition - 9, 'UPGRADE', { font: '17px m5x7', fill: '#ffffff' });

    this.spookinessText = this.add.text(800, yPosition += 10, 'SPOOKINESS', { font: '24px m5x7', fill: '#000000' });
    this.spookinessUpgrade = this.add.sprite(970, yPosition += 10, 'upgrade_disabled').setInteractive();
    this.spookinessUpgrade.setScale(0.35);
    this.spookinessUpgradeText = this.add.text(947, yPosition - 9, 'UPGRADE', { font: '17px m5x7', fill: '#ffffff' });

    this.brainSizeText = this.add.text(800, yPosition += 10, 'BRAIN SIZE', { font: '24px m5x7', fill: '#000000' });
    this.brainSizeUpgrade = this.add.sprite(970, yPosition += 10, 'upgrade_disabled').setInteractive();
    this.brainSizeUpgrade.setScale(0.35);
    this.brainSizeUpgradeText = this.add.text(947, yPosition - 9, 'UPGRADE', { font: '17px m5x7', fill: '#ffffff' });

    this.eyeShapeText = this.add.text(800, yPosition += 10, 'EYE SHAPE', { font: '24px m5x7', fill: '#000000' });
    this.eyeSizeText = this.add.text(800, yPosition += 20, 'EYE SIZE', { font: '24px m5x7', fill: '#000000' });

    this.equipmentText = this.add.text(800, yPosition += 30, 'EQUIPMENT', { font: '24px m5x7', fill: '#000000' });

    this.collateral = this.add.sprite(810, yPosition += 40, 'fireball').setInteractive();
    this.collateralText = this.add.text(800, yPosition + 15, 'Owned', { font: '14px m5x7', fill: '#000000' });
    this.collateral.on('pointerdown', function (pointer) {
      _this.selectedGotchi.equipWeapon('collateral');
      _this.resetWeaponLabels(_this.selectedGotchi);
    });

    this.mk2Grenade = this.add.sprite(860, yPosition, 'mk2grenade').setInteractive();
    this.mk2GrenadeText = this.add.text(850, yPosition + 15, 'Owned', { font: '14px m5x7', fill: '#000000' });
    this.mk2Grenade.on('pointerdown', function (pointer) {
      if (_this.selectedGotchi.isWeaponOwned('mk2grenade')) {
        _this.selectedGotchi.equipWeapon('mk2grenade');
      } else {
        _this.attemptPurchase('mk2grenade')
      }
      _this.resetWeaponLabels(_this.selectedGotchi);
    });

    this.m67Grenade = this.add.sprite(910, yPosition, 'm67grenade').setInteractive();
    this.m67GrenadeText = this.add.text(900, yPosition + 15, 'Owned', { font: '14px m5x7', fill: '#000000' });
    this.m67Grenade.on('pointerdown', function (pointer) {
      if (_this.selectedGotchi.isWeaponOwned('m67grenade')) {
        _this.selectedGotchi.equipWeapon('m67grenade');
      } else {
        _this.attemptPurchase('m67grenade')
      }
      _this.resetWeaponLabels(_this.selectedGotchi);
    });

    this.fireball = this.add.sprite(960, yPosition, 'fireball').setInteractive();
    this.fireballText = this.add.text(950, yPosition + 15, 'Owned', { font: '14px m5x7', fill: '#000000' });
    this.fireball.on('pointerdown', function (pointer) {
      if (_this.selectedGotchi.isWeaponOwned('fireball')) {
        _this.selectedGotchi.equipWeapon('fireball');
      } else {
        _this.attemptPurchase('fireball')
      }
      _this.resetWeaponLabels(_this.selectedGotchi);
    });

    this.upgradeGotchiText.visible = false;
    this.xpPerKillText.visible = false;
    this.gotchiNameText.visible = false;
    this.hitsText.visible = false;
    this.damageText.visible = false;
    this.rangeText.visible = false;
    this.speedText.visible = false;
    this.upgradePointsText.visible = false;
    this.xpProgressText.visible = false;
    this.killsText.visible = false;

    this.energyText.visible = false;
    this.aggressionText.visible = false;
    this.spookinessText.visible = false;
    this.brainSizeText.visible = false;
    this.eyeShapeText.visible = false;
    this.eyeSizeText.visible = false;

    this.energyUpgrade.visible = false;
    this.aggressionUpgrade.visible = false;
    this.spookinessUpgrade.visible = false;
    this.brainSizeUpgrade.visible = false;
    this.energyUpgradeText.visible = false;
    this.aggressionUpgradeText.visible = false;
    this.spookinessUpgradeText.visible = false;
    this.brainSizeUpgradeText.visible = false;

    this.equipmentText.visible = false;
    this.collateral.visible = false;
    this.fireball.visible = false;
    this.mk2Grenade.visible = false;
    this.m67Grenade.visible = false;
    this.collateralText.visible = false;
    this.mk2GrenadeText.visible = false;
    this.m67GrenadeText.visible = false;
    this.fireballText.visible = false;

    this.mode = 'placement';

    console.log('UIScene create', this);

    var ourGame = this.scene.get(Constants.SCENES.GAMEPLAY);
    ourGame.floorLayer.setTileIndexCallback([444], (gameObject) => {
      // console.log('on path', gameObject);
      gameObject.setTint(0xff0000);
      gameObject.droppable = false;
    });

    ourGame.topLayer.setTileIndexCallback([656,657,688,689,720,721,1212,1213,1244,1245,1276,1277,655,687,719], (gameObject) => {
      // console.log('on object', gameObject);
      gameObject.setTint(0xff0000);
      gameObject.droppable = false;
    });

    this.energyUpgrade.on('pointerdown', function (pointer) {
      if (_this.selectedGotchi.energy >= 50) {
        _this.selectedGotchi.increaseEnergy(1);
      } else {
        _this.selectedGotchi.increaseEnergy(-1);
      }
    });

    this.aggressionUpgrade.on('pointerdown', function (pointer) {
      if (_this.selectedGotchi.aggression >= 50) {
        _this.selectedGotchi.increaseAggression(1);
      } else {
        _this.selectedGotchi.increaseAggression(-1);
      }
    });

    this.spookinessUpgrade.on('pointerdown', function (pointer) {
      if (_this.selectedGotchi.spookiness >= 50) {
        _this.selectedGotchi.increaseSpookiness(1);
      } else {
        _this.selectedGotchi.increaseSpookiness(-1);
      }
    });

    this.brainSizeUpgrade.on('pointerdown', function (pointer) {
      if (_this.selectedGotchi.brainSize >= 50) {
        _this.selectedGotchi.increaseBrainSize(1);
      } else {
        _this.selectedGotchi.increaseBrainSize(-1);
      }
    });

    _.filter(this.registry.customData.myGotchis, ['selected', true]).map(function(g, index) {
      console.log('UIScene group create', g.tokenId);

      let item = _this.gotchiPlacementGroup.create(0, 0, g.tokenId);
      item.setInteractive();

      _this.input.setDraggable(item);
      _this.physics.world.enableBody(item);
    });
    _this.input.dragDistanceThreshold = 16;

    _this.input.on('dragstart', function (pointer, gameObject) {
      console.log('dragstart', gameObject);
      console.log('dragstart gotchis', _this.registry.customData.myGotchis);
      gameObject.setTint(0x00ff00);
      gameObject.droppable = true;
      gameObject.startX = gameObject.x;
      gameObject.startY = gameObject.y;

      let gotchiKey = gameObject.texture.key;
      let gotchi = _.find(_this.registry.customData.myGotchis, { tokenId: gotchiKey });
      let gotchiRange = gotchi.gotchi.withSetsNumericTraits[2];
      _this.range = Math.max(Constants.scalars.minimumRange, Math.abs(50 - gotchiRange) + Constants.scalars.minimumRange) * Constants.scalars.attackRange;


      console.log('dragstart', ourGame.gotchis);
      ourGame.gotchis.map(function(gotchi, index) {
        _this.physics.add.overlap(gameObject, gotchi, _this.gotchiOverlap, null, this);
      });

      _this.physics.add.overlap(gameObject, _this.panel, _this.gotchiOverlap, null, this);

      _this.physics.add.collider(gameObject, ourGame.floorLayer);
      _this.physics.add.collider(gameObject, ourGame.topLayer);

      if (ourGame.musicOn) {
        ourGame.pickupSound.play({ volume: 6 });
      }
    });

    _this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        // console.log('drag');
        gameObject.setTint(0x00ff00);
        gameObject.x = dragX;
        gameObject.y = dragY;
        gameObject.droppable = true;

        _this.gotchiRange.clear();

        _this.gotchiRange.beginPath();
        _this.gotchiRange.arc(dragX, dragY, _this.range - 24, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false, 0.01);
        _this.gotchiRange.strokePath();
        _this.gotchiRange.closePath();

        _this.gotchiRange.beginPath();
        _this.gotchiRange.lineStyle(0.4, 0xff00ff);
        _this.gotchiRange.arc(dragX, dragY, _this.range - 24, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), true, 0.01);
        _this.gotchiRange.strokePath();
        _this.gotchiRange.closePath();

    });

    _this.input.on('dragend', function (pointer, gameObject) {
        console.log('dragend');//, gameObject);
        gameObject.clearTint();
        _this.gotchiRange.clear();

        if (gameObject.droppable) {
          let pointerRect = new Phaser.Geom.Rectangle(pointer.x, pointer.y, 64, 64);
          Phaser.Geom.Rectangle.CenterOn(pointerRect, pointer.x, pointer.y);
          let intersect = Phaser.Geom.Intersects.RectangleToRectangle(_this.uiRect, pointerRect);

          if (intersect == false) {
            // create the enemy in the GameplayScene
            _this.events.emit('placeGotchi', { gameObject: gameObject });
            gameObject.destroy();
          } else {
            gameObject.x = gameObject.startX;
            gameObject.y = gameObject.startY;
          }
        } else {
          gameObject.x = gameObject.startX;
          gameObject.y = gameObject.startY;
        }
    });

    Phaser.Actions.GridAlign(this.gotchiPlacementGroup.getChildren(), {
        width: 3,
        height: 10,
        cellWidth: 64,
        cellHeight: 64,
        x: 840,
        y: 230
    });

    ourGame.events.on('addScore', function () {
        this.score += 1;
        this.ghst += 1;

        let enemiesRemaining = this.registry.customData.levelEnemies.length - this.score;

        scoreText.setText(`Score: ${this.score}`);
        enemiesText.setText(`Enemies: ${enemiesRemaining}`);
        _this.ghstText.setText(`GHST: ${this.ghst}`);

        if (enemiesRemaining == 0) {
          _this.scene.remove(Constants.SCENES.UI);
          console.log('ourGame', ourGame);
          ourGame.events.off('addScore');
          ourGame.events.off('resume');
          ourGame.spaceBar.off('up');
          ourGame.downKey.off('up');
          ourGame.upKey.off('up');

          let gotchiKills = {};
          for (var i = 0; i < ourGame.gotchis.length; i++) {
            let gotchi = ourGame.gotchis[i];
            gotchiKills[gotchi.info.id] = {
              info: gotchi.info,
              kills: gotchi.kills
            };
          }

          ourGame.scene.start(Constants.SCENES.GAMEOVER, { score: this.score, musicSettings: { music: ourGame.music, musicOn: ourGame.musicOn }, gotchiCount: ourGame.gotchiCount, gotchisPlaced: ourGame.gotchis.length, timeElapsed: ourGame.timeElapsed, gotchiKills: gotchiKills });
        }

    }, this);
  }

  setGotchiPlacementVisibility(visibility) {
    if (visibility) {
      this.mode = 'placement';
      // this.selectedGotchi.hideRange();
    }

    this.yourGotchisText.visible = visibility;
    this.gotchiPlacementGroup.setVisible(visibility);
  }

  setGotchiUpgradeVisibility(visibility, gotchi) {
    this.selectedGotchi = gotchi;

    if (visibility) {
      this.mode = 'upgrade';
      this.selectedGotchi.drawRange();
    }

    this.upgradeGotchiText.visible = visibility;
    this.gotchiNameText.visible = visibility;
    this.hitsText.visible = visibility;
    this.damageText.visible = visibility;
    this.rangeText.visible = visibility;
    this.speedText.visible = visibility;
    this.upgradePointsText.visible = visibility;
    this.xpProgressText.visible = visibility;
    this.xpPerKillText.visible = visibility;
    this.killsText.visible = visibility;
    this.energyText.visible = visibility;
    this.aggressionText.visible = visibility;
    this.spookinessText.visible = visibility;
    this.brainSizeText.visible = visibility;
    this.eyeShapeText.visible = visibility;
    this.eyeSizeText.visible = visibility;

    this.energyUpgrade.visible = visibility;
    this.aggressionUpgrade.visible = visibility;
    this.spookinessUpgrade.visible = visibility;
    this.brainSizeUpgrade.visible = visibility;
    this.energyUpgradeText.visible = visibility;
    this.aggressionUpgradeText.visible = visibility;
    this.spookinessUpgradeText.visible = visibility;
    this.brainSizeUpgradeText.visible = visibility;

    this.equipmentText.visible = visibility;
    this.fireball.visible = visibility;
    this.mk2Grenade.visible = visibility;
    this.m67Grenade.visible = visibility;
    this.collateral.visible = visibility;
    this.collateralText.visible = visibility;
    this.mk2GrenadeText.visible = visibility;
    this.m67GrenadeText.visible = visibility;
    this.fireballText.visible = visibility;

    if (gotchi != null) {
      this.gotchiNameText.setText(gotchi.info.name);
      this.hitsText.setText(`HITS: ${gotchi.hits}`);
      this.killsText.setText(`KILLS: ${gotchi.kills}`);
      this.damageText.setText(`ATTACK DAMAGE: ${gotchi.damage}`);
      this.rangeText.setText(`ATTACK RANGE: ${gotchi.range}`);
      this.speedText.setText(`ATTACK SPEED: ${gotchi.speed}`);
      this.upgradePointsText.setText(`UPGRADE POINTS: ${gotchi.upgradePoints}`);
      this.xpPerKillText.setText(`XP PER KILL: ${gotchi.xpPerKill}`);
      this.xpProgressText.setText(`XP PROGRESS: ${gotchi.xpProgress}`);

      this.energyText.setText(`ENERGY: ${gotchi.energy}`);
      this.aggressionText.setText(`AGGRESSION: ${gotchi.aggression}`);
      this.spookinessText.setText(`SPOOKINESS: ${gotchi.spookiness}`);
      this.brainSizeText.setText(`BRAIN SIZE: ${gotchi.brainSize}`);
      this.eyeShapeText.setText(`EYE SHAPE: ${gotchi.info.numericTraits[4]}`);
      this.eyeSizeText.setText(`EYE SIZE: ${gotchi.info.numericTraits[5]}`);

      this.collateral.setTexture(graphAddressToCollateralSpriteKey(gotchi.info.collateral));
      this.resetWeaponLabels(gotchi);
      this.resetUpgradeButtons(gotchi);
    }
  }

  update() {
    if (this.mode == 'upgrade') {
      this.hitsText.setText(`HITS: ${this.selectedGotchi.hits}`);
      this.killsText.setText(`KILLS: ${this.selectedGotchi.kills}`);

      this.damageText.setText(`ATTACK DAMAGE: ${this.selectedGotchi.damage}`);
      this.rangeText.setText(`ATTACK RANGE: ${this.selectedGotchi.range}`);
      this.speedText.setText(`ATTACK SPEED: ${this.selectedGotchi.speed}`);

      this.upgradePointsText.setText(`UPGRADE POINTS: ${this.selectedGotchi.upgradePoints}`);
      this.xpPerKillText.setText(`XP PER KILL: ${this.selectedGotchi.xpPerKill}`);
      this.xpProgressText.setText(`LEVEL UP PROGRESS: ${this.selectedGotchi.xpProgress}`);

      this.energyText.setText(`ENERGY: ${this.selectedGotchi.energy}`);          // attack speed
      this.aggressionText.setText(`AGGRESSION: ${this.selectedGotchi.aggression}`);  // attack damage
      this.spookinessText.setText(`SPOOKINESS: ${this.selectedGotchi.spookiness}`);  // attack range
      this.brainSizeText.setText(`BRAIN SIZE: ${this.selectedGotchi.brainSize}`);   // level up quicker
      this.eyeShapeText.setText(`EYE SHAPE: ${this.selectedGotchi.info.numericTraits[4]}`);
      this.eyeSizeText.setText(`EYE SIZE: ${this.selectedGotchi.info.numericTraits[5]}`);

      this.resetWeaponLabels(this.selectedGotchi);
      this.resetUpgradeButtons(this.selectedGotchi);
    }
  }
}
