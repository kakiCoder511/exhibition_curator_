const nextJest = require("next/jest");
const create = nextJest({ dir: "./" });
module.exports = create({
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
});
