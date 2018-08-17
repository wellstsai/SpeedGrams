import * as PIXI from 'pixi.js';
import { getTileBank, getStartingTiles } from './setup';

const bottomPanelHeight = 150;
const scrollerBaseHeight = 100;

const startNewGame = (app, resources, numOfPlayers) => {
  // connect to a multiplayer channel

  // setup/render board based on numOfPlayers
    // randomize board
  const tileBank = getTileBank();
  const scrollbarContainer = renderBottomPanel(app);
  renderStartTiles(app, resources, tileBank, scrollbarContainer);
  renderScroller(app, scrollbarContainer);

  // gameOn loop with game logic

};

const renderBottomPanel = (app) => {
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.width = 800;
  bg.height = bottomPanelHeight;
  bg.tint = 0x336600;
  bg.y = app.screen.height - bg.height;
  app.stage.addChild(bg);
  
  const scrollbarContainer = new PIXI.Container({ backgroundColor: 'white' });
  scrollbarContainer.x = 0 + 50;
  scrollbarContainer.y = app.screen.height - 100;
  app.stage.addChild(scrollbarContainer);

  return scrollbarContainer;
};

const renderStartTiles = (app, resources, tileBank, scrollbarContainer) => {
  const startingTiles = getStartingTiles(2, tileBank); // returns array
  const playerTiles = {};
  startingTiles.forEach((letter, index) => {
    const id = letter + index;
    playerTiles[`${letter}${index}`] = {
      id,
      letter,
      isOnBoard: false,
      sprite: new PIXI.Sprite(resources.tiles.textures[`letter_${letter.toUpperCase()}.png`]),
    };

    // position the sprite
    const letterSprite = playerTiles[`${letter}${index}`].sprite;
    letterSprite.x = (index % 12) * 53;
    letterSprite.y = Math.floor(index / 12) * 53;
    // console.log('xy', letterSprite.x, letterSprite.y)
    letterSprite.interactive = true;
    letterSprite.buttonMode = true;
    letterSprite.anchor.set(0.5);
    letterSprite.scale.set(0.2);

    letterSprite
      .on('pointerdown', onDragStart.bind(letterSprite))
      .on('pointerup', onDragEnd.bind(letterSprite))
      .on('pointerupoutside', onDragEnd.bind(letterSprite))
      .on('pointermove', onDragMove.bind(letterSprite));
    scrollbarContainer.addChild(letterSprite);
  });
};

const renderScroller = (app, scrollbarContainer) => {
  // render scrollbar scroller
  const scrollerHeightRatio = bottomPanelHeight / scrollbarContainer.height;
  const scrollerHeight = scrollerBaseHeight * scrollerHeightRatio;

  if (scrollerHeightRatio >= 1) {
    return;
  }

  console.log('scrollbar ratio', scrollerHeightRatio)
  console.log('scroller height', scrollerHeight)
  const scroller = new PIXI.Sprite(PIXI.Texture.WHITE);
  scroller.width = 15;
  scroller.height = scrollerHeight;
  scroller.x = app.screen.width - 20;
  scroller.y = app.screen.height - 120;
  scroller.interactive = true;
  scroller.buttonMode = true;

  scroller
    .on('pointerdown', (e) => onScrollerStart.bind(scroller)(e, scrollbarContainer, app))
    .on('pointerup', (e) => onScrollerEnd.bind(scroller)(e, scrollbarContainer))
    .on('pointerupoutside', (e) => onScrollerEnd.bind(scroller)(e, scrollbarContainer))
    .on('pointermove', (e) => onScrollerMove.bind(scroller)(e, scrollbarContainer));
  app.stage.addChild(scroller);

  const scrollerFrame = new PIXI.Sprite(PIXI.Texture.WHITE);
  scrollerFrame.width = app.screen.width;
  scrollerFrame.height = app.screen.height;
  app.stage.addChild(scrollerFrame);

};

function onDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}

function onDragEnd() {
  this.data = null;
  this.alpha = 1;
  this.dragging = false;
  // set the interaction data to null
}

function onDragMove() {
  if (this.dragging) {
    const newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x;
    this.y = newPosition.y;
  }
}

function onScrollerStart(event, scrollbarContainer, app) {
  this.data = event.data;
  this.dragging = true;

  // TODO: make these bounds only calculate once, otherwise will adjust after scrolling
  this.topBound = app.screen.height - 120;
  this.bottomBound = this.topBound - this.height + scrollerBaseHeight + 10;
}

function onScrollerEnd(e, scrollbarContainer) {
  this.data = null;
  this.dragging = false;
}

function onScrollerMove(e, scrollbarContainer) {
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
    const newContainerPosition = scrollbarContainer.y - interpolatedContainerDifference;

    scrollbarContainer.y = newContainerPosition;
    this.y = newScrollerPosition.y;
  }
}

export default startNewGame;
