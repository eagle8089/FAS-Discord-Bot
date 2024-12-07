import axios from 'axios';

export async function verifyUserinFaction(MemberApi) {
    const response = await axios.get(`https://api.torn.com/faction/?selections=basic&key=${MemberApi}`)
    const responseData = response.data;
    if (responseData.ID == 45835) {
        return true;
    }
    else {
        return false;
    }
}
