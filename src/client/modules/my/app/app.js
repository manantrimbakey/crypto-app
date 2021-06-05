import { LightningElement, track } from 'lwc';

const callToServer = (path, config) => {
    return new Promise(function (resolve, reject) {
        fetch(path, config)
            .then((response) => response.json())
            .then((data) => {
                resolve(data);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const columns = [
    { label: 'Label', fieldName: 'symbol' },
    {
        label: 'Market Value (INR)',
        fieldName: 'regularMarketPrice',
        type: 'number'
    },
    { label: 'Day Long Change', fieldName: 'regularMarketDayRange' },
    { label: 'Year Long Change', fieldName: 'fiftyTwoWeekRange' }
];

const columnsWazir = [
    { label: 'Label', fieldName: 'symbol' },
    { label: 'Market Value', fieldName: 'price' },
    { label: 'Currency', fieldName: 'currency' }
];

export default class App extends LightningElement {
    @track rawJsonData = {};

    columns = columns;
    columnsWazir = columnsWazir;
    connectedCallback() {
        this.fetchCrypto();
    }

    fetchCrypto() {
        var self = this;
        callToServer('http://localhost:3002/coinData')
            .then((data) => {
                this.rawJsonData = data;
                setTimeout(() => {
                    self.fetchCrypto();
                }, 1000);
            })
            .catch((error) => {
                alert(error);
            });
    }
}
