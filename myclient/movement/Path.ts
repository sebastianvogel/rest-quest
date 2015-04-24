/**
 * Created by sebastian on 29.03.15.
 */
import Move = require('./Move');
import QuestPosition = require('../board/QuestPosition');
import TileType = require('../game/TileType');

class Path {
    private moves: Array<Move> = [];
    private startPos: QuestPosition;

    constructor (startPos: QuestPosition) {
        this.startPos = pos;
    }

    addMove(move: Move) {
        this.moves.push(move);
    }

    getLength(): number {
        var result = 0;
        this.moves.forEach(function (move: Move) {
            if (move.tile.type === TileType.mountain) {
                result += 2;
            } else {
                result += 1;
            }
        });
        return result;
    }

    getMoves(): Array<Move> {
        return this.moves;
    }

    getLastMove(): Move {
        return this.moves[this.moves.length - 1];
    }

    copy(): Path {
        var copy: Path = new Path(this.startPos);
        for (var i = 0; i < this.moves.length; i++) {
            copy.addMove(this.moves[i]);
        }
        return copy;
    }

    getStartPos(): QuestPosition {
        return this.startPos;
    }

    getEndPos(): QuestPosition {
        return this.moves.length === 0 ? this.startPos : this.getLastMove().pos;
    }

}