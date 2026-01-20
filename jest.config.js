/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/*.test.ts"],
    reporters: [
        "default",
        [
            "jest-junit",
            { outputDirectory: "test-results", outputName: "junit.xml" },
        ],
    ],
};
