import {
    Subject,
    pipe,
    fromEvent,
    BehaviorSubject,
} from 'rxjs';

import * as color from './color'
import {
    animateStyle
} from './animation';

import {
    switchMap,
    takeUntil,
    throttleTime,
    tap,
} from 'rxjs/operators';

import {
    phone
} from '../js/dom';

function blockDropElement() {
    return (
        pipe(
            tap(event => event.preventDefault())
        )
    )
}

export function takeMouseSwipe(domElement) {
    return (
        pipe(
            switchMap(_ => (
                fromEvent(domElement, 'mousemove')
                .pipe(
                    blockDropElement(),
                    tap(_ => {
                        domElement.style.cursor = 'pointer';
                    })
                )
            )),
            // once mouse is up, we end swipe
            takeUntil(
                fromEvent(domElement, 'mouseup')
                .pipe(
                    tap(_ => {
                        domElement.style.cursor = 'default';
                    })
                )
            ),
            throttleTime(50)
        )
    )
}

export function converToCoords(velue) {
    return {
        x: velue.x,
        y: velue.y
    }
}

export {
    animateStyle
}