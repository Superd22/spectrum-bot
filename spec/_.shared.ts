import { install as jCoInstall } from 'jasmine-co';
import { } from 'jasmine';

/**
 * Helper class to set-up jasmine environement across multiple tests
 */
export class TestShared {
    /** contains the console object */
    private static oldConsole = Object.assign({}, console);
    private static _config = null;
    public static get config() {
        if (!this._config) {
            try {
                this._config = require('./../app/config').config;
            } catch (ex) {
                this._config = Object.assign({}, process.env);
            }
        }

        return this._config;
    }


    /**
     * Will prevent console loging
     * Currently only prevents .log()
     */
    private static tearConsole() {
        console.log = function () { };
    }

    /**
     * Will reinstante the console to its old state
     */
    private static attachConsole() {
        console.log = this.oldConsole.log;
    }

    /**
     * Will set-up all the beforeEach callbacks.
     */
    public static beforeEach() {
        beforeEach(() => {
            this.tearConsole();
        });
    }

    /**
     * Will set-up all the afterEach callbacks
     */
    public static afterEach() {
        afterEach(() => {
            this.attachConsole();
        });
    }


    /**
     * Will set-up all the common used hooks.
     */
    public static commonSetUp() {
        jCoInstall();
        this.beforeEach();
        this.afterEach();
    }

    public static testCommunityDependentSetUp() {
        if (!this.config._testCommunity) pending("No test Community declared in config");
    }

    public static testChannelDependentSetUp() {
        TestShared.testCommunityDependentSetUp();
        if (!this.config._testChannelId)
            pending('No test channel declared in config');
    }

    public static testLobbyDependentSetUp() {
        TestShared.testCommunityDependentSetUp();
        if (!this.config._testLobby)
            pending('No test lobby declared in config');
    }

}

