import {
    takeMouseSwipe,
    converToCoords,
    animateStyle
}
from '../../core';

import {
    screensaverBlocking,
    screensaverBlockingLine
} from '../../dom';

import {
    fromEvent,
    merge,
    Subject,
    BehaviorSubject
} from 'rxjs';

import {
    repeat,
    tap,
    map
} from 'rxjs/operators';

let bottomLineCount = 20;
let animateLineStatus = false;
// function converToCoords(velue) {
//     return {
//         x: velue.x,
//         y: velue.y
//     }
// }
let curentHeightSwipe = 0;

let endSwipeStatus = false;

const nextPX = new Subject();

let config = {
    start: {
        bottom: '20px',
    },
    end: {
        background: 'red',
        width: '20%',
        bottom: '70px'
    },
    options: {
        duration: 500,
        iterations: 1,
    }
}


function lineAnimate(event) {
    console.log(event);

    animateLineStatus = true;

    animateStyle(100, screensaverBlockingLine, config).subscribe(res => {
        config = res
    });
    bottomLineCount += 1;
}

// SWIPE SCREEN
const startSwipe$ = fromEvent(screensaverBlocking, 'mousedown')
    .pipe(
        takeMouseSwipe(screensaverBlocking),
        tap(endSwipeStatus = false),
        map(v => converToCoords(v)),
        tap(_ => curentHeightSwipe++),
        // tap(e => console.log(e)),
        tap(lineAnimate),
        repeat()
    )


const endSwipe$ = fromEvent(screensaverBlocking, 'mouseup')
    .pipe(
        tap(_ => animateBlockScreen()),
        tap(_ => resetData()),
    )

function animateBlockScreen() {
    if (bottomLineCount > 15) {
        // console.log(15);
    } else {
        // console.log(0);
    }
}

function resetData() {
    bottomLineCount = 20;
    animateLineStatus = false;
    // screensaverBlockingLine.style.bottom = '20px'
}

merge(
    startSwipe$,
    endSwipe$
).subscribe()