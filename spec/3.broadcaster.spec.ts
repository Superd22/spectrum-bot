import { SpectrumBroadcaster } from './../src/';
import { TestInstance } from './_.instance';
import { TestShared } from './_.shared';

import { } from 'jasmine';


interface BroadcasterTest {
    broadcaster: SpectrumBroadcaster;
}


describe("Broadcaster Service", function (this: BroadcasterTest) {

    TestShared.commonSetUp();
    it("Should instantiate", () => {
        this.broadcaster = SpectrumBroadcaster.getInstance();

        expect(this.broadcaster instanceof SpectrumBroadcaster).toBe(true);
        expect(this.broadcaster).toBeTruthy();
    });

    it("Should be able to declare new listeners and remove them", () => {
        let id = this.broadcaster.addListener("",() => {});
        expect(id).toBeGreaterThanOrEqual(0);
        this.broadcaster.removeListener(id);
    });

    

});

