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

  // on initialize, has direction, no hitspots destroyed
  // on regular move, same as above
  // on snap, hitspot becomes destroyed, want to keep it that way
  // on removed from snap to free space, hitspot still destroyed, want to replenish
  // on removed from snap, and snap again, hitspot destroyed but want to replenish and then destroy again
  relevantHitSpots.forEach((hitSpot) => {
    if (hitSpot._destroyed) {
      return;
    }

    if (hitSpot.direction === 'top') {
      hitSpot.x = x - (width / 2);
      hitSpot.y = y - (height * 1.5);
    }
    
    if (hitSpot.direction === 'bottom') {
      hitSpot.x = x - (width / 2);
      hitSpot.y = y + (height / 2);
    }
    
    if (hitSpot.direction === 'left') {
      hitSpot.x = x - (width * 1.5);
      hitSpot.y = y - (height / 2);
    }

    if (hitSpot.direction === 'right') {
      hitSpot.x = x + (width / 2);
      hitSpot.y = y - (height / 2);
    }
  });
};

const autoSnapIfCollision = (parentTile, store) => {
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
  let relevantHitSpots = [];
  possibleHitSpots.forEach((hitSpot) => {
    if (!relevantHitSpots.length) {
      relevantHitSpots.push(hitSpot);
      return;
    }
    
    // if same spot, add to array, if closer, replace
    if (Math.round(relevantHitSpots[0].x) === Math.round(hitSpot.x) && Math.round(relevantHitSpots[0].y) === Math.round(hitSpot.y)) {
      relevantHitSpots.push(hitSpot);
    } else if (Math.hypot(x - hitSpot.x, y - hitSpot.y) < Math.hypot(x - relevantHitSpots[0].x, y - relevantHitSpots[0].y)) {
      relevantHitSpots = [hitSpot];
    }
  });

  console.log('relevantHitSpots', relevantHitSpots);

  if (relevantHitSpots.length) {
    // autosnap
    parentTile.x = relevantHitSpots[0].x + (relevantHitSpots[0].width / 2);
    parentTile.y = relevantHitSpots[0].y + (relevantHitSpots[0].height / 2);

    console.log('mianboardtilegraph', mainBoardTileGraph);

    relevantHitSpots.forEach((hitSpot) => {
      const hitTile = mainBoardTileGraph[hitSpot.parentId];
      const placedTile = mainBoardTileGraph[parentTile.id];
      
      // update main board graph
      const direction = hitSpot.direction;
      hitTile[direction] = placedTile;
      placedTile[oppositeDirection[direction]] = hitTile;
      
      console.log('***destroying')
      // remove hitspots
      hitSpot.destroy();
      const placedTileHitSpot = hitSpots.find((hitSpot) => (hitSpot.parentId === placedTile.id) && (hitSpot.direction === oppositeDirection[direction]));
      placedTileHitSpot.destroy();
    });

    // // clean out destroyed hit spots
    store.dispatch({ type: 'CLEAN_DESTROYED_HIT_SPOTS' });
  } else {
    const directions = ['top', 'bottom', 'left', 'right'];
    const placedTile = mainBoardTileGraph[parentTile.id];
    directions.forEach((direction) => {
      if (placedTile[direction]) {
        const previouslyHitTile = placedTile[direction];
        previouslyHitTile[oppositeDirection[direction]] = null;
        placedTile[direction] = null;
        // re-add hitspot TODO *********************************
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

  console.log('***hitSpots', hitSpots)
  hitSpots.forEach((hitSpot) => hitSpot.alpha = 1);

  const hitSpotTiles = ['top', 'bottom', 'left', 'right'];
  hitSpotTiles.forEach((hitSpot) => {
    mainBoardTileSprite[hitSpot] = new PIXI.Sprite(PIXI.Texture.WHITE);
    mainBoardTileSprite[hitSpot].alpha = 1; // change to 0
    mainBoardTileSprite[hitSpot].tint = 0x36c2ed;
    mainBoardTileSprite[hitSpot].width = mainBoardTileSprite.width;
    mainBoardTileSprite[hitSpot].height = mainBoardTileSprite.height;
    mainBoardTileSprite[hitSpot].interactive = true;
    mainBoardTileSprite[hitSpot].x = -mainBoardTileSprite.width;
    mainBoardTileSprite[hitSpot].id = shortid.generate();
    mainBoardTileSprite[hitSpot].parentId = mainBoardTileSprite.id;
    mainBoardTileSprite[hitSpot].covered = false;
    mainBoardTileSprite[hitSpot].direction = hitSpot;

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
    
    if (!this._destroyed) {
      autoSnapIfCollision(this, store);

      positionHitSpots(this, hitSpots);
    }
  } else {
    this.on('pointermove', (e) => onMainBoardTileSpritePointerMove.bind(this)(e, app));
    this.dragging = true;
    this.initialPosition = [this.x, this.y];

    store.dispatch({
      type: 'TOGGLE_IS_DRAGGING',
      isDragging: true,
    });

    // set hit spots alpha 1, and move own hit spots out of board
    hitSpots.forEach((hitSpot) => {
      hitSpot.alpha = 1;
      if (hitSpot.parentId === this.id) {
        hitSpot.x = -hitSpot.width;
        hitSpot.y = -hitSpot.height;
      }
    });
    // check to see if movd out of other hit spots, if so, set alpha to 1
  }
}

export default renderStartTiles;
