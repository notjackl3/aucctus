export const getMediumRatio = (mediumValue: number, largeValue: number) => {
  let mediumRatio = mediumValue / largeValue;
  if (mediumRatio < 0.4) {
    mediumRatio = 0.4;
  } else if (mediumRatio > 0.6) {
    mediumRatio = 0.6;
  }
  return mediumRatio ? mediumRatio : 0.4;
};
export const getSmallRatio = (smallValue: number, largeValue: number) => {
  let smallRatio = smallValue / largeValue;
  if (smallRatio < 0.05) {
    smallRatio = 0.05;
  } else if (smallRatio > 0.25) {
    smallRatio = 0.25;
  }
  return smallRatio ? smallRatio : 0.05;
};
