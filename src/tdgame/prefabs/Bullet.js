import Phaser from 'phaser';

import { graphAddressToCollateralSpriteKey } from '../../util/Collateral';

export class Bullet extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, graphAddressToCollateralSpriteKey(config.collateral));

    this.collateral = config.collateral;
    this.damage = config.damage;
    this.gotchi = config.gotchi;

    config.scene.add.existing(this);
  }
}
