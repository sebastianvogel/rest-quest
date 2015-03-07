/**
 * Created by sebastian on 01.03.15.
 */
import Direction = require('../game/Direction');
import QuestBoard = require('../board/QuestBoard');
import QuestPosition = require('../board/QuestPosition');


export = ShortestPath;

class ShortestPath {
    private fromPos: QuestPosition;
    private toPos: QuestPosition;
    private board: QuestBoard;

    constructor(board: QuestBoard, fromPos: QuestPosition, toPos: QuestPosition) {
        this.fromPos = fromPos;
        this.toPos = toPos;
        this.board = board;
    }
    goNext(pos: QuestPosition): Direction {
        return undefined;
    }
    movesLeft(): number {
        return undefined;
    }
}
