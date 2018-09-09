import { getTileBank } from '../setup';

const addTile = (store) => {
  // grab tile from player bank
  const newTile = getTileBank().pop();
  // use createPlayerTile
  // add to redux
};

export default addTile;
