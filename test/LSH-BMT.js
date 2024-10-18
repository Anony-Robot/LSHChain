class BPlusTreeNode {
    constructor(t, isLeaf = false) {
        this.t = t; // Order of the tree
        this.keys = [];
        this.values = []; // To store values for leaf nodes
        this.children = []; // To store child nodes
        this.isLeaf = isLeaf;
    }
}

class BPlusTree {
    constructor(t) {
        this.root = new BPlusTreeNode(t, true); // Initially, the root is a leaf node
        this.t = t; // Order of the tree
    }

    insert(key, value) {
        let root = this.root;
        if (root.keys.length === (2 * this.t) - 1) {
            let temp = new BPlusTreeNode(this.t);
            this.root = temp;
            temp.children.push(root); // Old root becomes a child
            this.splitChild(temp, 0);
            this.insertNonFull(temp, key, value);
        } else {
            this.insertNonFull(root, key, value);
        }
    }

    insertNonFull(node, key, value) {
        let i = node.keys.length - 1;

        if (node.isLeaf) {
            // 查找是否已经存在相同的 key
            let idx = this.findKeyIndex(node, key);
            if (idx < node.keys.length && node.keys[idx] === key) {
                node.values[idx].push(value); // Key exists, append value
                return;
            }

            // Key doesn't exist, insert it
            node.keys.push(null); // Extend keys and values arrays
            node.values.push(null);

            // Shift elements to make space for the new key and value
            while (i >= 0 && key < node.keys[i]) {
                node.keys[i + 1] = node.keys[i];
                node.values[i + 1] = node.values[i];
                i--;
            }

            node.keys[i + 1] = key;
            node.values[i + 1] = [value]; // Insert new key and value
        } else {
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }
            i++;

            if (node.children[i].keys.length === (2 * this.t) - 1) {
                this.splitChild(node, i);
                if (key > node.keys[i]) {
                    i++;
                }
            }
            this.insertNonFull(node.children[i], key, value);
        }
    }

    findKeyIndex(node, key) {
        let i = 0;
        while (i < node.keys.length && node.keys[i] < key) {
            i++;
        }
        return i;
    }

    splitChild(parent, i) {
        let t = this.t;
        let y = parent.children[i];
        let z = new BPlusTreeNode(t, y.isLeaf);

        parent.children.splice(i + 1, 0, z);
        parent.keys.splice(i, 0, y.keys[t - 1]);

        z.keys = y.keys.splice(t, y.keys.length - t); // Move second half of keys
        if (y.isLeaf) {
            z.values = y.values.splice(t, y.values.length - t); // Move second half of values
        }

        if (!y.isLeaf) {
            z.children = y.children.splice(t, y.children.length - t); // Move second half of children
        }
    }

    search(key) {
        let node = this.root;
        while (!node.isLeaf) {
            let i = this.findKeyIndex(node, key);
            node = node.children[i];
        }

        let idx = this.findKeyIndex(node, key);
        if (idx < node.keys.length && node.keys[idx] === key) {
            console.log(`Found key: ${key}, values: ${node.values[idx]}`);
            return node.values[idx];
        }
        console.log(`Key ${key} not found in leaf node.`);
        return null;
    }

    getTreeHeight() {
        let height = 1;
        let node = this.root;
        while (!node.isLeaf) {
            node = node.children[0];
            height++;
        }
        return height;
    }
}

// 导出类
module.exports = { BPlusTree, BPlusTreeNode };
