


export class Utils {

    static getFormatedPriceWithComma(price: number) {
        return parseFloat(String(price)).toLocaleString('en-US')
    }

    static getNumberFromFormattedValue(value: string | number | null | undefined) {
        const parsed = parseFloat(String(value ?? '').replace(/,/g, ''));
        return Number.isNaN(parsed) ? 0 : parsed;
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
