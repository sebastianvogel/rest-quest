/**
 * Created by sebastian on 01.03.15.
 */

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


interface Move {
    tile: Tile;
    pos: QuestPosition;
    dir: Direction;
    tilesOpen: number;
    priority?: number
}

function oppositeDirection(dir: Direction): Direction {
    switch (dir) {
        case Direction.up:
            return Direction.down;
        case Direction.down:
            return Direction.up;
        case Direction.left:
            return Direction.right;
        case Direction.right:
            return Direction.left;
    }
}

class Searcher {
    private lastDir: Direction;
    private board: QuestBoard;
    private mountain: boolean = false;

    private nextTarget: QuestPosition = QuestPosition(1, 1);

    constructor(board: QuestBoard) {
        this.board = board;
    }

    private getNextTarget(): QuestPosition {
        while (this.board.getTileAt(this.nextTarget) !== undefined) {
            this.nextTarget = QuestPosition(this.nextTarget.getX() + 1, this.nextTarget.getY() + 1);
        }
        return this.nextTarget;
    }

    private getMoves(pos: QuestPosition): Array<Move> {
        return [
            this.getMove(pos, Direction.up),
            this.getMove(pos, Direction.right),
            this.getMove(pos, Direction.down),
            this.getMove(pos, Direction.left)
        ]
    }

    /**
     * Calculate how many tiles a move to the position would uncover
     * @param pos the position
     * @returns {number} the number of tiles the move would uncover
     */
    private calculateOpenTiles (pos: QuestPosition): number {
        var tile = this.board.getTileAt(pos);
        if(!tile) {
            return 0;
        }
        var tilesToOpen: number = 0;
        var lowerLeft = utils.lowerLeftInView(pos, tile.type);
        var upperRight = utils.upperRightInView(pos, tile.type);
        var i: number, j: number;
        for (i = lowerLeft.getX(); i <= upperRight.getX(); i ++) {
            for (j= lowerLeft.getY(); j <= upperRight.getX(); j++) {
                if (this.board.getTileAt(QuestPosition(i, j)) === undefined) {
                    tilesToOpen++;
                }
            }
        }
        return tilesToOpen;
    }
    private getMove(currentPos: QuestPosition, dir: Direction): Move {
        var pos: QuestPosition = QuestBoard.calculatePosition(currentPos, dir);
        var tile = this.board.getTileAt(pos);
        return {
            pos: pos,
            tile: tile,
            dir: dir,
            tilesOpen: this.calculateOpenTiles(pos)
        };
    }

    /**
     * Don't go on water and on castles of other players
     * @param move the move to check
     * @returns {boolean} when the move is forbidden
     */
    private isForbiddenMove(move: Move): boolean {
        if ((move.tile && move.tile.type === TileType.water) || this.board.isOtherCastle(move.pos)) {
            return true;
        }
        return false;
    }

    private isDeadEnd(pos: QuestPosition): boolean {
        var that: Searcher = this;
        var forbiddenMoveCount = 0;
        that.getMoves(pos).forEach(function (move) {
            if (that.isForbiddenMove(move)) {
                forbiddenMoveCount++;
            }
        });
        if (forbiddenMoveCount > 2) {
            return true;
        }
        return false;
    }

    goNext(pos: QuestPosition): Direction {
        var that: Searcher = this;
        var dirToTry: Direction;
        // go up the mountain
        if (that.mountain) {
            console.log('Go up the mountain - to direction' + Direction[that.lastDir]);
            that.mountain = false;
            return that.lastDir;
        }

        // check if we ran into a dead end
        if(that.isDeadEnd(pos) && that.lastDir !== undefined) {
            // go back if we are in a dead end
            console.log('We are in dead end - go back to last tile ' + Direction[that.lastDir])
            return oppositeDirection(that.lastDir)
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
            that.mountain = true;
        }
        console.log('Move ' + Direction[highestPrio.dir] + ' to ' + TileType[highestPrio.tile.type]);
        that.lastDir = highestPrio.dir;
        return highestPrio.dir;
    }
}
