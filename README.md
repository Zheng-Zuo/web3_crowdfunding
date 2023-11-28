# FundMe

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Zheng-Zuo/web3_crowdfunding)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Zheng-Zuo/web3_crowdfunding/pulls)

FundMe is a Web3 based crowdfunding platform that enables users to initiate and contribute towards fundraising campaigns. The project incorporates the verification of smart contract on EtherScan, interaction with the contract through the Wagmi library, and the integration of Firebase storage system for media files management.

Check out the **[Live Demo here](http://fundme.momocoder.com)** *(Note: Users from Mainland China need to use a VPN to bypass the GFW for rendering images)*. The project is deployed on the Sepolia testnet, hence you need to connect with Sepolia to interact with the contract. You can get dome free Sepolia ETH at: https://sepoliafaucet.com/

## Features
- Fully responsive design compatible across all devices.
- Incorporates two sub-repositories:
    1. `hardhat` - Contains all the smart contract related code, .sol files, deployment scripts etc.
    2. `src` - Houses the Nextjs 13 front-end files.
    
Each sub-repository consists of its own package.json file, and thus necessitates separate installations.

## Quick Start

To get this project up and running:

1. Clone the repository:

    ```bash
    git clone https://github.com/Zheng-Zuo/web3_crowdfunding.git
    cd web3_crowdfunding
    ```

2. Navigate into each sub-repository (`hardhat` and `src`) and install their respective dependencies:

    ```bash
    cd hardhat
    npm install

    cd ../src
    npm install
    ```

3. Create a `.env` file at each sub-repo level and add your own credentials.

4. For development mode, start the project with:

    ```bash
    npm run dev
    ```
    
   For a production-like environment, build and start the project with:

    ```bash
    npm run build
    npm start
    ```

## Contribute

We welcome all contributors who are interested in improving FundMe. Feel free to submit a pull request.

## License

This project is licensed under the terms of the MIT license.