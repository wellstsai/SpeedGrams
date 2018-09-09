import * as PIXI from 'pixi.js';
import shortid from 'shortid';

import { getGameState } from '../../../store/utils/getGameState';
import { onPlayerTileDragStart } from '../logic/tileClickLogic';

const createPlayerTile = (store, letter) => {
  const { resources, bottomPanelScrollLayer } = getGameState(store);

  const letterSprite = new PIXI.Sprite(resources.tiles.textures[`letter_${letter.toUpperCase()}.png`]);
  letterSprite.x = -letterSprite.width;
  letterSprite.y = -letterSprite.height;
  letterSprite.interactive = true;
  letterSprite.buttonMode = true;
  letterSprite.anchor.set(0.5);
  letterSprite.scale.set(0.2);
  
  // custom params
  letterSprite.resource = resources.tiles.textures[`letter_${letter.toUpperCase()}.png`];
  letterSprite.letter = letter;
  letterSprite.id = shortid.generate();

  letterSprite
    .on('pointerdown', (e) => onPlayerTileDragStart.bind(letterSprite)(e, store));
  bottomPanelScrollLayer.addChild(letterSprite);

  const playerTile = {
    id: letterSprite.id,
    letter,
    sprite: letterSprite,
  };

  // add player tile to store
  store.dispatch({
    type: 'ADD_PLAYER_TILE',
    playerTile,
  });
};

export default createPlayerTile;
