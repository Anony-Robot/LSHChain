const fs = require('fs').promises;
const Web3 = require('web3').default;
const readline = require('readline'); // 引入 readline 模块
// 导入 BPlusTree 和 BPlusTreeNode 类
const { BPlusTree } = require('./LSH-BMT');
const zOrderEncode = require('./ZorderEncoding');
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
          "internalType": "bytes",
          "name": "payload",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "lshCodes",
          "type": "int256"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "TxHash",
          "type": "bytes"
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
        },
        {
          "internalType": "bytes",
          "name": "payload",
          "type": "bytes"
        },
        {
          "internalType": "int256",
          "name": "lshCodes",
          "type": "int256"
        },
        {
          "internalType": "bytes",
          "name": "TxHash",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_payload",
          "type": "bytes"
        },
        {
          "internalType": "int256",
          "name": "_lshCodes",
          "type": "int256"
        }
      ],
      "name": "sendTransaction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
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
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_txhash",
          "type": "bytes"
        }
      ],
      "name": "findTransactionsByTxHash",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
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
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "path",
          "type": "bytes"
        }
      ],
      "name": "findTransactionsBypayload",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "int256",
          "name": "_lshCodes",
          "type": "int256"
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
      "type": "function"
    }
  ];
const contractAddress = '0xE165E43474781fea0d5Ce857BD42B4BCAc45be95'; // Replace with your deployed contract address
const accountAddress = '0x44156409D0Ebad1A371776c6F4Fc2a09945D3c21'; // Replace with your account address
const amountToSend = '0.0001'; // Amount to send per transaction in Ether
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
// 创建 readline 接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// 函数：获取用户查询类型
function getUserInputType() {
    return new Promise((resolve) => {
        rl.question('请输入查询类型：', (input) => {
            resolve(input); // 将输入字符串按逗号分割成数组
        });
    });
}
// 函数：获取用户输入
function getUserInput() {
    return new Promise((resolve) => {
        rl.question('请输入查询信息：', (input) => {
            resolve(input); // 将输入字符串按逗号分割成数组
        });
    });
}

// 创建一个新的 B+ 树
let bpt = new BPlusTree(3);

// Function to process transactions by sending them to the smart contract
async function processTransactions(payloads, lshcodes, accountAddress, amountToSend) {
    // 1000,5000,10000
    for (let i = 0; i < 1; i++) {
        const temp = lshcodes[i].split(',');
        const lshCodes = zOrderEncode(temp.slice(0, 10).map(Number));//不包含最后一个元素
        // 将字符串转换为 bytes
        const bytesPayload = web3.utils.utf8ToHex(payloads[i]); // 将字符串转换为 hex 格式
        try {
            const gasEstimate = await web3.eth.estimateGas({
                to: contractAddress,
                data: contract.methods.sendTransaction(bytesPayload, lshCodes).encodeABI(),
                value: web3.utils.toWei(amountToSend, 'ether')
            });

            const gasPrice = await web3.eth.getGasPrice();
            // Send the transaction with specified payload
            const createTransaction = await contract.methods.sendTransaction(bytesPayload, lshCodes).send({
                value: web3.utils.toWei(amountToSend, 'ether'),
                from: accountAddress,
                gas: gasEstimate,
                gasPrice: gasPrice
            });
            // 插入键值对
            const _value = await contract.methods.getTotalTransactions().call();
            const value = parseInt(_value, 10)
            bpt.insert(lshCodes, value-1);
            console.log(`LSHCode: ${lshCodes}, Gas: ${gasEstimate}, Transaction Fees: ${gasPrice * gasEstimate} wei`);
        } catch (error) {
            console.error(`Error in transaction ${i + 1}:`, error.message); // Log detailed error message
        }
    }
    console.log("All transactions processed");
}
// 使用 txhash 查找相关交易
async function findTransactionsByTxHashTest(txhash) {
    try {
        const transactionIndexes = await contract.methods.findTransactionsByTxHash(txhash).call();
            
        // 输出结果
        if (transactionIndexes.length > 0) {
            console.log(`Found transactions by txhash at indexes: ${transactionIndexes.join(', ')}`);
        } else {
            console.log('No transactions found with the specified TxHash.');
        }
    } catch (error) {
        console.error('查找交易时出错: ', error);
    }
}
// 使用index查找相关交易
async function findTransactionsByNumberTest(transactionNumber) {
    try {
        const TxHash = await contract.methods.findTransactionsByIndex(transactionNumber).call();
        console.log(`TxHash for transaction at Number ${transactionNumber}:`, TxHash); // 将 bytes 转换回字符串
    } catch (error) {
        console.error('Error fetching transaction payload:', error);
    }
}
// 使用payload查找相关交易
async function findTransactionsBypayloadTest(payload) {
    try {
        const bytesPayload = web3.utils.utf8ToHex(payload); // 将字符串转换为 hex 格式
        // 使用合约的 findTransactionsBypayload 方法查找相关交易
        const transactionIndexes = await contract.methods.findTransactionsBypayload(bytesPayload).call();
            
        // 输出结果
        if (transactionIndexes.length > 0) {
            console.log(`Found transactions by payload at indexes: ${transactionIndexes.join(', ')}`);
        } else {
            console.log('No transactions found with the specified payload.');
        }
    } catch (error) {
        console.error('查找交易时出错: ', error);
    }
}

