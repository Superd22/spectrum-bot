import { config } from './../app/config';
import { install as jCoInstall } from 'jasmine-co';
import { } from 'jasmine';

/**
 * Helper class to set-up jasmine environement across multiple tests
 */
export class TestShared {
    /** contains the console object */
    private static oldConsole = Object.assign({}, console);

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

    public static testLobbyDependentSetUp() {
        if (!config._testChannel || !config._testCommunity)
            pending('No test community/lobby declared in config');
    }

}

