import { getGameState } from '../../../store/utils/getGameState';

const isTilesConnected = (store) => {
  const { mainBoardTileGraph } = getGameState(store);

  // TODO: iterate through any random mainBoardTileGraph, see if count adds up to object.keys(mainboardtilegraph)

  const length = Object.keys(mainBoardTileGraph).length;
  const counter = 0;

  // start at rando point
  // trbl, if not null recurse, skip direction it came from
  // set flags, add count

  // reset all flags

  return false;
};

export default isTilesConnected;
