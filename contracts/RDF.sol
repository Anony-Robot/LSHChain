// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract RDF {
    // Transaction structure
    struct Transaction {
        address sender;
        uint amount;
        bytes payload;
        int lshCodes;
        bytes TxHash; // 添加 TxHash 字段
    }

    // Knowledge graph structure
    struct RDFGraph {
        bytes32 rootHash;
    }
    // Knowledge graph instance
    RDFGraph private rdfGraph;
    
    // Array to store transactions
    Transaction[] public transactions;

        // Event to log transaction creation
    event TransactionCreated(address sender, uint amount, bytes payload, int lshCodes, bytes TxHash);
    // Function to initiate a transaction
    function sendTransaction(bytes memory _payload, int _lshCodes) public payable {
        // 计算交易的哈希
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, msg.value, _payload, _lshCodes, block.timestamp));
        bytes memory txhash = abi.encodePacked(txHash); // 转换为 bytes
        // Create a new transaction and add it to the array
        transactions.push(Transaction({
            sender: msg.sender,
            amount: msg.value,
            payload: _payload,
            lshCodes: _lshCodes,
            TxHash: txhash // 存储计算得到的交易哈希
        }));
        
        // Emit an event for the new transaction
        emit TransactionCreated(msg.sender, msg.value, _payload, _lshCodes, txhash);
    }

    // Function to get the total number of transactions
    function getTotalTransactions() public view returns (uint) {
        return transactions.length;
    }

    // Helper function to compare two bytes arrays
    function compareBytes(bytes memory a, bytes memory b) internal pure returns (bool) {
        if (a.length != b.length) {
            return false;
        }
        for (uint i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }
        return true;
    }

    // Function to find transactions by transaction hash
    function findTransactionsByTxHash(bytes memory _txhash) public view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 0; i < transactions.length; i++) {
            // Compare TxHash with the provided hashes
            if (compareBytes(transactions[i].TxHash, _txhash)) {
                count++;
            }
        }

        uint[] memory result = new uint[](count);
        uint resultIndex = 0;
        for (uint i = 0; i < transactions.length; i++) {
            if (compareBytes(transactions[i].TxHash, _txhash)) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        return result;
    }
    
    // Function to get the payload of a specific transaction
    function findTransactionsByIndex(uint index) public view returns (bytes memory) {
        require(index < transactions.length, "Transaction does not exist");
        return transactions[index].TxHash;
    }
    
    // Function to find transactions by payload
    function findTransactionsBypayload(bytes memory path) public view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 0; i < transactions.length; i++) {
            if (compareBytes(transactions[i].payload, path)) {
                count++;
            }
        }

        uint[] memory result = new uint[](count);
        uint resultIndex = 0;
        for (uint i = 0; i < transactions.length; i++) {
            if (compareBytes(transactions[i].payload, path)) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        return result;
    }
    
    // Fallback function to receive Ether
    receive() external payable {}
}
