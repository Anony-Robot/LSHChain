如何开始一个纯净的Truffle 项目
1. 安装 Node.js 和 NPM
node -v
npm -v
2. 安装 Ganache-CLI
npm install -g ganache-cli
3. 启动 Ganache-CLI
ganache-cli
4. 安装 Truffle Framework（可选）
npm install -g truffle
5. 创建 Truffle 项目（如果使用 Truffle）
truffle init
这将创建一个包含合约、迁移和测试文件夹的新项目。
6. 编写智能合约
在 contracts 文件夹中创建一个新的智能合约文件（例如 MyContract.sol），并编写您的 Solidity 合约代码。
pragma solidity ^0.8.0;

contract MyContract {
    // 合约代码
}
7. 编译合约
使用 Truffle 编译合约：
truffle compile
8. 配置 Truffle 以连接到 Ganache
在 Truffle 项目的 truffle-config.js 文件中，配置网络以连接到 ganache-cli。通常，ganache-cli 运行在 http://127.0.0.1:8545。
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // 匹配任何网络 id
    }
  }
  // 其他配置...
};
9. 编写迁移脚本
在 migrations 文件夹中创建一个新的迁移脚本来部署您的合约。
const MyContract = artifacts.require("MyContract");
module.exports = function (deployer) {
  deployer.deploy(MyContract);
};

测试开始（每次启动ganache-cli网络需要重新填写测试脚本的合约地址和账户地址）

10. 部署合约到 Ganache
使用 Truffle 将合约部署到本地的 ganache-cli 网络：
truffle migrate --network development
11. 编写和运行测试
在 test 文件夹中编写合约的测试脚本。然后使用 Truffle 运行测试：
node jsonld.js



运行 Node.js 应用程序时，可以使用 --max-old-space-size 标志来增加内存限制。例如，要将内存限制设置为 4GB，可以这样做：
node --max-old-space-size=4096 your_script.js

12. 在 ganache-cli 运行的终端窗口中，按下 Ctrl+C 键组合退出。
