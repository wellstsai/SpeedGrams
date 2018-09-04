import { getGameState } from '../../../store/utils/getGameState';
import isNil from 'lodash/isNil';
import { directions, oppositeDirection } from '../../game/utils/directions';

const isTilesConnected = (store) => {
  const { mainBoardTileGraph } = getGameState(store);
  const mainBoardTileKeys = Object.keys(mainBoardTileGraph);
  const length = mainBoardTileKeys.length;

  let counter = 1; // to include starting tile
  const checkTile = (tile, originDirection) => {
    directions.array.forEach((direction) => {
      if (isNil(tile[direction]) || tile[direction].visited || direction === originDirection) {
        return;
      }
      counter = counter + 1;
      tile[direction].visited = true;
      checkTile(tile[direction], oppositeDirection(direction));
    });
  };
  const startPoint = mainBoardTileGraph[mainBoardTileKeys[0]]; // start at random tile
  startPoint.visited = true;
  checkTile(startPoint, null);

  // resetFlags
  const resetVisitedFlags = (tile, originDirection) => {
    tile.visited = false;
    directions.array.forEach((direction) => {
      if (isNil(tile[direction]) || !tile[direction].visited || direction === originDirection) {
        return;
      }

      tile[direction].visited = false;
      resetVisitedFlags(tile[direction], oppositeDirection(direction));
    });
  };
  resetVisitedFlags(startPoint);

  return counter === length;
};

export default isTilesConnected;
