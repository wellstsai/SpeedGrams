import * as PIXI from 'pixi.js';

class Button extends PIXI.Sprite {
  constructor(x, y, width, height) {
    super();
    this.create(x, y, width, height);
  }

  create(x, y, width, height) {
    // generate the texture
    let gfx = new PIXI.Graphics();
    gfx.beginFill(0xffffff, 1);
    gfx.drawRoundedRect(0, 0, width, height, height / 5);
    gfx.endFill();
    this.texture = gfx.generateCanvasTexture();

    // set the x, y and anchor
    this.x = x;
    this.y = y;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;

    // create the text object
    this._text = new PIXI.Text('', 'arial');
    this._text.anchor = new PIXI.Point(0.5, 0.5);
    this.addChild(this._text);

    // set the interactivity to true and assign callback functions
    this.interactive = true;
    this.buttonMode = true;

    this.on('mousedown', () => {
      this.onDown();
    }, this);

    this.on('mouseup', () => {
      this.onUp();
    }, this);

    this.on('mouseover', () => {
      this.onHover();
    }, this);

    this.on('mouseout', () => {
      this.onOut();
    }, this);
  }

  setText(val, style) {
    // Set text to be the value passed as a parameter
    this._text.text = val;
    // Set style of text to the style passed as a parameter
    this._text.style = style;
  }

  onDown() {
    this.y += 3;
    this.tint = 0xffffff;
  }

  onUp() {
    if(typeof(this._cb) === 'function') {
      this._cb();
    }
    this.y -= 3;
    this.tint = 0x336600;
  }

  onHover() {
    this.tint = 0x336600;
    // this.scale.x = 1.1;
    // this.scale.y = 1.1;
  }

  onOut() {
    this.tint = 0xffffff;
    // this.scale.x = 1;
    // this.scale.y = 1;
  }

  get clicked() {
    return this._cb;
  }

  set clicked(cb) {
    this._cb = cb;
  }
}

export default Button;
