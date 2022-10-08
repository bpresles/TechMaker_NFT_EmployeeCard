const EmployeeCard = artifacts.require("EmployeeCard");

module.exports = function (deployer) {
  deployer.deploy(EmployeeCard, "Younup Employee Card", "YNPC");
};