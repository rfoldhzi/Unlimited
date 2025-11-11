module.exports = {
    transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
    // setupFiles: ["./setupTests.js"],
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"], // this is default, you can change based on your needs
    testPathIgnorePatterns: ["/node_modules/"],
    testTimeout: 5000, // this is the default value, you can increase it based on your needs.
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0
        }
    }, // optional
    collectCoverageFrom: [
        'handler/*.{js,jsx}',
        "*/handler/*.js"
        // you can add any folder where your code is
    ], // optional
    coveragePathIgnorePatterns: [
        "/node_modules/",
        // add any file/folder for which you don't want coverage to be calculated
    ] // optional
}