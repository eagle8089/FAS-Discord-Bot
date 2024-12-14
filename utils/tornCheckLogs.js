import axios from 'axios';
import { MongoClient, ServerApiVersion } from 'mongodb'
const mongo_client = new MongoClient(process.env.MONGO_CON_URL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function stateChanged(newData, lastNews) {
    var newMsgs = [];
    var cnfFunds = [];
    await mongo_client.connect();
    const bankTransactionCol = mongo_client.db('fas-bot').collection('bankTransactions');
    for (var key in newData.news) {
        var newsData = newData.news[key];
        if (newsData.id === lastNews.id) {
            break;
        }
        const userName = newsData.text.split(' ')[0];
        let amount = newsData.text.split(' ')[3];
        amount = parseInt(amount.replace(/[^0-9.]/g, ''));
        const trxQuery = await bankTransactionCol.findOne({ userName: userName, amount: amount, status: 0 });
        if (trxQuery) {
            cnfFunds.push(trxQuery.messageId);
            trxQuery.status = 1;
            await bankTransactionCol.replaceOne({ userName: userName, amount: amount, status: 0 }, trxQuery);
        }
        newMsgs.push(JSON.stringify(newsData));
    }
    await mongo_client.close();
    return [newMsgs, cnfFunds];
}

export async function getNews(newsType, lastData) {
    const response = await axios.get(`https://api.torn.com/v2/faction/news?key=${process.env.TORN_ADMIN_API}&striptags=true&limit=20&sort=DESC&cat=${newsType}`)
    if (response.status != 200) {
        console.log("Error fetching Faction News!");
    }
    const responseData = response.data;
    const [newMsgs, cnfFunds] = await stateChanged(responseData, lastData);
    return [newMsgs, cnfFunds]

}
