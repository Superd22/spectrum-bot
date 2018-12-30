import { Container } from "typedi";
import { TestShared } from "./_.shared";
import { RSI } from "../src/";
import {} from "jasmine";
import * as fs from "fs-extra";

interface ThisContext {
    rsi: RSI;
}

describe("RSI Service", function(this: ThisContext) {
    TestShared.commonSetUp();

    it("should instantiate", () => {
        this.rsi = RSI.getInstance();
        expect(this.rsi instanceof RSI).toBe(true);
    });

    describe("Cookie Jar", () => {
        beforeEach(() => {
            Container.set(RSI, new RSI());
        });
        it(`Should create cookie jar if file doesn't exist`, async () => {
            try {
                await fs.remove("../src/cache/cookie.json");
            } catch (e) {}

            Container.set(RSI, new RSI());
            this.rsi = RSI.getInstance();
            expect(this.rsi instanceof RSI).toBe(true);
        });

        it(`Should create cookie jar if directory doesn't exist`, async () => {
            try {
                await fs.remove("../src/cache");
            } catch (e) {}

            Container.set(RSI, new RSI());
            this.rsi = RSI.getInstance();
            expect(this.rsi instanceof RSI).toBe(true);
        });

        it(`Should leave cookie jar as is if exists`, async () => {
            try {
                await fs.remove("../src/cache");
                await fs.ensureFile("../src/cache/cookie.json");
                await fs.writeFile("../src/cache/cookie.json", '{"test":123}');
            } catch (e) {}

            Container.set(RSI, new RSI());
            this.rsi = RSI.getInstance();
            expect(this.rsi instanceof RSI).toBe(true);

            const cookie = await fs.readFile("../src/cache/cookie.json", "utf-8");
            expect(cookie).toBe('{"test":123}');
        });

        afterAll(async () => {
            try {
                await fs.remove("../src/cache");
            } catch (e) {}

            Container.set(RSI, new RSI());
            this.rsi = RSI.getInstance();
        });
    });

    describe("Should handle login operation", () => {
        it("Should get a base token from RSI", async () => {
            let token = await this.rsi.getBaseToken();
            expect(token).toEqual(true);
        });

        it("Should be able to login as a guest", async () => {
            let login = await this.rsi.login();
            expect(login).toBe(true);
        });

        /**
        it("Should not loggin with bogus username/password", async () => {
            // Let's hope this test never passes ...
            this.rsi.setUsername("croberts");
            this.rsi.setPassword("1234");

            let login = await this.rsi.login();

            expect(login).toBeFalsy();
        });
        */

        it("Should loggin with good username/password", async () => {
            this.rsi.setUsername(TestShared.config.username);
            this.rsi.setPassword(TestShared.config.password);

            let login = await this.rsi.login();

            expect(login).toBeTruthy();
        });
    });
});
