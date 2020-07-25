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
        duration: 200,
        iterations: 1,
        moveTo: true
    }
}

let previousCoords = {
    x: null,
    y: null
};

let destroyAnimate$ = null;

function getSwipeCoords(event) {
    if (previousCoords.y === null) {
        console.log(event);
        previousCoords = event;
        config.options.sign = true;
    }

    if (destroyAnimate$ !== null) {
        if (previousCoords.y < event.y) {
            console.log('down');
            destroyAnimate$.unsubscribe();
            config.options.sign = false;
        } else {
            console.log('up');
            destroyAnimate$.unsubscribe()
            config.options.sign = true;
        }
    }
    // console.log(config.options.sign);

    previousCoords = event;
}

function lineAnimate(event) {

    animateLineStatus = true;

    bottomLineCount += 1;
    return animateStyle(30, screensaverBlockingLine, config).subscribe(res => {
        config = res
    });
}
// destroyAnimate$.pipe(
//     tap(_ => console.log(_ + 'lol'))
// )
// SWIPE SCREEN
const startSwipe$ = fromEvent(screensaverBlocking, 'mousedown')
    .pipe(
        takeMouseSwipe(screensaverBlocking),
        tap(endSwipeStatus = false),
        map(v => converToCoords(v)),
        tap(_ => curentHeightSwipe++),
        // tap(e => console.log(e)),
        // tap(lineAnimate),
        tap(e => getSwipeCoords(e)),
        map(e => {
            destroyAnimate$ = lineAnimate(e);
            return destroyAnimate$;
        }),
        // tap(_ => _.unsubscribe()),
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