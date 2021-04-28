import Phaser from 'phaser';

export class HealthBar {

    constructor (scene, enemy, modifiedRarityScore)
    {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.enemy = enemy;
        this.value = (modifiedRarityScore * 5); //0;
        this.p = 76 / (modifiedRarityScore * 5); //0;

        this.draw();

        scene.add.existing(this.bar);
    }

    decrease (amount)
    {
        this.value -= amount;

        if (this.value < 0)
        {
            this.value = 0;
        }

        this.draw();

        return (this.value === 0);
    }

    draw ()
    {
        this.bar.clear();

        //  BG
        this.bar.fillStyle(0x000000);
        this.bar.fillRect(this.x - 40, this.y - 40, 80, 16);

        //  Health

        this.bar.fillStyle(0xffffff);
        this.bar.fillRect(this.enemy.x + 2 - 40, this.enemy.y + 2 - 40, 76, 12);

        if (this.value < 30)
        {
            this.bar.fillStyle(0xff0000);
        }
        else
        {
            this.bar.fillStyle(0x00ff00);
        }

        var d = Math.floor(this.p * this.value);

        this.bar.fillRect(this.enemy.x + 2 - 40, this.enemy.y + 2 - 40, d, 12);
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
