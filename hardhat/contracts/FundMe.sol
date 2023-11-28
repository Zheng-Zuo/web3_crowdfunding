// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/* Errors */
error FundMe__TitleRequired();
error FundMe__DescriptionRequired();
error FundMe__ImageURLRequired();
error FundMe__CostBelowMinimum();
error FundMe__InvalidExpireDate();
error FundMe__CampaignDoesNotExist();
error FundMe__NotCampaignOwner();
error FundMe__CampaignNotOpen();
error FundMe__CampaignNotApproved();
error FundMe__CampaignHasExpired();
error FundMe__CampaignNotExpired();
error FundMe__CampaignHasClosed();
error FundMe__AmountMustAboveZero();
error FundMe__NoRefundAvailable();
error FundMe__InvalidPlatformFee();
error FundMe__TransferFailed();

contract FundMe is Ownable {
    /* Type declarations */
    enum statusEnum {
        OPEN,
        APPROVED,
        EXPIRED,
        DELETED,
        PAIDOUT
    }

    struct statsStruct {
        uint256 totalCampaigns;
        uint256 totalBackings;
        uint256 totalDonations;
    }

    struct backerStruct {
        address owner;
        uint256 contribution;
        uint256 timestamp;
        bool refunded;
    }

    struct campaignStruct {
        uint256 id;
        address owner;
        string title;
        string description;
        string imageURL;
        uint256 cost;
        uint256 raised;
        uint256 timestamp;
        uint256 expiresAt;
        uint256 numOfBackers;
        statusEnum status;
    }

    /* State variables */
    uint256 private s_platformFeePercent;
    statsStruct private s_stats;
    campaignStruct[] private s_campaigns;
    mapping(uint256 => backerStruct[]) private s_backersOfCampaign;

    /* Events */
    event Action(
        uint256 id,
        string actionType,
        address indexed executor,
        uint256 timestamp
    );

    constructor(uint256 _platformFeePercent) Ownable(msg.sender) {
        s_platformFeePercent = _platformFeePercent;
    }

    function createCampaign(
        string memory title,
        string memory description,
        string memory imageURL,
        uint256 cost,
        uint256 expiresAt
    ) external {
        if (bytes(title).length <= 0) {
            revert FundMe__TitleRequired();
        }
        if (bytes(description).length <= 0) {
            revert FundMe__DescriptionRequired();
        }
        if (bytes(imageURL).length <= 0) {
            revert FundMe__ImageURLRequired();
        }
        if (cost <= 0.1 ether) {
            revert FundMe__CostBelowMinimum();
        }
        if (expiresAt <= block.timestamp) {
            revert FundMe__InvalidExpireDate();
        }

        campaignStruct memory campaign;
        campaign.id = s_campaigns.length;
        campaign.owner = msg.sender;
        campaign.title = title;
        campaign.description = description;
        campaign.imageURL = imageURL;
        campaign.cost = cost;
        campaign.timestamp = block.timestamp;
        campaign.expiresAt = expiresAt;
        campaign.status = statusEnum.OPEN;

        s_campaigns.push(campaign);
        s_stats.totalCampaigns++;

        emit Action(
            campaign.id,
            "Campaign Created",
            msg.sender,
            block.timestamp
        );
    }

    function updateCampaign(
        uint256 id,
        string memory title,
        string memory description,
        string memory imageURL
    ) external {
        if (id > s_campaigns.length) {
            revert FundMe__CampaignDoesNotExist();
        }
        if (s_campaigns[id].owner != msg.sender) {
            revert FundMe__NotCampaignOwner();
        }
        if (s_campaigns[id].status != statusEnum.OPEN) {
            revert FundMe__CampaignNotOpen();
        }
        if (s_campaigns[id].expiresAt < block.timestamp) {
            revert FundMe__CampaignHasExpired();
        }
        if (bytes(title).length <= 0) {
            revert FundMe__TitleRequired();
        }
        if (bytes(description).length <= 0) {
            revert FundMe__DescriptionRequired();
        }
        if (bytes(imageURL).length <= 0) {
            revert FundMe__ImageURLRequired();
        }

        s_campaigns[id].title = title;
        s_campaigns[id].description = description;
        s_campaigns[id].imageURL = imageURL;

        emit Action(id, "Campaign Updated", msg.sender, block.timestamp);
    }

    function deleteCampaign(uint256 id) external {
        if (id > s_campaigns.length) {
            revert FundMe__CampaignDoesNotExist();
        }
        if (s_campaigns[id].owner != msg.sender && msg.sender != owner()) {
            revert FundMe__NotCampaignOwner();
        }
        if (s_campaigns[id].status != statusEnum.OPEN) {
            revert FundMe__CampaignNotOpen();
        }
        if (s_campaigns[id].expiresAt < block.timestamp) {
            revert FundMe__CampaignHasExpired();
        }

        s_campaigns[id].status = statusEnum.DELETED;
        s_stats.totalCampaigns--;
        performRefund(id);

        emit Action(id, "Campaign Deleted", msg.sender, block.timestamp);
    }

    function backCampaign(uint256 id) external payable {
        if (id > s_campaigns.length) {
            revert FundMe__CampaignDoesNotExist();
        }
        if (
            s_campaigns[id].status != statusEnum.OPEN &&
            s_campaigns[id].status != statusEnum.APPROVED
        ) {
            revert FundMe__CampaignHasClosed();
        }
        if (s_campaigns[id].expiresAt < block.timestamp) {
            revert FundMe__CampaignHasExpired();
        }
        if (msg.value <= 0) {
            revert FundMe__AmountMustAboveZero();
        }

        s_campaigns[id].raised += msg.value;
        s_campaigns[id].numOfBackers += 1;

        backerStruct memory backer;
        backer.owner = msg.sender;
        backer.contribution = msg.value;
        backer.timestamp = block.timestamp;
        backer.refunded = false;

        s_backersOfCampaign[id].push(backer);

        s_stats.totalBackings++;
        s_stats.totalDonations += msg.value;

        emit Action(id, "Campaign Backed", msg.sender, block.timestamp);

        if (s_campaigns[id].raised >= s_campaigns[id].cost) {
            s_campaigns[id].status = statusEnum.APPROVED;
        }
    }

    function refundExpiredCampaign(uint256 id) external {
        if (id > s_campaigns.length) {
            revert FundMe__CampaignDoesNotExist();
        }
        if (s_campaigns[id].status != statusEnum.OPEN) {
            revert FundMe__CampaignNotOpen();
        }
        if (s_campaigns[id].expiresAt > block.timestamp) {
            revert FundMe__CampaignNotExpired();
        }

        s_campaigns[id].status = statusEnum.EXPIRED;
        performRefund(id);

        emit Action(id, "Campaign Expired", msg.sender, block.timestamp);
    }

    function claimRefund(uint256 id, address owner) external {
        if (id > s_campaigns.length) {
            revert FundMe__CampaignDoesNotExist();
        }
        if (s_campaigns[id].expiresAt > block.timestamp) {
            revert FundMe__CampaignNotExpired();
        }
        if (s_campaigns[id].status != statusEnum.OPEN) {
            revert FundMe__CampaignNotOpen();
        }

        if (s_campaigns[id].numOfBackers == 0) {
            s_campaigns[id].status = statusEnum.EXPIRED;
            emit Action(id, "Campaign Expired", msg.sender, block.timestamp);
        }

        uint256 totalRefund = 0;
        for (uint256 i = 0; i < s_backersOfCampaign[id].length; i++) {
            if (
                s_backersOfCampaign[id][i].owner == owner &&
                !s_backersOfCampaign[id][i].refunded
            ) {
                s_backersOfCampaign[id][i].refunded = true;
                s_backersOfCampaign[id][i].timestamp = block.timestamp;
                totalRefund += s_backersOfCampaign[id][i].contribution;

                s_stats.totalBackings -= 1;
                s_stats.totalDonations -= s_backersOfCampaign[id][i].contribution;

                s_campaigns[id].raised -= s_backersOfCampaign[id][i].contribution;
                s_campaigns[id].numOfBackers -= 1;
            }
        }

        if (totalRefund == 0) {
            revert FundMe__NoRefundAvailable();
        }

        payTo(owner, totalRefund);
        emit Action(id, "Backer Claimed Refund", msg.sender, block.timestamp);

        if (s_campaigns[id].numOfBackers == 0) {
            s_campaigns[id].status = statusEnum.EXPIRED;
            emit Action(id, "Campaign Expired", msg.sender, block.timestamp);
        }
    }

    function payoutCampaign(uint256 id) external {
        if (id > s_campaigns.length) {
            revert FundMe__CampaignDoesNotExist();
        }
        if (s_campaigns[id].owner != msg.sender && msg.sender != owner()) {
            revert FundMe__NotCampaignOwner();
        }
        if (s_campaigns[id].status != statusEnum.APPROVED) {
            revert FundMe__CampaignNotApproved();
        }
        performPayout(id);
    }

    function performRefund(uint256 id) internal {
        for (uint256 i = 0; i < s_backersOfCampaign[id].length; i++) {
            if (!s_backersOfCampaign[id][i].refunded) {
                s_backersOfCampaign[id][i].refunded = true;
                s_backersOfCampaign[id][i].timestamp = block.timestamp;
                payTo(
                    s_backersOfCampaign[id][i].owner,
                    s_backersOfCampaign[id][i].contribution
                );

                s_stats.totalBackings -= 1;
                s_stats.totalDonations -= s_backersOfCampaign[id][i].contribution;

                s_campaigns[id].raised -= s_backersOfCampaign[id][i].contribution;
                s_campaigns[id].numOfBackers -= 1;
            }
        }
    }

    function performPayout(uint256 id) internal {
        uint256 platformFee = (s_campaigns[id].raised * s_platformFeePercent) / 100;
        uint256 payoutAmount = s_campaigns[id].raised - platformFee;

        payTo(s_campaigns[id].owner, payoutAmount);
        payTo(owner(), platformFee);

        s_campaigns[id].status = statusEnum.PAIDOUT;

        emit Action(id, "Campaign Paid Out", msg.sender, block.timestamp);
    }

    function payTo(address recipient, uint256 amount) internal {
        (bool success, ) = payable(recipient).call{value: amount}("");
        if (!success) {
            revert FundMe__TransferFailed();
        }
    }

    function changePlatformFee(uint256 _platformFeePercent) public onlyOwner {
        if (_platformFeePercent <= 0 || _platformFeePercent >= 100) {
            revert FundMe__InvalidPlatformFee();
        }
        s_platformFeePercent = _platformFeePercent;
    }

    function getCampaign(uint256 id) public view returns (campaignStruct memory) {
        if (id > s_campaigns.length) {
            revert FundMe__CampaignDoesNotExist();
        }
        return s_campaigns[id];
    }

    function getCampaigns() public view returns (campaignStruct[] memory) {
        return s_campaigns;
    }

    function getBackers(uint256 id) public view returns (backerStruct[] memory) {
        require(id <= s_campaigns.length, "Campaign does not exist");
        return s_backersOfCampaign[id];
    }

    function getPlatformFee() public view returns (uint256) {
        return s_platformFeePercent;
    }

    function getStats() public view returns (statsStruct memory) {
        return s_stats;
    }
}
