import {
    BehaviorSubject,
    interval,
    from,
    Subject,
} from 'rxjs';

import {
    switchMap,
    tap,
    map,
    repeat,
    mergeMap,
    filter,
    take,
    takeLast,
} from 'rxjs/operators';

import {
    setColor
} from './color';

function setColorAnimation() {

}

export function animateStyle(steps, element, config) {

    const durationForStep = Math.floor((config.options.duration / steps));

    let animation = [];

    let startArrStyle = [];
    let endArrStyle = [];
    const styles = from(startArrStyle);

    const unitOfMeasurement = [
        '%', 'cm', 'em', 'ex', 'in', 'mm', 'pc', 'pt', 'px', 'vh', 'vw', 'vmin'
    ];

    const unitOfColors = ['rgb', 'rgba', '#'];



    const measurementStyles = [];
    const colorStyles = [];
    const otherStyles = [];

    let currentUnit = null;

    const conditionForMeasurement = (style) => (
        unitOfMeasurement.some(unit => {
            if (JSON.stringify(style).includes(unit)) {
                currentUnit = unit;
                return true;
            }
            return false
        })
    );

    const conditionForColors = (style) => (
        unitOfColors.some(unit => {
            if (JSON.stringify(style).includes(unit)) {
                currentUnit = unit;
                return true;
            }
            return false
        })
    );

    let startDefault = {
        keyName: null,
        keyValue: null,
        selectValue: null,
        selectUnit: null,
        selectUnitLength: null,
        type: null
    }

    let endDefault = {
        keyName: null,
        keyValue: null,
        selectValue: null,
        selectUnit: null,
        selectUnitLength: null
    };

    const setTypeOfStyle = (style) => {

        if (conditionForColors(style)) {
            for (const key in style) {
                if (style.hasOwnProperty(key)) {
                    style[key] = setColor(style[key], true);
                    setStartDefault(currentUnit, style, key, 'color');
                }
            }

        } else if (conditionForMeasurement(style)) {
            for (const key in style) {
                if (style.hasOwnProperty(key)) {
                    setStartDefault(currentUnit, style, key, 'measurement');
                }
            }

        } else {
            for (const key in style) {
                if (style.hasOwnProperty(key)) {
                    setStartDefault(null, style, key, 'other');
                }
            }
        }

    }

    const startDefault$ = new BehaviorSubject(startDefault) // TODO: get obj for work
        .subscribe(res => {
            startDefault = res;
        });

    function getselectValue(type, keyValue, selectUnitLength) {
        const isMeasurement = type === 'measurement';
        const isColorOrOther = type === 'color' | type === 'other';
        if (isMeasurement) return keyValue.slice(0, -selectUnitLength);
        if (isColorOrOther) return keyValue;
    }

    const setStartDefault = (unit, style, key, type) => {
        const selectUnit = unit;
        const selectUnitLength =
            unit === null ?
            0 :
            unit.split('').length;

        const keyName = key;
        let keyValue = style[key];
        const selectValue = getselectValue(type, keyValue, selectUnitLength);

        if (type === 'color') {
            keyValue = setColor(JSON.stringify(style[key]));
        }

        const newStartDefault = {
            keyName,
            keyValue,
            selectValue,
            selectUnit,
            selectUnitLength,
            type
        }
        startDefault$.next(newStartDefault);
    }

    const createObjForStartDefault = () => {
        Object.keys(config.start).map(key => {
            const style = Object.create(config.start);
            style[key] = config.start[key];
            startArrStyle.push(style);
        })
    }

    const createObjForEndDefault = () => {
        Object.keys(config.end).map(key => {
            const style = Object.create(config.end);
            style[key] = config.end[key];
            endArrStyle.push(style);
        })
    }

    if (!element.animate || !config || !config.options) return;

    if (config.start) {
        animation = [config.start, null];
    }

    if (config.end) {
        animation = [config.end, null];
    }

    if (config.start && config.end) {

        animation = [config.start, config.end];

        createObjForStartDefault();

        createObjForEndDefault();

        const saveCurrentStule = [];
        const keysNameOfStyle = [];

        let count = 0;

        let newConfig = {
            start: null,
            end: config.end,
            options: config.options
        }

        const saveConfig$ = (item) => {
            return interval(0).pipe(
                map(_ => {
                    // console.log(item);
                    const styles = saveCurrentStule.filter(save => save.time === item.time);
                    const newStart = {};
                    // saveCurrentStule.shift();
                    styles.forEach(style => {
                        for (const key in style) {
                            if (style.hasOwnProperty(key)) {
                                newStart[key] = style[key];
                            }
                        }

                    })
                    delete newStart.time
                    newConfig.start = newStart;
                    if (count < 10) {
                        // console.log(newConfig);
                        count++
                    }
                }),
                take(1)
            )
        }

        const intervaled$ = () => interval()
            .pipe(
                // tap(v => console.log(v, 'THIS')),
                take(steps + 1)
            )

        const setStyle$ = (style, index) => {
            return (
                interval(durationForStep)
                .pipe(
                    tap(time => {
                        // console.log(style);
                        if (time !== 0) {

                            // console.log(config.options.sign);
                            config.options.sign ? style.selectValue += 1 : style.selectValue -= 1;
                            // style.selectValue += 1;
                            element.style[style.keyName] = `${style.selectValue}${style.selectUnit}`;
                        }
                    }),
                    // map(v => v = style),
                    map(time => {
                        const newConfig = Object.create(style);
                        newConfig[style.keyName] = `${style.selectValue}${style.selectUnit}`;
                        newConfig.time = time;
                        return newConfig;
                    }),
                    tap(config => {
                        saveCurrentStule.push(config);
                        saveCurrentStule.sort((a, b) => a.time - b.time);
                    }),
                    take(steps + 1),
                    mergeMap(saveConfig$)
                )
            )
        }

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
                tap(v => console.log(v)),
                map(style => style = startDefault),
                tap(style => keysNameOfStyle.push(style.keyName)),

                // tap(v => console.log(v)),
                mergeMap(setStyle$),
                switchMap(intervaled$),
                repeat(1)
            )

        const filterStyles$ = styles
            .pipe(
                map(setTypeOfStyle),
                // tap(style => console.log(style, 'THIS')),
                map(style => startDefault),
                tap(v => console.log(v)),
                repeat(1)
            )

        return from(filterStyles$).pipe(
            map(_ => newConfig)
        );
    }

}