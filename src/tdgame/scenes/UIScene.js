import Phaser from 'phaser';

import { Constants } from '../Constants';
import { Bullet } from '../prefabs/Bullet';

import _ from 'lodash';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.UI
    });

    this.score = 0;

    Phaser.Scene.call(this, { key: Constants.SCENES.UI, active: true });
  }

  init() {
    // this.phsyics.startSystem(Phaser.Phsyics.ARCADE);
  }

  preload() {
  }

  gotchiOverlap(gameObject, overlapObject) {
    // console.log('gotchiOverlap', gameObject, overlapObject);
    gameObject.setTint(0xff0000);
    gameObject.droppable = false;
  }

  create() {
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

    //  Our Text object to display the Score
    // let enemiesRemaining = this.registry.customData.myEnemies.length + this.registry.customData.svgsToGet.length;
    let enemiesRemaining = this.registry.customData.levelEnemies.length; // + this.registry.customData.svgsToGet.length;
    var scoreText = this.add.text(800, 80, `Score: 0`, { font: '30px m5x7', fill: '#000000' });
    var enemiesText = this.add.text(800, 100, `Enemies: ${enemiesRemaining}`, { font: '30px m5x7', fill: '#000000' });

    this.yourGotchisText = this.add.text(800, 130, 'Place Gotchis', { font: '30px m5x7', fill: '#000000' });
    this.gotchiPlacementGroup = this.add.group();

    this.upgradeGotchiText = this.add.text(800, 130, 'Upgrade Gotchi', { font: '30px m5x7', fill: '#000000' });
    this.gotchiNameText = this.add.text(800, 160, 'Gotchi', { font: '30px m5x7', fill: '#000000' });
    this.hitsText = this.add.text(800, 190, 'HITS', { font: '24px m5x7', fill: '#000000' });
    this.killsText = this.add.text(800, 210, 'KILLS', { font: '24px m5x7', fill: '#000000' });
    this.damageText = this.add.text(800, 230, 'DAMAGE', { font: '24px m5x7', fill: '#000000' });
    this.rangeText = this.add.text(800, 250, 'RANGE', { font: '24px m5x7', fill: '#000000' });
    this.speedText = this.add.text(800, 270, 'SPEED', { font: '24px m5x7', fill: '#000000' });
    this.xpPerKillText = this.add.text(800, 290, 'XP PER KILL', { font: '24px m5x7', fill: '#000000' });
    this.xpProgressText = this.add.text(800, 310, 'LEVEL UP PROGRESS', { font: '24px m5x7', fill: '#000000' });
    this.upgradePointsText = this.add.text(800, 330, 'UPGRADE POINTS', { font: '24px m5x7', fill: '#000000' });

    let yStart = 310 + 30;
    this.energyText = this.add.text(800, 360, 'ENERGY', { font: '24px m5x7', fill: '#000000' });
    this.energyUp = this.add.sprite(990, 370, 'uipack', 768).setInteractive();
    this.energyDown = this.add.sprite(970, 370, 'uipack', 769).setInteractive();

    this.aggressionText = this.add.text(800, 380, 'AGGRESSION', { font: '24px m5x7', fill: '#000000' });
    this.aggressionUp = this.add.sprite(990, 390, 'uipack', 768).setInteractive();
    this.aggressionDown = this.add.sprite(970, 390, 'uipack', 769).setInteractive();

    this.spookinessText = this.add.text(800, 400, 'SPOOKINESS', { font: '24px m5x7', fill: '#000000' });
    this.spookinessUp = this.add.sprite(990, 410, 'uipack', 768).setInteractive();
    this.spookinessDown = this.add.sprite(970, 410, 'uipack', 769).setInteractive();

    this.brainSizeText = this.add.text(800, 420, 'BRAIN SIZE', { font: '24px m5x7', fill: '#000000' });
    this.brainSizeUp = this.add.sprite(990, 430, 'uipack', 768).setInteractive();
    this.brainSizeDown = this.add.sprite(970, 430, 'uipack', 769).setInteractive();

    this.eyeShapeText = this.add.text(800, 440, 'EYE SHAPE', { font: '24px m5x7', fill: '#000000' });
    this.eyeSizeText = this.add.text(800, 460, 'EYE SIZE', { font: '24px m5x7', fill: '#000000' });

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
    this.energyUp.visible = false;
    this.energyDown.visible = false;
    this.aggressionUp.visible = false;
    this.aggressionDown.visible = false;
    this.spookinessUp.visible = false;
    this.spookinessDown.visible = false;
    this.brainSizeUp.visible = false;
    this.brainSizeDown.visible = false;

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

    this.energyUp.on('pointerdown', function (pointer) {
      _this.selectedGotchi.increaseEnergy(1);
    });

    this.energyDown.on('pointerdown', function (pointer) {
      _this.selectedGotchi.increaseEnergy(-1);
    });

    this.aggressionUp.on('pointerdown', function (pointer) {
      _this.selectedGotchi.increaseAggression(1);
    });

    this.aggressionDown.on('pointerdown', function (pointer) {
      _this.selectedGotchi.increaseAggression(-1);
    });

    this.spookinessUp.on('pointerdown', function (pointer) {
      _this.selectedGotchi.increaseSpookiness(1);
    });

    this.spookinessDown.on('pointerdown', function (pointer) {
      _this.selectedGotchi.increaseSpookiness(-1);
    });

    this.brainSizeUp.on('pointerdown', function (pointer) {
      _this.selectedGotchi.increaseBrainSize(1);
    });

    this.brainSizeDown.on('pointerdown', function (pointer) {
      _this.selectedGotchi.increaseBrainSize(-1);
    });


    this.registry.customData.myGotchis.map(function(g, index) {
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
      _this.range = Math.abs(50 - gotchiRange) * Constants.scalars.attackRange;


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
          // create the enemy in the GameplayScene
          _this.events.emit('placeGotchi', { gameObject: gameObject });
          gameObject.destroy();
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
        y: 190
    });

    ourGame.events.on('addScore', function () {
        this.score += 1;

        // let enemiesRemaining = this.registry.customData.myEnemies.length + this.registry.customData.svgsToGet.length - this.score;
        let enemiesRemaining = this.registry.customData.levelEnemies.length - this.score;

        scoreText.setText(`Score: ${this.score}`);
        enemiesText.setText(`Enemies: ${enemiesRemaining}`);

        if (enemiesRemaining == 0) {
          _this.scene.remove(Constants.SCENES.UI);
          _this.scene.start(Constants.SCENES.GAMEOVER, { score: this.score });
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
    this.killsText.visible = visibility;
    this.energyText.visible = visibility;
    this.aggressionText.visible = visibility;
    this.spookinessText.visible = visibility;
    this.brainSizeText.visible = visibility;
    this.eyeShapeText.visible = visibility;
    this.eyeSizeText.visible = visibility;
    this.energyUp.visible = visibility;
    this.energyDown.visible = visibility;
    this.aggressionUp.visible = visibility;
    this.aggressionDown.visible = visibility;
    this.spookinessUp.visible = visibility;
    this.spookinessDown.visible = visibility;
    this.brainSizeUp.visible = visibility;
    this.brainSizeDown.visible = visibility;
    this.xpPerKillText.visible = visibility;

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
    }
  }
}
