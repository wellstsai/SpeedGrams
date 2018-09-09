import * as PIXI from 'pixi.js';
import shortid from 'shortid';
import each from 'lodash/each';
import { getGameState } from '../../../store/utils/getGameState';
import isTilesConnected from '../utils/isTileConnected';
import { directions, oppositeDirection } from '../utils/directions';
import positionPlayerTiles from '../utils/positionPlayerTiles';

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

    if (hitSpot.direction === directions.TOP) {
      hitSpot.x = x - (width / 2);
      hitSpot.y = y - (height * 1.5);
    }
    
    if (hitSpot.direction === directions.BOTTOM) {
      hitSpot.x = x - (width / 2);
      hitSpot.y = y + (height / 2);
    }
    
    if (hitSpot.direction === directions.LEFT) {
      hitSpot.x = x - (width * 1.5);
      hitSpot.y = y - (height / 2);
    }

    if (hitSpot.direction === directions.RIGHT) {
      hitSpot.x = x + (width / 2);
      hitSpot.y = y - (height / 2);
    }
  });
};

const createHitSpot = (store, mainBoardTileSprite, direction) => {
  const { mainBoardLayer } = getGameState(store);

  mainBoardTileSprite[direction] = new PIXI.Sprite(PIXI.Texture.WHITE);
  mainBoardTileSprite[direction].alpha = 1;
  mainBoardTileSprite[direction].tint = 0x36c2ed;
  mainBoardTileSprite[direction].width = mainBoardTileSprite.width;
  mainBoardTileSprite[direction].height = mainBoardTileSprite.height;
  mainBoardTileSprite[direction].interactive = true;
  mainBoardTileSprite[direction].x = -mainBoardTileSprite.width;
  mainBoardTileSprite[direction].id = shortid.generate();
  mainBoardTileSprite[direction].parentId = mainBoardTileSprite.id;
  mainBoardTileSprite[direction].covered = false;
  mainBoardTileSprite[direction].direction = direction;

  store.dispatch({
    type: 'ADD_HIT_SPOT',
    hitSpot: mainBoardTileSprite[direction],
  });

  mainBoardLayer.addChild(mainBoardTileSprite[direction]);
};

