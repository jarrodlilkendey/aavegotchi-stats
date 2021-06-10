import { RateLimit } from 'async-sema';

import firebase from 'firebase';
import _ from 'lodash';

export const writeXPEventResult = async (data) => {
  console.log('writeXPEventResult', data);
  const courseScore = {
    score: data.score,
    gotchisPlaced: data.gotchisPlaced,
    timeElapsed: data.timeElapsed,
  };

  if (data.score > 0) {
    const db = firebase.firestore();

    let gotchiIds = Object.keys(data.gotchiKills);

    const leaderboardRef = db.collection('xpEvent');
    const snapshot = await leaderboardRef.get();
    console.log('snapshot', snapshot);

    Object.keys(data.gotchiKills).map(async (gotchiId) => {
      let kills = data.gotchiKills[gotchiId].kills;
      let info = {
        gotchiId: gotchiId,
        name: data.gotchiKills[gotchiId].info.name,
        owner: data.user
      };

      let results = _.filter(snapshot.docs, ['id', gotchiId]);
      if (results.length > 0) {
        // gotchi does exist
        const gotchiRef = db.collection('xpEvent').doc(gotchiId);
        const gotchiDoc = await gotchiRef.get();
        let gotchiData = gotchiDoc.data();

        gotchiData.kills += kills;
        gotchiData.info = info;

        if (!gotchiData.hasOwnProperty(data.course)) {
          gotchiData[data.course] = courseScore;
          db.collection('xpEvent').doc(gotchiId).set(gotchiData);
          console.log('id', gotchiId, 'new course complete');
        } else if (betterScore(gotchiData[data.course], courseScore)) {
          // score is better
          gotchiData[data.course] = courseScore;
          db.collection('xpEvent').doc(gotchiId).set(gotchiData);
          console.log('id', gotchiId, 'better score');
        } else {
          // increase kills
          db.collection('xpEvent').doc(gotchiId).set(gotchiData);
          console.log('id', gotchiId, 'increase kills');
        }
      } else {
        // gotchi does not exist
        let gotchiData = {
          kills: kills,
          [data.course]: courseScore,
          info: info
        };

        db.collection('xpEvent').doc(gotchiId).set(gotchiData);
        console.log('id', gotchiId, 'new gotchi');
      }
    });
  }
};


export const betterScore = (oldScore, newScore) => {
  console.log("betterScore comparison", oldScore, newScore);
  if (newScore.score > oldScore.score) {
    return true;
  } else if (newScore.score == oldScore.score && newScore.timeElapsed < oldScore.timeElapsed) {
    return true;
  } else if (newScore.score == oldScore.score && newScore.timeElapsed == oldScore.timeElapsed && newScore.gotchisPlaced < oldScore.gotchisPlaced) {
    return true;
  }
  return false;
};

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
