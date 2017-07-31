export let config = {
    /**
     * Common BOT config, used for running the Spectrum API.
     */

    /** The username to connect to spectrum with */
    username: "",
    /** The password to connect so spectrum with */
    password: "",


    /** 
     * DEV TESTS CONFIGS 
     * Used only when running the test suite.
     * please do **not** use a public community/channel for this. 
     */

    /** community name in which to test the api */
    _testCommunity: "",
    /** channel id (that exists in previous community) in which to test the api */
    _testChannelId: "",
    /** lobby name (that exists in previous community) in which to test the api */
    _testLobby: "",
};