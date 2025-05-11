//@ts-nocheck
const { expect } = require("chai"); // 引入Chai库用于断言
const path = require("path");
const Image = require(path.resolve("services/libs/image/Image")); // 引入Image类
const Pixel = require(path.resolve("services/libs/image/Pixel")); // 引入Pixel类（假设存在这个类）
const Jimp = require("jimp"); // 引入Jimp库

describe("Image Class Tests", () => {
    let image;
    const bitmapData = {
        data: [0xff0000ff, 0xffff00ff, 0xffffffff, 0x00ff00ff, 0x00ffffff,],
        width: 5,
        height: 1,
    };

    beforeEach(() => {
        // 在每个测试之前创建一个新的Image实例
        // Create a new Image instance before each test
        image = new Image({ bitmap: bitmapData });
    });

    it("Constructor initializes properties correctly", () => {
        // 测试构造函数是否正确初始化属性
        // Test if the constructor initializes properties correctly
        expect(image.bitmap).to.deep.equal(bitmapData);
        expect(image.width).to.equal(bitmapData.width);
        expect(image.height).to.equal(bitmapData.height);
        expect(image.filePath).to.be.null;
        expect(image.handler).to.equal(Jimp);
        expect(image.data).to.be.null;
    });

    it("Load method with valid file path", async () => {
        // 测试load方法是否能正确处理有效的文件路径
        // Test if the load method handles a valid file path correctly
        Jimp.read = async () => ({
            getPixelColor: () => {},
            greyscale: () => {},
            resize: () => {},
            bitmap: { data: [], width: 0, height: 0 },
        });

        image.filePath = path.resolve(
            "test/services/libs/image/test-image.png"
        );
        await image.load();
        expect(image.data).to.not.be.undefined;
    });

    it("Load method throws error when no bitmap or filePath", async () => {
        // 测试当没有位图或文件路径时load方法是否抛出错误
        // Test if the load method throws an error when no bitmap or file path is provided
        image.filePath = null;
        image.bitmap.data = null;

        await expect(image.load()).to.be.rejectedWith(
            "No image file path nor bitmap provided"
        );
    });

    it("getPixel method retrieves pixel correctly", () => {
        // 测试getPixel方法是否能正确获取像素
        // Test if the getPixel method retrieves the pixel correctly
        image.data = {
            getPixelColor: () => 0xff0000ff,
        };

        const pixel = image.getPixel(0, 0);
        expect(pixel).to.be.instanceOf(Pixel);
        expect(pixel.color).to.equal(0xff0000ff);
    });

    it("getPixel method throws error when image not loaded", () => {
        // 测试当图像未加载时getPixel方法是否抛出错误
        // Test if the getPixel method throws an error when the image is not loaded
        image.data = null;
        expect(() => image.getPixel(0, 0)).to.throw("Image not loaded yet");
    });

    it("resize method resizes image correctly", () => {
        // 测试resize方法是否能正确调整图像大小
        // Test if the resize method resizes the image correctly
        image.data = {
            resize: () => image.data,
        };

        const resizedImage = image.resize(10, 5);
        expect(image.data.resize).to.have.been.calledWith({ w: 10, h: 5 });
        expect(resizedImage).to.equal(image);
    });

    it("toGrayscale changes image to grayscale", () => {
        // 测试toGrayscale方法是否能正确将图像转为灰度图
        // Test if the toGrayscale method converts the image to grayscale correctly
        image.data = {
            greyscale: () => image.data,
        };

        const grayscaleImage = image.toGrayscale();
        expect(image.data.greyscale).to.have.been.called;
        // expect(grayscaleImage).to.equal(image);
    });

    it("fromBitmap method creates image from bitmap", async () => {
        // 测试fromBitmap方法是否能正确从位图创建图像
        // Test if the fromBitmap method creates an image from bitmap correctly
        Jimp.fromBitmap = async () => ({
            bitmap: {
                data: [
                    0xff0000ff, 0xffff00ff, 0xffffffff, 0x00ff00ff, 0x00ffffff,
                ],
                width: 5,
                height: 1,
            },
        });

        const newImage = await image.fromBitmap(
            bitmapData.data,
            bitmapData.width,
            bitmapData.height
        );
        expect(image.data).to.not.be.undefined;
        // expect(newImage).to.equal(image);
    });

    // it("fromBuffer method creates image from buffer", async () => {
    // TODO: 未找到合适的测试用例
    //     // 测试fromBuffer方法是否能正确从缓冲区创建图像
    //     // Test if the fromBuffer method creates an image from buffer correctly
    //     const dummyBuffer = Buffer.from([0, 1, 2, 3]);

    //     Jimp.fromBuffer = async () => ({
    //         bitmap: { data: [], width: 0, height: 0 },
    //     });

    //     const newImage = await image.fromBuffer(dummyBuffer);
    //     expect(image.data).to.not.be.undefined;
    //     // expect(newImage).to.equal(image);
    // });

    it("toBitmap returns bitmap data correctly", () => {
        // 测试toBitmap方法是否能正确返回位图数据
        // Test if the toBitmap method returns the bitmap data correctly
        image.data = { bitmap: { data: [], width: 0, height: 0 } };
        const bitmap = image.toBitmap();
        expect(bitmap).to.equal(image.data.bitmap);
    });

    it("toBuffer returns buffer correctly", () => {
        // 测试toBuffer方法是否能正确返回缓冲区
        // Test if the toBuffer method returns the buffer correctly
        image.data = {
            getBuffer: () => Buffer.from([1, 2, 3, 4]),
        };

        const buffer = image.toBuffer();
        expect(buffer).to.deep.equal(Buffer.from([1, 2, 3, 4]));
    });

    // it("save method saves image to specified file path", () => {
    // TODO: 引入sinon库用于测试save方法
    // ? 要不要引入sinon库？
    // 测试save方法是否能正确保存图像到指定路径
    // Test if the save method saves the image to the specified file path
    //     image.data = {
    //         write: () => {},
    //     };

    //     const writeStub = sinon.stub(image.data, "write"); // 使用sinon监控write方法
    //     image.save("output/path/image.png");
    //     expect(writeStub).to.have.been.calledWith("output/path/image.png");
    // });

    it("toStrengthMap generates strength map correctly", () => {
        // 测试toStrengthMap方法是否能正确生成强度图
        // Test if the toStrengthMap method generates a strength map correctly
        image.data = {
            bitmap: {
                data: Uint8Array.from([255, 0, 0, 0, 255, 255, 0, 0]),
                width: 2,
                height: 1,
            },
        };

        const strengthMap = image.toStrengthMap();
        expect(strengthMap.data).to.deep.equal([1 / 3, 2 / 3]); // R=255 G=255 B=0 => 强度 = (255+255+0)/3/255 = 1
        // Strength = (255+255+0)/3 / 255 = 0.666, (255+0+0 / 3/ 255 = 0.333)
        expect(strengthMap.width).to.equal(2);
        expect(strengthMap.height).to.equal(1);
    });
});
