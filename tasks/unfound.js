/* eslint-disable no-undef */
require('dotenv').config();
const { CONTRACT_NAMES } = require('../utils/constants');
const {
  readContract,
  writeContract,
  writeABI,
  readABI,
} = require('../utils/io');

// task to deploy contract passing parameters
task('deploy:Unfound', 'Deploy the Unfound Contract')
  .addParam("name", "The token name")
  .addParam("symbol", "The token symbol")
  .addParam("decimals", "The number of decimals")
  .setAction(async (taskArgs, { ethers }) => {
    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const UnfoundContract = await ethers.deployContract(CONTRACT_NAMES.Unfound, [
      taskArgs.name,
      taskArgs.symbol,
      taskArgs.decimals
    ]);


    await UnfoundContract.waitForDeployment();

    console.info(`Contract deployed at ${UnfoundContract.target}`);
  
    writeContract(CONTRACT_NAMES.Unfound, UnfoundContract.target, signer.address, []);

});

// verify contract on etherscan, kae sure to match the token details
task('verify:Unfound', 'Verify Contract', async (_, { run }) => {
  const myContract = readContract(CONTRACT_NAMES.Unfound);

  // Assuming these were your deployment parameters
  const name = "Devchef";
  const symbol = "DEV";
  const decimals = 18; // Assuming decimals were provided as a number, not a string

  await run('verify:verify', {
    address: myContract.address,
    constructorArguments: [
      name,
      symbol,
      decimals,
    ],
  });
});

// Export the ABI for use
task('abi:Unfound', 'Export contract ABI', async () => {
  writeABI('unfound.sol/Unfound.json', CONTRACT_NAMES.Unfound);
});
