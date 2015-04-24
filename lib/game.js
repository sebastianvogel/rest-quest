/* global require,module,console */
/* jshint node: true */
'use strict';

var Player   = require('./player');
var Maps     = require('./maps');
var both     = require('./both');
var Response = require('./response');

/**
 * create a new game state object
 *
 * @return {Object}
 */
function state () {
	return {
		players : {},
		map     : Maps.create(),
		phase   : 'register' // register, in progress, over	
	};
}

/**
 * register a player in the game state
 *
 * @param {State} State
 * @param {Request} req
 * @param {Response} res
 * @param {io} io
 */
function register (State, req, res, io) {
	if (State.phase !== 'register') {
		res.send(Response.invalidOp());
		return;
	}

	var player = Player.create(req.body.name, State.players);
	State.players[player.name] = player;
	
	// maybe this won't work?
	var castlePlace = Maps.placementTile(State.map);
	castlePlace.tile.castle = player.name;
	player.pos = {
		x: castlePlace.x,
		y: castlePlace.y
	};

	console.log('registered player {' + player.name + '} at {' + player.pos.x + ',' + player.pos.y + '}');
	
	both('register', function () {
		res.send(Response.view(player, State.map));
	}).done(function () {
		State.phase = 'in progress';
		io.broadcast('start', JSON.stringify(State));
	});
}

/**
 * move a player on the field
 *
 * @param {State} State
 * @param {Request} req
 * @param {Response} res
 * @param {io} io
 */
function move (State, req, res, io) {
	if (State.phase !== 'in progress') {
		res.send(Response.invalidOp());
		return;
	}

	both('move', function () {
        console.log('Player ' + req.body.player + " wants to move " + req.body.direction);
		var player = Player.get(State, req.body.player);
		var newPos = Maps.move(player.pos, req.body.direction, State.map.size);
		console.log(player.name, player.turn, player.pos, newPos);
		var tile = Maps.get(newPos, State.map);

		// mountains take two steps to climb
		if (tile.type !== 'mountain' ||
			(tile.type === 'mountain' && player.climb === req.body.direction)) {

			player.climb    = false;
			player.pos      = newPos;
			player.dead     = Player.isDead(player, tile);
			player.done     = Player.isDone(player, tile);
			pickUp(player, tile, io);
		} else {
			console.log(player.name + ' climbing mountain in dir ' + req.body.direction);
			player.climb = req.body.direction;
		}

		player.turn++;
		player._res = res;
	}).done(function () {
		setTimeout(function () {
			resolve(State, io);
			io.broadcast('move', JSON.stringify(State.players));
		}, 500);
	});
}

/**
 * pickup treasure if available on tile
 *
 * @param {Player} player
 * @param {Tile} tile
 * @param {io} io
 */
function pickUp (player, tile, io) {
	if (!treasure(tile)) {
		return;
	}
	
	player.treasure = true;
	delete tile.treasure;
	io.broadcast('pickup', JSON.stringify(player));
}

/**
 * resolve the turn
 *
 * @param {State} State
 * @param {io} io
 */
function resolve (State, io) {
	var players = Object.keys(State.players);
	var p1 = State.players[players[0]];
	var p2 = State.players[players[1]];

	if ((p1.done && p2.done) || (p1.dead && p2.dead)) {
		p1._res.send(Response.gameOver('draw'));
		p2._res.send(Response.gameOver('draw'));
		clientGameOver(false, io);
		State.phase = 'over';
	} else if (p1.done || p2.dead) {
		p1._res.send(Response.gameOver('won'));
		p2._res.send(Response.gameOver('lost'));
		clientGameOver(p1, io);
		State.phase = 'over';
	} else if (p2.done || p1.dead) {
		p1._res.send(Response.gameOver('lost'));
		p2._res.send(Response.gameOver('won'));
		clientGameOver(p2, io);
		State.phase = 'over';
	} else {
		p1._res.send(Response.view(p1, State.map));
		p2._res.send(Response.view(p2, State.map));
	}

	delete p1._res;
	delete p2._res;
}

/**
 * tell the web client that the game is over
 *
 * @param {string} winner
 * @param {io} io
 */
function clientGameOver (winner, io) {
	if (!winner) {
		io.broadcast('gameover', JSON.stringify({ result : 'draw' }));
	} else {
		io.broadcast('gameover', JSON.stringify({ result : 'win', winner : winner.name }));
	}
}

/**
 * check if there is a treasure on a tile
 */
function treasure (tile) {
	return tile.treasure;
}

module.exports = {
	move     : move,
	register : register,
	state    : state
};