// zOrderEncode.js

function zOrderEncode(coordinates) {
    let k = coordinates.length; // 总维度
    let maxBits = Math.max(...coordinates.map(n => n.toString(2).length)); // 每个坐标最大二进制位数
    let zValue = 0;

    // 遍历每个维度的每一位
    for (let i = 0; i < maxBits; i++) { // i 对应公式中的 j 位
        for (let j = 0; j < k; j++) {    // j 对应公式中的维度 i
            let currentBit = (coordinates[j] >> i) & 1;  // 获取第j维坐标的第i位
            zValue |= currentBit << (k * i + (k - j - 1)); // 根据公式的左移计算
        }
    }
    return zValue;
}

// 导出函数，以便其他文件可以使用
module.exports = zOrderEncode;
