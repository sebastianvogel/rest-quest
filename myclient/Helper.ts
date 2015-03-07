/**
 * Created by sebastian on 06.03.15.
 */
/// <reference path="../typings/node/node.d.ts" />
import GameData = require('./game/GameData');
import TileType = require('./game/TileType');

export function ask(question: string, format: RegExp, callback: (data: string) => void): void {
    var stdin = process.stdin, stdout = process.stdout;

    stdin.resume();
    stdout.write(question + ": ");

    stdin.once('data', function(data) {
        var stringData: string = data.toString().trim();
        if (format.test(stringData)) {
            callback(stringData);
        } else {
            stdout.write("It should match: "+ format +"\n");
            ask(question, format, callback);
        }
    });
}


export function getTileTypeString(type: TileType): string {
    var len: number,
        typeName = TileType[type];
    // fill type names with whitespace to make every name the same lenght
    if (type !== TileType.mountain) {
        len = TileType[TileType.mountain].length;
        while (typeName.length < len) {
            typeName += ' ';
        }
    }
    return typeName;
}



export function printGameData(data: GameData) {
    if(data.game) {
        console.log('Game finished: You ' + data.game.result);
    }
    if (data.view) {
        data.view.forEach(function (row) {
            var output: string = '';
            row.forEach(function (tile) {
                output += getTileTypeString(tile.type) + '\t';
            });
            console.log(output);
        });
    }
}