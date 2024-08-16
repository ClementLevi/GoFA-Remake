/**
 * 根据给定的坐标和偏移量生成新的坐标值数组
 * 通过计算每个维度的最大偏移量（maxDimOffset）来限制每个维度的坐标偏移不超过 sqrt(𝑛)×offset，从而确保新坐标与原始坐标的距离不超过总体偏移量 offset。
 * @param {number[]} Pos - 原始坐标数组
 * @param {number} offset - 偏移量
 * @returns {number[]} - 新的坐标值数组
 */
function posOffset(Pos, offset) {
    const n = Pos.length; // 坐标的维度数
    const maxDimOffset = offset / Math.sqrt(n); // 每个维度的最大偏移量
    const Pos_new = [];

    for (let i = 0; i < n; i++) {
        // 生成-1到1之间的随机数
        const directionFactor = Math.random() * 2 - 1;
        // 计算当前维度的偏移量（可能是正也可能是负）
        const dimOffset = directionFactor * maxDimOffset;
        // 计算新的坐标值
        const newPos = Pos[i] + dimOffset;
        // 添加到新数组中
        Pos_new.push(newPos);
    }

    return Pos_new;
}

module.exports = { posOffset };

// 示例
if (require.main === module) {
    const originalPos = [10, 10]; // 三维坐标
    const maxOffset = 1; // 最大偏移量
    const newPos = posOffset(originalPos, maxOffset);
    console.log(newPos);
}