/**
 * @interface Pos
 * @description A position in the game world. 游戏世界中的一个位置。
 * @method distanceTo calculates the distance between two positions. Must be implemented by subclasses. 计算两个位置之间的距离。必须由子类实现。
 * @static setScale sets the scale of the position. 设置位置的缩放比例。
 */
class Pos {
    /**
     * @property {Number} scale The scale of the position. Indicates the size of the game world. 位置的缩放比例。表示游戏世界的大小。
     * @static
     */
    static scale = 1000;
    
    /**
     * @property {Boolean} allowNegative Whether negative coordinates are allowed. 是否允许负坐标。
     * @static
     */
    static allowNegative = true;

    /**
     * Set the scale of the position.
     * This enables larger scale of the game world.
     * 设置位置的缩放比例。
     * 这使得游戏世界可以更大。
     * @param {Number} n The new scale. 新的缩放比例。
     * @static
     */
    static setScale(n) {
        Pos.scale = n;
    }

    /**
     * Set whether negative coordinates are allowed.
     * @param {Boolean} b switch for allowing negative coordinates. 切换是否允许负坐标。
     * @static
     */
    static setAllowNegative(b) {
        Pos.allowNegative = b;
    }

    /**
     * Must be implemented and called by subclasses with super().
     * 必须由子类实现并通过 super() 调用。
     * @abstract
     */
    constructor() {
        if (new.target === Pos) {
            throw new Error("Must be implemented by subclass");
        }
    }

    /**
     * Must be implemented by subclasses.
     * @param {Pos} otherPos The position to calculate distance to. 要计算距离的另一个位置。
     * @abstract
     * @memberof Pos
     */
    distanceTo(otherPos) {
        throw new Error("Not implemented");
    }

    /**
     * Give the position a random offset within maximal distance e, Ignoring how many dimensions the position has.
     * Must be implemented by subclasses.
     * 在最大距离 e 范围内为位置给予随机偏移，无视位置的维度有多少。
     * 必须由子类实现。
     * @param {Number} e offset value 偏移值
     * @returns this
     * @abstract
     * @memberof Pos
     */
    offset(e) {
        throw new Error("Not implemented");
    }
}
module.exports = Pos;

if (require.main === module) {
    console.log(Pos.scale); // 1000 by default  默认值为 1000
    console.log(Pos.allowNegative); // false by default 默认值为 false

    // console.log(new Pos(1, 2).toString()); //! raise error because not implemented by subclass  抛出错误，因为没有被子类实现
    class MyPos extends Pos {
        constructor(x, y) {
            super();
            this.x = x;
            this.y = y;
        }
        distanceTo(otherPos) {
            return Math.sqrt(
                Math.pow(this.x - otherPos.x, 2) +
                    Math.pow(this.y - otherPos.y, 2)
            );
        }
    }

    const pos1 = new MyPos(1, 2);
    const pos2 = new MyPos(3, 4);
    console.log(pos1.distanceTo(pos2)); // 2.8284271247461903
}
