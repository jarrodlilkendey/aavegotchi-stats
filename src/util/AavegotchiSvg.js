import { RateLimit } from 'async-sema';

export const filterSvgBackground = (gotchiSvg) => {
  gotchiSvg = gotchiSvg.replace("<style>", "<style>.gotchi-bg,.wearable-bg{display: none}");
  return gotchiSvg;
};

export const generateGotchiUrl = (gotchiSvg) => {
  let newSvg = filterSvgBackground(gotchiSvg);
  let blob = new Blob([newSvg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  return url;
};

export const retrieveAavegotchiSvg = async (aavegotchiContract, gotchiId) => {
  try {
    const response = await aavegotchiContract.methods.getAavegotchiSvg(gotchiId).call();
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const retrieveGotchiSvgs = async (aavegotchiContract, gotchiIds, rateLimit) => {
  let gotchiSvgs = {};

  const limit = RateLimit(rateLimit);

  for (var i = 0; i < gotchiIds.length; i++) {
    let tokenId = gotchiIds[i];
    await limit();
    let svg = await retrieveAavegotchiSvg(aavegotchiContract, tokenId);
    gotchiSvgs[tokenId] = svg;
  }

  return gotchiSvgs;
};
