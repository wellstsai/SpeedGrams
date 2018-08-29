import * as PIXI from 'pixi.js';
import Button from '../../components/button';
import { getGameState } from '../../../../store/utils/getGameState';

const renderButtons = (store) => {
  const { mainBoardLayer } = getGameState(store);

  let style = new PIXI.TextStyle({
    fontFamily: 'Arial', // Font Family
    fontSize: 22, // Font Size
    fontWeight: 'bold', // Font Weight
    fill: ['#000000'], // gradient
    stroke: '#4a1850',
    strokeThickness: 0,
    wordWrap: true,
    wordWrapWidth: 440,
  });

  // Add Tile Button
  const addTileButton = new Button(700, 350, 130,45);
  addTileButton.setText('Add Tile', style);
  addTileButton.clicked = () => {
    console.log('I am clicked');
    console.log('**testing', getGameState(store))
  };
  mainBoardLayer.addChild(addTileButton);
  store.dispatch({
    type: 'ADD_ADD_TILE_BUTTON',
    addTileButton,
  });

  // Complete Button
  const completeButton = new Button(700, 400, 130, 45);
  completeButton.setText('Complete!', style);
  completeButton.clicked = () => {
    console.log('I am clicked');
  };
  mainBoardLayer.addChild(completeButton);
  store.dispatch({
    type: 'ADD_COMPLETE_BUTTON',
    completeButton,
  });
};

const renderStartBoard = (store) => {
  // render buttons
  renderButtons(store);
};

export default renderStartBoard;