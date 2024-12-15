let provider;
let signer;
let auctionContract;
const contractAddress = "0x5E28693ce05C8e284Ba817c59C39c5E11f76c584";  // Replace with your contract address
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_biddingTime",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "AuctionEnded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "AuctionStarted",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "bid",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endAuction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "bidder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "HighestBidIncreased",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "auctionEndTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ended",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "highestBid",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "highestBidder",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "pendingReturns",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            // Request account access
            await window.ethereum.request({ method: "eth_requestAccounts" });
            
            // Set up provider and signer
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            // Get user address and update the UI
            const account = await signer.getAddress();
            document.getElementById("wallet-connect").style.display = "none";
            document.getElementById("auction-details").style.display = "block";

            // Initialize the contract
            auctionContract = new ethers.Contract(contractAddress, contractABI, signer);

            // Fetch auction details
            fetchAuctionDetails();
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Wallet connection failed: " + error.message);
        }
    } else {
        alert("MetaMask not detected! Please install MetaMask.");
    }
}

async function fetchAuctionDetails() {
    try {
        const highestBid = await auctionContract.highestBid();
        const highestBidder = await auctionContract.highestBidder();
        const auctionEndTime = await auctionContract.auctionEndTime();
        const ended = await auctionContract.ended();

        document.getElementById("highestBid").innerText = ethers.utils.formatEther(highestBid);
        document.getElementById("highestBidder").innerText = highestBidder === "0x0000000000000000000000000000000000000000" ? "None" : highestBidder;
        document.getElementById("auctionEndTime").innerText = new Date(auctionEndTime * 1000).toLocaleString();

        if (ended) {
            document.getElementById("auction-status").innerText = "Auction has ended.";
            document.getElementById("endAuctionButton").style.display = "none";
        } else {
            document.getElementById("auction-status").innerText = "Auction is ongoing.";
            const userAddress = await signer.getAddress();
            if (userAddress.toLowerCase() === (await auctionContract.owner()).toLowerCase()) {
                document.getElementById("endAuctionButton").style.display = "block";
            }
        }
    } catch (error) {
        console.error("Error fetching auction details:", error);
    }
}

async function placeBid() {
    const bidAmount = document.getElementById("bidAmount").value;
    const bidValue = ethers.utils.parseEther(bidAmount);

    try {
        const tx = await auctionContract.bid({ value: bidValue });
        await tx.wait();
        alert("Bid placed successfully!");
        fetchAuctionDetails();
    } catch (error) {
        console.error("Error placing bid:", error);
        alert("Error placing bid: " + error.message);
    }
}

async function endAuction() {
    try {
        const tx = await auctionContract.endAuction();
        await tx.wait();
        alert("Auction ended successfully!");
        fetchAuctionDetails();
    } catch (error) {
        console.error("Error ending auction:", error);
        alert("Error ending auction: " + error.message);
    }
}

async function withdraw() {
    try {
        const tx = await auctionContract.withdraw();
        await tx.wait();
        alert("Withdrawal successful!");
    } catch (error) {
        console.error("Error withdrawing:", error);
        alert("Error withdrawing: " + error.message);
    }
}
