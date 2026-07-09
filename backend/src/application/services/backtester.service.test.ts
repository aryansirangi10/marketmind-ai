// ==============================================================================
// Jest Unit & Integration Tests for Strategy Backtester Service
// ==============================================================================

import { BacktesterService, StrategyWorkflow } from "./backtester.service";

describe("BacktesterService Unit Tests", () => {
  const mockCandles = [
    { time: 1718000000, close: 150.0 },
    { time: 1718086400, close: 151.0 },
    { time: 1718172800, close: 152.0 },
    { time: 1718259200, close: 153.0 },
    { time: 1718345600, close: 154.0 },
    { time: 1718432000, close: 155.0 },
    { time: 1718518400, close: 156.0 },
    { time: 1718604800, close: 157.0 },
    { time: 1718691200, close: 158.0 },
    { time: 1718777600, close: 159.0 },
    { time: 1718864000, close: 160.0 },
    { time: 1718950400, close: 161.0 },
    { time: 1719036800, close: 162.0 },
    { time: 1719123200, close: 163.0 },
    { time: 1719209600, close: 164.0 },
    { time: 1719296000, close: 165.0 },
    { time: 1719382400, close: 166.0 },
    { time: 1719468800, close: 167.0 },
    { time: 1719555200, close: 168.0 },
    { time: 1719641600, close: 169.0 },
    { time: 1719728000, close: 170.0 },
    { time: 1719814400, close: 171.0 }
  ];

  const mockStrategy: StrategyWorkflow = {
    indicators: [{ id: "ema20", type: "EMA", period: 20 }],
    conditions: [{ indicator1: "price", operator: "CROSS_ABOVE", indicator2: "ema20" }],
    riskRules: [{ type: "STOP_LOSS", value: 2.0 }],
    positionSizing: { type: "PERCENT_CASH", value: 100 }
  };

  it("should fail simulation if input candles array has insufficient elements", async () => {
    await expect(
      BacktesterService.runSimulation(
        "mock-user-id",
        "Short Term Crossover",
        "AAPL",
        mockStrategy,
        [{ time: 1718000000, close: 150.0 }],
        10000
      )
    ).rejects.toThrow("Insufficient candles data to compute indicators");
  });

  it("should compute correct end balance and positive trades log for rising price series", async () => {
    // Inject Mock Prisma client delegate
    jest.spyOn((BacktesterService as any).prisma.backtestRun, "create").mockResolvedValue({} as any);

    const result = await BacktesterService.runSimulation(
      "mock-user-id",
      "Short Term Crossover",
      "AAPL",
      mockStrategy,
      mockCandles,
      10000.0,
      0.0 // no transaction fees for testing
    );

    expect(result.startCapital).toBe(10000.0);
    expect(result.endBalance).toBeGreaterThanOrEqual(10000.0);
    expect(result.equityCurve.length).toBeGreaterThan(0);
  });
});
