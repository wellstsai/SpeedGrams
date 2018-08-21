import _ from 'lodash';

const defaultState = {
  app: null,
  resources: null,
  bottomPanelScrollLayer: null,
  mainBoardLayer: null,
  bottomPanelHeight: 150,
  scrollerBaseHeight: 100,
};

const gameReducer = (state = _.cloneDeep(defaultState), action) => {
  switch (action.type) {
  case 'ADD_APP':
    return Object.assign({}, state, {
      app: action.app
    });
  
  case 'ADD_RESOURCES':
    return Object.assign({}, state, {
      resources: action.resources
    });
  
  case 'ADD_BOTTOM_PANEL_SCROLL_LAYER':
    return Object.assign({}, state, {
      bottomPanelScrollLayer: action.bottomPanelScrollLayer
    });
  
  case 'ADD_MAIN_BOARD_LAYER':
    return Object.assign({}, state, {
      mainBoardLayer: action.mainBoardLayer
    });

  default:
    return state;
  }
};

export default gameReducer;