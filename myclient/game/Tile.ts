import TileType = require('./TileType');

export = Tile;
interface Tile {
	type: TileType;
	castle?: string;
	treasure?: boolean;
}
