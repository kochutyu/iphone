function toRGB(hex) {
    if (!hex) return console.error('toRGB() method expects one argument.');

    const hexValue = hex
        .split('')
        .filter(symbol => symbol !== '#')
        .map(symbol => symbol.toLowerCase().toString());

    const long = hexValue.length === 6;

    if (long) {
        const color = {
            r: parseInt(hexValue[1] + hexValue[2], 16),
            g: parseInt(hexValue[3] + hexValue[4], 16),
            b: parseInt(hexValue[5] + hexValue[6], 16)
        }
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
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
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }

    return console.error(`"${hex}" is invalid. Please enter in format "#1c1c1c" !`);
}

function toHEX(rgb) {
    if (!rgb) return console.error('toHEX() method expects one argument.');

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
            return hex.length == 1 ? "0" + hex : hex;
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