import email from "infra/email";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
});

describe("Email Infrastructure", () => {
    test("Should send an email", async () => {
        await orchestrator.deleteAllEmails();

        await email.send({
            from: "TestFrom <from@test.com>",
            to: "TestTo <to@test.com>",
            subject: "Subject Test",
            text: "Body Text Test. Hello!",
        });
        await email.send({
            from: "TestFrom2 <from2@test.com>",
            to: "TestTo2 <to2@test.com>",
            subject: "Subject Test 2",
            text: "Body Text Test 2. Hello!",
        });

        const lastEmail = await orchestrator.getLastEmail();

        expect(lastEmail.sender).toBe("<from2@test.com>");
        expect(lastEmail.recipients[0]).toBe("<to2@test.com>");
        expect(lastEmail.subject).toBe("Subject Test 2");
        expect(lastEmail.text).toBe("Body Text Test 2. Hello!\n");
    });
});
