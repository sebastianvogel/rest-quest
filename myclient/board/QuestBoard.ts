/**
 * Created by sebastian on 01.03.15.
 */
import utils = require('../Utils');

import Tile = require('../game/Tile');
import Player = require('../game/Player');
import QuestPosition = require('./QuestPosition');
import Direction = require('../game/Direction');
import helper = require('../Helper');

enum BoardPartName { topLeft, topRight, bottomLeft, bottomRight};

interface Board {
    topLeft: Array<Array<Tile>>;
    topRight: Array<Array<Tile>>;
    bottomLeft: Array<Array<Tile>>;
    bottomRight: Array<Array<Tile>>;
}

interface InternalPosition {
    boardPart: BoardPartName;
    row: number;
    column: number;
}

export = QuestBoard;

class QuestBoard {
    private boardSize: number = 0;

    private myCastle: QuestPosition = QuestPosition(0, 0);

    private otherCastle: QuestPosition;

    private treasure: QuestPosition;

    private board: Board = {
        topLeft: [],
        topRight: [],
        bottomLeft: [],
        bottomRight: []
    };
    private player: Player;


    constructor(player: Player) {
        this.player = player;
    }

    private getBoardPart(part: BoardPartName): Array<Array<Tile>> {
        return <Array<Array<Tile>>> this.board[BoardPartName[part]];
    }

    private whichBoardPart(position: QuestPosition): BoardPartName {
        if (position.getX() >= 0) {
            if (position.getY() >= 0 ) {
                return BoardPartName.topRight;
            }
            return BoardPartName.topLeft;
        }
        if (position.getY() >= 0) {
            return BoardPartName.bottomRight;
        }
        return BoardPartName.bottomLeft;
    }

    private convertToInternalPosition(position: QuestPosition): InternalPosition {
        var internal: InternalPosition = {
            row: Math.abs(position.getX()),
            column: Math.abs(position.getY()),
            boardPart: this.whichBoardPart(position)
        };
        return internal;
    }

    private addTile(tile: Tile, position: QuestPosition) {
        var internalPosition: InternalPosition = this.convertToInternalPosition(position);
        var currentBoard: Array<Array<Tile>> = this.getBoardPart(internalPosition.boardPart);
        var row: number = internalPosition.row;
        var column: number = internalPosition.column;

        if (currentBoard[row] === undefined) {
            currentBoard[row] = [];
        }
        if (currentBoard[row][column] === undefined) {
            currentBoard[row][column] = tile;
        } else {
            if(!utils.equals(currentBoard[row][column], tile)) {
                console.log('Tiles at position (' + row + ',' + column + ') does not match');
            }
        }
    }

    initialize(view: Array<Array<Tile>>): QuestPosition {
        this.update(view, this.myCastle);
        return this.myCastle;
    }

    static calculatePosition(fromPosition: QuestPosition, dir: Direction): QuestPosition {
        var currentPosition: QuestPosition;
        switch (dir) {
            case Direction.down:
                currentPosition = QuestPosition(fromPosition.getX(), fromPosition.getY() - 1);
                break;
            case Direction.up:
                currentPosition = QuestPosition(fromPosition.getX(), fromPosition.getY() + 1);
                break;
            case Direction.left:
                currentPosition = QuestPosition(fromPosition.getX() - 1, fromPosition.getY());
                break;
            case Direction.right:
                currentPosition = QuestPosition(fromPosition.getX() + 1, fromPosition.getY());
                break;
            default:
                throw new Error('Unknown Direction');
                break;
        }
        return currentPosition;
    }

    private checkTile(tile: Tile, pos: QuestPosition) {
        if (tile.castle === this.player.name && !utils.equals(pos, this.myCastle)) {
            // TODO calculate board size
            console.log('Board size determined, the board size is: ' + pos);
        }
        if (tile.castle && tile.castle !== this.player.name) {
            console.log('Castle of other player found ' + tile.castle);
            this.otherCastle = pos;
        }
        if (tile.treasure) {
            console.log('Treasure found at ' + pos);
            this.treasure = pos;
        }
    }

    update(view: Array<Array<Tile>>, fromPosition: QuestPosition,  dir?: Direction): QuestPosition {
        var that: QuestBoard = this;
        var currentPosition: QuestPosition;
        console.log('From pos: ' + fromPosition);
        if(dir === undefined) {
            currentPosition = fromPosition;
        } else {
            currentPosition = QuestBoard.calculatePosition(fromPosition, dir);
        }
        console.log('Current ps: ' + currentPosition);
        var posInView: number = Math.floor(view.length / 2);
        var output: string = '';
        view.forEach(function (row, rowIndex) {
            var y: number;
            if(rowIndex < posInView) {
                y = currentPosition.getY() + (posInView - rowIndex);
            } else if (rowIndex === posInView) {
                y = currentPosition.getY();
            } else {
                y = currentPosition.getY() - (rowIndex - posInView);
            }
            row.forEach(function (tile, columnIndex) {
                var x: number;
                if(columnIndex < posInView) {
                    x = currentPosition.getX() - (posInView - columnIndex);
                } else if (columnIndex === posInView) {
                    x = currentPosition.getX();
                } else {
                    x = currentPosition.getX() + (columnIndex - posInView);
                }
                var tilePos = QuestPosition(x, y);
                that.addTile(tile, tilePos);
                that.checkTile(tile, tilePos);
                output += helper.getTileTypeString(tile.type) + ' ' + tilePos + '\t';
            });
            output += '\n';
        });
        console.log(output);
        return currentPosition;
    }

    getTileAt(position: QuestPosition): Tile {
        var intPos: InternalPosition = this.convertToInternalPosition(position);
        var boardPart = this.getBoardPart(intPos.boardPart);

        if(boardPart[intPos.row] && boardPart[intPos.row][intPos.column]) {
            return boardPart[intPos.row][intPos.column];
        }
        return null;
    }

    isTreasureFound(): boolean {
        return this.treasure !== undefined;
    }

    getTreasurePosition(): QuestPosition {
        return this.treasure;
    }

    getMyCastlePosition(): QuestPosition {
        return this.myCastle;
    }

    isOtherCastle(pos: QuestPosition): boolean {
        return utils.equals(pos, this.otherCastle);
    }

}
