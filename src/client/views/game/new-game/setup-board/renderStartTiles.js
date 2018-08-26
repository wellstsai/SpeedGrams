import * as PIXI from 'pixi.js';
import shortid from 'shortid';
import { getTileBank, getStartingTiles } from '../../setup';
import { getGameState } from '../../../../store/utils/getGameState';

const oppositeDirection = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

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

const positionHitSpots = (parentTile, storeHitSpots) => {
  const { id, x, y, width, height } = parentTile;
  const relevantHitSpots = storeHitSpots.filter((hitSpot) => hitSpot.parentId === id);

  relevantHitSpots[0].direction = 'top';
  relevantHitSpots[0].x = x - (width / 2);
  relevantHitSpots[0].y = y - (height * 1.5);

  relevantHitSpots[1].direction = 'bottom';
  relevantHitSpots[1].x = x - (width / 2);
  relevantHitSpots[1].y = y + (height / 2);

  relevantHitSpots[2].direction = 'left';
  relevantHitSpots[2].x = x - (width * 1.5);
  relevantHitSpots[2].y = y - (height / 2);

  relevantHitSpots[3].direction = 'right';
  relevantHitSpots[3].x = x + (width / 2);
  relevantHitSpots[3].y = y - (height / 2);
};

const autoSnapIfCollision = (parentTile, store) => {
  // go through every main board tile y hit spots
    // if y is within, go through x hit spots
      // if x also within, add to possbileHitSpots
  const { x, y } = parentTile;
  const { mainBoardTileGraph, hitSpots } = getGameState(store);

  
  const possibleHitSpots = hitSpots.reduce((acc, hitSpot) => {
    const { top, bottom, left, right } = hitSpot.getBounds();
    if (y > top && y < bottom) {
      if (x > left && x < right) {
        acc.push(hitSpot);
      }
    }
    return acc;
  }, []);

  console.log('possibleHitSpots', possibleHitSpots);
  // check which hitspot is closest to tile, add to an array relevantHitSpots to account for same dimensions
  // snap tile to closest
  const relevantHitSpots = possibleHitSpots.reduce((acc, hitSpot) => {
    if (
      !acc.length ||
      (Math.round(acc[0].x) === Math.round(hitSpot.x) && Math.round(acc[0].y) === Math.round(hitSpot.y))
    ) {
      acc.push(hitSpot);
      return acc;
    } else if (Math.hypot(x - hitSpot.x, y - hitSpot.y) < Math.hypot(x - acc[0].x, y - acc[0].y)) {
      return [hitSpot];
    } else {
      return acc;
    }
  }, []);
  console.log('relevantHitSpots', relevantHitSpots);

  if (relevantHitSpots.length) {
    // autosnap
    parentTile.x = relevantHitSpots[0].x + (relevantHitSpots[0].width / 2);
    parentTile.y = relevantHitSpots[0].y + (relevantHitSpots[0].height / 2);

    // update main board graph
    console.log('mianboardtilegraph', mainBoardTileGraph);
    relevantHitSpots.forEach((hitSpot) => {
      const hitTile = mainBoardTileGraph[hitSpot.parentId];
      const placedTile = mainBoardTileGraph[parentTile.id];
      hitTile[hitSpot.direction] = placedTile;
      placedTile[oppositeDirection[hitSpot.direction]] = hitTile;
    });
  } else {
    const directions = ['top', 'bottom', 'left', 'right'];
    const placedTile = mainBoardTileGraph[parentTile.id];
    directions.forEach((direction) => {
      if (placedTile[direction]) {
        const previouslyHitTile = placedTile[direction];
        previouslyHitTile[oppositeDirection[direction]] = null;
        placedTile[direction] = null;
      }
    });
  }
};

function onPlayerTileDragStart(event, store) {
  this.alpha = 0;

  const { app, mainBoardLayer, hitSpots } = getGameState(store);

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

  hitSpots.forEach((hitSpot) => hitSpot.alpha = 0.5);
  // create up down left right sprite for each, alpha 0, position pending, add listeners, add id, dispatch
  const hitSpotTiles = ['up', 'down', 'left', 'right'];
  hitSpotTiles.forEach((hitSpot) => {
    mainBoardTileSprite[hitSpot] = new PIXI.Sprite(PIXI.Texture.WHITE);
    mainBoardTileSprite[hitSpot].alpha = 1; // change to 0
    mainBoardTileSprite[hitSpot].tint = 0x36c2ed;
    mainBoardTileSprite[hitSpot].width = mainBoardTileSprite.width;
    mainBoardTileSprite[hitSpot].height = mainBoardTileSprite.height;
    mainBoardTileSprite[hitSpot].interactive = true;
    mainBoardTileSprite[hitSpot].id = shortid.generate();
    mainBoardTileSprite[hitSpot].parentId = mainBoardTileSprite.id;
    mainBoardTileSprite[hitSpot].covered = false;

    store.dispatch({
      type: 'ADD_HIT_SPOT',
      hitSpot: mainBoardTileSprite[hitSpot],
    });

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
  const { app, mainBoardBounds, hitSpots } = getGameState(store);
  
  if (!isWithinBounds(this, mainBoardBounds) && !playerTileSprite._destroyed) {
    this.destroy();
    playerTileSprite.alpha = 1;
  } else if (!isWithinBounds(this, mainBoardBounds) && playerTileSprite._destroyed) {
    this.x = this.initialPosition[0];
    this.y = this.initialPosition[1];
    positionHitSpots(this, hitSpots);
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
  
  if (this.dragging) {
    this.off('pointermove');
    this.dragging = false;

    store.dispatch({
      type: 'TOGGLE_IS_DRAGGING',
      isDragging: false,
    });

    hitSpots.forEach((hitSpot) => hitSpot.alpha = 0);
    autoSnapIfCollision(this, store);
    positionHitSpots(this, hitSpots);
  } else {
    this.on('pointermove', (e) => onMainBoardTileSpritePointerMove.bind(this)(e, app));
    this.dragging = true;
    this.initialPosition = [this.x, this.y];

    store.dispatch({
      type: 'TOGGLE_IS_DRAGGING',
      isDragging: true,
    });

    // set hit spots alpha 1 except for own
    hitSpots.forEach((hitSpot) => {
      if (hitSpot.parentId !== this.id) {
        hitSpot.alpha = 0.5;
      }
    });
    // check to see if movd out of other hit spots, if so, set alpha to 1
  }
}

export default renderStartTiles;
