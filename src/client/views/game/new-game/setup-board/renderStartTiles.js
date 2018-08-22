import * as PIXI from 'pixi.js';

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

    playerTiles.push({
      id: index,
      sprite: letterSprite,
    });

    letterSprite
      .on('pointerdown', (e) => onPlayerTileDragStart.bind(letterSprite)(e, store))
      .on('pointerup', onPlayerTileDragEnd.bind(letterSprite))
      .on('pointerupoutside', onPlayerTileDragEnd.bind(letterSprite))
      .on('pointermove', onPlayerTileDragMove.bind(letterSprite));
    bottomPanelScrollLayer.addChild(letterSprite);
  });
};

// on dragstart
  // alpha 0 on bottom panel layer
  // add to main board layer
// on move
  // move main board duplicate
// on dragend
  // if within bottompanel bounds
    // delete from main board layer
    // alpha 1 on bottom panel layer
  // if within main board bounds
    // delete from bottom panel layer
    // dragging false

function onPlayerTileDragStart(event, store) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  // this.data = event.data;
  this.alpha = 0;
  this.dragging = false;

  const gameState = getGameState(store);
  const { app, mainBoardLayer } = gameState;

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

  mainBoardTileSprite
    .on('pointermove', (e) => onMainBoardTileSpritePointerMove.bind(mainBoardTileSprite)(e, app))
    .on('pointerup', onMainBoardTileSpritePointerUp.bind(mainBoardTileSprite).bind(this))
    .on('pointerdown', onMainBoardTileSpritePointerDown.bind(mainBoardTileSprite).bind(this));
  mainBoardLayer.addChild(mainBoardTileSprite);
}

function onPlayerTileDragEnd() {
  this.data = null;
  // this.alpha = 1;
  this.dragging = false;
  // set the interaction data to null
}

function onPlayerTileDragMove() {
  if (this.dragging) {
    const newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x;
    this.y = newPosition.y;
  }
}

function onMainBoardTileSpritePointerMove(event, app) {
  console.log('hit pointermove', this.letter)
  if (this.dragging) {
    const mouseposition = app.renderer.plugins.interaction.mouse.global;
    this.x = mouseposition.x;
    this.y = mouseposition.y;
  }
}

function onMainBoardTileSpritePointerUp() {
  console.log('pointerup hit')
}

function onMainBoardTileSpritePointerDown() {
  console.log('pointerdown hit')
  this.dragging = false;
  this.off('pointermove');
}

export default renderStartTiles;
