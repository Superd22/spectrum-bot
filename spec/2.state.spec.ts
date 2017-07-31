import { SpectrumCommunity } from '../src/Spectrum/components/shared/community.component';
import { SpectrumState } from './../src/Spectrum/services/state.service';
import { TestInstance } from './_.instance';
import { TestShared } from './_.shared';

import { } from 'jasmine';


interface StateTest {
    state: SpectrumState;
}


describe("State Service", function (this: StateTest) {
    TestShared.commonSetUp();

    it("Should be gettable from Spectrum Service", () => {
        this.state = TestInstance.bot.getState();

        expect(this.state instanceof SpectrumState).toBe(true);
    });

    it("Should be ready eventually", async () => {
        let ready = await this.state.whenReady();

        expect(ready).toBe(true);
    });

    describe("Self", () => {
        describe("Status", () => {
            it("Should be able to change status", async () => {
                let post = await this.state.setBotPresence("away");
                expect(post.success).toBeTruthy();
            });

            it("Should detect when it changes status", (done) => {
                let callback = function() { done(); }

                this.state.onCustomListener("settings.update", callback);
                let post = this.state.setBotPresence("do_not_disturb");
            });
        });
    });

    describe("Communities", () => {

        function ensureIsStarCitizenCommunity(community: SpectrumCommunity) {
            let co = community.community;

            return (co.id == 1);
        }

        it("Should be able to look for communities", () => {
            let co = this.state.getCommunityByName("Star Citizen");

            expect(co instanceof SpectrumCommunity).toBe(true);
            expect(ensureIsStarCitizenCommunity(co)).toBe(true);
        });

        it("Should have access to the Star Citizen community", async () => {
            let accesibleCommunities = this.state.getCommunities();
            let hasAccess = false;

            accesibleCommunities.forEach((community) => {
                if (!hasAccess) {
                    hasAccess = ensureIsStarCitizenCommunity(community);
                }
            });

            expect(hasAccess).toBe(true);
        });

        it("Should have access to #General in the Star Citizen Community", async () => {
            let accessibleLobbies = this.state.getAccessibleLobbies();
            let hasAccess = false;

            accessibleLobbies.forEach((lobby) => {
                if (!hasAccess) {
                    hasAccess = (lobby.lobby.id == 1);
                }
            });

            expect(hasAccess).toBe(true);
        });

    });

});