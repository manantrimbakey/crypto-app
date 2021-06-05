// Simple Express server setup to serve for local testing/dev API server
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
var cors = require('cors');
const https = require('https');

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors());

const HOST = process.env.API_HOST || 'localhost';
const PORT = process.env.API_PORT || 3002;
const coinsList = ['THETA', 'DOGE'];
const coinsListWazir = [
    { name: 'thetausdt', curr: 'usdt' },
    { name: 'dogeinr', curr: 'inr' }
];
coinsData = {};
coinsDataWazir = {};

app.get('/api/v1/endpoint', (req, res) => {});

app.get('/coinData', (req, res) => {
    let resultJsonYahoo = [];
    let objKeysYahoo = Object.keys(coinsData);

    for (let i = 0; i < objKeysYahoo.length; i++) {
        const element = objKeysYahoo[i];
        resultJsonYahoo.push(coinsData[element].quoteResponse.result[0]);
    }

    let resultJsonWazir = [];
    let objKeysWazir = Object.keys(coinsDataWazir);
    for (let i = 0; i < objKeysWazir.length; i++) {
        const element = objKeysWazir[i];
        // console.log(JSON.stringify(coinsDataWazir[element]));
        let obj = JSON.parse(JSON.stringify(coinsDataWazir[element]));
        obj.symbol = element;
        for (let j = 0; j < coinsListWazir.length; j++) {
            const element = coinsListWazir[j];
            if (element.name == obj.market) {
                obj.currency = element.curr;
                break;
            }
        }
        resultJsonWazir.push(obj);
    }

    let resultToJson = {
        yahooFinance: resultJsonYahoo,
        wazir: resultJsonWazir
    };

    res.json(resultToJson);
});

app.listen(PORT, () =>
    console.log(
        `✅  API Server started: http://${HOST}:${PORT}/api/v1/endpoint`
    )
);

const hostName = 'query1.finance.yahoo.com';
const urlPath =
    '/v7/finance/quote?&symbols=@COIN@-INR&fields=extendedMarketChange,extendedMarketChangePercent,extendedMarketPrice,extendedMarketTime,regularMarketChange,regularMarketChangePercent,regularMarketPrice,regularMarketTime,circulatingSupply,ask,askSize,bid,bidSize,dayHigh,dayLow,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,volume';
const wazirURL = '/api/v2/trades?market=@COIN@&limit=1';

const optionsYahoo = {
    hostname: hostName,
    port: 443,
    path: urlPath,
    method: 'GET'
};

const optionsWazir = {
    hostname: 'x.wazirx.com',
    port: 443,
    path: wazirURL,
    method: 'GET'
};

const pollData = async function (optionsURL, callback, errorCallBack) {
    var chunks = [];
    var schema = {};
    const req = https.request(optionsURL, (res) => {
        res.on('data', (d) => {
            chunks.push(d);
        });
        res.on('end', function () {
            let data = Buffer.concat(chunks);
            schema = data;
            callback(schema);
        });
    });

    req.on('error', (error) => {
        errorCallBack(error);
    });
    req.end();
};

let i = 0;
let index = i % coinsList.length;
let iWazir = 0;
let indexWazir = iWazir % coinsListWazir.length;

const fetchData = async function () {
    setInterval(() => {
        let optionsURLYahoo = JSON.parse(JSON.stringify(optionsYahoo));
        optionsURLYahoo.path = optionsURLYahoo.path.replace(
            '@COIN@',
            coinsList[index]
        );
        var flagYahoo = false;
        pollData(
            optionsURLYahoo,
            (param) => {
                let eachCoinData = JSON.parse(param);

                coinsData[eachCoinData.quoteResponse.result[0].symbol] =
                    eachCoinData;

                flagYahoo = true;
            },
            (error) => {
                console.error(error);
                flagYahoo = false;
            }
        );

        i++;
        index = i % coinsList.length;
    }, 1000);
};

const fetchDataWazir = async function () {
    setInterval(() => {
        let optionsWazirURL = JSON.parse(JSON.stringify(optionsWazir));

        optionsWazirURL.path = optionsWazirURL.path.replace(
            '@COIN@',
            coinsListWazir[indexWazir].name
        );

        var flagWazir = false;
        pollData(
            optionsWazirURL,
            (param) => {
                let eachCoinData = JSON.parse(param);

                coinsDataWazir[eachCoinData[0].market] = eachCoinData[0];
                flagWazir = true;
            },
            (error) => {
                console.error(error);
                flagWazir = false;
            }
        );
        iWazir++;
        indexWazir = iWazir % coinsListWazir.length;
    }, 1000);
};

fetchData();
fetchDataWazir();
