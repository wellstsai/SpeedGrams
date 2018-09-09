import { getTileBank, getStartingTiles } from '../setup';
import { getGameState } from '../../../store/utils/getGameState';
import positionPlayerTiles from '../utils/positionPlayerTiles';
import createPlayerTile from '../utils/createPlayerTile';

const renderStartTiles = (store) => {
  const tileBank = getTileBank();
  const startingTiles = getStartingTiles(2, tileBank); // returns array

  // create starting tile sprites
  startingTiles.forEach((letter) => {
    createPlayerTile(store, letter);
  });

  // position sprites
  // get new playerTiles state
  const { playerTiles } = getGameState(store);
  positionPlayerTiles(playerTiles.map((tile) => tile.sprite));
};

export default renderStartTiles;
