function HEXtoRGB(hex, animate = false) {
    if (!hex) return console.error('HEXtoRGB() method expects one argument.');

    const hexValue = hex
        .split('')
        .filter(symbol => symbol !== '#')
        .map(symbol => symbol.toLowerCase().toString());

    const long = hexValue.length === 6;


    if (long) {
        const color = {
            r: parseInt(hexValue[0] + hexValue[1], 16),
            g: parseInt(hexValue[2] + hexValue[3], 16),
            b: parseInt(hexValue[4] + hexValue[5], 16)
        }
        return animate ? [color.r, color.g, color.b] :
            `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    const short =
        hexValue.length === 3 &&
        hexValue.every((symbol, i, arr) => symbol === arr[1]);

    if (short) {
        const color = {
            r: parseInt(hexValue[0] + hexValue[0], 16),
            g: parseInt(hexValue[1] + hexValue[1], 16),
            b: parseInt(hexValue[2] + hexValue[2], 16)
        }
        return animate ? [color.r, color.g, color.b] :
            `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    return console.error(`"${hex}" is invalid. Please enter in format "#1c1c1c" or "#111" !`);
}

function RGBtoHEX(rgb) {
    if (!rgb) return console.error('RGBtoHEX() method expects one argument.');

    const condition = ['r', 'g', 'b', 'a', '(', ')', ' '];

    const rgbValues = rgb
        .split('')
        .filter(symbol => !condition.some(sym => sym === symbol))
        .join('')
        .split(',')
        .filter(symbol => symbol.split('').length < 4 && symbol.split('').length > 0)
        .map(symbol => +symbol)

    const rgbValid = rgbValues.every(num => num >= 0 && num <= 255);

    if (rgbValues.length === 3 && rgbValid) {
        const convertRBGtoHEX = rgbValues.map(symbol => {
            let number = +symbol;
            const hex = number.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        });
        return `#${convertRBGtoHEX[0]}${convertRBGtoHEX[1]}${convertRBGtoHEX[2]}`;
    }

    if (!rgbValid) {
        const invalidNumber = rgbValues.map(num => {
            if (num >= 0 && num <= 255) {
                return num;
            }
            return 'invalid';
        });
        return console.error(`"${rgb}" is invalid. Please enter in format "rgb(${invalidNumber[0]}, ${invalidNumber[1]}, ${invalidNumber[2]})" !`);
    }

    return console.error(`"${rgb}" is invalid. Please enter in format "rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})" !`);
}

function RGBtoRGB(rgb) {
    if (!rgb) return console.error('RBGtoRGB() method expects one argument.');

    const condition = ['r', 'g', 'b', 'a', '(', ')', ' ', '[', ']'];

    const rgbValues = rgb
        .split('')
        .filter(symbol => !condition.some(sym => sym === symbol))
        .join('')
        .split(',')
        .filter(symbol => symbol.split('').length < 4 && symbol.split('').length > 0)
        .map(symbol => +symbol)

    const rgbValid = rgbValues.every(num => num >= 0 && num <= 255);

    if (rgbValues.length === 3 && rgbValid) {
        const rgbValue = rgbValues.join(', ');
        return `rgb(${rgbValue})`;
    }

    if (!rgbValid) {
        const invalidNumber = rgbValues.map(num => {
            if (num >= 0 && num <= 255) {
                return num;
            }
            return 'invalid';
        });
        return console.error(`"${rgb}" is invalid. Please enter in format "rgb(${invalidNumber[0]}, ${invalidNumber[1]}, ${invalidNumber[2]})" !`);
    }

    return console.error(`"${rgb}" is invalid. Please enter in format "rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})" !`);

}

export function setColor(color, animate = false) {
    const type = ['rgb', 'rgba', '#', '[', ']'];
    const result = type.find(type => color.includes(type));

    const RGB = ['rgb', 'rgba', '#', '[', ']'];
    const HEX = '#';


    if (result === HEX) return HEXtoRGB(color, animate);

    const isRGB = RGB.some(res => res === result);
    if (isRGB) return RGBtoRGB(color, animate);
}

console.log(setColor('[3, 7, 2]'));