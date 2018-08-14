import shuffle from 'lodash/shuffle';
// will probably move this to server-side

const tiles = [
  ...new Array(13).fill('a'),
  ...new Array(3).fill('b'),
  ...new Array(3).fill('c'),
  ...new Array(6).fill('d'),
  ...new Array(18).fill('e'),
  ...new Array(3).fill('f'),
  ...new Array(4).fill('g'),
  ...new Array(3).fill('h'),
  ...new Array(12).fill('i'),
  ...new Array(2).fill('j'),
  ...new Array(2).fill('k'),
  ...new Array(5).fill('l'),
  ...new Array(3).fill('m'),
  ...new Array(8).fill('n'),
  ...new Array(11).fill('o'),
  ...new Array(3).fill('p'),
  ...new Array(2).fill('q'),
  ...new Array(9).fill('r'),
  ...new Array(6).fill('s'),
  ...new Array(9).fill('t'),
  ...new Array(6).fill('u'),
  ...new Array(3).fill('v'),
  ...new Array(3).fill('w'),
  ...new Array(2).fill('x'),
  ...new Array(3).fill('y'),
  ...new Array(2).fill('z'),
];

const numOfStartTilesMap = {
  // 2: 21,
  2: 80,
  3: 21,
  4: 21,
  5: 15,
  6: 15,
  7: 11,
};

export const getTileBank = () => {
  return shuffle(tiles);
};

export const getStartingTiles = (numOfPlayers, arr) => {
  const startingTiles = [];
  const numOfStartTiles = numOfStartTilesMap[numOfPlayers];

  for (let i = 0; i < numOfStartTiles; i++) {
    startingTiles.push(arr.pop());
  }

  return startingTiles;
};
