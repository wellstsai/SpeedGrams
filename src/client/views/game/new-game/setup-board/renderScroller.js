import * as PIXI from 'pixi.js';

import { getGameState } from '../../../../store/utils/getGameState';

const renderScroller = (store) => {
  const gameStore = getGameState(store);
  const { app, bottomPanelHeight, scrollerBaseHeight, bottomPanelScrollLayer } = gameStore;
  // render scrollbar scroller
  const scrollerHeightRatio = bottomPanelHeight / bottomPanelScrollLayer.height;
  const scrollerHeight = scrollerBaseHeight * scrollerHeightRatio;

  if (scrollerHeightRatio >= 1) {
    return;
  }

  const scroller = new PIXI.Sprite(PIXI.Texture.WHITE);
  scroller.width = 15;
  scroller.height = scrollerHeight;
  scroller.x = app.screen.width - 20;
  scroller.y = app.screen.height - 120;
  scroller.interactive = true;
  scroller.buttonMode = true;

  scroller
    .on('pointerdown', (e) => onScrollerStart.bind(scroller)(e, gameStore))
    .on('pointerup', (e) => onScrollerEnd.bind(scroller)(e))
    .on('pointerupoutside', (e) => onScrollerEnd.bind(scroller)(e))
    .on('pointermove', (e) => onScrollerMove.bind(scroller)(e, gameStore));
  app.stage.addChild(scroller);

};

function onScrollerStart(event, gameStore) {
  const { app, scrollerBaseHeight } = gameStore;

  this.data = event.data;
  this.dragging = true;

  // TODO: make these bounds only calculate once, otherwise will adjust after scrolling
  this.topBound = app.screen.height - 120;
  this.bottomBound = this.topBound - this.height + scrollerBaseHeight + 10;
}

function onScrollerEnd() {
  this.data = null;
  this.dragging = false;
}

function onScrollerMove(e, gameStore) {
  const { bottomPanelHeight, bottomPanelScrollLayer } = gameStore;

  if (this.dragging) {
    const newScrollerPosition = this.data.getLocalPosition(this.parent);
    
    if (newScrollerPosition.y < this.topBound) {
      newScrollerPosition.y = this.topBound;
    }

    if (newScrollerPosition.y > this.bottomBound) {
      newScrollerPosition.y = this.bottomBound;
    }
    
    const difference = newScrollerPosition.y - this.y;
    const interpolatedContainerDifference = (difference / this.height) * bottomPanelHeight; // this preserves the ratio of scrollbar to amt scrolled in container
    const newContainerPosition = bottomPanelScrollLayer.y - interpolatedContainerDifference;

    bottomPanelScrollLayer.y = newContainerPosition;
    this.y = newScrollerPosition.y;
  }
}

export default renderScroller;
