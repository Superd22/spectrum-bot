import { Broadcaster } from './../src/Spectrum/services/broadcaster.service';
import { TestInstance } from './_.instance';
import { TestShared } from './_.shared';

import { } from 'jasmine';


interface BroadcasterTest {
    broadcaster: Broadcaster;
}


describe("Broadcaster Service", function (this: BroadcasterTest) {

    TestShared.commonSetUp();
    it("Should instantiate", () => {
        this.broadcaster = Broadcaster.getInstance();

        expect(this.broadcaster instanceof Broadcaster).toBe(true);
        expect(this.broadcaster).toBeTruthy();
    });

    it("Should be able to declare new listeners and remove them", () => {
        let id = this.broadcaster.addListener("",() => {});
        expect(id).toBeGreaterThanOrEqual(0);
        this.broadcaster.removeListener(id);
    });

    

});

