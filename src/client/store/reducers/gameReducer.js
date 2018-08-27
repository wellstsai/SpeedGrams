import _ from 'lodash';

const defaultState = {
  app: null,
  resources: null,
  bottomPanelScrollLayer: null,
  mainBoardLayer: null,
  mainBoardBounds: null,
  bottomPanelHeight: 150,
  scrollerBaseHeight: 100,
  playerTiles: [],
  mainBoardTileGraph: {},
  isDragging: null,
  hitSpots: [],
};

const gameReducer = (state = _.cloneDeep(defaultState), action) => {
  switch (action.type) {
  case 'ADD_APP': {
    return {
      ...state,
      app: action.app,
    };
  }
  
  case 'ADD_RESOURCES': {
    return {
      ...state,
      resources: action.resources,
    };
  }
  
  case 'ADD_BOTTOM_PANEL_SCROLL_LAYER': {
    return {
      ...state,
      bottomPanelScrollLayer: action.bottomPanelScrollLayer,
    };
  }
  
  case 'ADD_MAIN_BOARD_LAYER': {
    return {
      ...state,
      mainBoardLayer: action.mainBoardLayer,
      mainBoardBounds: action.mainBoardBounds,
    };
  }

  case 'INITIALIZE_PLAYER_TILES': {
    return {
      ...state,
      playerTiles: [...state.playerTiles, ...action.playerTiles],
    };
  }

  case 'DELETE_PLAYER_TILE': {
    return {
      ...state,
      playerTiles: state.playerTiles.filter((tile, index) => index !== action.index),
    };
  }

  case 'ADD_MAIN_BOARD_TILE': {
    // const mainBoardTileGraph = _.cloneDeep(state.mainBoardTileGraph);
    state.mainBoardTileGraph[action.mainBoardTile.id] = action.mainBoardTile;
    return {
      ...state,
    };
  }

  case 'TOGGLE_IS_DRAGGING': {
    return {
      ...state,
      isDragging: action.isDragging,
    };
  }

  case 'ADD_HIT_SPOT': {
    const hitSpots = [...state.hitSpots];
    // binary search insert
    // check middle, if to the right go right, if left go left, otherwise splice
    hitSpots.push(action.hitSpot);
    return {
      ...state,
      hitSpots,
    };
  }

  case 'CLEAN_DESTROYED_HIT_SPOTS': {
    // const hitSpots = state.hitSpots.filter((hitSpot) => !hitSpot._destroyed);
    // const hitSpots = [...state.hitSpots];
    _.remove(state.hitSpots, (hitSpot) => hitSpot._destroyed);
    return state;
  }

  default:  {
    return state;
  }

  }
};

export default gameReducer;