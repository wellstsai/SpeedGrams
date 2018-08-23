export const addApp = (app) => ({
  type: 'ADD_APP',
  app,
});

export const addResources = (resources) => ({
  type: 'ADD_RESOURCES',
  resources,
});

export const addBottomPanelScrollLayer = (bottomPanelScrollLayer) => ({
  type: 'ADD_BOTTOM_PANEL_SCROLL_LAYER',
  bottomPanelScrollLayer,
});

export const addMainBoardLayer = (mainBoardLayer) => ({
  type: 'ADD_MAIN_BOARD_LAYER',
  mainBoardLayer,
});

export const initializePlayerTiles = (playerTiles) => ({
  type: 'INITIALIZE_PLAYER_TILES',
  playerTiles,
});

export const deletePlayerTile = (index) => ({
  type: 'DELETE_PLAYER_TILE',
  index,
});
