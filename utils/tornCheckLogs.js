import axios from 'axios';

function stateChanged(newData, lastNews) {
    var newMsgs = [];
    for (var key in newData.news) {
        var newsData = newData.news[key];
        if (newsData.id === lastNews.id) {
            break;
        }
        newMsgs.push(JSON.stringify(newsData));
    }
    if (newMsgs.length != 0) {
        return [true, newMsgs];
    }
    else {
        return [false, []];
    }
}

export async function getNews(newsType, lastData) {
    const response = await axios.get(`https://api.torn.com/v2/faction/news?key=${process.env.TORN_ADMIN_API}&striptags=true&limit=20&sort=DESC&cat=${newsType}`)
    if (response.status != 200) {
        console.log("Error fetching Faction News!");
    }
    const responseData = response.data;
    const [changeStatus, pushMsg] = stateChanged(responseData, lastData);
    if (changeStatus) {
        return [true, pushMsg];
        // previous_fetch = JSON.parse(pushMsg[0]);
    }
    else {
        return [false, []]
    }
}
