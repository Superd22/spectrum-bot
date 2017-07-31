import { TestShared } from './_.shared';
import { TestInstance } from './_.instance';
import { SpectrumUser } from '../src/Spectrum/components/shared/user.component';
import { Spectrum } from '..';
import { } from 'jasmine';


describe("Spectrum Service", () => {
    TestShared.commonSetUp();

    it("Should instantiate", () => {
        TestInstance.bot = new Spectrum();
    });

    it("Should launch spectrum", async () => {
        let spectrum = await TestInstance.bot.initSpectrum(TestShared.config.username, TestShared.config.password);

        expect(spectrum).toBeTruthy();
    });


    describe("Misc.", () => {
        describe("User search", async () => {

            it("Should find a single match", async () => {
                let users = await TestInstance.bot.LookForUserByName("croberts68");

                expect(users.length).toEqual(1);
                expect(users[0] instanceof SpectrumUser).toBe(true);

                let cRoberts = users[0].getUser();
                expect(cRoberts.nickname).toBe("croberts68");
                expect(cRoberts.id).toBe(387);
            });

            it("Should find multiple matches", async () => {
                let users = await TestInstance.bot.LookForUserByName("cr");

                expect(users.length).toBeGreaterThan(0);
            });

        });

    });

});