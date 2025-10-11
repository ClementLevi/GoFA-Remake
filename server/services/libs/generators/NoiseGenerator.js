const NOISEJS = require("noisejs");

const NOISE_AMPLIFIER = 10;
/**
 * 噪声生成器接口
 * 噪声生成器接口，用于生成不同种类的噪声图像，如Perlin噪声、Simplex噪声等。
 * 需要实现以下方法：
 * - generate2D(x, y, seed = null, fineness = 1)：生成2D噪声图像，返回一个二维数组。
 * - generate3D(x, y, z, seed = null, fineness = 1)：生成3D噪声图像，返回一个三维数组。
 * 对于每个方法，需要传入噪声图像的宽度、高度、种子、噪声粒度（用于离散噪声）等参数。
 * 上述方法的返回值都是二维或三维数组，数组元素的值代表对应位置的噪声值。数组元素数量与传入的宽度、高度、深度以及噪声粒度有关。
 * 例如：对于generate2D方法，返回的数组的元素数量为(x÷fineness)*(y÷fineness)，其中fineness为噪声粒度。
 * @example
 * const noise = new PerlinNoiseGenerator();  // PerlinNoiseGenerator 实现了 INoiseGenerator 接口
 * const noise2D = noise.generate2D(x=2, y=2, seed=1234,fineness=1)
 * console.log(noise2D) // [  [ 0, 0.10009653588 ],  [ 0.09990149399999998, 0.00019503899808068535 ] ]
 * @module shared/NoiseGenerator
 * @author Clement_Levi
 * @interface INoiseGenerator
 */
class INoiseGenerator {
    /**
     * @abstract
     * @param {number} [fineness=1] 噪声粒度，用于生成离散噪声时控制目标采样点间距，默认为1
     * @param {number?} seed
     */
    constructor(fineness = 1, seed = null) {}

    /**
     * @abstract
     * @param {number} x 需要生成的噪声图像的宽度
     * @param {number} y 需要生成的噪声图像的高度
     * @param {number?} seed 种子
     * @param {number} [fineness=1] 噪声粒度，用于生成离散噪声时控制目标采样点间距，默认为1。位于[0,1]之间，值越大，噪声越离散。
     * //@returns {Array<Array<number>>>}
     */
    generate2D(x, y, seed = null, fineness = 1) {}

    /**
     * @abstract
     * @param {number} x 需要生成的噪声图像的宽度
     * @param {number} y 需要生成的噪声图像的高度
     * @param {number} z 需要生成的噪声图像的深度
     * @param {number?} seed
     * @param {number} [fineness=1] 噪声粒度，用于生成离散噪声时控制目标采样点间距，默认为1。位于[0,1]之间，值越大，噪声越离散。
     * //@returns {Array<Array<Array<number>>>>}
     */
    generate3D(x, y, z, seed = null, fineness = 1) {}
}

/**
 * 柏林噪声生成器
 * 柏林噪声生成器，用于生成2D和3D柏林噪声图像。
 * 实现了INoiseGenerator接口。
 * @implements INoiseGenerator
 */
class PerlinNoiseGenerator extends INoiseGenerator {
    /**
     * @override
     * @param {number} [fineness=1] 噪声粒度，用于生成离散噪声时控制目标采样点间距，默认为1
     * @param {number?} seed
     */
    constructor(fineness = 1, seed = null) {
        super(fineness, seed);
        this._Noise = new NOISEJS.Noise(seed ? seed : Math.random());
        this._Noise.seed(seed ? seed : Math.random());
    }

    /**
     * 按照柏林噪声生成2D噪声
     * @override
     * @param {number} x
     * @param {number} y
     * @param {number?} seed
     * @returns {Array<Array<number>>}
     */
    generate2D(x, y, seed = null) {
        if (seed) {
            this._Noise.seed(seed ? seed : Math.random());
        }
        var image = [];
        for (var _x = 0; _x < x; _x++) {
            var row = [];
            for (var _y = 0; _y < y; _y++) {
                // noise.simplex2 and noise.perlin2 return values between -1 and 1.
                var value = this._Noise.perlin2(_x / 100, _y / 100);
                row.push(Math.abs(value) * NOISE_AMPLIFIER);
            }
            image.push(row);
        }
        return image;
    }

