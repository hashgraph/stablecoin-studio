import { expect, test } from "bun:test";
import {
  DFNSConfig,
  FireblocksConfig,
} from "../../src/strategies/IStrategyConfig";
import { SignatureStrategyFactory } from "../../src/factories/SignatureStrategyFactory";
import { FireblocksStrategy } from "../../src/strategies/signature/FireblocksStrategy";
import { DFNSStrategy } from "../../src/strategies/signature/DFNSStrategy";

const API_KEY = "API_KEY";
const BASE_URL = "BASE_URL";
const SECRET_KEY_PATH = "SECRET_KEY_PATH";

test('SignatureStrategyFactory creates FireblocksStrategy for FireblocksConfig', () => {
    const strategyConfig = new FireblocksConfig(API_KEY,SECRET_KEY_PATH,BASE_URL);
    const strategy = SignatureStrategyFactory.createStrategy(strategyConfig);
    expect(strategy instanceof FireblocksStrategy);
});

test('SignatureStrategyFactory creates DFNSStrategy for DFNSConfig', () => {
    const strategyConfig = new DFNSConfig();
    const strategy = SignatureStrategyFactory.createStrategy(strategyConfig);
    expect(strategy instanceof DFNSStrategy);
});

test('SignatureStrategyFactory throws an error for unrecognized config', () => {
    const strategyConfig = {};
    try {
        SignatureStrategyFactory.createStrategy(strategyConfig);
        throw new Error('Test failed: should have thrown an error');
    } catch (error) {
        expect(error instanceof Error && error.message === "Unrecognized signature request type");
    }
});
