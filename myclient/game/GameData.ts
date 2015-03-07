import GameInfo = require('./GameInfo');
import Tile = require('./Tile');

export = GameData;

interface GameData {
	view?: Array<Array<Tile>>;
	game?: GameInfo;
}
