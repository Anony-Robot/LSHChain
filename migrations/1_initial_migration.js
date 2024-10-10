const JSONLD = artifacts.require("JSONLD");

module.exports = function (deployer) {
  deployer.deploy(JSONLD);
};
