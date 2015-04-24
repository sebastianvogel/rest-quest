/**
 * Created by sebastian on 01.03.15.
 */


import BasicMover = require('./BasicMover');
import Move = require('./Move');
import utils = require('../Utils');
import Direction = require('../game/Direction');
import TileType = require('../game/TileType');
import Tile = require('../game/Tile');
import QuestBoard = require('../board/QuestBoard');
import QuestPosition = require('../board/QuestPosition');


export=Searcher;

var TOWARDS_PRIO = 3;
var AWAY_PRIO = -5;
var UNCOVER_PRIO = 2;


class Searcher extends BasicMover {
    private lastDir: Direction;

    private nextTarget: QuestPosition = QuestPosition(1, 1);

    constructor(board: QuestBoard) {
        super(board);
    }

    private getNextTarget(): QuestPosition {
        while (this.board.getTileAt(this.nextTarget) !== undefined) {
            this.nextTarget = QuestPosition(this.nextTarget.getX() + 1, this.nextTarget.getY() + 1);
        }
        return this.nextTarget;
    }

    goNext(pos: QuestPosition): Direction {
        var that: Searcher = this;
        var dirToTry: Direction;
        // go up the mountain
        if (that.isGoingUpMountain()) {
            console.log('Go up the mountain - to direction' + Direction[that.lastDir]);
            that.setGoingUpMountain(false);
            return that.lastDir;
        }

        // check if we ran into a dead end
        if(that.isDeadEnd(pos) && that.lastDir !== undefined) {
            // go back if we are in a dead end
            console.log('We are in dead end - go back to last tile ' + Direction[that.lastDir])
            return Searcher.oppositeDirection(that.lastDir)
        }

        var moves = that.getMoves(pos);

        // filter for possible moves
        var possibleMoves: Array<Move> = [];
        moves.forEach(function (move) {
            if (!that.isForbiddenMove(move) && !that.isDeadEnd(move.pos)) {
                possibleMoves.push(move);
            }
        });

        // check which direction we should go to reach this.getNextTarget()
        var nextTarget = that.getNextTarget();
        var dirsToward = utils.directionsToward(pos, nextTarget);
        var highestPrio: Move;
        possibleMoves.forEach(function (move) {
            if (move.priority === undefined) {
                move.priority = 0;
            }
            if (utils.inArray(dirsToward, move.dir)) {
                move.priority += TOWARDS_PRIO;
            } else {
                move.priority += AWAY_PRIO;
            }
            if (move.tilesOpen > 0) {
                move.priority += (move.tile.type === TileType.mountain) ? (move.tilesOpen / 2) : move.tilesOpen;
            }
            if (utils.inView(move.pos, move.tile.type, nextTarget)) {
                move.priority += UNCOVER_PRIO;
            }

            if (!highestPrio || highestPrio.priority < move.priority) {
                highestPrio = move;
            } else if (highestPrio.priority === move.priority && utils.inView(move.pos, move.tile.type, nextTarget)) {
                highestPrio = move;
            }
        });
        if (highestPrio.tile.type === TileType.mountain) {
            that.setGoingUpMountain(true);
        }
        console.log('Move ' + Direction[highestPrio.dir] + ' to ' + TileType[highestPrio.tile.type]);
        that.lastDir = highestPrio.dir;
        return highestPrio.dir;
    }
}
