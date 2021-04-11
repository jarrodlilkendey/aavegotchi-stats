const _ = require('lodash');
const { ethers } = require('ethers');

export const calculatePortalBRS = (portalAavegotchis) => {
  let topBRS = 0;
  for (var i = 0; i < 10; i++) {
    let a = portalAavegotchis[i];
    let aScore = calculateBRS(a.numericTraits);
    if (aScore > topBRS) {
      topBRS = aScore;
    }
  }
  return topBRS;
};

export const calculateBRS = (traits) => {
  let brs = 0;
  for (let t = 0; t < 6; t++) {
    let traitValue = parseInt(traits[t]);
    if (traitValue < 50) {
      brs += (100 - traitValue);
    } else {
      brs += (traitValue + 1);
    }
  }
  return brs;
};

export const plusSign = (traitScore) => {
  if (traitScore > 0) {
    return '+';
  }
  return '';
};

export const wearableTraitModifiers = (tms) => {
  let modifiers = '';
  if (tms[0] != 0) {
    modifiers += `${plusSign(tms[0])}${tms[0]} NRG `;
  }
  if (tms[1] != 0) {
    modifiers += `${plusSign(tms[1])}${tms[1]} AGG `;
  }
  if (tms[2] != 0) {
    modifiers += `${plusSign(tms[2])}${tms[2]} SPK `;
  }
  if (tms[3] != 0) {
    modifiers += `${plusSign(tms[3])}${tms[3]} BRN `;
  }
  return modifiers;
};

export const wearableBRSModifierLabel = (itemMaxQty) => {
  if (itemMaxQty >= 1000) {
    return '+1 BRS (Common)';
  }

  if (itemMaxQty >= 500) {
    return '+2 BRS (Uncommon)';
  }

  if (itemMaxQty >= 250) {
    return '+5 BRS (Rare)';
  }

  if (itemMaxQty >= 100) {
    return '+10 BRS (Legendary)';
  }

  if (itemMaxQty >= 10) {
    return '+20 BRS (Mythical)';
  }

  if (itemMaxQty >= 1) {
    return '+50 BRS (Godlike)';
  }
};

export const wearableRarityLabel = (item) => {
  let itemMaxQty = parseInt(item.maxQuantity);

  if (itemMaxQty >= 1000) {
    return 'Common';
  }

  if (itemMaxQty >= 500) {
    return 'Uncommon';
  }

  if (itemMaxQty >= 250) {
    return 'Rare';
  }

  if (itemMaxQty >= 100) {
    return 'Legendary';
  }

  if (itemMaxQty >= 10) {
    return 'Mythical';
  }

  if (itemMaxQty >= 1) {
    return 'Godlike';
  }
};

export const wearableBRSModifier = (itemMaxQty) => {
  if (itemMaxQty >= 1000) {
    return 1;
  }

  if (itemMaxQty >= 500) {
    return 2;
  }

  if (itemMaxQty >= 250) {
    return 5;
  }

  if (itemMaxQty >= 100) {
    return 10;
  }

  if (itemMaxQty >= 10) {
    return 20;
  }

  if (itemMaxQty >= 1) {
    return 50;
  }
};

export const scoreWearable = (wearable, aavegotchi) => {
  const points = wearablePoints(wearable, aavegotchi);
  const wearableRarityScore = wearableBRSModifier(wearable.maxQuantity);

  const score = {
    totalScore: points,
    nrgScore: parseInt(wearable.traitModifiers[0]),
    aggScore: parseInt(wearable.traitModifiers[1]),
    spkScore: parseInt(wearable.traitModifiers[2]),
    brnScore: parseInt(wearable.traitModifiers[3]),
    rarityScore: wearableRarityScore
  };

  // console.log('scoreWearable', wearable, aavegotchi, score);

  return score;
};

