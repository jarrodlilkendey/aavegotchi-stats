import Phaser from 'phaser';

export class Bolt {
  constructor(config) {
    this.scene = config.scene;
    this.damage = config.damage;
    this.gotchi = config.gotchi;
    this.enemy = config.enemy;

    this.bolt = new Phaser.GameObjects.Graphics(this.scene);

    this.calculateLineSegments(3);

    this.scene.add.existing(this.bolt);

    console.log('create bolt', config);
  }

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  calculateLineSegments(generations) {
    this.lineSegments = [];

    this.lineSegments.push(new Phaser.Geom.Line(this.gotchi.x, this.gotchi.y, this.enemy.x, this.enemy.y));

    let offsetAmount = 40;
    for (var gen = 0; gen < generations; gen++) {
      let segments = this.lineSegments.length;
      for (var seg = 0; seg < segments; seg++) {
        let l = this.lineSegments.shift();

        let midPoint = Phaser.Geom.Line.GetMidPoint(l);       // returns a point
        let normal = Phaser.Geom.Line.GetNormal(l);           // returns a point
        let perpendicular = Phaser.Geom.Line.PerpSlope(l);    // returns a number
        let randomOffset = this.randomFloat(-offsetAmount, offsetAmount);

        // console.log('mid point', midPoint);
        // console.log('normal', normal);
        // console.log('perpendicular', perpendicular);
        // console.log('randomOffset', randomOffset);

        midPoint.x += this.randomFloat(-offsetAmount, offsetAmount);
        midPoint.y += this.randomFloat(-offsetAmount, offsetAmount);

        this.lineSegments.push(new Phaser.Geom.Line(l.x1, l.y1, midPoint.x, midPoint.y));
        this.lineSegments.push(new Phaser.Geom.Line(midPoint.x, midPoint.y, l.x2, l.y2));
      }
      offsetAmount /= 2;
    }

    this.draw();
    //test for line intersections
  }

  draw() {
    this.bolt.clear();
    if (this.lineSegments.length > 0) {
      console.log('draw lineSegments', this.lineSegments);

      this.bolt.lineStyle(4, 0xaa00aa);

      for (var i = 0; i < this.lineSegments.length; i++) {
        this.bolt.strokeLineShape(this.lineSegments[i]);
      }
    }
  }

  destroy() {
    this.bolt.destroy();
  }
}
