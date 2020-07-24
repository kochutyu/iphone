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

    for (let i = 0; i < steps; i++) {
        let animation = [];

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
            const styles = from(startArrStyle);
            const unitOfMeasurement = [
                '%', 'cm', 'em', 'ex', 'in', 'mm', 'pc', 'pt', 'px', 'vh', 'vw', 'vmin'
            ];


            let startDefault = {
                selectUnit: null,
                selectUnitLength: null,
                keyValue: null,
                newKeyValue: null,
                value: null
            }
            const endDefault = config.end;

            // TODO: create obj for style
            Object.keys(config.start).map(key => {
                const style = Object.create(config.start);
                style[key] = config.start[key];
                startArrStyle.push(style);
            })

            // const units = from(unitOfMeasurement);

            const startDefault$ = new BehaviorSubject(startDefault)
                .subscribe(res => {
                    startDefault = res;
                    console.log(res, 'THISI');
                });


            const findUnitForStyle$ = () => styles
                .pipe(
                    filter(style => {

                        for (const key in style) {
                            return unitOfMeasurement.some(unit => {
                                if (JSON.stringify(style[key]).includes(unit)) {
                                    const selectUnit = unit;
                                    const selectUnitLength = unit.split('').length;
                                    const keyValue = style[key];
                                    const newKeyValue = keyValue
                                        .slice(0, -selectUnitLength);
                                    const value = `${+newKeyValue + 1}${selectUnit}`;
                                    startDefault$.next({
                                        selectUnit,
                                        selectUnitLength,
                                        keyValue,
                                        newKeyValue,
                                        value
                                    });
                                    return true;
                                }
                                return false;
                            })
                        }

                    })
                )

            const setAnimation$ = styles
                .pipe(
                    switchMap(findUnitForStyle$),
                    tap(style => {
                        const value = `${+startDefault.newKeyValue + 1}${startDefault.selectUnit}`;

                        for (const key in style) {
                            if (style.hasOwnProperty(key)) {
                                element.style[key] = value;
                            }
                        }
                    })
                ).subscribe(res => {})



            // forkJoin(
            //     startDefault$,
            //     setAnimation$
            // ).subscribe(res => {
            //     console.log(res, 'THIS');
            // })

            // Object.keys(config.start).forEach((key, i) => {
            //     const includesUnitIndex = unitOfMeasurement.findIndex(
            //         unit => JSON
            //         .stringify(config.start[key])
            //         .includes(unit)
            //     );
            //     let unit = null;
            //     let unitLength = null;
            //     let keyValue = config.start[key];
            //     let newKeyValue = null;

            //     if (includesUnitIndex !== -1) {
            //         unit = unitOfMeasurement[includesUnitIndex];
            //         unitLength = unit.split('').length;
            //         newKeyValue = keyValue
            //             .slice(0, -unitLength);
            //         behaviorSub.next(`${+newKeyValue + 1}${unit}`);
            //         behaviorSub
            //             .pipe(
            //                 // debounceTime(50),
            //                 // tap(_ => (
            //                 //     behaviorSub.next(`${+newKeyValue + 1}${unit}`)
            //                 // ))
            //             )
            //             .subscribe(res => {
            //                 console.log(res);
            //                 element.style[key] = res;
            //             });
            // }

            // if (typeof config.start[key] === 'number') {
            //     element.style[key] = config.start[key];
            // }

            // });


        }
        // element.animate(animation, config.options);
    }
}