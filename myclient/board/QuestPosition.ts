export = QuestPosition;

interface QuestPosition {
	/**
	 * Das ist ein test
	 * @return {number} Test
	 */
	getX(): number;
	getY(): number;
}

function getFormattedNumber(num: number): string {
    if (num < 0) {
        return '' + num;
    } else if(num === 0) {
        return ' ' + num;
    } else {
        return '+' + num;
    }
}


class QuestPositionImpl implements QuestPosition {
	private x: number;
    private y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	getX(): number {
		return this.x;
	}

	getY(): number {
		// test kommentar
		return this.y;
	}

    toString(): string {
        return '{x:' + getFormattedNumber(this.getX()) + ', y:' + getFormattedNumber(this.getY()) + '}';
    }
}


function QuestPosition(x: number, y: number): QuestPosition {
		return new QuestPositionImpl(x, y);
}

