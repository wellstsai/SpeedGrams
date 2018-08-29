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

export const addMainBoardTile = (mainBoardTile) => ({
  type: 'ADD_MAIN_BOARD_TILE',
  mainBoardTile,
});

export const toggleIsDragging = (isDragging) => ({
  type: 'TOGGLE_IS_DRAGGING',
  isDragging,
});

export const addHitSpot = (hitSpot) => ({
  type: 'ADD_HIT_SPOT',
  hitSpot,
});

export const cleanOldHitSpots = () => ({
  type: 'CLEAN_OLD_HIT_SPOTS',
});

export const addAddTileButton = (addTileButton) => ({
  type: 'ADD_ADD_TILE_BUTTON',
  addTileButton,
});

export const addCompleteButton = (completeButton) => ({
  type: 'ADD_ADD_TILE_BUTTON',
  completeButton,
});
