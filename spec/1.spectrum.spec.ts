import { TestShared } from './_.shared';
import { TestInstance } from './_.instance';
import { User } from './../src/Spectrum/interfaces/user.interface';
import { SpectrumUser } from './../src/Spectrum/components/user.component';
import { config } from './../app/config';
import { Spectrum } from '..';
import { } from 'jasmine';


describe("Spectrum Service", () => {
    TestShared.commonSetUp();

    it("Should instantiate", () => {
        TestInstance.bot = new Spectrum();
    });

    it("Should launch spectrum", async () => {
        let spectrum = await TestInstance.bot.initSpectrum(config.username, config.password);

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