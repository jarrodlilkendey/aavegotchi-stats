export const Constants = {
  SCENES: {
    LOAD: "LOAD",
    MENU: "MENU",
    GAMEPLAY: "GAMEPLAY",
    UI: "UI",
    GAMEOVER: "GAMEOVER",
    PAUSED: "PAUSED",
  },

  scalars: {
    attackDamage: 1.5, // validated
    attackRange: 6, // validated
    attackSpeed: 10000, // validated
    baseXpPerPoint: 100,
    xpDifficultlyIncrease: 1.4,
    damageResistance: 1, // want to remove this
    bulletSpeed: 10000,
    enemyHealthPoints: 1.25,
    enemySpawnSpeeds: [3000, 1500, 750],
    enemyBasedSpeed: 15
  }
}
