import { useContractWrite, useContractRead, useContractEvent } from 'wagmi'
import { ethers } from 'ethers'
import { format } from 'date-fns'
import abi from '../contracts/FundMe.sol/FundMe.json'

const contractAddress = '0x67F11C4d58783327cd24e8F800332c2306408754';
const contractABI = abi.abi;

export interface Backer {
    owner: string;
    contribution: number;
    timestamp: string;
    refunded: boolean;
}

export interface campaignProps {
    id: string;
    owner: string;
    title: string;
    description: string;
    imageURL: string;
    cost: number;
    raised: number;
    timestamp: string;
    expiresAt: string;
    numOfBackers: number;
    status: number;
}


export const createCampaign = () => {
    const result = useContractWrite({
        address: contractAddress,
        abi: contractABI,
        functionName: 'createCampaign',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const backCampaign = () => {
    const result = useContractWrite({
        address: contractAddress,
        abi: contractABI,
        functionName: 'backCampaign',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const updateCampaign = () => {
    const result = useContractWrite({
        address: contractAddress,
        abi: contractABI,
        functionName: 'updateCampaign',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const deleteCampaign = () => {
    const result = useContractWrite({
        address: contractAddress,
        abi: contractABI,
        functionName: 'deleteCampaign',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const claimRefund = () => {
    const result = useContractWrite({
        address: contractAddress,
        abi: contractABI,
        functionName: 'claimRefund',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const payoutCampaign = () => {
    const result = useContractWrite({
        address: contractAddress,
        abi: contractABI,
        functionName: 'payoutCampaign',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const getStats = () => {

    const results = useContractRead({
        address: contractAddress,
        abi: contractABI,
        functionName: 'getStats',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const parseStats = (data: { [key: string]: bigint }) => {
    // console.log(data)
    const totalCampaigns = data["totalCampaigns"].toString()
    const totalBackings = data["totalBackings"].toString()
    const totalDonations = ethers.formatEther(data["totalDonations"].toString())
    return { totalCampaigns, totalBackings, totalDonations }
}

export const listenEvents = (onEvent: () => void) => {
    const unwatch = useContractEvent({
        address: contractAddress,
        abi: contractABI,
        eventName: 'Action',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
        listener: (log) => {
            // console.log(log["0"].args)
            onEvent()
        }
    })

    return unwatch
}

export const getCampaigns = () => {
    const results = useContractRead({
        address: contractAddress,
        abi: contractABI,
        functionName: 'getCampaigns',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getCampaignById = (id: number) => {
    const results = useContractRead({
        address: contractAddress,
        abi: contractABI,
        functionName: 'getCampaign',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
        args: [id]
    })
    return results
}

export const getBackersById = (id: number) => {
    const results = useContractRead({
        address: contractAddress,
        abi: contractABI,
        functionName: 'getBackers',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
        args: [id]
    })
    return results
}

export const parsedCampaign = (campaign: { [key: string]: any }) => {
    return {
        id: campaign.id.toString(),
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        imageURL: campaign.imageURL,
        cost: parseFloat(ethers.formatEther(campaign.cost.toString())),
        raised: parseFloat(ethers.formatEther(campaign.raised.toString())),
        timestamp: format(new Date(Number(campaign.timestamp) * 1000), 'yyyy-MM-dd HH:mm:ss'),
        expiresAt: format(new Date(Number(campaign.expiresAt) * 1000), 'yyyy-MM-dd HH:mm:ss'),
        numOfBackers: parseFloat(campaign.numOfBackers.toString()),
        status: campaign.status,
    }
}

export const parsedBacker = (backer: { [key: string]: any }) => {
    return {
        owner: backer.owner,
        contribution: parseFloat(ethers.formatEther(backer.contribution.toString())),
        timestamp: format(new Date(Number(backer.timestamp) * 1000), 'yyyy-MM-dd HH:mm:ss'),
        refunded: backer.refunded,
    }
}

export const parsedCampaigns = (data: { [key: string]: any }) => {
    const parsedCampaigns = data.map(parsedCampaign)
    const filteredCampaigns = parsedCampaigns.filter((campaign: campaignProps) => campaign.status !== 3)
    return filteredCampaigns
}

export const parsedBackers = (data: { [key: string]: any }) => {
    const parsedBackers = data.map(parsedBacker)
    return parsedBackers
}

export const parseErrorMessages = (error: any) => {
    let errorMessage: string
    const errorName = error.cause?.data?.errorName
    if (errorName === 'FundMe__TitleRequired') {
        errorMessage = 'Title is required'
    } else if (errorName === 'FundMe__DescriptionRequired') {
        errorMessage = 'Description is required'
    } else if (errorName === 'FundMe__ImageURLRequired') {
        errorMessage = 'Image is required'
    } else if (errorName === 'FundMe__CostBelowMinimum') {
        errorMessage = 'Cost must be greater than 0.1 ether'
    } else if (errorName === 'FundMe__InvalidExpireDate') {
        errorMessage = 'Expire date must be in the future'
    } else if (errorName === 'FundMe__CampaignDoesNotExist') {
        errorMessage = 'Campaign id is Invalid'
    } else if (errorName === 'FundMe__NotCampaignOwner') {
        errorMessage = 'You are not the owner of this campaign'
    } else if (errorName === 'FundMe__CampaignNotOpen') {
        errorMessage = 'Campaign is not open'
    } else if (errorName === 'FundMe__CampaignNotApproved') {
        errorMessage = 'Campaign is not approved yet'
    } else if (errorName === 'FundMe__CampaignHasExpired') {
        errorMessage = 'Campaign has already expired'
    } else if (errorName === 'FundMe__CampaignNotExpired') {
        errorMessage = 'Campaign has not expired yet'
    } else if (errorName === 'FundMe__CampaignHasClosed') {
        errorMessage = 'Campaign has already closed'
    } else if (errorName === 'FundMe__AmountMustAboveZero') {
        errorMessage = 'Contribution amount must be greater than 0'
    } else if (errorName === 'FundMe__NoRefundAvailable') { 
        errorMessage = 'No refund available for this address or the address has already been refunded'
    } else if (errorName === 'FundMe__InvalidPlatformFee') {
        errorMessage = 'Platform fee must be between 0 and 100'
    } else if (errorName === 'FundMe__TransferFailed') {
        errorMessage = 'Failed to transfer funds'
    } else {
        errorMessage = error?.shortMessage
    }
    return errorMessage
}
