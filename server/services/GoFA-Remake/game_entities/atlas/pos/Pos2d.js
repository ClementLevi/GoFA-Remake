const Pos = require("./Pos");
/**
 * @implements {Pos}
 * @class Pos2d A 2D position object. // Pos2d 二维位置对象。
 * @property {Number} x The x value of the position. // 位置的 x 值。
 * @property {Number} y The y value of the position. // 位置的 y 值。
 * @method distanceTo Calculates the distance between two 2 dimensional positions. // distanceTo 计算两个二维位置之间的距离。
 * @method offset Give the position a random offset within maximal distance e, Ignoring how many dimensions the position has. // offset 在最大距离 e 范围内为位置给予随机偏移，无视位置的维度有多少。
 */
class Pos2d extends Pos {
    /**
     * Accept x and y values and create a new 2D position object. // 接受 x 和 y 值并创建一个新的二维位置对象。
     * @param {Number|null} x The x value of the position. May be null to generate a random value. // 位置的 x 值。可以为 null 以生成随机值。
     * @param {Number|null} y The y value of the position. May be null to generate a random value. // 位置的 y 值。可以为 null 以生成随机值。
     * @method distanceTo Calculates the distance between two 2 dimensional positions. // distanceTo 计算两个二维位置之间的距离。
     */ constructor(x = null, y = null) {
        super();
        if (Pos.allowNegative) {
            this.x = x === null ? (Math.random() * 2 - 1) * Pos.scale : x;
            this.y = y === null ? (Math.random() * 2 - 1) * Pos.scale : y;
        } else {
            this.x = x === null ? Math.random() * Pos.scale : x;
            this.y = y === null ? Math.random() * Pos.scale : y;
        }
    }
    /**
     * Calculates the distance between two positions. // 计算两个位置之间的距离。
     * Implementation of the distance formula for 2D positions. // 二维位置的距离公式实现。
     * @param {Pos2d} pos2d Another Pos2d object to calculate distance to. // 另一个 Pos2d 对象，用于计算距离。
     * @returns {Number} The distance between the two positions. // 两个位置之间的距离。
     * @inheritdoc
     * @override
     */
    distanceTo(pos2d) {
        return Math.sqrt(
            Math.pow(pos2d.x - this.x, 2) + Math.pow(pos2d.y - this.y, 2)
        );
    }
    /**
     * Give the position a random offset within maximal distance e, Ignoring how many dimensions the position has. // 在最大距离 e 范围内为位置给予随机偏移，无视位置的维度有多少。
     * @param {Number} e offset value // 偏移值
     * @returns this // 返回自身
     * @inheritdoc
     * @override
     */
    offset(e) {
        const randomOffset = Math.random() * 2 - 1;
        const distance = Math.sqrt(this.x ** 2 + this.y ** 2);

        if (distance === 0) {
            return this;
        }

        const newX = this.x + (this.x * randomOffset * e) / distance;
        const newY = this.y + (this.y * randomOffset * e) / distance;

        this.x = newX;
        this.y = newY;

        return this;
    }
}

module.exports = Pos2d;

if (require.main === module) {
    const pos = new Pos2d();
    console.log(pos);
    Pos2d.setScale(10);
    Pos2d.setAllowNegative(false);
    const p2 = new Pos2d();
    console.log(p2);
    console.log(pos.distanceTo(p2));
    pos.offset(1000);
    console.log("new pos: ", pos);
}
