const popsicle = require('popsicle');

/**
 * Main API class to handle every call to the RSI-API as well as 
 * user-identification.
 * @class RSI
 */
export class RSI {
    /** the username to use for login */
    private user: string
    /** the password to use for login */
    private pwd: string;
    /** main rsi url */
    private rsi = "https://robertsspaceindustries.com/";
    /** a collection of tokens */
    private tokens = {};
    /** cookieJar for api calls */
    private cookieJar = popsicle.jar();

    private static _instance: RSI = new RSI();

    constructor() {
        if (RSI._instance) {
            throw new Error("Error: Instantiation failed: Use RSI.getInstance() instead of new.");
        }
        RSI._instance = this;
    }

    public static getInstance(): RSI {
        return RSI._instance;
    }

    /**
     * Convenience method to generate requests options
     * @param opts the request option
     * @return the request option with shared cookiejar and correct auth headers
     */
    private pop(opts: string): any;
    private pop(opts: any): any;
    private pop(opts: any): any {
        if (typeof opts == 'string') opts = { url: opts };

        opts.transport = popsicle.createTransport({
            jar: this.cookieJar
        });

        opts.headers = opts.headers || {};
        this.appendRSIToken(opts.headers);
        this.appendTavernToken(opts.headers);

        return opts;
    }

    /**
     * Saves the current token from the cookieJar
     * @param tokenName the name of the token to store
     */
    private getToken(tokenName = "Rsi-Token") {
        let cookies = this.cookieJar.getCookiesSync("https://robertsspaceindustries.com/");
        var foundToken = null;

        if (cookies && cookies.length > 0)
            cookies.forEach(cookie => {
                if (!foundToken) {
                    let match = cookie.toString().match(new RegExp(tokenName + "=([a-z0-9]+);"));
                    if (match[1]) foundToken = match[1];
                }
            });

        if (foundToken) this.tokens[tokenName] = foundToken;
    }

    /**
     * Appends RSI-Token to header 
     * @param headers 
     */
    private appendRSIToken(headers: Object) {
        this.getToken();
        if (this.tokens['Rsi-Token']) headers["X-Rsi-Token"] = this.tokens['Rsi-Token'];
    }

    /**
     * Appends x-tavern-id to headers
     * @param headers
     */
    private appendTavernToken(headers) {
        if (this.tokens["x-tavern-id"]) headers["x-tavern-id"] = this.tokens["x-tavern-id"];
    }

    /**
     * Sets the tavern-id for Spectrum API calls
     * @param tavernId
     */
    public setTavernId(tavernId) {
        this.tokens["x-tavern-id"] = tavernId;
    }

    /**
     * Performs a Login on the RSI website.
     * And sets auth token as needed.
     * @return wheter or not we're sucessfully logged-in.
     */
    public login(): Promise<boolean> {
        return this.getBaseToken().then((res) => {
            if (this.pwd && this.user)
                return popsicle.post(this.pop({ url: this.rsi + "api/account/signin", body: { password: this.pwd, username: this.user } }))
                    .use(popsicle.plugins.parse('json')).then((res) => {
                        return res.body;
                    });

            return res;
        });
    }

    /** 
     * Goes to main rsi page to get basic un-authed token
     * @return wheter or not we reached RSI.
     */
    public getBaseToken(): Promise<boolean> {
        return popsicle.get(this.pop(this.rsi + "connect")).then((res) => res.status == 200);
    }

    /**
     * Sets the current username to use
     * @param username the username to use
     */
    public setUsername(username: string) {
        this.user = username;
    }

    /**
     * Sets the current password to use
     * @param password the password to use
     */
    public setPassword(password: string) {
        this.pwd = password;
    }

    /**
     * Sends a POST request to the RSI Website.
     * Will append the full RSI url (with trailing slash)
     * @param url the endpoint 
     * @param data an object of data to send
     * @return a popsicle Promise
     */
    public post(url, data?) {
        return popsicle.post(this.pop({ url: this.rsi + url, body: data })).use(popsicle.plugins.parse('json'));
    }

    /**
     * Sends a GET request to the RSI Website.
     * Will append the full RSI url (with trailing slash)
     * @param url the endpoint 
     * @return a popsicle Promise
     */
    public get(url) {
        return popsicle.post(this.pop({ url: this.rsi + url })).use(popsicle.plugins.parse('json'));
    }

    /**
     * Return the current RSI-Token
     * @return The RSI-Token
     */
    public getRsiToken(): string {
        if (this.tokens['Rsi-Token']) return this.tokens['Rsi-Token'];
        return null;
    }

}