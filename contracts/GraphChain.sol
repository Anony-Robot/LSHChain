// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract JSONLD {
    // Transaction structure
    struct Transaction {
        address sender;
        uint amount;
        string[] playload;
        string[] lshCodes;
    }

    // Array to store transactions
    Transaction[] public transactions;

    // Event to log transaction creation
    event TransactionCreated(address sender, uint amount, string[] playload, string[] lshCodes);

    // Function to initiate a transaction
    function sendTransaction(string[] memory _playload, string[] memory _lshCodes) public payable {
        // Create a new transaction and add it to the array
        transactions.push(Transaction({
            sender: msg.sender,
            amount: msg.value,
            playload: _playload,
            lshCodes:_lshCodes
        }));
        // Emit an event for the new transaction
        emit TransactionCreated(msg.sender, msg.value, _playload, _lshCodes);
    }

    // Function to get the total number of transactions
    function getTotalTransactions() public view returns (uint) {
        return transactions.length;
    }
    
    // Helper function to compare two string arrays
    function compareStrings(string[] memory a, string[] memory b) internal pure returns (bool) {
        if (a.length != b.length) {
            return false;
        }
        for (uint i = 0; i < a.length; i++) {
            if (keccak256(abi.encodePacked(a[i])) != keccak256(abi.encodePacked(b[i]))) {
                return false;
            }
        }
        return true;
    }

    // Function to find transactions by playload
    function findTransactionsByPlayload(string[] memory path) public view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 0; i < transactions.length; i++) {
            if (compareStrings(transactions[i].playload, path)) {
                count++;
            }
        }

        uint[] memory result = new uint[](count);
        uint resultIndex = 0;
        for (uint i = 0; i < transactions.length; i++) {
            if (compareStrings(transactions[i].playload, path)) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        return result;
    }
    
    // Function to find transactions by lshCodes
    function findTransactionsByLSHCodes(string[] memory _lshCodes) public view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 0; i < transactions.length; i++) {
            if (compareStrings(transactions[i].lshCodes, _lshCodes)) {
                count++;
            }
        }

        uint[] memory result = new uint[](count);
        uint resultIndex = 0;
        for (uint i = 0; i < transactions.length; i++) {
            if (compareStrings(transactions[i].lshCodes, _lshCodes)) {
                result[resultIndex] = i;
                resultIndex++;
            }
        }
        return result;
    }
    
    // Function to get the playload of a specific transaction
    function findTransactionsByIndex(uint index) public view returns (string[] memory) {
        require(index < transactions.length, "Transaction does not exist");
        return transactions[index].playload;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
