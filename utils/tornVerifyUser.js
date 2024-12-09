import axios from 'axios';

export async function verifyUserinFaction(MemberApi) {
    const response = await axios.get(`https://api.torn.com/faction/?selections=basic&key=${MemberApi}`)
    const responseData = response.data;
    if (responseData.ID == 45835) {
        const response = await axios.get(`https://api.torn.com/user/?selections=basic&key=${MemberApi}`)
        const responseData = response.data;
        return [responseData.name, responseData.player_id];
    }
    else {
        return false;
    }
}

export async function verifyUserinFactionMaster() {
    const response = await axios.get(`https://api.torn.com/v2/faction/members?key=${process.env.TORN_ADMIN_API}&striptags=true`)
    return response.data.members
}