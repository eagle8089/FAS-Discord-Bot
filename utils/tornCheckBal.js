import axios from 'axios';

export async function checkUserBalance(tornId) {
    const response = await axios.get(`https://api.torn.com/faction/?selections=donations&key=${process.env.TORN_ADMIN_API}`)
    const responseData = response.data;
    if (responseData.donations[tornId]) {
        return responseData.donations[tornId].money_balance;
    }
    else {
        return 0;
    }
}