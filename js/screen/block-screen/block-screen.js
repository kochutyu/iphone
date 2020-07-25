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

function lineAnimate() {
    if (!screensaverBlockingLine.animate) return;

    animateLineStatus = true;

    // const animation = [{
    //         background: '#ffffff',
    //         bottom: animateLineStatus ? (bottomLineCount) + 'px' : null
    //     },
    //     {
    //         background: 'red',
    //         bottom: animateLineStatus ? (bottomLineCount += 4) + 'px' : null
    //     }
    // ];
    // const animationOptions = {
    //     duration: 300,
    //     iterations: 1,
    // };
    // screensaverBlockingLine.animate(animation, animationOptions);
    // screensaverBlockingLine.style.bottom = animateLineStatus ? (bottomLineCount += 4) + 'px' : null;
    // }
    const config = {
        start: {
            background: '#ffffff',
            bottom: '20px',
            width: '50px'
        },
        end: {
            background: 'red',
            width: '20%',
            bottom: '70px'
        },
        options: {
            duration: 300,
            iterations: 1,
        }
    }

    const configBGC = {
        start: {
            background: 'red',
            bottom: '30px',
            opacity: '0.5',
        },
        end: {
            background: 'red',
            width: '20%',
            bottom: '22px'
        },
        options: {
            duration: 300,
            iterations: 1,
        }
    }
    animateStyle(100, screensaverBlockingLine, config).subscribe(res => console.log(res));
    animateStyle(1, screensaverBlocking, configBGC, nextPX);

    // merge(
    //     animateStyle(100, screensaverBlockingLine, config),
    //     animateStyle(1, screensaverBlocking, configBGC)
    // ).subscribe();
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