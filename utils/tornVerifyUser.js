import axios from 'axios';
const tornApi = 'Z2Rh3D2TSGHf2VeQ';

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

export async function verifyUserinFactionMaster(memberId) {
    const response = await axios.get(`https://api.torn.com/v2/faction/members?key=${tornApi}&striptags=true`)
    return response.data.members
}