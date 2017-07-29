import { SpectrumBroadcaster } from './../src/Spectrum/services/broadcaster.service';
import { SpectrumCommunity } from '../src/Spectrum/components/shared/community.component';
import { TestInstance } from './_.instance';
import { TestShared } from './_.shared';

import { } from 'jasmine';

describe("Text Lobby", () => {
    TestShared.commonSetUp();
    TestShared.testLobbyDependentSetUp();

    let testCommunity: SpectrumCommunity;

    it("Should find the test community", () => {
        testCommunity = TestInstance.bot.getState().getCommunityByName(TestShared.config._testCommunity);
        expect(testCommunity).toBeTruthy();
    });

    it("Should find the test lobby", () => {
        TestInstance.lobby = testCommunity.getLobbyByName(TestShared.config._testChannel);
        expect(TestInstance.lobby).toBeTruthy();
    });

    it("Should be able to subscribe to a lobby", () => {
        expect(TestInstance.lobby.isSubscribed()).toBe(false);
        TestInstance.lobby.subscribe();
        expect(TestInstance.lobby.isSubscribed()).toBe(true);
    });

    it("Should be able to send a message in a lobby", () => {
        TestInstance.lobby.sendPlainTextMessage("[UNIT] Should be able to send a message in a lobby");
    });

    it("Should get notified of messages in a subscribed lobby", (done) => {
        TestInstance.lobby.OnTextMessage(() => {
            TestInstance.lobby.closeOnTextMessage();
            done();
        });

        TestInstance.lobby.sendPlainTextMessage("[UNIT] Should get notified of messages in a subscribed lobby");
    });

    xit("Should be able to unsubscribe from a lobby", (done) => {
        TestInstance.lobby.OnTextMessage(() => {
            TestInstance.lobby.closeOnTextMessage();
            fail();
        });

        TestInstance.lobby.unSubscribe();
        expect(TestInstance.lobby.isSubscribed()).toBe(false);

        setTimeout(() => done(), 5000);
    });

});