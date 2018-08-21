import renderLayers from './renderLayers';
// import renderBottomPanel from './renderBottomPanel';
import renderStartTiles from './renderStartTiles';
import renderScroller from './renderScroller';
// import renderStartBoard from './renderStartBoard';
// import renderOtherPlayersView from './renderOtherPlayersView';

const setupBoard = (store) => {
  renderLayers(store);
  renderStartTiles(store);
  renderScroller(store);
  // renderStartBoard();
  // renderOtherPlayersView();
};

export default setupBoard;