export const wearablePoints = (wearable, aavegotchi) => {
  let traitsEnd = [...aavegotchi.numericTraits];
  for (var i = 0; i < 4; i++) {
    traitsEnd[i] = parseInt(traitsEnd[i]) + parseInt(wearable.traitModifiers[i]);
  }

  const startBRS = calculateBRS(aavegotchi.numericTraits);
  const endBRS = calculateBRS(traitsEnd);
  const wearableRarityScore = wearableBRSModifier(wearable.maxQuantity);

  return (endBRS - startBRS) + wearableRarityScore;
}

// uint8 internal constant WEARABLE_SLOT_BODY = 0;
//  uint8 internal constant WEARABLE_SLOT_FACE = 1;
//  uint8 internal constant WEARABLE_SLOT_EYES = 2;
//  uint8 internal constant WEARABLE_SLOT_HEAD = 3;
//  uint8 internal constant WEARABLE_SLOT_HAND_LEFT = 4;
//  uint8 internal constant WEARABLE_SLOT_HAND_RIGHT = 5;
//  uint8 internal constant WEARABLE_SLOT_PET = 6;
//  uint8 internal constant WEARABLE_SLOT_BG = 7;
export const wearablePositionLabel = (wearable) => {
  let slot = wearable.slotPositions;

  if (slot[0]) {
    return 'Body';
  }

  if (slot[1]) {
    return 'Face';
  }

  if (slot[2]) {
    return 'Eyes';
  }

  if (slot[3]) {
    return 'Head';
  }

  if (slot[4] || slot[5]) {
    return 'Hand';
  }

  if (slot[6]) {
    return 'Pet';
  }

  if (slot[7]) {
    return 'Background';
  }

  return 'Unknown';
}

export const wearableBySlot = (wearables, aavegotchi, slot) => {
  const slots = ['Body', 'Face', 'Eyes', 'Head', 'Left Hand', 'Right Hand', 'Pet', 'Background'];
  const slotIndex = _.indexOf(slots, slot);
  if (slotIndex != -1) {
    if (aavegotchi.equippedWearables[slotIndex] === '0') {
      return null;
    }
    return wearables[aavegotchi.equippedWearables[slotIndex]];
  } else {
    if (slot === 'Hand') {
      let leftHand = aavegotchi.equippedWearables[4];
      let rightHand = aavegotchi.equippedWearables[5];

      if (leftHand === '0' && rightHand === '0') {
        return null;
      }

      if (leftHand === '0') {
        return wearables[rightHand];
      }

      if (rightHand === '0') {
        return wearables[leftHand];
      }

      // return wearable with the least points
      let leftHandScore = wearablePoints(wearables[leftHand], aavegotchi);
      let rightHandScore = wearablePoints(wearables[rightHand], aavegotchi);

      if (leftHandScore > rightHandScore) {
        return wearables[rightHand];
      } else {
        return wearables[leftHand];
      }
    }
  }
  return null;
}

export const calculateSeason1Reward = (mode, modeRank) => {
  const totalGHST = 1400000;
  let modeGHSTAward = 0;
  let weight = 0;
  let reward = 0;

  if (modeRank > 5000) {
    return 0;
  }

  if (mode == 0) {
    modeGHSTAward = 1400000 * 0.7;
    weight = Math.pow(1 / modeRank, 0.97);
    reward = weight * 95338.67;
  } else if (mode == 1) {
    modeGHSTAward = 1400000 * 0.2;
    weight = Math.pow(1 / modeRank, 0.76);
    reward = weight * 9800.93;
  } else if (mode == 2) {
    modeGHSTAward = 1400000 * 0.1;
    weight = Math.pow(1 / modeRank, 0.65);
    reward = weight * 2592.58;
  } else {
    return 0;
  }

  return reward;
}

export const formatGhst = (ghstInWeiUnits) => {
  let ghstInEtherUnits = ethers.utils.formatEther(ghstInWeiUnits);
  return parseFloat(ghstInEtherUnits);
}
