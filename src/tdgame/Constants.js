export const Constants = {
  SCENES: {
    LOAD: "LOAD",
    MENU: "MENU",
    GAMEPLAY: "GAMEPLAY",
    UI: "UI",
    GAMEOVER: "GAMEOVER",
    PAUSED: "PAUSED",
    LEVELSELECT: "LEVELSELECT",
  },

  scalars: {
    attackDamage: 3, //1.5, // validated
    attackRange: 6, // validated
    attackSpeed: 10000, // validated
    minimumDamage: 5,
    minimumRange: 10,
    minimumSpeed: 5,
    minimumXpPerKill: 5,
    baseXpPerPoint: 100,
    xpDifficultlyIncrease: 1.25,
    damageResistance: 1, // want to remove this
    bulletSpeed: 20000,
    grenadeSpeed: 10000,
    enemySpawnSpeeds: [1600, 400, 200], //[600, 300, 275],
    enemyBasedSpeed: 10, //8.5,
    enemyTimescaleSpeeds: [1, 2.5, 3.5],
    enemyHealthPointsByDifficulty: [0.6, 0.9, 1.2, 1.4],
    svgBatchSize: 10,
    maxGotchis: 21,
    ghstPerKill: 1,
  },

  prices: {
    fireball: 10,
    mk2grenade: 20,
    m67grenade: 30,
  },

  assets: {
    basePath: '/game', //'https://gotchitdgameassets.s3.amazonaws.com',
  }
}
