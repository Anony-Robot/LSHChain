const fs = require('fs').promises;
const Web3 = require('web3').default;

// Setup web3 and contract instance
const web3 = new Web3('http://127.0.0.1:8545'); // Replace with your provider (e.g., Ganache)

const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string[]",
          "name": "playload",
          "type": "string[]"
        },
        {
          "indexed": false,
          "internalType": "string[]",
          "name": "lshCodes",
          "type": "string[]"
        }
      ],
      "name": "TransactionCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "transactions",
      "outputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "stateMutability": "payable",
      "type": "receive",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "_playload",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "_lshCodes",
          "type": "string[]"
        }
      ],
      "name": "sendTransaction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [],
      "name": "getTotalTransactions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "path",
          "type": "string[]"
        }
      ],
      "name": "findTransactionsByPlayload",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "_lshCodes",
          "type": "string[]"
        }
      ],
      "name": "findTransactionsByLSHCodes",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "findTransactionsByIndex",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];
const contractAddress = '0x9CF0794Ff6A8A85ef5F5CF2d2E30198321d6d4B5'; // Replace with your deployed contract address

// Instantiate the contract
const contract = new web3.eth.Contract(contractABI, contractAddress);

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

// Function to process transactions by sending them to the smart contract
async function processTransactions(playload, accountAddress, amountToSend) {
    const minhasher = new MinHash(10);
    for (let i = 0; i < playload.length; i++) {
        let strArray = playload[i].split(' ');
        const shingles = textToShingles(playload[i]);
        const minhashSignature = minhasher.computeMinHashSignatures(shingles);
        const lshCodes = minhashSignature.map(number => number.toString(16));
        try {
            const gasEstimate = await web3.eth.estimateGas({
                to: contractAddress,
                data: contract.methods.sendTransaction(strArray,lshCodes).encodeABI(),
                value: web3.utils.toWei(amountToSend, 'ether')
            });

            const gasPrice = await web3.eth.getGasPrice();
            // Send the transaction with specified playload
            const createTransaction = await contract.methods.sendTransaction(strArray,lshCodes).send({
                value: web3.utils.toWei(amountToSend, 'ether'), // Sending ether
                from: accountAddress,
                // gas是执行交易中每个操作所需的计算步骤的计量单位。每个智能合约操作都有一个特定的 gas成本，这取决于该操作的复杂性。确保了交易执行的计算资源消耗得到了补偿，防止了恶意行为（如无限循环）耗尽网络资源。
                gas: gasEstimate,
                // gasPrice 是用户愿意为每个 gas 单位支付的价格，以 wei（1e18 wei=1ether）为单位。交易费用 = gas 限额 × gasPrice，这是用户必须支付的总费用，用于补偿矿工执行交易的计算资源消耗。
                gasPrice: gasPrice
            });
            console.log(`Transaction ${i + 1} completed. Tx Hash: ${createTransaction.transactionHash}, Gas: ${gasEstimate}, Transaction Fees: ${gasPrice*gasEstimate}wei`);
        } catch (error) {
            console.error(`Error in transaction ${i + 1}:`, error.message); // Log detailed error message
        }
    }
    console.log("All transactions processed");
}

// 获取特定交易索引的playload
async function findTransactionsByIndexTest(transactionIndex) {
    try {
        const playload = await  contract.methods.findTransactionsByIndex(transactionIndex).call();
        console.log(`Playload for transaction at index ${transactionIndex}:`, playload);
    } catch (error) {
        console.error('Error fetching transaction playload:', error);
    }
}

// 使用playload查找相关交易
async function findTransactionsByPlayloadTest(playload) {
    try {
        // 使用合约的 findTransactionsByPlayload 方法查找相关交易
        const transactionIndexes = await contract.methods.findTransactionsByPlayload(playload).call();
            
        // 输出结果
        if (transactionIndexes.length > 0) {
            console.log(`Found transactions by playload at indexes: ${transactionIndexes.join(', ')}`);
        } else {
            console.log('No transactions found with the specified playload.');
        }
    } catch (error) {
        console.error('查找交易时出错: ', error);
    }
}

async function findTransactionsByLSHCodesTest(lshCodes) {
    try {
        // 使用合约的 findTransactionsByLSHCodes 方法查找相关交易
        const transactionIndexes = await contract.methods.findTransactionsByLSHCodes(lshCodes).call();
            
        // 输出结果
        if (transactionIndexes.length > 0) {
            console.log(`Found transactions by lshCodes at indexes: ${transactionIndexes.join(', ')}`);
        } else {
            console.log('No transactions found with the specified lshCodes.');
        }
    } catch (error) {
        console.error('查找交易时出错: ', error);
    }
}
// Main function to read file, parse data and send transactions
async function main() {
    const filePath = 'data/test.txt'; // Local path to the file
    const accountAddress = '0x7De90bc3B12c606F3F640Cc0CB87885225050146'; // Replace with your account address
    const amountToSend = '0.0001'; // Amount to send per transaction in Ether

    try {
        const content = await readFileContent(filePath);
        const data = JSON.parse(content); // Assuming the file contains an array of objects
        const playload = data.map(item => item.text);
        // Process transactions by sending them to the contract
        const startTime1 = performance.now();
        await processTransactions(playload, accountAddress, amountToSend);
        const endTime1 = performance.now();
        const timeDifference1 = endTime1 - startTime1;
        console.log(`Total time for processTransactions: ${timeDifference1} milliseconds`);
    } catch (error) {
        console.error('Error during processing: ', error);
    }

    // 你要查找playload
    const queryText = [ '罗马', '股东', '中国', '企业', '曝光' ]; // 假设 JSON 文件包含playload数据
    const startTime3 = performance.now();
    findTransactionsByPlayloadTest(queryText);
    const endTime3 = performance.now();
    const timeDifference3 = endTime3 - startTime3;// milliseconds-毫秒
    console.log(`Total time for findTransactionsByPlayloadTest: ${timeDifference3} milliseconds`);
    
    // 你要查找lshCodes
    const lshCodes = ['388f295c','7170b344','aa523d2c','20433ee8','1c1550fc','54f6dae4','8dd864cc','3c96688','1027d12d','387d0284']; // 假设 JSON 文件包含lshCodes数据
    const startTime4 = performance.now();
    findTransactionsByLSHCodesTest(lshCodes);
    const endTime4 = performance.now();
    const timeDifference4 = endTime4 - startTime4;// milliseconds-毫秒
    console.log(`Total time for findTransactionsByLSHCodesTest: ${timeDifference4} milliseconds`);
    
    // 示例测试：从索引 0 获取交易playload
    const transactionIndex = 0;  // 你可以根据实际情况调整索引
    const startTime2 = performance.now();
    findTransactionsByIndexTest(transactionIndex);
    const endTime2 = performance.now();
    const timeDifference2 = endTime2 - startTime2;
    console.log(`Total time for findTransactionsByIndexTest: ${timeDifference2} milliseconds`);
}

// Call the main function to initiate the process
main();
