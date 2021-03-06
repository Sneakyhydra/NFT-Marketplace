const { ethers } = require('hardhat');

describe('KBMarket', function () {
	it('Should mint and trade NFTs', async function () {
		// Test to receive contract addresses
		const kbmarket = await ethers.getContractFactory('KBMarket');
		const market = await kbmarket.deploy();
		await market.deployed();
		const marketAddress = market.address;

		const NFT = await ethers.getContractFactory('NFT');
		const nft = await NFT.deploy(marketAddress);
		await nft.deployed();
		const nftAddress = nft.address;

		// test to receive listing price and auction price
		let listingPrice = await market.getListingPrice();
		listingPrice = listingPrice.toString();

		const auctionPrice = ethers.utils.parseUnits('100', 'ether');

		// Test for minting
		await nft.mintToken('https-t1');
		await nft.mintToken('https-t2');

		await market.mintNft(nftAddress, 1, auctionPrice, {
			value: listingPrice,
		});
		await market.mintNft(nftAddress, 2, auctionPrice, {
			value: listingPrice,
		});

		// Test for different addresses from different users - test accounts
		// Return an array of addresses
		const [_, buyerAddress] = await ethers.getSigners();

		// Create a market sale with address, id and price
		await market
			.connect(buyerAddress)
			.buyNft(nftAddress, 1, { value: auctionPrice });

		let items = await market.fetchUnsoldNfts();
		items = await Promise.all(
			items.map(async (i) => {
				const tokenURI = await nft.tokenURI(i.tokenId);
				let item = {
					price: i.price.toString(),
					tokenId: i.tokenId.toString(),
					seller: i.seller,
					owner: i.owner,
					tokenURI,
				};
				return item;
			})
		);

		// Test out all the items
		console.log('items', items);
	});
});
