/* eslint-disable no-undef */
require('dotenv').config();
const { CONTRACT_NAMES } = require('../utils/constants');
const {
  readContract,
  writeContract,
  writeABI,
  readABI,
} = require('../utils/io');


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

// verify contract on etherscan
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


// whitelist deployer address
task(
  'whitelist-owner:Unfound',
  'Whitelists the owner of the Contract',
  async (_, { ethers }) => {
    const myContract = readContract(CONTRACT_NAMES.Unfound);
    const abi = readABI(CONTRACT_NAMES.Unfound);

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const contract = new ethers.Contract(myContract.address, abi, signer);

    const tx = await contract.setWhitelist(signer.address, true);
    await tx.wait();

    console.info(`${signer.address} whitelisted`);
  },
);

// whitelist user / uniswap address manually
task(
  'whitelist-address:Unfound',
  'Whitelists a specific address for the Contract',
  async (taskArgs, { ethers }) => {
    const { whitelist } = taskArgs; // Assuming the address to whitelist is passed as a task argument


    const myContract = readContract(CONTRACT_NAMES.Unfound);
    const abi = readABI(CONTRACT_NAMES.Unfound);

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const contract = new ethers.Contract(myContract.address, abi, signer);

    const tx = await contract.setWhitelist(whitelist, true);
    await tx.wait();

    console.info(`${whitelist} whitelisted`);
  },
).addParam("whitelist", "The address to be whitelisted");


// set data-uri 
task(
  'set-data-uri',
  'Sets the DataURI in the contract',
  async (_, { ethers }) => {
    const myContract = readContract(CONTRACT_NAMES.Unfound);
    const abi = readABI(CONTRACT_NAMES.Unfound);

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const contract = new ethers.Contract(myContract.address, abi, signer);

    const dataURI = process.env.IMAGE_URL;

    const tx = await contract.setDataURI(dataURI);
    await tx.wait();

    console.info(`DataURI has been set successfully!`);
  },
);

// Export the ABI for use
task('abi:Unfound', 'Export contract ABI', async () => {
  writeABI('unfound.sol/Unfound.json', CONTRACT_NAMES.Unfound);
});

task("create-pool:Unfound", "Creates a new staking pool", async (taskArgs, { ethers }) => {
  const { tokenaddress, amount } = taskArgs;

  const myContract = readContract(CONTRACT_NAMES.Unfound);
  const abi = readABI(CONTRACT_NAMES.Unfound);
  console.log(abi)

  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  const contract = new ethers.Contract(myContract.address, abi, signer);

  try {
      // Specify the gas limit explicitly if required
      const gasLimit = 1000000; // Example gas limit, adjust based on needs
      const tx = await contract.createPool(tokenaddress, ethers.parseUnits(amount, 18), {
          gasLimit: gasLimit,
      });
      await tx.wait();
      console.info(`Pool created with ${tokenaddress} for amount: ${amount}`);
  } catch (error) {
      console.error("Failed to create pool:", error);
      // Additional debug information
      console.debug(`Token Address: ${tokenaddress}`);
      console.debug(`Amount: ${amount}`);
      console.debug(`Signer Address: ${await signer.getAddress()}`);
  }
})
.addParam("tokenaddress", "The address of the token contract")
.addParam("amount", "The amount of tokens to stake");
