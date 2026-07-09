


export class Utils {

    static getFormatedPriceWithComma(price: number) {
        return parseFloat(String(price)).toLocaleString('en-US')
    }

    static getCurrencyName(currencyCode: string) {
        const currencyMap: { [key: string]: string } = {
            'BHD': 'Bahrain Dinar',
            'GBP': 'British Pound',
            'SAR': 'Saudi Riyal',
            'AED': 'Emirati Dirham',
            'INR': 'Indian Rupee'
        };

        const currencyName = currencyMap[currencyCode] || currencyCode;
        return currencyName;
    }

    static getCurrentTime() {
        const now = new Date();
        const time = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        return time;
    }
}
