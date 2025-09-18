import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
});

describe("GET Status Endpoint", () => {
    describe("Anonymous user", () => {
        test("Retrieving current system status", async () => {
            const response = await fetch("http://localhost:3000/api/v1/status");
            const body = await response.json();
            const parsedUpdatedAt = new Date(body.updated_at).toISOString();

            expect(response.status).toBe(200);
            expect(body).toEqual(
                expect.objectContaining({
                    updated_at: expect.any(String),
                    dependencies: expect.objectContaining({
                        database: expect.objectContaining({
                            version: expect.any(String),
                            max_connections: expect.any(Number),
                            used_connections: expect.any(Number),
                        }),
                    }),
                }),
            );
            expect(body.dependencies.database.version).toMatch(/^16\./);
            expect(body.updated_at).toEqual(parsedUpdatedAt);
            expect(body.dependencies.database.max_connections).toEqual(100);
            expect(body.dependencies.database.used_connections).toEqual(1);
        });
    });
});