const autoSnapIfCollision = (parentTile, store) => {
  const { x, y } = parentTile;
  const { mainBoardTileGraph, hitSpots } = getGameState(store);

  const possibleHitSpots = hitSpots.reduce((acc, hitSpot) => {
    if (!hitSpot._destroyed) {
      const { top, bottom, left, right } = hitSpot.getBounds();
      if (y > top && y < bottom) {
        if (x > left && x < right) {
          acc.push(hitSpot);
        }
      }
    }
    return acc;
  }, []);

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

  if (relevantHitSpots.length) {
    // autosnap
    parentTile.x = relevantHitSpots[0].x + (relevantHitSpots[0].width / 2);
    parentTile.y = relevantHitSpots[0].y + (relevantHitSpots[0].height / 2);

    relevantHitSpots.forEach((hitSpot) => {
      const hitTile = mainBoardTileGraph[hitSpot.parentId];
      const placedTile = mainBoardTileGraph[parentTile.id];
      
      // update main board graph
      const direction = hitSpot.direction;
      hitTile[direction] = placedTile;
      placedTile[oppositeDirection(direction)] = hitTile;
      
      // remove hitspots
      hitSpot.destroy();
      const placedTileHitSpot = hitSpots.find((hitSpot) => (hitSpot.parentId === placedTile.id) && (hitSpot.direction === oppositeDirection(direction)));
      !placedTileHitSpot._destroyed && placedTileHitSpot.destroy();
    });

    // clean out destroyed hit spots
    // store.dispatch({ type: 'CLEAN_DESTROYED_HIT_SPOTS' });
  } else {
    const placedTile = mainBoardTileGraph[parentTile.id];
    directions.array.forEach((direction) => {
      if (placedTile[direction]) {
        const previouslyHitTile = placedTile[direction];
        previouslyHitTile[oppositeDirection(direction)] = null;
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
  mainBoardTileSprite.resource = this.resource;

  hitSpots.forEach((hitSpot) => hitSpot.alpha = 1);

  const hitSpotTiles = directions.array;
  hitSpotTiles.forEach((hitSpot) => {
    createHitSpot(store, mainBoardTileSprite, hitSpot);
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
  const { app, mainBoardBounds, hitSpots, mainBoardTileGraph, mainBoardLayer, addTileButton, completeButton } = getGameState(store);

  if (!isWithinBounds(this, mainBoardBounds) && !playerTileSprite._destroyed) {
    this.destroy();
    playerTileSprite.alpha = 1;
  } else if (!isWithinBounds(this, mainBoardBounds) && playerTileSprite._destroyed) {
    this.x = this.initialPosition[0];
    this.y = this.initialPosition[1];

    positionHitSpots(this, hitSpots);
  } else if (isWithinBounds(this, mainBoardBounds) && !playerTileSprite._destroyed) {
    positionHitSpots(this, hitSpots);

    store.dispatch({
      type: 'DELETE_PLAYER_TILE',
      id: playerTileSprite.id,
    });
    playerTileSprite.destroy();
    
    store.dispatch({
      type: 'ADD_MAIN_BOARD_TILE',
      mainBoardTile: {
        id: this.id,
        letter: this.letter,
        reference: this,
        top: null,
        bottom: null,
        left: null,
        right: null,
      },
    });

    // re-position player tiles after one is gone
    const { playerTiles } = getGameState(store);
    positionPlayerTiles(playerTiles.map((tile) => tile.sprite));
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

    // TODO: if playertiles reach 0 && all connected, enable add tile button, else disable
    if (!getGameState(store).playerTiles.length && isTilesConnected(store)) {
      console.log('hit add tile')
      // TODO: addTileButton enable styles
      addTileButton.interactive = true;
      // add a tile from bank
      addTile(store);
      // reposition tiles
    } else {
      addTileButton.interactive = false;
      // TODO: addTileButton disable styles
    }
  } else {
    this.on('pointermove', (e) => onMainBoardTileSpritePointerMove.bind(this)(e, app));
    this.dragging = true;
    this.initialPosition = [this.x, this.y];

    store.dispatch({
      type: 'TOGGLE_IS_DRAGGING',
      isDragging: true,
    });

    // replenish destroyed hitspots, including ones left
    const associatedHitSpots = hitSpots.filter((hitSpot) => hitSpot.parentId === this.id);
    const destroyedHitSpotDirections = [];
    associatedHitSpots.forEach((hitSpot) => {
      if (hitSpot._destroyed) {
        destroyedHitSpotDirections.push(hitSpot.direction);
        hitSpot.deletionFlag = true;
      }
    });

    destroyedHitSpotDirections.forEach((direction) => {
      createHitSpot(store, this, direction);
    });

    // find parentId of reciprocal hit spot parent, then search store hit spots to restore destroyed
    destroyedHitSpotDirections.forEach((direction) => {
      if (mainBoardTileGraph[this.id][direction] === null) {
        return;
      }

      const reciprocalParentId = mainBoardTileGraph[this.id][direction].id;
      const associatedHitSpots = hitSpots.filter((hitSpot) => hitSpot.parentId === reciprocalParentId);
      const destroyedHitSpotDirections = [];
      associatedHitSpots.forEach((hitSpot) => {
        if (hitSpot._destroyed) {
          destroyedHitSpotDirections.push(hitSpot.direction);
          hitSpot.deletionFlag = true;
        }
      });

      destroyedHitSpotDirections.forEach((direction) => {
        const reciprocalTile = mainBoardTileGraph[reciprocalParentId].reference;
        createHitSpot(store, reciprocalTile, direction);
        positionHitSpots(reciprocalTile, getGameState(store).hitSpots);
      });
    });

    store.dispatch({ type: 'CLEAN_OLD_HIT_SPOTS' });

    // set hit spots alpha 1, and move own hit spots out of board
    hitSpots.forEach((hitSpot) => {
      if (!hitSpot._destroyed) {
        hitSpot.alpha = 1;
        if (hitSpot.parentId === this.id) {
          hitSpot.x = -hitSpot.width;
          hitSpot.y = -hitSpot.height;
        }
      }
    });

    // adds all sprites to top layer, then currently clicked sprite
    each(mainBoardTileGraph, (tile) => {
      mainBoardLayer.addChild(tile.reference);
    });
    mainBoardLayer.addChild(this);    
  }
}

export {
  onPlayerTileDragStart,
  onMainBoardTileSpritePointerMove,
  onMainBoardTileSpritePointerDown,
};
