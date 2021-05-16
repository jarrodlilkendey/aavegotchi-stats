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
