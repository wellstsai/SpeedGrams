import * as PIXI from 'pixi.js';
import shortid from 'shortid';
import { getTileBank, getStartingTiles } from '../../setup';
import { getGameState } from '../../../../store/utils/getGameState';

const renderStartTiles = (store) => {
  const gameState = getGameState(store);
  const { resources, bottomPanelScrollLayer } = gameState;
  const tileBank = getTileBank();
  const startingTiles = getStartingTiles(2, tileBank); // returns array
  const playerTiles = [];

  startingTiles.forEach((letter, index) => {
    // position the sprite
    const letterSprite = new PIXI.Sprite(resources.tiles.textures[`letter_${letter.toUpperCase()}.png`]);
    letterSprite.x = (index % 12) * 53;
    letterSprite.y = Math.floor(index / 12) * 53;
    letterSprite.interactive = true;
    letterSprite.buttonMode = true;
    letterSprite.anchor.set(0.5);
    letterSprite.scale.set(0.2);
    
    // custom params
    letterSprite.resource = resources.tiles.textures[`letter_${letter.toUpperCase()}.png`];
    letterSprite.letter = letter;
    letterSprite.index = index;

    letterSprite
      .on('pointerdown', (e) => onPlayerTileDragStart.bind(letterSprite)(e, store));
    bottomPanelScrollLayer.addChild(letterSprite);

    playerTiles.push({
      id: index,
      letter,
      sprite: letterSprite,
    });

  });

  store.dispatch({
    type: 'INITIALIZE_PLAYER_TILES',
    playerTiles,
  });
};

const isWithinBounds = (sprite, bounds) => {
  const { width, height, x, y } = bounds;

  const isWithinXBounds = sprite.x > x && sprite.x < width;
  const isWithinYBounds = sprite.y > y && sprite.y < height;

  if (isWithinXBounds && isWithinYBounds) {
    return true;
  }
  return false;
};

function onPlayerTileDragStart(event, store) {
  this.alpha = 0;

  const { app, mainBoardLayer } = getGameState(store);

  const mainBoardTileSprite = new PIXI.Sprite(this.resource);
  const currentPosition = app.renderer.plugins.interaction.mouse.global;
  mainBoardTileSprite.x = currentPosition.x;
  mainBoardTileSprite.y = currentPosition.y;
  mainBoardTileSprite.dragging = true;
  mainBoardTileSprite.interactive = true;
  mainBoardTileSprite.buttonMode = true;
  mainBoardTileSprite.anchor.set(0.5);
  mainBoardTileSprite.scale.set(0.2);
  mainBoardTileSprite.letter = this.letter;
  mainBoardTileSprite.id = shortid.generate();

  // create up down left right sprite for each, alpha 0, position pending, add listeners, add id, dispatch
  const hitSpots = ['up', 'down', 'left', 'right'];
  hitSpots.forEach((hitSpot) => {
    mainBoardTileSprite[hitSpot] = new PIXI.Sprite(PIXI.Texture.WHITE);
    mainBoardTileSprite[hitSpot].alpha = 1; // change to 0
    mainBoardTileSprite[hitSpot].tint = 0x36c2ed;
    mainBoardTileSprite[hitSpot].width = mainBoardTileSprite.width;
    mainBoardTileSprite[hitSpot].height = mainBoardTileSprite.height;
    mainBoardTileSprite[hitSpot].interactive = true;
    mainBoardTileSprite[hitSpot].id = shortid.generate();

    // dispatch

    mainBoardLayer.addChild(mainBoardTileSprite[hitSpot]);
  });

  mainBoardTileSprite
    .on('pointermove', (e) => onMainBoardTileSpritePointerMove.bind(mainBoardTileSprite)(e, app))
    .on('pointerdown', (e) => onMainBoardTileSpritePointerDown.bind(mainBoardTileSprite)(e, store, this));
  mainBoardLayer.addChild(mainBoardTileSprite);
}

function onMainBoardTileSpritePointerMove(event, app) {
  if (this.dragging) {
    const mouseposition = app.renderer.plugins.interaction.mouse.global;
    this.x = mouseposition.x;
    this.y = mouseposition.y;
  }
}

function onMainBoardTileSpritePointerDown(event, store, playerTileSprite) {
  const { app, mainBoardBounds } = getGameState(store);

  console.log("event", event.target)

  if (this.dragging) {
    this.off('pointermove');
    this.dragging = false;

    store.dispatch({
      type: 'TOGGLE_IS_DRAGGING',
      isDragging: false,
    });

    // set hit spots position
    
    // check if hit other hit spots, if so, set alpha to 0

  } else {
    this.on('pointermove', (e) => onMainBoardTileSpritePointerMove.bind(this)(e, app));
    this.dragging = true;
    this.initialPosition = [this.x, this.y];

    store.dispatch({
      type: 'TOGGLE_IS_DRAGGING',
      isDragging: true,
    });

    // set hit spots alpha 1
    // check to see if movd out of other hit spots, if so, set alpha to 1
  }

  if (!isWithinBounds(this, mainBoardBounds) && !playerTileSprite._destroyed) {
    this.destroy();
    playerTileSprite.alpha = 1;
  } else if (!isWithinBounds(this, mainBoardBounds) && playerTileSprite._destroyed) {
    this.x = this.initialPosition[0];
    this.y = this.initialPosition[1];
  } else if (isWithinBounds(this, mainBoardBounds) && !playerTileSprite._destroyed) {
    store.dispatch({
      type: 'DELETE_PLAYER_TILE',
      index: playerTileSprite.index,
    });
    playerTileSprite.destroy();

    store.dispatch({
      type: 'ADD_MAIN_BOARD_TILE',
      mainBoardTile: {
        id: this.id,
        letter: this.letter,
        up: null,
        down: null,
        left: null,
        right: null,
      },
    });
  }
}

export default renderStartTiles;
