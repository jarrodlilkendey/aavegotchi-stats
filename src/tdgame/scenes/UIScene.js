import Phaser from 'phaser';

import { Constants } from '../Constants';
import { Bullet } from '../prefabs/Bullet';

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

    // this.panel.fillStyle(0xffcc33, 1);
    // this.panel.fillRect(790, 80, 220, 550);

    this.physics.world.enable(this.panel);
    this.panel.body.setSize(220, 550)
    this.panel.body.reset(790, 80);
    this.panel.fillRect(790, 80, 220, 550);

    //  Our Text object to display the Score
    let enemiesRemaining = this.registry.customData.myEnemies.length + this.registry.customData.svgsToGet.length;
    var scoreText = this.add.text(800, 80, `Score: 0`, { font: '30px m5x7', fill: '#000000' });
    var enemiesText = this.add.text(800, 100, `Enemies: ${enemiesRemaining}`, { font: '30px m5x7', fill: '#000000' });
    var yourGotchisText = this.add.text(800, 130, 'Your Gotchis', { font: '30px m5x7', fill: '#000000' });

    let group = this.add.group();

    console.log('UIScene create', this);

    // Object.keys(this.registry.customData.mySvgObjects).map(function(tokenId, index) {
    //   let e = _this.add.sprite(0 + (index * 50), 0 + (index * 50), tokenId);
    //   e.displayWidth = 48;
    //   e.displayHeight = 48;
    //   console.log('create sprite add', tokenId);
    // });

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


    this.registry.customData.myGotchis.map(function(g, index) {
      console.log('UIScene group create', g.tokenId);

      let item = group.create(0, 0, g.tokenId);
      item.setInteractive();

      _this.input.setDraggable(item);
      _this.physics.world.enableBody(item);

      // let e = _this.add.sprite(0 + (index * 50), 0 + (index * 50), tokenId);
      // e.displayWidth = 48;
      // e.displayHeight = 48;
      // console.log('create sprite add', tokenId);
    });
    _this.input.dragDistanceThreshold = 16;

    _this.input.on('dragstart', function (pointer, gameObject) {
      console.log('dragstart');
      gameObject.setTint(0x00ff00);
      gameObject.droppable = true;
      gameObject.startX = gameObject.x;
      gameObject.startY = gameObject.y;

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
        console.log('drag');
        gameObject.setTint(0x00ff00);
        gameObject.x = dragX;
        gameObject.y = dragY;
        gameObject.droppable = true;

    });

    _this.input.on('dragend', function (pointer, gameObject) {
        console.log('dragend');//, gameObject);
        gameObject.clearTint();

        if (gameObject.droppable) {
          // create the enemy in the GameplayScene
          _this.events.emit('placeGotchi', { gameObject: gameObject });
          gameObject.destroy();
        } else {
          gameObject.x = gameObject.startX;
          gameObject.y = gameObject.startY;
        }
    });

    Phaser.Actions.GridAlign(group.getChildren(), {
        width: 3,
        height: 10,
        cellWidth: 64,
        cellHeight: 64,
        x: 840,
        y: 190
    });

    ourGame.events.on('addScore', function () {
        this.score += 1;

        let enemiesRemaining = this.registry.customData.myEnemies.length + this.registry.customData.svgsToGet.length - this.score;

        scoreText.setText(`Score: ${this.score}`);
        enemiesText.setText(`Enemies: ${enemiesRemaining}`);

        if (enemiesRemaining == 0) {
          _this.scene.remove(Constants.SCENES.UI);
          _this.scene.start(Constants.SCENES.GAMEOVER, { score: this.score });
        }

    }, this);
  }

  update() {
  }
}
