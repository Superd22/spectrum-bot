import { SpectrumUser } from './../src/Spectrum/components/user.component';
import { SpectrumTextMessage } from './../src/Spectrum/components/textMessage.component';
import { Broadcaster } from './../src/Spectrum/services/broadcaster.service';
import { SpectrumCommunity } from './../src/Spectrum/components/community.component';
import { config } from './../app/config';
import { TestInstance } from './_.instance';
import { TestShared } from './_.shared';

import { } from 'jasmine';

describe("Text message", () => {
    TestShared.commonSetUp();
    TestShared.testLobbyDependentSetUp();

    describe("Text message parsing", () => {
        it("Should correctly parse plain text", () => {
            let msg = "test plain text";
            let text = { text: msg };
            let parsed = SpectrumTextMessage.generateContentStateFromText(text);

            // Text shouldn't have changed
            expect(text.text).toEqual(msg);
            // Text should have only one block
            expect(parsed.blocks.length).toBe(1);
            // Block should be the msg
            expect(parsed.blocks[0].text).toEqual(msg);
            // Should not have any entity
            expect(parsed.entityMap).toEqual({});
        });

        describe("Emojis", () => {
            it("Should correctly parse a single emoji", () => {
                let msgs = ["test single :ok: emoji", ":ok: test single emoji", "test single emoji :ok:", ":ok:"];

                msgs.forEach((msg) => {
                    let text = { text: msg };

                    let parsed = SpectrumTextMessage.generateContentStateFromText(text);

                    // Should have a single entity
                    let eMap = parsed.entityMap[0];
                    expect(eMap['data']).toBe(":ok:");
                    expect(eMap['type']).toBe("EMOJI");

                    // Should correctly have linked that entity to :ok:
                    expect(parsed.blocks[0]["entityRanges"][0]["key"]).toBe(0);
                    expect(parsed.blocks[0]["entityRanges"][0]["length"]).toBe(":ok:".length);
                    expect(parsed.blocks[0]["entityRanges"][0]["offset"]).toBe(msg.indexOf(":ok:"));
                });
            });

            it("Should correctly parse multiple emojis", () => {
                let msgs = ["test dual :ok: :ok: emoji", ":ok: :ok: dual single emoji", "test dual emoji :ok: :ok:", "test :ok: dual emoji :ok:",
                    ":ok: test :ok: dual emoji", ":ok: test dual emoji :ok:", ":ok::ok:", ":ok: :ok:"];

                msgs.forEach((msg) => {
                    let text = { text: msg };
                    let parsed = SpectrumTextMessage.generateContentStateFromText(text);

                    let eMap = parsed.entityMap[0];
                    expect(eMap['data']).toBe(":ok:");
                    expect(eMap['type']).toBe("EMOJI");

                    let offset = msg.indexOf(":ok:");
                    let length = ":ok:".length;

                    // Should correctly have linked that entity to :ok:
                    expect(parsed.blocks[0]["entityRanges"][0]["key"]).toBe(0);
                    expect(parsed.blocks[0]["entityRanges"][0]["length"]).toBe(length);
                    expect(parsed.blocks[0]["entityRanges"][0]["offset"]).toBe(offset);


                    // Should correctly have found the second entity
                    expect(parsed.blocks[0]["entityRanges"][1]["key"]).toBe(1);
                    expect(parsed.blocks[0]["entityRanges"][1]["length"]).toBe(length);
                    expect(parsed.blocks[0]["entityRanges"][1]["offset"]).toBe(msg.indexOf(":ok:", length + offset));
                });
            })
        });

        describe("Mentions", () => {
            it("Should correctly parse a mention", () => {
                let u: SpectrumUser = new SpectrumUser(TestInstance.bot.getState().getMember());
                let mention = u.mention();
                let msgs = [mention + " test mention", "test " + mention + " mention", "test mention " + mention, mention];

                msgs.forEach((msg) => {
                    let text = { text: msg };
                    let parsed = SpectrumTextMessage.generateContentStateFromText(text);

                    let eMap = parsed.entityMap[0];

                    expect(text.text).toBe(msg.replace(mention, "@" + u.getUser().nickname));

                    expect(eMap['data']['id']).toBe(u.getUser().id);
                    expect(eMap['type']).toBe("MENTION");

                    let offset = text.text.indexOf("@" + u.getUser().nickname);
                    let length = ("@" + u.getUser().nickname).length;

                    // Should correctly have linked that entity to our mention
                    expect(parsed.blocks[0]["entityRanges"][0]["key"]).toBe(0);
                    expect(parsed.blocks[0]["entityRanges"][0]["length"]).toBe(length);
                    expect(parsed.blocks[0]["entityRanges"][0]["offset"]).toBe(offset);
                });

            });

            it("Should correctly parse multiple mentions", () => {
                let u: SpectrumUser = new SpectrumUser(TestInstance.bot.getState().getMember());

                let mention = u.mention();
                let msgs = [mention + " " +  mention + " test mention", "test " + mention + mention + " mention", "test mention " + mention + mention,
                mention + " " + mention, mention + "test" + mention];

                msgs.forEach((msg) => {
                    let text = { text: msg };
                    let parsed = SpectrumTextMessage.generateContentStateFromText(text);

                    expect(text.text).toBe(msg.replace(new RegExp(mention, "g"), "@" + u.getUser().nickname));
                    
                    let eMap = parsed.entityMap[0];
                    expect(eMap['data']['id']).toBe(u.getUser().id);
                    expect(eMap['type']).toBe("MENTION");


                    let offset = text.text.indexOf("@" + u.getUser().nickname);
                    let length = ("@" + u.getUser().nickname).length;

                    // Should correctly have linked that entity to our mention
                    expect(parsed.blocks[0]["entityRanges"][0]["key"]).toBe(0);
                    expect(parsed.blocks[0]["entityRanges"][0]["length"]).toBe(length);
                    expect(parsed.blocks[0]["entityRanges"][0]["offset"]).toBe(offset);

                    expect(parsed.blocks[0]["entityRanges"][1]["key"]).toBe(1);
                    expect(parsed.blocks[0]["entityRanges"][1]["length"]).toBe(length);
                    expect(parsed.blocks[0]["entityRanges"][1]["offset"]).toBe(text.text.indexOf("@" + u.getUser().nickname, length + offset));
                });

            });
        });
    });

});