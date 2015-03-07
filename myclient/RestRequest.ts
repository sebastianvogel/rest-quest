import request = require('request');

import Direction = require('./game/Direction');
import GameInfo = require('./game/GameInfo');
import GameData = require('./game/GameData');
import Player = require('./game/Player');
import Tile = require('./game/Tile');
import TileType = require('./game/TileType');

var BASE_URL: string = 'http://localhost:3000';

function convertToTileType(stringType: string): TileType {
	var result: TileType;
	switch(stringType) {
		case TileType[TileType.grass]:
		    result = TileType.grass;
		    break;
		case TileType[TileType.forest]:
		    result = TileType.forest;
		    break;
		case TileType[TileType.mountain]:
		    result = TileType.mountain;
		    break;
		case TileType[TileType.water]:
		default:
		    result = TileType.water;
		    break;
	}
	return result;
}

function convertToTile(tile: any): Tile {
	var result: Tile = {
		type: convertToTileType(String(tile.type))
	};
	if (tile.castle) {
		result.castle = String(tile.castle);
	}
	if (tile.treasure) {
		result.treasure = true;
	}
	return result;
}

function convertToGameData(data: any): GameData {
	var result: GameData = {};
	if(data.game) {
		result.game = {
			game: String(data.game.game),
			result: String(data.game.result)
		}
	}
	if(data.view) {
		result.view = [];
		for (var i = 0; i < data.view.length; i++) {
			result.view[i] = [];
			for(var j = 0; j < data.view[i].length; j++) {
				result.view[i][j] = convertToTile(data.view[i][j]);
			}
		}
	}
	return result;
}

var myPlayer: Player;

export function register(player: Player, cb: (data: GameData) => void): void {
	myPlayer = player;
	request({
		uri    : BASE_URL + '/register/',
		method : 'POST',
		form   : {
			name : player.name
		}
	}, function (error, res,  body) {
		cb(convertToGameData(JSON.parse(body)));
	});
}

export function move (dir: Direction, cb: (data: GameData) => void ): void {
    console.log(Direction[dir]);
	request({
		uri    : BASE_URL + '/move/',
		method : 'POST',
		form   : {
			player: myPlayer.name,
            direction: Direction[dir]
		}
	}, function (error, res, body) {
        var data = JSON.parse(body);
		cb(convertToGameData(data));
	});
}


export function reset(): void {
	request({
		uri    : BASE_URL + '/reset/',
		method : 'GET'
	}, function () {});
}
