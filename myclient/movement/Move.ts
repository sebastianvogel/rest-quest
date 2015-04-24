/**
 * Created by sebastian on 08.03.15.
 */

export = Move;
import Direction = require('../game/Direction');
import Tile = require('../game/Tile');
import QuestPosition = require('../board/QuestPosition');

interface Move {
    tile: Tile;
    pos: QuestPosition;
    dir: Direction;
    tilesOpen?: number;
    priority?: number
}

