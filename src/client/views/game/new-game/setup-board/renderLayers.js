import * as PIXI from 'pixi.js';

import { getGameState } from '../../../../store/utils/getGameState';

const renderLayers = (store) => {
  renderBottomPanelLayers(store);
  renderMainBoardLayers(store);
};

const renderBottomPanelLayers = (store) => {
  const { app, bottomPanelHeight } = getGameState(store);

  // render bottom panel background
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.width = app.screen.width;
  bg.height = bottomPanelHeight;
  bg.y = app.screen.height - bg.height;
  bg.tint = 0x336600;
  app.stage.addChild(bg);

  // render bottom panel scrolling layer and add to game store
  const bottomPanelScrollContainer = new PIXI.Container();
  bottomPanelScrollContainer.x = 0 + 50;
  bottomPanelScrollContainer.y = app.screen.height - 100;
  app.stage.addChild(bottomPanelScrollContainer);
  store.dispatch({
    type: 'ADD_BOTTOM_PANEL_SCROLL_LAYER',
    bottomPanelScrollLayer: bottomPanelScrollContainer,
  });

  // render bottom panel frame
    // pixi js shapes
};

const renderMainBoardLayers = (store) => {
  const { app, bottomPanelHeight } = getGameState(store);

  // render main board background
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.width = app.screen.width;
  bg.height = app.screen.height - bottomPanelHeight;
  bg.tint = 0x808080;
  app.stage.addChild(bg);

  // render main board container
  const mainBoardContainer = new PIXI.Container();
  app.stage.addChild(mainBoardContainer);
  store.dispatch({
    type: 'ADD_MAIN_BOARD_LAYER',
    mainBoardLayer: mainBoardContainer,
  });
};

export default renderLayers;
