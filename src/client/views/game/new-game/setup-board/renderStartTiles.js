import * as PIXI from 'pixi.js';

import { getTileBank, getStartingTiles } from '../../setup';
import { getGameState } from '../../../../store/utils/getGameState';

const renderStartTiles = (store) => {
  const gameState = getGameState(store);
  const { resources, bottomPanelScrollLayer } = gameState;
  const tileBank = getTileBank();
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
      .on('pointerdown', onTileDragStart.bind(letterSprite))
      .on('pointerup', onTileDragEnd.bind(letterSprite))
      .on('pointerupoutside', onTileDragEnd.bind(letterSprite))
      .on('pointermove', onTileDragMove.bind(letterSprite));
    bottomPanelScrollLayer.addChild(letterSprite);
  });
};

function onTileDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}

function onTileDragEnd() {
  this.data = null;
  this.alpha = 1;
  this.dragging = false;
  // set the interaction data to null
}

function onTileDragMove() {
  if (this.dragging) {
    const newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x;
    this.y = newPosition.y;
  }
}

export default renderStartTiles;
