/**
 * @module RSI
 */ /** */

import { RSIApiResponse } from './../interfaces/RSIApiResponse.interface';
import { ApiResponse } from './../interfaces/APIResponse.interface';
import * as cookieStore from 'tough-cookie-file-store';
import * as popsicle from 'popsicle';
import * as rl from 'readline';

/**
 * Main API class to handle every call to the RSI-API as well as 
 * user-identification.
 * @class Service
 */
export class Service {
    /** the username to use for login */
    private user: string
    /** the password to use for login */
    private pwd: string;
    /** main rsi url */
    private rsi = "https://robertsspaceindustries.com/";
    /** a collection of tokens */
    private tokens = {};
    /** cookieJar for api calls */
    private cookieJar = popsicle.jar(new cookieStore(__dirname + "/../../../cache/cookie.json"));
    private input = rl.createInterface(process.stdin, process.stdout, null);

    private static _instance: Service = new Service();

    constructor() {
        if (Service._instance) {
            throw new Error("Error: Instantiation failed: Use RSI.getInstance() instead of new.");
        }
        Service._instance = this;
    }

    public static getInstance(): Service {
        return Service._instance;
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
     * Performs a Login on the Service website.
     * And sets auth token as needed.
     * @return wheter or not we're sucessfully logged-in.
     */
    public login(): Promise<any> {
        return this.getBaseToken().then((res) => {
            // We need to try to login
            if (this.pwd && this.user)
                return popsicle.post(this.pop({ url: this.rsi + "api/account/signin", body: { password: this.pwd, username: this.user } }))
                    .use(popsicle.plugins.parse('json')).then((res) => {
                        // We're succesfully logged-in
                        if (res.body.success == 1) {
                            console.log("LOGIN OK");
                            return res.body;
                        }

                        // We have an issue
                        else {
                            // We need to trigger MFA
                            if (res.body.code == "ErrMultiStepRequired") {
                                return this.multiStepAuth().then((res) => { console.log("okay in login()"); });
                            }

                            // We need to trigger captcha.
                            if (res.body.code == "ErrCaptchaRequired") {
                                console.log("Captcha triggered, please resolve it on the website...");
                                return false;
                            }

                            if (res.body.code == "ErrWrongPassword_username") {
                                console.log("Wrong credentials.");
                                return false;
                            }
                            // we have an unexpected error, we couldn't login.
                            console.log("Unexpected login Error", res.body);
                            return false;
                        }
                    });
            // We don't need to perform a log-in.
            else return new Promise((resolve) => { resolve(true) });
        });
    }

    /**
     * Handles MultiStep Authentitifaciton if required.
     */
    private multiStepAuth(): Promise<any> {
        console.log("Need MFA code");

        return this.askForCode().then(res => { return res; });
    }

    /**
     * Prompts the user for a MFA code and tests it until it's wokring.
     */
    private askForCode() {
        return new Promise((resolve) => {
            console.log("\n");
            this.input.question("Please input one time MFA code", (code) => {
                return popsicle.post(this.pop({ url: this.rsi + "api/account/signinMultiStep", body: { code: code, device_name: "bot", device_type: "computer", duration: "session" } })).use(popsicle.plugins.parse('json'))
                    .then((res) => {
                        if (res.body.success == 0) {
                            console.log("RSI : " + res.body.msg);
                            resolve(this.askForCode());
                        }
                        else {
                            console.log("MFA OK.");
                            //this.input.close();
                            resolve(res.body);
                        }
                    });

            });
        })
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
     * Sends a POST request to the Service Website.
     * Will append the full Service url (with trailing slash)
     * @param url the endpoint 
     * @param data an object of data to send
     * @return a popsicle Promise
     */
    public post(url, data?): Promise<RSIApiResponse> {
        return popsicle.post(this.pop({ url: this.rsi + url, body: data })).use(popsicle.plugins.parse('json')).then((res: ApiResponse) => {
            return res.body;
        });
    }

    /**
     * Sends a GET request to the Service Website.
     * Will append the full Service url (with trailing slash)
     * @param url the endpoint 
     * @return a popsicle Promise
     */
    public get(url): Promise<RSIApiResponse> {
        return popsicle.post(this.pop({ url: this.rsi + url })).use(popsicle.plugins.parse('json')).then((res: ApiResponse) => {
            return res.body;
        });
    }

    /**
     * Return the current RSI-Token
     * @return The RSI-Token
     */
    public getRsiToken(): string {
        if (this.tokens['Rsi-Token']) return this.tokens['Rsi-Token'];
        return null;
    }

    /**
     * Convenience method to push data to api/spectrum/search/member/autocomplete
     * @param subject the Monicker or Handle to search
     * @param community_id the community_id in which to search
     * @return the data returned by the RSI API
     */
    public PostAPIAutoComplete(subject: string, community_id?: number): Promise<RSIApiResponse> {
        return this.post("api/spectrum/search/member/autocomplete", {
            text: subject, community_id: community_id
        });
    }

}