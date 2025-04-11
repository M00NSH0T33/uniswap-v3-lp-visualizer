# Uniswap V3 Staggered LP Visualizer - User Guide

## Overview

The Uniswap V3 Staggered LP Visualizer is an interactive tool designed to help you understand how staggered and overlapping range liquidity positions in Uniswap V3 can create a more linear overall position. This guide will walk you through how to use the tool effectively.

## Getting Started

### Installation

1. Extract the `uniswap_v3_staggered_lp_visualizer.zip` file to a folder on your computer.
2. Open the `index.html` file in a modern web browser (Chrome, Firefox, Safari, or Edge).

No internet connection is required to run the tool once downloaded.

## Interface Overview

The interface is divided into several sections:

1. **Market Parameters** - Set the current ETH price and fee tier
2. **Position Configuration** - Configure up to 5 staggered LP positions
3. **Visualization Area** - View different aspects of your positions
4. **Position Analysis** - See metrics and comparisons
5. **Educational Resources** - Learn about concentrated liquidity concepts

## Using the Tool

### Setting Market Parameters

1. **Current ETH Price**: Enter the current ETH price in USDC. This affects where the current price line appears on the charts.
2. **Fee Tier**: Select the fee tier for the pool (0.01%, 0.05%, 0.3%, or 1%). The 0.05% tier is commonly used for ETH/USDC pairs.
3. **Price Scale**: Choose between linear and logarithmic price scales for the charts.

### Configuring Positions

1. **Number of Positions**: Use the slider to select how many positions you want to create (1-5).
2. For each position, set:
   - **Lower Bound**: The minimum price for the position
   - **Upper Bound**: The maximum price for the position
   - **Liquidity Allocation**: The percentage of your total liquidity allocated to this position

3. Click the **Update Visualization** button to apply your changes.

### Viewing Visualizations

The visualization area has four tabs:

1. **Liquidity**: Shows how liquidity is distributed across the price range
   - Each colored line represents a different position
   - The black line shows the combined liquidity

2. **Delta**: Shows how position value changes with respect to price
   - Delta = 1 means the position is 100% token0 (ETH)
   - Delta = 0 means the position is 100% token1 (USDC)
   - The smoother the combined delta curve, the more linear the position

3. **Gamma**: Shows the rate of change of delta
   - Higher gamma values indicate more non-linearity
   - Staggered positions distribute gamma across the price range
   - Lower absolute gamma values are better for linearity

4. **Linearity**: Compares position value to an ideal linear response
   - The green dashed line shows the ideal linear response
   - The purple line shows a single wide position
   - The pink line shows your staggered positions
   - The closer the pink line is to the green line, the more linear your position

### Understanding Position Analysis

The Position Analysis section provides metrics to evaluate your staggered positions:

1. **Combined Position Metrics**:
   - **Effective Price Range**: The total price range covered by all positions
   - **Linearity Score**: How close your combined position is to a perfect linear response (higher is better)
   - **Capital Efficiency**: How efficiently your capital is being used compared to a single position
   - **Average Delta**: The weighted average delta of all positions at the current price

2. **Comparison with Single Position**:
   - Side-by-side comparison between your staggered approach and a single wide position
   - Green values indicate improvements over the single position

## Strategies for Optimal Results

### Creating More Linear Positions

1. **Overlap Positions**: Ensure positions overlap to avoid gaps in liquidity
2. **Stagger Boundaries**: Place position boundaries at different price points
3. **Distribute Liquidity**: Allocate more liquidity to positions near the current price
4. **Use More Positions**: Generally, more positions (3-5) create a more linear response

### Example Configurations

#### Balanced 3-Position Strategy
- Position 1: Lower bound = Current price × 0.8, Upper bound = Current price × 1.0, Allocation = 33%
- Position 2: Lower bound = Current price × 0.9, Upper bound = Current price × 1.1, Allocation = 34%
- Position 3: Lower bound = Current price × 1.0, Upper bound = Current price × 1.2, Allocation = 33%

#### Wide Range 5-Position Strategy
- Position 1: Lower bound = Current price × 0.7, Upper bound = Current price × 0.9, Allocation = 15%
- Position 2: Lower bound = Current price × 0.8, Upper bound = Current price × 1.0, Allocation = 20%
- Position 3: Lower bound = Current price × 0.9, Upper bound = Current price × 1.1, Allocation = 30%
- Position 4: Lower bound = Current price × 1.0, Upper bound = Current price × 1.2, Allocation = 20%
- Position 5: Lower bound = Current price × 1.1, Upper bound = Current price × 1.3, Allocation = 15%

## Understanding the Math

### Delta Calculation

For a Uniswap V3 LP position with lower price Pa and upper price Pb:

```
Delta(S) = {
    1                                  if S < Pa
    K/S * (√(S/Pa) - 1)/(r - 1)       if Pa ≤ S ≤ Pb
    0                                  if S > Pb
}
```

Where:
- S is the current price
- K = √(Pa * Pb) is the geometric mean of the price range
- r = √(Pb/Pa) is the range factor

### Gamma Calculation

```
Gamma(S) = {
    0                                  if S < Pa
    -K/(2*S²) * 1/(r - 1)             if Pa ≤ S ≤ Pb
    0                                  if S > Pb
}
```

## Troubleshooting

### Common Issues

1. **Charts not displaying**: Make sure you have a modern browser with JavaScript enabled.
2. **Positions not updating**: Click the "Update Visualization" button after making changes.
3. **Unexpected behavior**: Try refreshing the page to reset all parameters.

## Additional Resources

To learn more about Uniswap V3 and concentrated liquidity:

1. [Uniswap V3 Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
2. [Uniswap V3 Documentation](https://docs.uniswap.org/concepts/protocol/concentrated-liquidity)
3. [Understanding the Value of Uniswap v3 Liquidity Positions](https://lambert-guillaume.medium.com/understanding-the-value-of-uniswap-v3-liquidity-positions-cdaaee127fe7)
4. [Gamma transforms: How to hedge squeeth using Uni V3](https://lambert-guillaume.medium.com/gamma-transforms-how-to-hedge-squeeth-using-uni-v3-da785cb8b378)

## Conclusion

The Uniswap V3 Staggered LP Visualizer helps you understand how multiple overlapping LP positions can create a more linear overall position. By experimenting with different configurations, you can develop strategies that optimize capital efficiency while maintaining a more predictable response to price changes.

Remember that this tool is for educational purposes and visualization only. Always do your own research before deploying actual liquidity on Uniswap V3.
