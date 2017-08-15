import { SpectrumBroadcaster } from './../src/';
import { SpectrumCommunity } from '../src/';
import { TestInstance } from './_.instance';
import { TestShared } from './_.shared';

import { } from 'jasmine';

describe("Channel (forum)", () => {
    TestShared.commonSetUp();
    TestShared.testChannelDependentSetUp();

    let testCommunity: SpectrumCommunity;

    it("Should find the test community", () => {
        testCommunity = TestInstance.bot.getState().getCommunityByName(TestShared.config._testCommunity);
        expect(testCommunity).toBeTruthy();
    });

    it("Should find the test channel", () => {
        TestInstance.channel = testCommunity.getChannel(Number(TestShared.config._testChannelId));
        expect(TestInstance.channel).toBeTruthy();
    });

});