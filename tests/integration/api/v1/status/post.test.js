import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
});

describe("POST Status Endpoint", () => {
    describe("Anonymous user", () => {
        test("Block POST to be executed", async () => {
            const response = await fetch(
                "http://localhost:3000/api/v1/status",
                {
                    method: "POST",
                },
            );
            const body = await response.json();

            expect(response.status).toBe(405);
            expect(body).toEqual({
                name: "MethodNotAllowedError",
                message: "Method not allowed to this endpoint",
                action: "Check if the HTTP method is valid for this endpoint",
                status_code: 405,
            });
        });
    });
});
