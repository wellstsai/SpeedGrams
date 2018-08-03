import * as PIXI from 'pixi.js';
import { getTileBank, getStartingTiles } from './setup';

const startNewGame = (app, resources, numOfPlayers) => {
  // connect to a multiplayer channel

  // setup/render board based on numOfPlayers
    // randomize board
    const tileBank = getTileBank();
    renderStartTiles(app, resources, tileBank);


  // gameOn loop with game logic

};

const renderStartTiles = (app, resources, tileBank) => {
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
    letterSprite.x = 68;
    letterSprite.y = 100;
    letterSprite.interactive = true;
    letterSprite.scale.set(0.2);

    letterSprite
      .on('pointerdown', onDragStart.bind(letterSprite))
      .on('pointerup', onDragEnd.bind(letterSprite))
      .on('pointermove', onDragMove.bind(letterSprite));
    app.stage.addChild(letterSprite);
  });
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
    var newPosition = this.data.getLocalPosition(this.parent);
    this.x = newPosition.x;
    this.y = newPosition.y;
  }
}

export default startNewGame;
