import {
    Subject,
    pipe,
    fromEvent,
    merge,
    BehaviorSubject,
    interval,
    timer,
    from,
    forkJoin
} from 'rxjs';

import {
    switchMap,
    takeUntil,
    throttleTime,
    tap,
    map,
    debounce,
    debounceTime,
    repeat,
    findIndex,
    last,
    find,
    mergeMap,
    filter,
    delay,
    take,
    takeLast,
} from 'rxjs/operators';

import {
    phone
} from './dom';

const sub = new Subject();
const behaviorSub = new BehaviorSubject();

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
                    blockDropElement()
                )
            )),
            // once mouse is up, we end swipe
            takeUntil(
                fromEvent(domElement, 'mouseup')
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

export function animateStyle(steps, element, config) {
    // console.log(steps);
    const durationForStep = Math.floor((config.options.duration / steps));
    // console.log(durationForStep);

    // for (let i = 0; i < steps; i++) {
    let animation = [];
    const animatinSteps = new Array(steps).fill(1);

    if (!element.animate || !config || !config.options) return;

    if (config.start) {
        animation = [config.start, null];
    }

    if (config.end) {
        animation = [config.end, null];
    }

    if (config.start && config.end) {

        animation = [config.start, config.end];

        let startArrStyle = [];
        let endArrStyle = [];
        const styles = from(startArrStyle);

        const unitOfMeasurement = [
            '%', 'cm', 'em', 'ex', 'in', 'mm', 'pc', 'pt', 'px', 'vh', 'vw', 'vmin'
        ];

        // # rgb rgba //!word

        // opacity: 0.7
        // const name = [opacity, tranform, ]

        let startDefault = {
            keyName: null,
            keyValue: null,
            selectValue: null,
            selectUnit: null,
            selectUnitLength: null
        }
        let endDefault = {
            keyName: null,
            keyValue: null,
            selectValue: null,
            selectUnit: null,
            selectUnitLength: null
        };

        // TODO: create obj for start default
        Object.keys(config.start).map(key => {
            const style = Object.create(config.start);
            style[key] = config.start[key];
            startArrStyle.push(style);
        })

        // TODO: create obj for end default
        Object.keys(config.end).map(key => {
            const style = Object.create(config.end);
            style[key] = config.end[key];
            endArrStyle.push(style);
        })

        // console.log(endArrStyle, 'THIS');

        const startDefault$ = new BehaviorSubject(startDefault)
            .subscribe(res => {
                startDefault = res;
            });

        let counti = 0;

        function setStyle$(style, i) {
            return (
                interval(durationForStep)
                .pipe(
                    tap(time => {
                        if (time !== 0) {
                            style.selectValue += 1;
                            element.style[style.keyName] = `${style.selectValue}${style.selectUnit}`;
                        }
                    }),
                    take(steps + 1)
                )
            )
        }

        function setStartDefault(unit, style, key) {
            const selectUnit = unit;
            const selectUnitLength = unit.split('').length;
            const keyName = key;
            const keyValue = style[key];
            const selectValue = +keyValue
                .slice(0, -selectUnitLength);
            const newStartDefault = {
                keyName,
                keyValue,
                selectValue,
                selectUnit,
                selectUnitLength
            }
            startDefault$.next(newStartDefault);
        }

        function setEndDefault() {

        }

        // console.log(styles);
        const findUnitForStartDefault$ = styles
            .pipe(
                filter(style => {

                    for (const key in style) {
                        return unitOfMeasurement.some(unit => {
                            if (JSON.stringify(style[key]).includes(unit)) {
                                setStartDefault(unit, style, key);
                                return true;
                            }
                            return false;
                        })
                    }

                }),
                map(style => style = startDefault),
                // tap(v => console.log(v)),
                mergeMap(setStyle$),
                repeat(1)
            ).subscribe(res => console.log())

        let keyStyle = [];
        const setAnimation$ = styles
            .pipe(
                // tap(v => console.log(v)),
                // switchMap(findUnitForStyle$),
                repeat(1)
                // mergeMap(_ => timer(1000)),
                // mergeMap(setStyle$),
                // tap(_ => console.log(_)),

            ).subscribe(res => console.log())

    }
}