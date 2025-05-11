import axios from 'axios';

const tornMasterApi = process.env.TORN_API_KEY;

export async function checkUserBalance(userName) {
	try {
		const apiHeader = {
			'accept': 'application/json',
			'Authorization': `ApiKey ${tornMasterApi}`,
		};
		const factionBalanceBook = await axios.get('https://api.torn.com/v2/faction/balance', { headers: apiHeader });
		if (factionBalanceBook.status !== 200) {
			throw new Error('Failed to call API - Faction Balance');
		}

		const userBalance = factionBalanceBook.data.balance.members.find(member => member.username === userName);
		if (userBalance) {
			return userBalance.money;
		}
		else {
			return 0;
		}
	}
	catch (error) {
		console.error(error);
		return { state: false, username: null };
	}
}
