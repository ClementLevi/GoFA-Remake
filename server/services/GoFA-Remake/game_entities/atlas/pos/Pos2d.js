const path = require("node:path");
/**
 * @typedef {typeof import("./Pos")} Pos
 * @type {Pos}
 */
const Pos = require(path.resolve(__dirname, "./Pos"));
/**
 * @implements {Pos}
 * @class Pos2d A 2D position object. 二维位置对象。
 * @property {number} x The x value of the position. 位置的 x 值。
 * @property {number} y The y value of the position. 位置的 y 值。
 * @property {(Pos2d):number} distanceTo Calculates the distance between two 2 dimensional positions. 计算两个二维位置之间的距离。
 * @property {(number):this} offset Give the position a random offset within maximal distance e, Ignoring how many dimensions the position has. 在最大距离 e 范围内为位置给予随机偏移，无视位置的维度有多少。
 */
class Pos2d extends Pos {
    static allowNegative = true;
    static scale = 1;
    /**
     * Accept x and y values and create a new 2D position object. 接受 x 和 y 值并创建一个新的二维位置对象。
     * @constructor
     * @param {number?} x The x value of the position. May be null to generate a random value. 位置的 x 值。可以为 null 以生成随机值。
     * @param {number?} y The y value of the position. May be null to generate a random value. 位置的 y 值。可以为 null 以生成随机值。
     */
    constructor(x, y) {
        super(x??0, y??0);
        if (Pos2d.allowNegative) {
            this.x = this.x ?? (Math.random() * 2 - 1) * Pos.scale;
            this.y = this.y ?? (Math.random() * 2 - 1) * Pos.scale;
        } else {
            this.x = this.x ?? Math.random() * Pos.scale;
            this.y = this.y ?? Math.random() * Pos.scale;
        }
    }
    /**
     * Calculates the distance between two positions. 计算两个位置之间的距离。
     * Implementation of the distance formula for 2D positions. 二维位置的距离公式实现。
     * @param {Pos2d} pos2d Another Pos2d object to calculate distance to. 另一个 Pos2d 对象，用于计算距离。
     * @returns {number} The distance between the two positions. 两个位置之间的距离。
     * @inheritdoc
     */
    distanceTo(pos2d) {
        return Math.sqrt(
            Math.pow(pos2d.x - this.x, 2) + Math.pow(pos2d.y - this.y, 2)
        );
    }
    /**
     * Give the position a random offset within maximal distance e, Ignoring how many dimensions the position has. 在最大距离 e 范围内为位置给予随机偏移，无视位置的维度有多少。
     * @param {number} e maximal offset value 最大偏移值
     * @returns {this} 返回自身
     */
    offset(e) {
        const randomOffsetX = Math.random() * 2 - 1;
        const randomOffsetY = Math.random() * 2 - 1;
        const distance = Math.sqrt(this.x ** 2 + this.y ** 2);
        if (distance === 0) return this;
        this.x += (this.x * randomOffsetX * e) / distance;
        this.y += (this.y * randomOffsetY * e) / distance;
        return this;
    }
}

module.exports = Pos2d;

if (require.main === module) {
    const pos = new Pos2d();
    console.log(pos);
    Pos2d.setScale(10);
    Pos2d.setAllowNegative(false);
    const p2 = new Pos2d(1, 1);
    const p3 = new Pos2d();
    console.log(p2, p3);
    console.log("distance between p3 and itself: ", p3.distanceTo(p3));
    p2.offset(10);
    console.log(
        `new pos of p2: `,
        p2.x,
        `: `,
        p2.y,
        `, distance: ${p2.distanceTo(new Pos2d(1, 1))} (should be less than 10)`
    );
}
