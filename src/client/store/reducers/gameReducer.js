import _ from 'lodash';

const defaultState = {
  app: null,
  resources: null,
  bottomPanelScrollLayer: null,
  mainBoardLayer: null,
  bottomPanelHeight: 150,
  scrollerBaseHeight: 100,
  playerTiles: [],
};

const gameReducer = (state = _.cloneDeep(defaultState), action) => {
  switch (action.type) {
  case 'ADD_APP':
    return {
      ...state,
      app: action.app,
    };
  
  case 'ADD_RESOURCES':
    return {
      ...state,
      resources: action.resources,
    };
  
  case 'ADD_BOTTOM_PANEL_SCROLL_LAYER':
    return {
      ...state,
      bottomPanelScrollLayer: action.bottomPanelScrollLayer,
    };
  
  case 'ADD_MAIN_BOARD_LAYER':
    return {
      ...state,
      mainBoardLayer: action.mainBoardLayer,
    };

  case 'INITIALIZE_PLAYER_TILES':
    return {
      ...state,
      playerTiles: [...state.playerTiles, ...action.playerTiles],
    };

  case 'DELETE_PLAYER_TILE':
    return {
      ...state,
      playerTiles: state.playerTiles.filter((tile, index) => index !== action.index),
    };

  default:
    return state;
  }
};

export default gameReducer;