    /**
     * 按照柏林噪声生成3D噪声
     * @override
     * @param {number} x 数组宽度
     * @param {number} y
     * @param {number} z
     * @param {number?} seed
     * @returns {Array<Array<Array<number>>>}
     */
    generate3D(x, y, z, seed = null) {
        if (seed) {
            this._Noise.seed(seed ? seed : Math.random());
        }
        var image = [];
        for (var _x = 0; _x < x; _x++) {
            var row = [];
            for (var _y = 0; _y < y; _y++) {
                var col = [];
                for (var _z = 0; _z < z; _z++) {
                    // noise.simplex3 and noise.perlin3 return values between -1 and 1.
                    var value = this._Noise.perlin3(
                        _x / 100,
                        _y / 100,
                        _z / 100
                    );
                    col.push(Math.abs(value) * NOISE_AMPLIFIER);
                }
                row.push(col);
            }
            image.push(row);
        }
        return image;
    }
}

/**
 * Simplex噪声生成器
 * Simplex噪声生成器，用于生成2D和3D Simplex噪声图像。
 * 实现了INoiseGenerator接口。
 * @implements INoiseGenerator
 */
class SimplexNoiseGenerator extends INoiseGenerator {
    /**
     * @override
     * @param {number} [fineness=1] 噪声粒度，用于生成离散噪声时控制目标采样点间距，默认为1
     * @param {number?} seed
     */
    constructor(fineness = 1, seed = null) {
        super(fineness, seed);
        this._Noise = new NOISEJS.Noise(seed ? seed : Math.random());
        this._Noise.seed(seed ? seed : Math.random());
    }

    /**
     * 按照Simplex噪声生成2D噪声
     * @override
     * @param {number} x
     * @param {number} y
     * @param {number?} seed
     * @param {number} [fineness=1] 噪声粒度，用于生成离散噪声时控制目标采样点间距，默认为1。位于[0,1]之间，值越大，噪声越离散。
     * @returns {Array<Array<number>>}
     */
    generate2D(x, y, seed = null, fineness = 1) {
        if (seed) {
            this._Noise.seed(seed ? seed : Math.random());
        }
        var image = [];
        for (var _x = 0; _x < x; _x++) {
            var row = [];
            for (var _y = 0; _y < y; _y++) {
                // noise.simplex2 and noise.perlin2 return values between -1 and 1.
                var value = this._Noise.simplex2(_x / 100, _y / 100);
                row.push(Math.abs(value) * NOISE_AMPLIFIER);
            }
            image.push(row);
        }
        return image;
    }

    /**
     * 按照Simplex噪声生成3D噪声
     * @override
     * @param {number} x 数组宽度
     * @param {number} y
     * @param {number} z
     * @param {number?} seed
     * @param {number} [fineness=1] 噪声粒度，用于生成离散噪声时控制目标采样点间距，默认为1。位于[0,1]之间，值越大，噪声越离散。
     * @returns {Array<Array<Array<number>>>}
     */
    generate3D(x, y, z, seed = null, fineness = 1) {
        if (seed) {
            this._Noise.seed(seed ? seed : Math.random());
        }
        var image = [];
        for (var _x = 0; _x < x; _x++) {
            var row = [];
            for (var _y = 0; _y < y; _y++) {
                var col = [];
                for (var _z = 0; _z < z; _z++) {
                    // noise.simplex3 and noise.perlin3 return values between -1 and 1.
                    var value = this._Noise.simplex3(
                        _x / 100,
                        _y / 100,
                        _z / 100
                    );
                    col.push(Math.abs(value) * NOISE_AMPLIFIER);
                }
                row.push(col);
            }
            image.push(row);
        }
        return image;
    }
}

module.exports = {
    INoiseGenerator,
    PerlinNoiseGenerator,
    SimplexNoiseGenerator,
};

if (require.main === module) {
    const noise = new PerlinNoiseGenerator();
    const noise2 = new SimplexNoiseGenerator();
    console.log(noise.generate2D(2, 2, 1234));
    console.log(noise2.generate2D(2, 2));
}
