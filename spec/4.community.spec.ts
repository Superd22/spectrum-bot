import { SpectrumLobby } from './../src/';
import { SpectrumChannel } from './../src/';
import { SpectrumBroadcaster } from './../src/';
import { SpectrumCommunity } from '../src/';
import { TestInstance } from './_.instance';
import { TestShared } from './_.shared';

import { } from 'jasmine';

describe("Community", () => {
    TestShared.commonSetUp();
    TestShared.testCommunityDependentSetUp();

    let testCommunity: SpectrumCommunity;

    it("Should find the test community", () => {
        testCommunity = TestInstance.bot.getState().getCommunityByName(TestShared.config._testCommunity);
        expect(testCommunity).toBeTruthy();
    });

    it("Should be able to get member count for lobbies", async () => {
        let count = await testCommunity.getOnlineMemberCount();
        expect(count).toBeTruthy();
    });

    it("Should return a channel it owns", () => {
        let target = testCommunity.community.forum_channel_groups[0].channels[0];
        let test = testCommunity.getChannel(target);

        expect(test).toBeTruthy();
        expect(test instanceof SpectrumChannel).toBe(true);
        expect(test.channel.id == target.id).toBe(true);
    });

    it("Should not return a channel it doesn't own", () => {
        // Yes i've reserved a channel just for this test.
        let target = 6466;
        let test = testCommunity.getChannel(target);

        expect(test).toBeFalsy();
    });

    it("Should return a lobby it owns", () => {
        let target = testCommunity.community.lobbies[0];
        let test = testCommunity.getLobbyByName(target.name);

        expect(test).toBeTruthy();
        expect(test instanceof SpectrumLobby).toBe(true);
        expect(test.lobby.id == target.id).toBe(true);
    });

    it("Should not return a lobby it doesn't owns", () => {
        let target = 4461;
        let test = testCommunity.getLobbyById(target);

        expect(test).toBeFalsy();
    });


});