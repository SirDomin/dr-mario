export class Color {
    static BLACK = '#000000';
    static DARK_BLUE = '#00009C';
    static RED = '#9C0000';
    static PINK = '#9C009C';
    static GREEN = '#009C00';
    static LIGHT_BLUE = '#009C9C';
    static YELLOW = '#9C9C00';
    static GRAY = '#535A5D';
    static WHITE = '#FFFFFF';

    static randomColor() {
        let colors = [
            this.RED,
            this.YELLOW,
            this.GREEN
        ]

        return colors[Math.floor(Math.random() * (colors.length))];

    }
}