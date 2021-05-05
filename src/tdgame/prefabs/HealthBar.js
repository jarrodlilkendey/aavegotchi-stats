import Phaser from 'phaser';

export class HealthBar {

    constructor (scene, enemy, maxHealth)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.enemy = enemy;
        this.maxHealth = maxHealth;
        this.value = maxHealth;// * 5); //0;
        // this.p = 76 / (maxHealth);// * 5); //0;

        this.draw();

        scene.add.existing(this.bar);
    }

    decrease (amount)
    {
        this.value -= amount;

        if (this.value < 0) {
          this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }

    draw ()
    {
        this.bar.clear();

        let barSize = 40;
        let bgSize = 4;
        let p = ((barSize*2) - (bgSize/2)) / (this.maxHealth);
        //let p = ((barSize*2) - (bgSize/2)) / (this.maxHealth * (this.value / this.maxHealth));

        let barHeight = 16;

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(
          this.x - barSize,
          this.y - barSize,
          barSize * 2,
          (barSize / 2) - bgSize
        );

        //  Health
        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(
          this.enemy.x + (bgSize/2) - barSize,
          this.enemy.y + (bgSize/2) - barSize,
          (barSize * 2) - bgSize,
          barHeight
        );

        if (this.value/this.maxHealth < 0.3) {
          // red
          this.bar.fillStyle(0xff0000);
        }
        else {
          // green
          this.bar.fillStyle(0x00ff00);
        }

        // var d = Math.floor(this.p * this.value);
        // var d = Math.floor(((bgSize/2) - barSize) * (this.value / this.maxHealth));
        // var d = Math.floor((((bgSize*2) - barSize)/this.maxHealth) * this.value);
        var d = Math.floor(p * this.value);
        // var d= Math.floor(76 * (this.value/this.maxHealth));

        this.bar.fillRect(
          this.enemy.x + (bgSize/2) - barSize,
          this.enemy.y + (bgSize/2) - barSize,
          d,
          barHeight
        );
    }

    move(x, y) {
      this.x = x;
      this.y = y;
      this.draw();
    }

    destroy() {
      this.bar.destroy();
    }

}
