import { TestShared } from './_.shared';
import { RSI } from '../src/';
import { } from 'jasmine';



interface ThisContext {
    rsi: RSI;
}

describe("RSI Service", function (this: ThisContext) {
    TestShared.commonSetUp();

    it("should instantiate", () => {
        this.rsi = RSI.getInstance();
        expect(this.rsi instanceof RSI).toBe(true);
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