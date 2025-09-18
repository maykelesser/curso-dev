import dotenv from "dotenv";
import database from "infra/database";

dotenv.config();

describe("getSSLValues", () => {
    const { getSSLValues } = database;

    beforeEach(() => {
        delete process.env.POSTGRES_CA;
        delete process.env.NODE_ENV;
    });

    it("Should return an object with 'ca' key if POSTGRES_CA is set", () => {
        // Setting the environment variable
        process.env.POSTGRES_CA = "some-ca-value";

        // Executing the function
        const result = getSSLValues();

        // Checking the result
        expect(result).toEqual({ ca: "some-ca-value" });
    });

    it("Should return true if POSTGRES_CA is not set and NODE_ENV is 'production'", () => {
        // Setting the environment
        process.env.NODE_ENV = "production";

        // Executing the function
        const result = getSSLValues();

        // Verifying the result
        expect(result).toBe(true);
    });

    it("Should return false if POSTGRES_CA is not set and NODE_ENV is not 'production'", () => {
        // Setting the environment
        process.env.NODE_ENV = "development";

        // Executing the function
        const result = getSSLValues();

        // Verifying the result
        expect(result).toBe(false);
    });
});
