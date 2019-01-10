import { Container } from "typedi";
import { SpectrumLobby } from "./../src/";
import { SpectrumChannel } from "./../src/";
import { SpectrumBroadcaster } from "./../src/";
import { SpectrumCommunity, SpectrumCommands } from "../src/";
import { TestInstance } from "./_.instance";
import { TestShared } from "./_.shared";

import {} from "jasmine";
import { SpectrumCommand } from "../src/Spectrum/components/api/decorators/spectrum-command.decorator";

describe("Organizations", () => {
    describe(`Management`, () => {
        describe(`Member list`, () => {
            it(`Should list memberlist`);
            it(`Should search through memberlist`);
        })
    })
});