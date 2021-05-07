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
    xpDifficultlyIncrease: 1.25,
    damageResistance: 1, // want to remove this
    bulletSpeed: 10000,
    enemySpawnSpeeds: [3000, 1500, 750],
    enemyBasedSpeed: 15,
    enemyHealthPointsByDifficulty: [0.6, 0.9, 1.2, 1.4]
  }
}
