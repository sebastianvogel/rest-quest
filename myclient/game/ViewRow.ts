import Tile =require('./Tile');
import TileType = require('./TileType');
export = ViewRow;

interface ViewRow {
	[index: number]: Tile;
}