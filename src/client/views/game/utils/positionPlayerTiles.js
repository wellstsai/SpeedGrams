import get from 'lodash/get';

const COLUMNS = 12;

const positionPlayerTiles = (playerTileSprites) => {
  if (!get(playerTileSprites, length)) return;

  const spriteWidth = playerTileSprites[0].width;
  playerTileSprites.forEach((sprite, index) => {
    sprite.x = (index % COLUMNS) * spriteWidth;
    sprite.y = Math.floor(index / COLUMNS) * spriteWidth;
  });
};

export default positionPlayerTiles;
