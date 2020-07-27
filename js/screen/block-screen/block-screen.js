import {
    takeMouseSwipe,
    converToCoords,
    animateStyle
}
from '../../../core/core';

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

let linePosition = {
    start: {
        bottom: '20px',
    },
    end: {},
    options: {
        duration: 200,
        moveTo: true,
    }
}

let lineWidth = {
    start: {
        width: '80px',
        color: "rgb(1,4,2)",
        // opacity: '0.4',
        backgroundColor: 'rgb(255,255,255)'
    },
    end: {
        backgroundColor: 'rbg(0, 0, 0)',
        width: '20%',
        bottom: '70px',
        color: "rgb(1,4,2)",
    },
    options: {
        duration: 100,
        moveTo: true,
        max_width: '200px',
        min_width: '80px'
    }
}

let bgcPosition = {
    start: {
        top: '0px',
    },
    end: {},
    options: {
        duration: 1000,
        moveTo: true
    }
}

let previousCoords = {
    x: null,
    y: null
};

let destroyAnimate$ = null;

function getSwipeCoords(currentCoords) {
    if (previousCoords.y === null) {
        // console.log(event);
        previousCoords = event;
        linePosition.options.sign = true;
        lineWidth.options.sign = true;
        bgcPosition.options.sign = true;
    }

    if (destroyAnimate$ !== null) {
        if (previousCoords.y < event.y) {
            // console.log('down');
            destroyAnimate$.unsubscribe();
            linePosition.options.sign = false;
            lineWidth.options.sign = false;
            bgcPosition.options.sign = true;
        } else {
            // console.log('up');
            destroyAnimate$.unsubscribe()
            linePosition.options.sign = true;
            lineWidth.options.sign = true;
            bgcPosition.options.sign = false;
        }
    }

    previousCoords = event;
}

function animateElements(event) {


    const linePositionAnimate$ = animateStyle(30, screensaverBlockingLine, linePosition).pipe(
        tap(newStyle => linePosition = newStyle)
    )

    const lineWidthAnimate$ = animateStyle(30, screensaverBlockingLine, lineWidth).pipe(
        tap(newStyle => lineWidth = newStyle)
    )

    const bgcPositionAnimate$ = animateStyle(100, screensaverBlocking, bgcPosition).pipe(
        tap(newStyle => bgcPosition = newStyle)
    )

    return merge(linePositionAnimate$, lineWidthAnimate$, bgcPositionAnimate$).subscribe();
}


// SWIPE SCREEN
const startSwipe$ = fromEvent(screensaverBlocking, 'mousedown')
    .pipe(
        takeMouseSwipe(screensaverBlocking),
        map(event => converToCoords(event)),
        tap(currentCoords => getSwipeCoords(currentCoords)),
        map(currentCoords => {
            destroyAnimate$ = animateElements(currentCoords);
            return destroyAnimate$;
        }),
        repeat()
    )

const endSwipe$ = fromEvent(screensaverBlocking, 'mouseup')
    .pipe(
        // tap(_ => animateBlockScreen()),
    )

merge(
    startSwipe$,
    endSwipe$
).subscribe()