// 使用 lshCodes 查找相关交易
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
    const jsonldFile = 'data/arem.jsonld'; // Local path to the file
    const lshcodeFile = 'data/pstable_lsh_encoded_arem.txt'; // Local path to the file
    try {
        const content = await readFileContent(jsonldFile);
        const lshcodes = await readFileContent(lshcodeFile);
        // Process transactions by sending them to the contract
        const startTime1 = performance.now();
        const data = JSON.parse(content);
        const payloads = data['@graph'].map(item => {
            return JSON.stringify({
                id: item['@id'],           // 提取 '@id' 字段
                type: item['@type'],       // 提取 '@type' 字段
                category: item['Category'], // 提取 'Category' 字段
                attributes: item['Attributes'].split(',') // 将 'Attributes' 字段转换为数组
            });
        });
        console.log(`${payloads[0]}`);
        await processTransactions(payloads, lshcodes.split('\n'), accountAddress, amountToSend);
        const endTime1 = performance.now();
        const timeDifference1 = endTime1 - startTime1;
        console.log(`Total time for processTransactions: ${timeDifference1} milliseconds`);
    } catch (error) {
        console.error('Error during processing: ', error);
    }

    while (true) {
        console.log("请选择要查询的类型:");
        console.log("1: 链式查找 payload");
        console.log("2: 链式查找 lshCodes");
        console.log("3: 链式查找 TxHash");
        console.log("4: 链式查找 TxNumber");
        console.log("5: LSH-BMT查找 lshCodes");
        console.log("6: 退出"); // 添加退出选项

        const choice = await getUserInput();

        switch (choice) {
            case '1':
                const queryText = await getUserInput(); // 获取用户输入
                const startTime3 = performance.now();
                await findTransactionsBypayloadTest(queryText);
                const endTime3 = performance.now();
                const timeDifference3 = endTime3 - startTime3; // milliseconds-毫秒
                console.log(`Total time for findTransactionsBypayloadTest: ${timeDifference3} milliseconds`);
                break;
            
            case '2':
                const lshCodes = await getUserInput(); // 获取用户输入
                const startTime4 = performance.now();
                await findTransactionsByLSHCodesTest(lshCodes);
                const endTime4 = performance.now();
                const timeDifference4 = endTime4 - startTime4; // milliseconds-毫秒
                console.log(`Total time for findTransactionsByLSHCodesTest: ${timeDifference4} milliseconds`);
                break;
            
            case '3':
                const txhash = await getUserInput(); // 获取用户输入
                const startTime2 = performance.now();
                await findTransactionsByTxHashTest(txhash);
                const endTime2 = performance.now();
                const timeDifference2 = endTime2 - startTime2; // milliseconds-毫秒
                console.log(`Total time for findTransactionsByTxHashTest: ${timeDifference2} milliseconds`);
                break;
                
            case '4':
                const txnumber = await getUserInput(); // 获取用户输入
                const startTime5 = performance.now();
                await findTransactionsByNumberTest(txnumber);
                const endTime5 = performance.now();
                const timeDifference5 = endTime5 - startTime5; // milliseconds-毫秒
                console.log(`Total time for findTransactionsByNumberTest: ${timeDifference5} milliseconds`);
                break;
                
            case '5':
                const key = await getUserInput(); // 获取用户输入
                const lsh = parseInt(key, 10)
                const startTime6 = performance.now();
                bpt.search(lsh);
                const endTime6 = performance.now();
                const timeDifference6 = endTime6 - startTime6; // milliseconds-毫秒
                console.log(`Total time for findTransactionIndexByLSHCodesTest: ${timeDifference6} milliseconds`);
                break;
                
            case '6':
                console.log('退出程序。');
                rl.close(); // 关闭 readline 接口
                return; // 退出循环和主函数

            default:
                console.log('无效的选择，请输入 1、2、3、4或5。');
        }
    }
 
}

// Call the main function to initiate the process
main();
