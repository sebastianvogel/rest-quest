/**
 * Created by sebastian on 08.03.15.
 */
export = BasicMover;

import Mover = require('./Mover');
import Move = require('./Move');
import utils = require('../Utils');
import Direction = require('../game/Direction');
import TileType = require('../game/TileType');
import Tile = require('../game/Tile');
import QuestBoard = require('../board/QuestBoard');
import QuestPosition = require('../board/QuestPosition');


class BasicMover implements Mover {
    board: QuestBoard;

    private goingUpMountain: boolean = false;
    private targetReached: boolean = false;

    constructor(board: QuestBoard) {
        this.board = board;
    }

    static oppositeDirection(dir: Direction): Direction {
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

    getMoves(pos: QuestPosition): Array<Move> {
        return [
            this.getMove(pos, Direction.up),
            this.getMove(pos, Direction.right),
            this.getMove(pos, Direction.down),
            this.getMove(pos, Direction.left)
        ]
    }

    getMove(currentPos: QuestPosition, dir: Direction): Move {
        var pos: QuestPosition = QuestBoard.calculatePosition(currentPos, dir);
        var tile = this.board.getTileAt(pos);
        return {
            pos: pos,
            tile: tile,
            dir: dir,
            tilesOpen: this.calculateOpenTiles(move.pos);
        };
    }

    /**
     * Don't go on water and on castles of other players
     * @param move the move to check
     * @returns {boolean} when the move is forbidden
     */
    isForbiddenMove(move: Move): boolean {
        if ((move.tile && move.tile.type === TileType.water) || this.board.isOtherCastle(move.pos)) {
            return true;
        }
        return false;
    }

    isDeadEnd(pos: QuestPosition): boolean {
        var that: BasicMover = this;
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

    setGoingUpMountain(goingUpMountain: boolean): void {
        this.goingUpMountain = goingUpMountain;
    }

    isGoingUpMountain(): boolean {
        return this.goingUpMountain;
    }

    setTargetReached(targetReached: boolean): void {
        this.targetReached = targetReached;
    }

    isTargetReached(): boolean {
        return this.targetReached;
    }

    goNext(pos: QuestPosition): Direction {
        throw new Error('Don\'t use the basic implementation of goNext()!');
    }

    /**
     * Calculate how many tiles a move to the position would uncover
     * @param pos the position
     * @returns {number} the number of tiles the move would uncover
     */
    calculateOpenTiles (pos: QuestPosition): number {
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
                if (this.board.getTileAt(QuestPosition(i, j)) === null) {
                    tilesToOpen++;
                }
            }
        }
        return tilesToOpen;
    }
}