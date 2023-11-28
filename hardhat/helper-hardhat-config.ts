export interface networkConfigItem {
    platformFeePercent: number;
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    31337: {
        platformFeePercent: 3
    },

    11155111: {
        platformFeePercent: 3
    },
}

export const developmentChains = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;