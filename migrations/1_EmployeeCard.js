const EmployeeCard = artifacts.require("EmployeeCard");

module.exports = function (deployer) {
  deployer.deploy(EmployeeCard, "Younup Employee Card", "YNPC", {from: "0xE5BAC846Fa14dacF121599f3757AB36a2C8F699D"});
};