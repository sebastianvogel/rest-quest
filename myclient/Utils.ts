/**
 * Created by sebastian on 01.03.15.
 */

import Direction = require('./game/Direction');
import TileType = require('./game/TileType');
import QuestPosition = require('./board/QuestPosition');


/**
 * Check if two objects are the same comparing all properties
 *
 * @param obj the object
 * @param other the object to compare
 * @returns {boolean} true if the objects are the same
 */
export function equals(obj: any, other: any): boolean {

    if (typeof obj !== typeof other) {
        return false;
    }
    if (typeof obj !== 'object') {
        return obj === other;
    }
    if(obj === null && other === null) {
        return true;
    }

    if(Object.getPrototypeOf(obj) !== Object.getPrototypeOf(other)) {
        return false;
    }

    if(Object.keys(obj).length !== Object.keys(other).length) {
        return false;
    }

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            if(!equals(obj[prop], other[prop])) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Check if an element is in an array using utils.equals
 * @param arr the array
 * @param elem the element to search for
 * @returns {boolean} true if the element was found
 */
export function inArray<T>(arr: Array<T>, elem: T): boolean {
    for (var i = 0; i < arr.length; i++) {
        if(equals(arr[i], elem)) {
            return true;
        }
    }
    return false;
}


/**
 * Returns all Directions that will lead toward a position
 * @param from the from position
 * @param to the to position
 * @returns {Array<Direction>} the directions that will lead toward the
 */
export function directionsToward(from: QuestPosition, to: QuestPosition): Array<Direction> {
    var dirs: Array<Direction> = [];
    if (equals(from, to)) {
        return dirs;
    }
    if (to.getX() > from.getX()) {
        dirs.push(Direction.right);
    } else if (to.getX() < from.getX()) {
        dirs.push(Direction.left);
    }
    if (to.getY() > from.getY()) {
        dirs.push(Direction.up);
    } else if (to.getY() < from.getY()) {
        dirs.push(Direction.down);
    }
    return dirs;
}


/**
 * Returns all Directions that will lead away from a position
 * @param from the from position
 * @param to the to position
 * @returns {Array<Direction>} the directions that will lead toward the
 */
export function directionsAway(from: QuestPosition, to: QuestPosition): Array<Direction> {
    var dirs:Array<Direction> = [];
    if (equals(from, to)) {
        return dirs;
    }
    if (to.getX() === from.getX()) {
        dirs.push(Direction.right, Direction.left);
    } else if (to.getX() > from.getX()) {
        dirs.push(Direction.left);
    } else  {
        dirs.push(Direction.right);
    }

    if (to.getY() === from.getY()) {
        dirs.push(Direction.up, Direction.down);
    } else if (to.getY() > from.getY()) {
        dirs.push(Direction.down);
    } else {
        dirs.push(Direction.up);
    }
    return dirs;
}

/**
 * Gets the view size for a tile type
 * @param type the tile type
 * @returns {number} the size of the view
 */
export function viewSizeForTileType(type: TileType): number {
    var viewSize: number;
    switch (type) {
        case TileType.mountain:
            viewSize = 7;
            break;
        case TileType.grass:
            viewSize = 5;
            break;
        case TileType.forest:
            viewSize = 3;
            break;
        default:
            return 0;
    }
    return viewSize;
}

/**
 * Returns the position of the lower left corner in a view
 * @param pos the position in the middle of the view
 * @param type the tile type
 * @returns {QuestPosition} the position on the lower left corner
 */
export function lowerLeftInView(pos: QuestPosition, type: TileType): QuestPosition {
    var halfViewSize = Math.floor(viewSizeForTileType(type)/2);
    return QuestPosition(pos.getX() - halfViewSize, pos.getY() - halfViewSize);
}

/**
 * Returns the position of the upper right corner in a view
 * @param pos the position in the middle of the view
 * @param type the tile type
 * @returns {QuestPosition} the position in the upper right corner
 */
export function upperRightInView(pos: QuestPosition, type: TileType): QuestPosition {
    var halfViewSize = Math.floor(viewSizeForTileType(type)/2);
    return QuestPosition(pos.getX() + halfViewSize, pos.getY() + halfViewSize);
}

/**
 * Checks if a position is in the view of another
 * @param viewPos the position in the middle of the view
 * @param type the tile type
 * @param searchPos the position to check
 * @returns {boolean} true if the search position is in the view
 */
export function inView(viewPos: QuestPosition, type: TileType,  searchPos: QuestPosition): boolean {
    var lowerLeft = lowerLeftInView(viewPos, type);
    var upperRight = upperRightInView(viewPos, type);
    if (
        searchPos.getX() >= lowerLeft.getX() &&
        searchPos.getX() <= upperRight.getX() &&
        searchPos.getY() >= lowerLeft.getY() &&
        searchPos.getY() <= upperRight.getY()
    ) {
        return true;
    }
    return false;
}