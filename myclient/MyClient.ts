/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/request/request.d.ts" />

import request = require('request');
import QuestPosition = require('./board/QuestPosition');
import QuestBoard = require('./board/QuestBoard');
import Direction = require('./game/Direction');
import GameData = require('./game/GameData');
import Player = require('./game/Player');
import rest = require('./RestRequest');
import helper = require('./Helper');

import Searcher = require('./movement/Searcher');
import ShortestPath = require('./movement/ShortestPath');

var myPlayer: Player = { name: 'elbird-bot-' + parseInt(String(Math.random() * 100), 10) }
var board = new QuestBoard(myPlayer);
var searcher = new Searcher(board);

var treasureVisited = false;

var shortestPath: ShortestPath;
var alwaysAsk = false;



function move(dirToGo: Direction, pos: QuestPosition): void {
    rest.move(dirToGo, function (data: GameData) {
        if (data.game) {
            helper.printGameData(data);
            return;
        }
        var currentPos = board.update(data.view, pos, dirToGo);
        helper.printGameData(data);
        takeTurn(currentPos);
    });
}

/**
 *
 * @param pos
 * @param data
 * @param search
 */
function takeTurn (pos: QuestPosition): void {
    var dirToGo: Direction;
    if (board.isTreasureFound() && treasureVisited) {
        if (!shortestPath) {
            shortestPath = new ShortestPath(board, pos, board.getMyCastlePosition());
        }
        dirToGo = shortestPath.goNext(pos);
    } else if (board.isTreasureFound()) {
        if (!shortestPath) {
            shortestPath = new ShortestPath(board, pos, board.getTreasurePosition());
        }
        dirToGo = searcher.goNext(pos);
        if (shortestPath.movesLeft() === 0) {
            shortestPath = null;
            treasureVisited = true;
        }
    } else {
        dirToGo = searcher.goNext(pos);
    }
    if(alwaysAsk) {
        helper.ask("Go " + Direction[dirToGo], /yes|left|right|up|down/, function (answer) {
            if (answer !== 'yes') {
                dirToGo = Direction[answer];
            }
            move(dirToGo, pos);
        });
    } else {
        move(dirToGo, pos);
    }
}

console.log('Hello I\'m player: ' + myPlayer.name);
helper.ask("Ask before move? (yes or no)", /yes|no/, function (yesNo) {
    if (yesNo === 'yes') {
        console.log("I will always ask before I move!");
        alwaysAsk = true;
    }
    rest.register(myPlayer, function(data: GameData) {
        var pos: QuestPosition = board.initialize(data.view);
        helper.printGameData(data);
        takeTurn(pos);
    });
});

