const directions = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
};
directions.array = [directions.TOP, directions.BOTTOM, directions.LEFT, directions.RIGHT];

const oppositeDirection = (direction) => {
  if (direction === directions.TOP) return directions.BOTTOM;
  if (direction === directions.BOTTOM) return directions.BOTTOM;
  if (direction === directions.LEFT) return directions.RIGHT;
  if (direction === directions.RIGHT) return directions.LEFT;

  if (!direction) {
    throw Error(`Error: passed in invalid direction: ${direction}`);
  }
};

export {
  directions,
  oppositeDirection,
};
