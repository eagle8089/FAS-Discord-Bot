import axios from 'axios';

export async function verifyUserinFaction(MemberApi) {
	try {
		const apiHeader = {
			'accept': 'application/json',
			'Authorization': `ApiKey ${MemberApi}`,
		};
		const userInfo = await axios.get('https://api.torn.com/v2/user', { headers: apiHeader });
		if (userInfo.status !== 200) {
			throw new Error('Failed to call API - Verify User');
		}
		// const userTornId = userInfo.data.player_id;
		const userTornName = userInfo.data.name;
		const tornFactionId = userInfo.data.faction.faction_id;
		if (tornFactionId == 45835) {
			return { state: true, tornUsername: userTornName };
		}
		else {
			return { state: false, username: null };
		}
	}
	catch (error) {
		console.error(error);
		return { state: false, username: null };
	}
}
