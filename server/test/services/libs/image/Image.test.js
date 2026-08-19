//@ts-nocheck
const { expect } = require("chai"); // 引入Chai库用于断言
const path = require("path");
const Image = require(path.resolve("services/libs/image/Image")); // 引入Image类
const Pixel = require(path.resolve("services/libs/image/Pixel")); // 引入Pixel类
// 实现中为 jimp 1.x：`const { Jimp } = require("jimp")`
const { Jimp } = require("jimp");

describe("Image Class Tests", () => {
    let image;
    const bitmapData = {
        data: [0xff0000ff, 0xffff00ff, 0xffffffff, 0x00ff00ff, 0x00ffffff],
        width: 5,
        height: 1,
    };

    beforeEach(() => {
        // 每个测试之前创建一个新的Image实例；深拷贝避免测试间互相污染
        image = new Image({
            bitmap: { ...bitmapData, data: [...bitmapData.data] },
        });
    });

    it("Constructor initializes properties correctly", () => {
        // 测试构造函数是否正确初始化属性
        expect(image.bitmap).to.deep.equal(bitmapData);
        expect(image.width).to.equal(bitmapData.width);
        expect(image.height).to.equal(bitmapData.height);
        // 实现默认 filePath 为空字符串（config.filePath ?? ""）
        expect(image.filePath).to.equal("");
        expect(image._handler).to.equal(Jimp);
        expect(image._data).to.be.null;
    });

    it("Load method with valid file path", async () => {
        // 使用真实的 test-image.png 读取
        image.filePath = path.resolve(
            "test/services/libs/image/test-image.png"
        );
        await image.load();
        expect(image._data).to.be.instanceOf(Jimp);
        expect(image._data.bitmap).to.have.property("data");
    });

    it("Load method throws error when no bitmap or filePath", async () => {
        // 当没有位图或文件路径时load方法应抛出错误
        image.filePath = null;
        image.bitmap = null;

        let threw = false;
        try {
            await image.load();
        } catch (err) {
            threw = true;
            expect(err.message).to.include(
                "No image file path nor bitmap provided"
            );
        }
        expect(threw).to.be.true;
    });

    it("getPixel method retrieves pixel correctly", () => {
        // 测试getPixel方法是否能正确获取像素
        image._data = {
            getPixelColor: () => 0xff0000ff,
        };

        const pixel = image.getPixel(0, 0);
        expect(pixel).to.be.instanceOf(Pixel);
        // Pixel 统一使用 0xRRGGBBAA 布局：0xff0000ff => R=255 G=0 B=0 A=255
        expect(pixel.r).to.equal(0xff);
        expect(pixel.g).to.equal(0x00);
        expect(pixel.b).to.equal(0x00);
        expect(pixel.a).to.equal(0xff);
    });

    it("getPixel method throws error when image not loaded", () => {
        // 测试当图像未加载时getPixel方法是否抛出错误
        image._data = null;
        expect(() => image.getPixel(0, 0)).to.throw("Image not loaded yet");
    });

    it("resize method resizes image correctly", () => {
        // 测试resize方法是否能正确调整图像大小（实现：this._data.resize({w, h})）
        let calledWith = null;
        const resized = { bitmap: { data: [], width: 10, height: 5 } };
        image._data = {
            resize: (opts) => {
                calledWith = opts;
                return resized;
            },
        };

        const ret = image.resize(10, 5);
        expect(calledWith).to.deep.equal({ w: 10, h: 5 });
        expect(image._data).to.equal(resized);
        expect(ret).to.equal(image); // 返回自身，支持链式调用
    });

    it("toGrayscale changes image to grayscale", () => {
        // 测试toGrayscale方法是否能正确将图像转为灰度图（实现：this._data.greyscale()）
        const grey = { bitmap: { data: [], width: 5, height: 1 } };
        image._data = {
            greyscale: () => grey,
        };

        const ret = image.toGrayscale();
        expect(image._data).to.equal(grey);
        expect(ret).to.equal(image);
    });

    it("fromBitmap method creates image from bitmap", () => {
        // 测试fromBitmap方法是否能正确从位图创建图像
        // jimp 1.x 的 Jimp.fromBitmap 要求 data 为 RGBA 字节 Buffer（width*height*4 字节）
        const rgbaBytes = Buffer.from([
            255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255,
            0, 255, 255, 255,
        ]);

        const ret = image.fromBitmap(rgbaBytes, 5, 1);
        expect(image._data).to.be.instanceOf(Jimp);
        expect(image._data.bitmap.width).to.equal(5);
        expect(image._data.bitmap.height).to.equal(1);
        expect(ret).to.equal(image);
    });

    it("toBitmap returns bitmap data correctly", () => {
        // 测试toBitmap方法是否能正确返回位图数据
        const mockBitmap = { data: [], width: 0, height: 0 };
        image._data = { bitmap: mockBitmap };
        const bitmap = image.toBitmap();
        expect(bitmap).to.equal(mockBitmap);
    });

    it("toBuffer returns buffer correctly", () => {
        // 测试toBuffer方法是否能正确返回缓冲区
        image._data = {
            getBuffer: () => Buffer.from([1, 2, 3, 4]),
        };

        const buffer = image.toBuffer();
        expect(buffer).to.deep.equal(Buffer.from([1, 2, 3, 4]));
    });

    it("toStrengthMap generates strength map correctly", () => {
        // 测试toStrengthMap方法是否能正确生成强度图
        // 像素1: R=255,G=0,B=0 => 强度 = (255+0+0)/3/255 = 1/3
        // 像素2: R=255,G=255,B=0 => 强度 = (255+255+0)/3/255 = 2/3
        image._data = {
            bitmap: {
                data: Uint8Array.from([255, 0, 0, 0, 255, 255, 0, 0]),
                width: 2,
                height: 1,
            },
        };

        const strengthMap = image.toStrengthMap();
        expect(strengthMap.data).to.deep.equal([1 / 3, 2 / 3]);
        expect(strengthMap.width).to.equal(2);
        expect(strengthMap.height).to.equal(1);
    });
});
