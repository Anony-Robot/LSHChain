const JSONLD = artifacts.require("JSONLD");
const RDF = artifacts.require("RDF");
module.exports = function (deployer) {
  deployer.deploy(JSONLD);
  deployer.deploy(RDF);
};
