import { Container } from "typedi";
import { SpectrumLobby } from "./../src/";
import { SpectrumChannel } from "./../src/";
import { SpectrumBroadcaster } from "./../src/";
import { SpectrumCommunity, SpectrumCommands } from "../src/";
import { TestInstance } from "./_.instance";
import { TestShared } from "./_.shared";

import {} from "jasmine";
import { SpectrumCommand } from "../src/Spectrum/components/api/decorators/spectrum-command.decorator";

describe("Spectrum Commands", () => {
    TestShared.commonSetUp();

    let commands: SpectrumCommands;
    beforeEach(() => {
        commands = TestInstance.bot.getState().commands;
    });

    describe("Service", () => {
        it("Should expose the command service", async () => {
            expect(commands).toBeTruthy();
            expect(commands instanceof SpectrumCommands).toBe(true);
        });

        it("Should register commands through glob", async () => {
            await commands.registerCommands({ commands: ["spec/mock/commands/*.ts"] });

            const registered = commands.getCommandList();

            expect(registered.find(command => command.shortCode === "testCommand1")).toBeTruthy();
            expect(registered.find(command => command.shortCode === "testCommand2")).toBeTruthy();
        });

        it("Should register commands through array", async () => {
            const test3 = class {
                callback = () => {};
            };
            SpectrumCommand("test3")(test3);

            const test4 = class {
                callback = () => {};
            };
            SpectrumCommand("test4")(test4);
            await commands.registerCommands({ commands: [test3, test4] });

            const registered = commands.getCommandList();

            expect(registered.find(command => command.shortCode === "test3")).toBeTruthy();
            expect(registered.find(command => command.shortCode === "test4")).toBeTruthy();
        });

        it("Should not register commands that are not decorated", async () => {
            const test = class {
                callback = () => {};
            };

            await commands.registerCommands({ commands: [test] });

            const registered = commands.getCommandList();

            expect(registered.find(command => command.shortCode === "test5")).toBeUndefined();
        });

        it("Should call the callback provided on", done => {
            TestShared.testLobbyDependentSetUp();
            TestInstance.lobby = TestInstance.bot
                .getState()
                .getCommunityByName(TestShared.config._testCommunity)
                .getLobbyByName(TestShared.config._testLobby);
            commands.setPrefix("[UNIT]");

            const testCallback = class {
                callback = () => {
                    TestInstance.lobby.unSubscribe();
                    done();
                };
            };
            SpectrumCommand("test callback")(testCallback);

            commands.getCommandList();

            TestInstance.lobby.subscribe();
            TestInstance.lobby.sendPlainTextMessage("[UNIT] test callback");
        });
    });

    describe("Decorator", () => {
        it("Should decorate the class", () => {
            const test = class {
                callback = () => {};
            };
            SpectrumCommand("test")(test);
            expect(Reflect.getMetadata("spectrum-command", test)).toBe(true);
        });
    });
});
