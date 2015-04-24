/**
 * Created by sebastian on 08.03.15.
 */
import QuestPosition = require('../board/QuestPosition');
import Direction = require('../game/Direction');
export = Mover;
interface Mover {
    goNext(pos: QuestPosition): Direction;
    isGoingUpMountain(): boolean;
    isTargetReached(): boolean;
}