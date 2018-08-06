import * as PIXI from 'pixi.js';
import { getTileBank, getStartingTiles } from './setup';

const startNewGame = (app, resources, numOfPlayers) => {
  // connect to a multiplayer channel

  // setup/render board based on numOfPlayers
    // randomize board
  const tileBank = getTileBank();
  const scrollbarContainer = renderScrollbar(app);
  renderStartTiles(app, resources, tileBank, scrollbarContainer);


  // gameOn loop with game logic

};

const renderScrollbar = (app) => {
  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.width = 800;
  bg.height = 150;
  bg.tint = 0xff0000;
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
    console.log('xy', letterSprite.x, letterSprite.y)
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
