function GlitchTile() {
    this.id = 0;
    this.touchedByPlayer = -1;
    this.colorId = 0;
    this.pos = new Vector2(0,0);
    this.height = 0;
    this.width = 0;
}

function Tile(x, y) {
    this.x = x;
    this.y = y;
    this.touchedByPlayer = -1;
}

function Glitch(){
  this.tiles = [];
  this.tilesInRow = 0;
}

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}
