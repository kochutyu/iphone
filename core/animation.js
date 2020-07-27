import {
    BehaviorSubject,
    interval,
    from,
    Subject,
    merge,
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
    const endConfig$ = from(endArrStyle);

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
        selectUnitLength: null,
        type: null
    };

    const setTypeOfStyle = (style, isStartConfig) => {

        if (conditionForColors(style)) {
            for (const key in style) {
                if (style.hasOwnProperty(key)) {
                    style[key] = setColor(style[key], true);
                    setStartDefault(currentUnit, style, key, 'color', isStartConfig);
                }
            }

        } else if (conditionForMeasurement(style)) {
            for (const key in style) {
                if (style.hasOwnProperty(key)) {
                    setStartDefault(currentUnit, style, key, 'measurement', isStartConfig);
                }
            }

        } else {
            for (const key in style) {
                if (style.hasOwnProperty(key)) {
                    setStartDefault(null, style, key, 'other', isStartConfig);
                }
            }
        }

    }

    const startDefault$ = new Subject() // TODO: get obj for work
        .subscribe(res => {
            startDefault = res;
        });

    const allEndStyles = [];

    let allEndColors = [];
    let allEndMeasurement = [];
    let allEndOther = [];

    function filterEndConfig() {
        allEndColors = allEndStyles.filter(style => style.type === 'color');
        allEndMeasurement = allEndStyles.filter(style => style.type === 'measurement');
        allEndOther = allEndStyles.filter(style => style.type === 'other');

        console.log(allEndColors);
        console.log(allEndMeasurement);
        console.log(allEndOther);
    }

    const endDefault$ = new Subject() // TODO: get obj for work
        .subscribe(res => {
            allEndStyles.push(res);
            filterEndConfig();
        });

    function getselectValue(type, keyValue, selectUnitLength) {
        const isMeasurement = type === 'measurement';
        const isColorOrOther = type === 'color' | type === 'other';
        if (isMeasurement) return +keyValue.slice(0, -selectUnitLength);
        if (isColorOrOther) return keyValue;
    }

    const setStartDefault = (unit, style, key, type, isStartConfig) => {
        const selectUnit = unit;
        const selectUnitLength =
            unit === null ? 0 : unit.split('').length;

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

        if (isStartConfig) {
            startDefault$.next(newStartDefault);
        } else {
            endDefault$.next(newStartDefault)
        }
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

        let newConfig = { // !One transform ???
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

        function selectTypeStyle(style) {
            if (style.type === 'measurement') {
                config.options.sign ? style.selectValue += 1 : style.selectValue -= 1;
                element.style[style.keyName] = `${style.selectValue}${style.selectUnit}`;
            }
            if (style.type === 'color') {
                // console.log(style);
                element.style[style.keyName] = style.keyValue;
                // console.log(style.keyValue);
            }
            if (style.type === 'other') {
                element.style[style.keyName] = style.keyValue;
                // console.log(style.keyValue);
            }
        }

        const setStyle$ = (style, index) => {
            return (
                interval(durationForStep)
                .pipe(
                    tap(time => {
                        // console.log(style);
                        if (time !== 0) {

                            selectTypeStyle(style)
                            // console.log(config.options.sign);
                        }
                    }),
                    // map(v => v = style),
                    map(time => {
                        const newConfig = Object.create(style);
                        newConfig[style.keyName] = `${style.selectValue}${style.selectUnit}`;
                        newConfig.time = time;
                        return newConfig;
                    }),
                    // tap(v => console.log(v)),
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
                // tap(style => keysNameOfStyle.push(style.keyName)),

                // tap(v => console.log(v)),
                mergeMap(setStyle$),
                switchMap(intervaled$),
                repeat(1)
            )

        const filterEndConfig$ = endConfig$
            .pipe(
                tap(end => {
                    setTypeOfStyle(end, false);
                }),
                map(end => endDefault),
                // tap(_ => console.log(allEndStyles)),
                repeat(1)
            ).subscribe();

        const filterStyles$ = styles
            .pipe(
                tap(style => {
                    setTypeOfStyle(style, true);
                }),
                map(style => startDefault),
                tap(_ => {
                    // console.log(_);
                }),
                mergeMap(setStyle$),
                repeat(1)
            );

        // const lol = merge(filterStyles$, filterEndDefault$)

        return from(filterStyles$).pipe(
            map(_ => newConfig)
        );
    }

}