/**
 * Created by sebastian on 01.03.15.
 */

import BasicMover = require('./BasicMover');
import Direction = require('../game/Direction');
import TileType = require('../game/TileType');
import QuestBoard = require('../board/QuestBoard');
import QuestPosition = require('../board/QuestPosition');
import Path = require('./Path');
import Move = require('./Move');


export = ShortestPath;

class ShortestPath extends BasicMover {
    private fromPos: QuestPosition;
    private toPos: QuestPosition;

    private candidateList: Array<Path> = [];
    private openList: Array<Array<Path>> = [];
    private visitedEdges: { [s: string]: boolean } = {}

    private shortestPath: Path;
    private moveNumber = 0;
    private recalculatePath = false;

    private lastMove: Move;

    private getNormalizedEdge(from: QuestPosition, move: Move): string {
        var first: QuestPosition,
            second: QuestPosition;
        if (move.dir === Direction.up || move.dir === Direction.right) {
            first = from;
            second = move.pos;
        } else {
            first = move.pos;
            second = from;
        }
        return first.toString() + second.toString();
    }

    private isCandidate(path: Path) {
        var pathEndPos: QuestPosition = path.getEndPos();
        return this.toPos.getX() === pathEndPos.getX() &&  this.toPos.getY() === pathEndPos.getY();
    }

    private addPathToList(path: Path) {
        if(this.isCandidate(path)) {
            candidateList.push(path);
            return;
        }
        var pathLength = path.getLength();
        if (!Array.isArray(openList[pathLength])) {
            openList[pathLength] = [];
        }
        openList[pathLength].push(path);
    }

    private searchPaths(paths: Array<Path>) {
        var that = this;

        paths.forEach( function (path: Path) {
            that.getMoves(path.getEndPos()).forEach(function (move: Move) {
                var newPath: Path;
                    edge: string = that.getNormalizedEdge(path.getEndPos(), move);
                // Do nothing if tile is empty or the move is forbidden
                // and make sure we don't visit the same edge twice
                if (move.tile === null || that.isForbiddenMove(move) || that.visitedEdges[edge] ) {
                    return;
                }
                newPath = path.copy();
                newPath.addMove(move);
                that.visitedEdges[edge] = true;
                that.addPathToOpenList(newPath);
            });
        });
    }

    private calculateShortestPath(fromPos: QuestPosition) {
        var that = this, i = 0,
            startPath = new Path(fromPos);
        this.addPathToList(startPath);
        while (this.candidateList.length <= 0 ) {
            for (i = 0; i < this.openList.length; i++) {
                if (Array.isArray(this.openList[i])) {
                    this.searchPaths(this.openList[i]);
                    this.openList[i] = null;
                    break;
                }
            }
        }

        // shortest path found
        this.shortestPath = this.candidateList[0];
        for (i = 1; i < this.candidateList.length; i++) {
            if (this.candidateList[i].getLength() > this.shortestPath.getLength()) {
                this.shortestPath = this.candidateList[i];
            }
        }
        // reset candidate, open path and visitedEdges lists
        this.candidateList = [];
        this.openList = [];
        this.visitedEdges = {};
    }

    constructor(board: QuestBoard, fromPos: QuestPosition, toPos: QuestPosition) {
        super(board);
        this.fromPos = fromPos;
        this.toPos = toPos;
        calculateShortestPath(fromPos);
    }

    goNext(pos: QuestPosition): Direction {
        // go up the mountain
        if (this.isGoingUpMountain()) {
            console.log('Go up the mountain - to direction' + Direction[that.lastDir]);
            this.setGoingUpMountain(false);
            return this.lastMove.dir;
        }

        if (this.recalculatePath) {
            this.recalculatePath = false;
            calculateShortestPath(pos);
            this.moveNumber = 0;
        }
        this.lastMove = this.shortestPath.getMoves()[this.moveNumber];
        this.moveNumber++;

        // if new tiles are uncovered with the next move recalculate the path
        if (this.lastMove.tilesOpen > 0) {
            this.recalculatePath = true;
        }

        if (this.lastMove.tile.type === TileType.mountain) {
            this.setGoingUpMountain(true);
        }
        return this.lastMove.dir;
    }
}
