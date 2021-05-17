import { RateLimit } from 'async-sema';

import firebase from 'firebase';

export const writeScore = async (data) => {
  const db = firebase.firestore();
  const leaderboardRef = db.collection(data.leaderboard).doc(data.user);
  const doc = await leaderboardRef.get();
  if (!doc.exists) {
    console.log('doesnt exist');
    db.collection(data.leaderboard)
      .doc(data.user)
      .set(data);
  } else {
    console.log('exists', doc.data());
    const leaderboardData = doc.data();
    if (data.score > leaderboardData.score) {
      db.collection(data.leaderboard)
        .doc(data.user)
        .set(data);
    } else if (data.score == leaderboardData.score && data.timeElapsed < leaderboardData.timeElapsed) {
      db.collection(data.leaderboard)
        .doc(data.user)
        .set(data);
    } else if (data.score == leaderboardData.score && data.timeElapsed == leaderboardData.timeElapsed && data.gotchisPlaced < leaderboardData.gotchisPlaced) {
      db.collection(data.leaderboard)
        .doc(data.user)
        .set(data);
    }
  }
};

export const writeGotchiKills = async (data) => {
  const db = firebase.firestore();

  let tokenIds = Object.keys(data.gotchiKills);
  for (var i = 0; i < tokenIds.length; i++) {
    let tokenId = tokenIds[i];
    let kills = data.gotchiKills[tokenId].kills;
    let info = data.gotchiKills[tokenId].info;
    let gotchiKillsRef = db.collection('gotchiKills').doc(tokenId);
    let doc = await gotchiKillsRef.get();

    if (!doc.exists) {
      console.log('doesnt exist');
      db.collection('gotchiKills')
        .doc(tokenId)
        .set({ kills: kills, info: info });
    } else {
      console.log('exists', doc.data());
      let gotchiKillsData = doc.data();
      db.collection('gotchiKills')
        .doc(tokenId)
        .set({ kills: gotchiKillsData.kills + kills, info: info });
    }
  };
};

export const readScores = async (data) => {
  const db = firebase.firestore();

  const leaderboardRef = db.collection(data.leaderboard);

  let results = [];

  const snapshot = await leaderboardRef.get();

  snapshot.forEach(doc => {
    results.push(doc.data());
  });

  return results;
}

export const readGotchiKills = async () => {
  const db = firebase.firestore();

  const leaderboardRef = db.collection('gotchiKills');

  let results = [];

  const snapshot = await leaderboardRef.get();

  snapshot.forEach(doc => {
    results.push(doc.data());
  });

  return results;
}
