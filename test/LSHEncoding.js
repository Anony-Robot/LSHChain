const fs = require('fs').promises;

// Helper function to read file content
async function readFileContent(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        console.error('Error reading file: ', error);
        throw error;
    }
}
// 简单的哈希函数，返回32位哈希值
function simpleHash(value, seed) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash + char + seed) & 0xFFFFFFFF; // 确保结果为非负数
  }
  return hash >>> 0; // 将hash转换为无符号32位整数
}

// MinHash类
class MinHash {
  constructor(numHashes) {
    this.numHashes = numHashes;
    this.seeds = Array.from({ length: numHashes }, (_, i) => i * 1000 + 7);
  }

  // 计算最小哈希签名
  computeMinHashSignatures(shingles) {
    return this.seeds.map(seed => {
      return Math.min(...shingles.map(shingle => simpleHash(shingle, seed)));
    });
  }
}

// 将文本分词，转换为shingles集合
function textToShingles(text, shingleSize = 2) {
  const words = text.split(/\s+/);
  const shingles = [];
  for (let i = 0; i <= words.length - shingleSize; i++) {
    shingles.push(words.slice(i, i + shingleSize).join(' '));
  }
  return shingles;
}

// 主程序
async function main() {
  // 初始化MinHash对象，使用10个哈希函数
  const minhasher = new MinHash(10);

  // 假设我们有一个数组，包含从test.txt文件中读取的数据
  const filePath = 'data/test.txt'; // Local path to the file
  const content = await readFileContent(filePath);
  const data = JSON.parse(content); // Assuming the file contains an;

    // 收集输出行
    const outputLines = data.map(item => {
      const shingles = textToShingles(item['text']);
      const minhashSignature = minhasher.computeMinHashSignatures(shingles);
      const minHashHexString = minhashSignature.map(number => number.toString(16)).join(' ');

      // 构建输出行的字符串
      return `{"ID":${item['id']}, "cluster":${item['cluster']}, "text":"${item['text']}", "MinHash":"${minHashHexString}"},`;
    });

    // 将输出行连接成一个字符串，每个项目占一行
    const outputString = outputLines.join('\n');  // 将输出字符串写入test2.txt文件
  fs.writeFile('data/test2.txt', outputString, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Data has been written to test2.txt');
    }
  });
}

main();

