/**
 * Uniswap V3 Staggered LP Visualizer
 * JavaScript for LP range calculations and visualizations
 */

// Global variables
let positions = [];
let currentPrice = 3000;
let feeTier = 0.05;
let priceScale = 'linear';
let numPositions = 3;
let charts = {};

// Constants
const TICK_BASE = 1.0001;
const SQRT_PRICE_FACTOR = Math.sqrt(TICK_BASE);

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize positions
    updatePositionsFromInputs();
    
    // Initialize charts
    initializeCharts();
    
    // Update visualizations
    updateVisualizations();
});

/**
 * Set up event listeners for user interactions
 */
function setupEventListeners() {
    // Update button
    document.getElementById('updateButton').addEventListener('click', function() {
        updatePositionsFromInputs();
        updateVisualizations();
    });
    
    // Number of positions slider
    document.getElementById('numPositions').addEventListener('input', function() {
        numPositions = parseInt(this.value);
        updatePositionVisibility();
        updateLiquidityAllocations();
    });
    
    // Liquidity allocation sliders
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`liquidity${i}`).addEventListener('input', function() {
            document.getElementById(`liquidity${i}Value`).textContent = `${this.value}%`;
        });
    }
    
    // Market parameters
    document.getElementById('currentPrice').addEventListener('change', function() {
        currentPrice = parseFloat(this.value);
    });
    
    document.getElementById('feeTier').addEventListener('change', function() {
        feeTier = parseFloat(this.value);
    });
    
    document.getElementById('priceScale').addEventListener('change', function() {
        priceScale = this.value;
        updateVisualizations();
    });
    
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        updateVisualizations();
    });
    
    // Help button
    document.getElementById('helpButton').addEventListener('click', function() {
        const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
        helpModal.show();
    });
    
    // Tab switching
    document.querySelectorAll('#visualizationTabs .nav-link').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('active');
            const tabId = this.getAttribute('href');
            
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Show the selected tab pane
            document.querySelector(tabId).classList.add('show', 'active');
            
            // Remove active class from other tabs
            document.querySelectorAll('#visualizationTabs .nav-link').forEach(otherTab => {
                if (otherTab !== this) {
                    otherTab.classList.remove('active');
                }
            });
        });
    });
}

/**
 * Update position visibility based on the number of positions selected
 */
function updatePositionVisibility() {
    for (let i = 1; i <= 5; i++) {
        const positionElement = document.getElementById(`position${i}`);
        if (i <= numPositions) {
            positionElement.classList.remove('d-none');
        } else {
            positionElement.classList.add('d-none');
        }
    }
}

/**
 * Update liquidity allocations to ensure they sum to 100%
 */
function updateLiquidityAllocations() {
    // Calculate equal distribution
    const equalShare = Math.floor(100 / numPositions);
    const remainder = 100 - (equalShare * numPositions);
    
    // Set values for visible positions
    for (let i = 1; i <= numPositions; i++) {
        const slider = document.getElementById(`liquidity${i}`);
        const valueDisplay = document.getElementById(`liquidity${i}Value`);
        
        // Last position gets the remainder
        const value = (i === numPositions) ? equalShare + remainder : equalShare;
        
        slider.value = value;
        valueDisplay.textContent = `${value}%`;
    }
}

/**
 * Update positions array from input values
 */
function updatePositionsFromInputs() {
    positions = [];
    currentPrice = parseFloat(document.getElementById('currentPrice').value);
    feeTier = parseFloat(document.getElementById('feeTier').value);
    
    for (let i = 1; i <= numPositions; i++) {
        const lowerBound = parseFloat(document.getElementById(`lowerBound${i}`).value);
        const upperBound = parseFloat(document.getElementById(`upperBound${i}`).value);
        const liquidityPercentage = parseFloat(document.getElementById(`liquidity${i}`).value);
        
        positions.push({
            id: i,
            lowerBound: lowerBound,
            upperBound: upperBound,
            liquidityPercentage: liquidityPercentage,
            // Calculate additional properties
            geometricMean: Math.sqrt(lowerBound * upperBound),
            rangeFactor: Math.sqrt(upperBound / lowerBound)
        });
    }
    
    // Update analysis metrics
    updateAnalysisMetrics();
}

/**
 * Initialize D3.js charts
 */
function initializeCharts() {
    // Initialize liquidity chart
    charts.liquidity = initializeLiquidityChart();
    
    // Initialize delta chart
    charts.delta = initializeDeltaChart();
    
    // Initialize gamma chart
    charts.gamma = initializeGammaChart();
    
    // Initialize linearity chart
    charts.linearity = initializeLinearityChart();
}

/**
 * Initialize the liquidity distribution chart
 */
function initializeLiquidityChart() {
    const container = document.getElementById('liquidityChart');
    const width = container.clientWidth;
    const height = container.clientHeight || 400;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create chart group
    const chart = svg.append('g')
        .attr('transform', `translate(${width * 0.1}, ${height * 0.1})`);
    
    // Create axes
    const xScale = d3.scaleLinear()
        .range([0, width * 0.8]);
    
    const yScale = d3.scaleLinear()
        .range([height * 0.8, 0]);
    
    const xAxis = chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${height * 0.8})`);
    
    const yAxis = chart.append('g')
        .attr('class', 'axis y-axis');
    
    // Add grid lines
    const xGrid = chart.append('g')
        .attr('class', 'grid x-grid');
    
    const yGrid = chart.append('g')
        .attr('class', 'grid y-grid');
    
    // Add chart title
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Liquidity Distribution');
    
    // Add x-axis label
    svg.append('text')
        .attr('class', 'axis-label x-label')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .text('Price (USDC)');
    
    // Add y-axis label
    svg.append('text')
        .attr('class', 'axis-label y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text('Liquidity');
    
    // Create tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip');
    
    return {
        svg,
        chart,
        xScale,
        yScale,
        xAxis,
        yAxis,
        xGrid,
        yGrid,
        tooltip,
        width,
        height
    };
}

/**
 * Initialize the delta chart
 */
function initializeDeltaChart() {
    const container = document.getElementById('deltaChart');
    const width = container.clientWidth;
    const height = container.clientHeight || 400;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create chart group
    const chart = svg.append('g')
        .attr('transform', `translate(${width * 0.1}, ${height * 0.1})`);
    
    // Create axes
    const xScale = d3.scaleLinear()
        .range([0, width * 0.8]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height * 0.8, 0]);
    
    const xAxis = chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${height * 0.8})`);
    
    const yAxis = chart.append('g')
        .attr('class', 'axis y-axis');
    
    // Add grid lines
    const xGrid = chart.append('g')
        .attr('class', 'grid x-grid');
    
    const yGrid = chart.append('g')
        .attr('class', 'grid y-grid');
    
    // Add chart title
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Delta (Rate of Change of Position Value)');
    
    // Add x-axis label
    svg.append('text')
        .attr('class', 'axis-label x-label')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .text('Price (USDC)');
    
    // Add y-axis label
    svg.append('text')
        .attr('class', 'axis-label y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text('Delta');
    
    // Create tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip');
    
    return {
        svg,
        chart,
        xScale,
        yScale,
        xAxis,
        yAxis,
        xGrid,
        yGrid,
        tooltip,
        width,
        height
    };
}

/**
 * Initialize the gamma chart
 */
function initializeGammaChart() {
    const container = document.getElementById('gammaChart');
    const width = container.clientWidth;
    const height = container.clientHeight || 400;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create chart group
    const chart = svg.append('g')
        .attr('transform', `translate(${width * 0.1}, ${height * 0.1})`);
    
    // Create axes
    const xScale = d3.scaleLinear()
        .range([0, width * 0.8]);
    
    const yScale = d3.scaleLinear()
        .range([height * 0.8, 0]);
    
    const xAxis = chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${height * 0.8})`);
    
    const yAxis = chart.append('g')
        .attr('class', 'axis y-axis');
    
    // Add grid lines
    const xGrid = chart.append('g')
        .attr('class', 'grid x-grid');
    
    const yGrid = chart.append('g')
        .attr('class', 'grid y-grid');
    
    // Add chart title
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Gamma (Rate of Change of Delta)');
    
    // Add x-axis label
    svg.append('text')
        .attr('class', 'axis-label x-label')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .text('Price (USDC)');
    
    // Add y-axis label
    svg.append('text')
        .attr('class', 'axis-label y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text('Gamma');
    
    // Create tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip');
    
    return {
        svg,
        chart,
        xScale,
        yScale,
        xAxis,
        yAxis,
        xGrid,
        yGrid,
        tooltip,
        width,
        height
    };
}

/**
 * Initialize the linearity chart
 */
function initializeLinearityChart() {
    const container = document.getElementById('linearityChart');
    const width = container.clientWidth;
    const height = container.clientHeight || 400;
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create chart group
    const chart = svg.append('g')
        .attr('transform', `translate(${width * 0.1}, ${height * 0.1})`);
    
    // Create axes
    const xScale = d3.scaleLinear()
        .range([0, width * 0.8]);
    
    const yScale = d3.scaleLinear()
        .range([height * 0.8, 0]);
    
    const xAxis = chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${height * 0.8})`);
    
    const yAxis = chart.append('g')
        .attr('class', 'axis y-axis');
    
    // Add grid lines
    const xGrid = chart.append('g')
        .attr('class', 'grid x-grid');
    
    const yGrid = chart.append('g')
        .attr('class', 'grid y-grid');
    
    // Add chart title
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Position Value Linearity');
    
    // Add x-axis label
    svg.append('text')
        .attr('class', 'axis-label x-label')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .text('Price (USDC)');
    
    // Add y-axis label
    svg.append('text')
        .attr('class', 'axis-label y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .text('Position Value');
    
    // Create tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip');
    
    return {
        svg,
        chart,
        xScale,
        yScale,
        xAxis,
        yAxis,
        xGrid,
        yGrid,
        tooltip,
        width,
        height
    };
}

/**
 * Update all visualizations
 */
function updateVisualizations() {
    updateLiquidityChart();
    updateDeltaChart();
    updateGammaChart();
    updateLinearityChart();
}

/**
 * Update the liquidity distribution chart
 */
function updateLiquidityChart() {
    const chart = charts.liquidity;
    
    // Determine price range for x-axis
    const minPrice = Math.min(...positions.map(p => p.lowerBound)) * 0.9;
    const maxPrice = Math.max(...positions.map(p => p.upperBound)) * 1.1;
    
    // Update scales
    if (priceScale === 'logarithmic') {
        chart.xScale = d3.scaleLog()
            .domain([minPrice, maxPrice])
            .range([0, chart.width * 0.8]);
    } else {
        chart.xScale = d3.scaleLinear()
            .domain([minPrice, maxPrice])
            .range([0, chart.width * 0.8]);
    }
    
    // Generate data points for each position
    const liquidityData = generateLiquidityData(minPrice, maxPrice);
    
    // Find maximum liquidity value for y-axis scaling
    const maxLiquidity = Math.max(
        ...liquidityData.combined.map(d => d.liquidity),
        ...positions.flatMap(p => liquidityData[p.id].map(d => d.liquidity))
    ) * 1.1;
    
    chart.yScale.domain([0, maxLiquidity]);
    
    // Update axes
    chart.xAxis.call(d3.axisBottom(chart.xScale));
    chart.yAxis.call(d3.axisLeft(chart.yScale));
    
    // Update grid lines
    chart.xGrid.call(
        d3.axisBottom(chart.xScale)
            .tickSize(-chart.height * 0.8)
            .tickFormat('')
    );
    
    chart.yGrid.call(
        d3.axisLeft(chart.yScale)
            .tickSize(-chart.width * 0.8)
            .tickFormat('')
    );
    
    // Create line generator
    const line = d3.line()
        .x(d => chart.xScale(d.price))
        .y(d => chart.yScale(d.liquidity))
        .curve(d3.curveMonotoneX);
    
    // Remove existing lines
    chart.chart.selectAll('.liquidity-line').remove();
    chart.chart.selectAll('.liquidity-area').remove();
    
    // Create area generator
    const area = d3.area()
        .x(d => chart.xScale(d.price))
        .y0(chart.yScale(0))
        .y1(d => chart.yScale(d.liquidity))
        .curve(d3.curveMonotoneX);
    
    // Draw liquidity areas for each position
    positions.forEach(position => {
        chart.chart.append('path')
            .datum(liquidityData[position.id])
            .attr('class', `liquidity-area position-${position.id}`)
            .attr('d', area)
            .style('fill-opacity', 0.3);
    });
    
    // Draw liquidity lines for each position
    positions.forEach(position => {
        chart.chart.append('path')
            .datum(liquidityData[position.id])
            .attr('class', `liquidity-line position-${position.id}`)
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke-width', 2);
    });
    
    // Draw combined liquidity line
    chart.chart.append('path')
        .datum(liquidityData.combined)
        .attr('class', 'liquidity-line combined-position')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke-width', 3);
    
    // Draw current price line
    chart.chart.selectAll('.current-price-line').remove();
    chart.chart.append('line')
        .attr('class', 'current-price-line')
        .attr('x1', chart.xScale(currentPrice))
        .attr('y1', 0)
        .attr('x2', chart.xScale(currentPrice))
        .attr('y2', chart.height * 0.8);
    
    // Add current price label
    chart.chart.selectAll('.current-price-label').remove();
    chart.chart.append('text')
        .attr('class', 'current-price-label')
        .attr('x', chart.xScale(currentPrice))
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .text(`Current: $${currentPrice}`);
}

/**
 * Update the delta chart
 */
function updateDeltaChart() {
    const chart = charts.delta;
    
    // Determine price range for x-axis
    const minPrice = Math.min(...positions.map(p => p.lowerBound)) * 0.9;
    const maxPrice = Math.max(...positions.map(p => p.upperBound)) * 1.1;
    
    // Update scales
    if (priceScale === 'logarithmic') {
        chart.xScale = d3.scaleLog()
            .domain([minPrice, maxPrice])
            .range([0, chart.width * 0.8]);
    } else {
        chart.xScale = d3.scaleLinear()
            .domain([minPrice, maxPrice])
            .range([0, chart.width * 0.8]);
    }
    
    // Generate data points for delta
    const deltaData = generateDeltaData(minPrice, maxPrice);
    
    // Update axes
    chart.xAxis.call(d3.axisBottom(chart.xScale));
    chart.yAxis.call(d3.axisLeft(chart.yScale));
    
    // Update grid lines
    chart.xGrid.call(
        d3.axisBottom(chart.xScale)
            .tickSize(-chart.height * 0.8)
            .tickFormat('')
    );
    
    chart.yGrid.call(
        d3.axisLeft(chart.yScale)
            .tickSize(-chart.width * 0.8)
            .tickFormat('')
    );
    
    // Create line generator
    const line = d3.line()
        .x(d => chart.xScale(d.price))
        .y(d => chart.yScale(d.delta))
        .curve(d3.curveMonotoneX);
    
    // Remove existing lines
    chart.chart.selectAll('.delta-line').remove();
    
    // Draw delta lines for each position
    positions.forEach(position => {
        chart.chart.append('path')
            .datum(deltaData[position.id])
            .attr('class', `delta-line position-${position.id}`)
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke-width', 2);
    });
    
    // Draw combined delta line
    chart.chart.append('path')
        .datum(deltaData.combined)
        .attr('class', 'delta-line combined-position')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke-width', 3);
    
    // Draw current price line
    chart.chart.selectAll('.current-price-line').remove();
    chart.chart.append('line')
        .attr('class', 'current-price-line')
        .attr('x1', chart.xScale(currentPrice))
        .attr('y1', 0)
        .attr('x2', chart.xScale(currentPrice))
        .attr('y2', chart.height * 0.8);
    
    // Add current price label
    chart.chart.selectAll('.current-price-label').remove();
    chart.chart.append('text')
        .attr('class', 'current-price-label')
        .attr('x', chart.xScale(currentPrice))
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .text(`Current: $${currentPrice}`);
}

/**
 * Update the gamma chart
 */
function updateGammaChart() {
    const chart = charts.gamma;
    
    // Determine price range for x-axis
    const minPrice = Math.min(...positions.map(p => p.lowerBound)) * 0.9;
    const maxPrice = Math.max(...positions.map(p => p.upperBound)) * 1.1;
    
    // Update scales
    if (priceScale === 'logarithmic') {
        chart.xScale = d3.scaleLog()
            .domain([minPrice, maxPrice])
            .range([0, chart.width * 0.8]);
    } else {
        chart.xScale = d3.scaleLinear()
            .domain([minPrice, maxPrice])
            .range([0, chart.width * 0.8]);
    }
    
    // Generate data points for gamma
    const gammaData = generateGammaData(minPrice, maxPrice);
    
    // Find maximum gamma value for y-axis scaling
    const maxGamma = Math.max(
        ...gammaData.combined.map(d => Math.abs(d.gamma)),
        ...positions.flatMap(p => gammaData[p.id].map(d => Math.abs(d.gamma)))
    ) * 1.1;
    
    chart.yScale.domain([-maxGamma, 0]);
    
    // Update axes
    chart.xAxis.call(d3.axisBottom(chart.xScale));
    chart.yAxis.call(d3.axisLeft(chart.yScale));
    
    // Update grid lines
    chart.xGrid.call(
        d3.axisBottom(chart.xScale)
            .tickSize(-chart.height * 0.8)
            .tickFormat('')
    );
    
    chart.yGrid.call(
        d3.axisLeft(chart.yScale)
            .tickSize(-chart.width * 0.8)
            .tickFormat('')
    );
    
    // Create line generator
    const line = d3.line()
        .x(d => chart.xScale(d.price))
        .y(d => chart.yScale(d.gamma))
        .curve(d3.curveMonotoneX);
    
    // Remove existing lines
    chart.chart.selectAll('.gamma-line').remove();
    
    // Draw gamma lines for each position
    positions.forEach(position => {
        chart.chart.append('path')
            .datum(gammaData[position.id])
            .attr('class', `gamma-line position-${position.id}`)
            .attr('d', line)
            .style('fill', 'none')
            .style('stroke-width', 2);
    });
    
    // Draw combined gamma line
    chart.chart.append('path')
        .datum(gammaData.combined)
        .attr('class', 'gamma-line combined-position')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke-width', 3);
    
    // Draw current price line
    chart.chart.selectAll('.current-price-line').remove();
    chart.chart.append('line')
        .attr('class', 'current-price-line')
        .attr('x1', chart.xScale(currentPrice))
        .attr('y1', 0)
        .attr('x2', chart.xScale(currentPrice))
        .attr('y2', chart.height * 0.8);
    
    // Add current price label
    chart.chart.selectAll('.current-price-label').remove();
    chart.chart.append('text')
        .attr('class', 'current-price-label')
        .attr('x', chart.xScale(currentPrice))
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .text(`Current: $${currentPrice}`);
}

/**
 * Update the linearity chart
 */
function updateLinearityChart() {
    const chart = charts.linearity;
    
    // Determine price range for x-axis
    const minPrice = Math.min(...positions.map(p => p.lowerBound)) * 0.9;
    const maxPrice = Math.max(...positions.map(p => p.upperBound)) * 1.1;
    
    // Update scales
    if (priceScale === 'logarithmic') {
        chart.xScale = d3.scaleLog()
            .domain([minPrice, maxPrice])
            .range([0, chart.width * 0.8]);
    } else {
        chart.xScale = d3.scaleLinear()
            .domain([minPrice, maxPrice])
            .range([0, chart.width * 0.8]);
    }
    
    // Generate data points for position value
    const valueData = generatePositionValueData(minPrice, maxPrice);
    
    // Find maximum value for y-axis scaling
    const maxValue = Math.max(
        ...valueData.combined.map(d => d.value),
        ...valueData.ideal.map(d => d.value),
        ...valueData.single.map(d => d.value)
    ) * 1.1;
    
    chart.yScale.domain([0, maxValue]);
    
    // Update axes
    chart.xAxis.call(d3.axisBottom(chart.xScale));
    chart.yAxis.call(d3.axisLeft(chart.yScale));
    
    // Update grid lines
    chart.xGrid.call(
        d3.axisBottom(chart.xScale)
            .tickSize(-chart.height * 0.8)
            .tickFormat('')
    );
    
    chart.yGrid.call(
        d3.axisLeft(chart.yScale)
            .tickSize(-chart.width * 0.8)
            .tickFormat('')
    );
    
    // Create line generator
    const line = d3.line()
        .x(d => chart.xScale(d.price))
        .y(d => chart.yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    // Remove existing lines
    chart.chart.selectAll('.value-line').remove();
    
    // Draw ideal linear line
    chart.chart.append('path')
        .datum(valueData.ideal)
        .attr('class', 'value-line ideal-line')
        .attr('d', line)
        .style('fill', 'none');
    
    // Draw single position line
    chart.chart.append('path')
        .datum(valueData.single)
        .attr('class', 'value-line single-position')
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', 'var(--secondary-color)')
        .style('stroke-width', 2);
    
    // Draw combined position line
    chart.chart.append('path')
        .datum(valueData.combined)
        .attr('class', 'value-line actual-line')
        .attr('d', line)
        .style('fill', 'none');
    
    // Draw current price line
    chart.chart.selectAll('.current-price-line').remove();
    chart.chart.append('line')
        .attr('class', 'current-price-line')
        .attr('x1', chart.xScale(currentPrice))
        .attr('y1', 0)
        .attr('x2', chart.xScale(currentPrice))
        .attr('y2', chart.height * 0.8);
    
    // Add current price label
    chart.chart.selectAll('.current-price-label').remove();
    chart.chart.append('text')
        .attr('class', 'current-price-label')
        .attr('x', chart.xScale(currentPrice))
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .text(`Current: $${currentPrice}`);
    
    // Add legend
    chart.chart.selectAll('.linearity-legend').remove();
    const legend = chart.chart.append('g')
        .attr('class', 'linearity-legend')
        .attr('transform', `translate(${chart.width * 0.6}, 20)`);
    
    // Ideal line
    legend.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('class', 'ideal-line');
    
    legend.append('text')
        .attr('x', 25)
        .attr('y', 5)
        .text('Ideal Linear');
    
    // Single position
    legend.append('line')
        .attr('x1', 0)
        .attr('y1', 20)
        .attr('x2', 20)
        .attr('y2', 20)
        .style('stroke', 'var(--secondary-color)')
        .style('stroke-width', 2);
    
    legend.append('text')
        .attr('x', 25)
        .attr('y', 25)
        .text('Single Position');
    
    // Combined position
    legend.append('line')
        .attr('x1', 0)
        .attr('y1', 40)
        .attr('x2', 20)
        .attr('y2', 40)
        .attr('class', 'actual-line');
    
    legend.append('text')
        .attr('x', 25)
        .attr('y', 45)
        .text('Staggered Positions');
}

/**
 * Generate liquidity data for visualization
 */
function generateLiquidityData(minPrice, maxPrice) {
    const numPoints = 200;
    const priceStep = (maxPrice - minPrice) / numPoints;
    
    // Initialize result object
    const result = {
        combined: []
    };
    
    // Initialize combined data array
    for (let i = 0; i <= numPoints; i++) {
        const price = minPrice + i * priceStep;
        result.combined.push({
            price: price,
            liquidity: 0
        });
    }
    
    // Generate data for each position
    positions.forEach(position => {
        const positionData = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const price = minPrice + i * priceStep;
            let liquidity = 0;
            
            // Calculate liquidity based on price range
            if (price >= position.lowerBound && price <= position.upperBound) {
                // Normalize by position's liquidity percentage
                liquidity = position.liquidityPercentage;
            }
            
            positionData.push({
                price: price,
                liquidity: liquidity
            });
            
            // Add to combined liquidity
            result.combined[i].liquidity += liquidity;
        }
        
        result[position.id] = positionData;
    });
    
    return result;
}

/**
 * Generate delta data for visualization
 */
function generateDeltaData(minPrice, maxPrice) {
    const numPoints = 200;
    const priceStep = (maxPrice - minPrice) / numPoints;
    
    // Initialize result object
    const result = {
        combined: []
    };
    
    // Initialize combined data array
    for (let i = 0; i <= numPoints; i++) {
        result.combined.push({
            price: minPrice + i * priceStep,
            delta: 0
        });
    }
    
    // Generate data for each position
    positions.forEach(position => {
        const positionData = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const price = minPrice + i * priceStep;
            let delta = calculateDelta(position, price);
            
            positionData.push({
                price: price,
                delta: delta
            });
            
            // Add weighted delta to combined delta
            result.combined[i].delta += delta * (position.liquidityPercentage / 100);
        }
        
        result[position.id] = positionData;
    });
    
    return result;
}

/**
 * Generate gamma data for visualization
 */
function generateGammaData(minPrice, maxPrice) {
    const numPoints = 200;
    const priceStep = (maxPrice - minPrice) / numPoints;
    
    // Initialize result object
    const result = {
        combined: []
    };
    
    // Initialize combined data array
    for (let i = 0; i <= numPoints; i++) {
        result.combined.push({
            price: minPrice + i * priceStep,
            gamma: 0
        });
    }
    
    // Generate data for each position
    positions.forEach(position => {
        const positionData = [];
        
        for (let i = 0; i <= numPoints; i++) {
            const price = minPrice + i * priceStep;
            let gamma = calculateGamma(position, price);
            
            positionData.push({
                price: price,
                gamma: gamma
            });
            
            // Add weighted gamma to combined gamma
            result.combined[i].gamma += gamma * (position.liquidityPercentage / 100);
        }
        
        result[position.id] = positionData;
    });
    
    return result;
}

/**
 * Generate position value data for visualization
 */
function generatePositionValueData(minPrice, maxPrice) {
    const numPoints = 200;
    const priceStep = (maxPrice - minPrice) / numPoints;
    
    // Initialize result object
    const result = {
        combined: [],
        ideal: [],
        single: []
    };
    
    // Create single wide position for comparison
    const singlePosition = {
        lowerBound: Math.min(...positions.map(p => p.lowerBound)),
        upperBound: Math.max(...positions.map(p => p.upperBound)),
        geometricMean: Math.sqrt(
            Math.min(...positions.map(p => p.lowerBound)) * 
            Math.max(...positions.map(p => p.upperBound))
        ),
        rangeFactor: Math.sqrt(
            Math.max(...positions.map(p => p.upperBound)) / 
            Math.min(...positions.map(p => p.lowerBound))
        )
    };
    
    // Generate data points
    for (let i = 0; i <= numPoints; i++) {
        const price = minPrice + i * priceStep;
        
        // Calculate combined position value
        let combinedValue = 0;
        positions.forEach(position => {
            combinedValue += calculatePositionValue(position, price) * (position.liquidityPercentage / 100);
        });
        
        // Calculate single position value
        const singleValue = calculatePositionValue(singlePosition, price);
        
        // Calculate ideal linear value (straight line from min to max)
        const idealValue = (price - minPrice) / (maxPrice - minPrice) * 
            calculatePositionValue(singlePosition, maxPrice);
        
        result.combined.push({
            price: price,
            value: combinedValue
        });
        
        result.single.push({
            price: price,
            value: singleValue
        });
        
        result.ideal.push({
            price: price,
            value: idealValue
        });
    }
    
    return result;
}

/**
 * Calculate delta for a position at a given price
 */
function calculateDelta(position, price) {
    if (price < position.lowerBound) {
        return 1; // 100% token0
    } else if (price > position.upperBound) {
        return 0; // 0% token0
    } else {
        // Within range: K/S * (√(S/Pa) - 1)/(r - 1)
        const K = position.geometricMean;
        const r = position.rangeFactor;
        return (K / price) * (Math.sqrt(price / position.lowerBound) - 1) / (r - 1);
    }
}

/**
 * Calculate gamma for a position at a given price
 */
function calculateGamma(position, price) {
    if (price < position.lowerBound || price > position.upperBound) {
        return 0; // Gamma is zero outside the range
    } else {
        // Within range: -K/(2*S²) * 1/(r - 1)
        const K = position.geometricMean;
        const r = position.rangeFactor;
        return -K / (2 * price * price) * (1 / (r - 1));
    }
}

/**
 * Calculate position value at a given price
 */
function calculatePositionValue(position, price) {
    if (price < position.lowerBound) {
        // Below range: value = price
        return price;
    } else if (price > position.upperBound) {
        // Above range: value = upperBound
        return position.upperBound;
    } else {
        // Within range: value based on square root formula
        const sqrtPrice = Math.sqrt(price);
        const sqrtLower = Math.sqrt(position.lowerBound);
        const sqrtUpper = Math.sqrt(position.upperBound);
        
        // Simplified formula for demonstration
        return 2 * (
            (sqrtPrice - sqrtLower) / (sqrtUpper - sqrtLower) * position.upperBound +
            (sqrtUpper - sqrtPrice) / (sqrtUpper - sqrtLower) * position.lowerBound
        );
    }
}

/**
 * Update analysis metrics based on current positions
 */
function updateAnalysisMetrics() {
    // Calculate effective price range
    const minPrice = Math.min(...positions.map(p => p.lowerBound));
    const maxPrice = Math.max(...positions.map(p => p.upperBound));
    document.getElementById('effectivePriceRange').textContent = `$${minPrice.toFixed(0)} - $${maxPrice.toFixed(0)}`;
    
    // Calculate linearity score
    const linearityScore = calculateLinearityScore();
    document.getElementById('linearityScore').textContent = `${linearityScore.toFixed(0)}%`;
    document.getElementById('staggeredLinearity').textContent = `${linearityScore.toFixed(0)}%`;
    
    // Calculate single position linearity
    const singleLinearityScore = calculateSinglePositionLinearityScore();
    document.getElementById('singleLinearity').textContent = `${singleLinearityScore.toFixed(0)}%`;
    
    // Calculate linearity difference
    const linearityDiff = linearityScore - singleLinearityScore;
    const linearityDiffElement = document.getElementById('linearityDiff');
    linearityDiffElement.textContent = linearityDiff > 0 ? `+${linearityDiff.toFixed(0)}%` : `${linearityDiff.toFixed(0)}%`;
    linearityDiffElement.className = linearityDiff > 0 ? 'text-success' : 'text-danger';
    
    // Calculate capital efficiency
    const capitalEfficiency = calculateCapitalEfficiency();
    document.getElementById('capitalEfficiency').textContent = `${capitalEfficiency.toFixed(1)}x`;
    document.getElementById('staggeredEfficiency').textContent = `${capitalEfficiency.toFixed(1)}x`;
    
    // Calculate single position capital efficiency
    const singleEfficiency = 1.0; // Base comparison
    document.getElementById('singleEfficiency').textContent = `${singleEfficiency.toFixed(1)}x`;
    
    // Calculate efficiency difference
    const efficiencyDiff = capitalEfficiency - singleEfficiency;
    const efficiencyDiffElement = document.getElementById('efficiencyDiff');
    efficiencyDiffElement.textContent = efficiencyDiff > 0 ? `+${efficiencyDiff.toFixed(1)}x` : `${efficiencyDiff.toFixed(1)}x`;
    efficiencyDiffElement.className = efficiencyDiff > 0 ? 'text-success' : 'text-danger';
    
    // Calculate average delta
    const avgDelta = calculateAverageDelta();
    document.getElementById('averageDelta').textContent = avgDelta.toFixed(2);
    
    // Calculate maximum gamma values
    const maxStaggeredGamma = calculateMaxStaggeredGamma();
    const maxSingleGamma = calculateMaxSingleGamma();
    document.getElementById('staggeredGamma').textContent = Math.abs(maxStaggeredGamma).toFixed(2);
    document.getElementById('singleGamma').textContent = Math.abs(maxSingleGamma).toFixed(2);
    
    // Calculate gamma difference
    const gammaDiff = Math.abs(maxStaggeredGamma) - Math.abs(maxSingleGamma);
    const gammaDiffElement = document.getElementById('gammaDiff');
    // For gamma, lower absolute value is better (less non-linearity)
    gammaDiffElement.textContent = gammaDiff < 0 ? `${gammaDiff.toFixed(2)}` : `+${gammaDiff.toFixed(2)}`;
    gammaDiffElement.className = gammaDiff < 0 ? 'text-success' : 'text-danger';
}

/**
 * Calculate linearity score (0-100%)
 */
function calculateLinearityScore() {
    // Generate position value data
    const minPrice = Math.min(...positions.map(p => p.lowerBound));
    const maxPrice = Math.max(...positions.map(p => p.upperBound));
    const valueData = generatePositionValueData(minPrice, maxPrice);
    
    // Calculate deviation from ideal linear response
    let totalDeviation = 0;
    const numPoints = valueData.combined.length;
    
    for (let i = 0; i < numPoints; i++) {
        const deviation = Math.abs(valueData.combined[i].value - valueData.ideal[i].value);
        const maxPossibleDeviation = valueData.ideal[i].value;
        totalDeviation += deviation / maxPossibleDeviation;
    }
    
    // Average deviation as percentage
    const avgDeviation = (totalDeviation / numPoints) * 100;
    
    // Convert to linearity score (100% - deviation%)
    return Math.max(0, 100 - avgDeviation);
}

/**
 * Calculate single position linearity score (0-100%)
 */
function calculateSinglePositionLinearityScore() {
    // Generate position value data
    const minPrice = Math.min(...positions.map(p => p.lowerBound));
    const maxPrice = Math.max(...positions.map(p => p.upperBound));
    const valueData = generatePositionValueData(minPrice, maxPrice);
    
    // Calculate deviation from ideal linear response
    let totalDeviation = 0;
    const numPoints = valueData.single.length;
    
    for (let i = 0; i < numPoints; i++) {
        const deviation = Math.abs(valueData.single[i].value - valueData.ideal[i].value);
        const maxPossibleDeviation = valueData.ideal[i].value;
        totalDeviation += deviation / maxPossibleDeviation;
    }
    
    // Average deviation as percentage
    const avgDeviation = (totalDeviation / numPoints) * 100;
    
    // Convert to linearity score (100% - deviation%)
    return Math.max(0, 100 - avgDeviation);
}

/**
 * Calculate capital efficiency multiplier
 */
function calculateCapitalEfficiency() {
    // Simple model: efficiency increases with number of positions
    // More sophisticated model would account for overlap and range width
    return 1.0 + (numPositions * 0.5);
}

/**
 * Calculate average delta at current price
 */
function calculateAverageDelta() {
    let totalDelta = 0;
    
    positions.forEach(position => {
        const delta = calculateDelta(position, currentPrice);
        totalDelta += delta * (position.liquidityPercentage / 100);
    });
    
    return totalDelta;
}

/**
 * Calculate maximum gamma for staggered positions
 */
function calculateMaxStaggeredGamma() {
    // Generate gamma data
    const minPrice = Math.min(...positions.map(p => p.lowerBound));
    const maxPrice = Math.max(...positions.map(p => p.upperBound));
    const gammaData = generateGammaData(minPrice, maxPrice);
    
    // Find maximum absolute gamma value
    return gammaData.combined.reduce((max, point) => {
        return Math.abs(point.gamma) > Math.abs(max) ? point.gamma : max;
    }, 0);
}

/**
 * Calculate maximum gamma for single position
 */
function calculateMaxSingleGamma() {
    // Create single wide position for comparison
    const singlePosition = {
        lowerBound: Math.min(...positions.map(p => p.lowerBound)),
        upperBound: Math.max(...positions.map(p => p.upperBound)),
        geometricMean: Math.sqrt(
            Math.min(...positions.map(p => p.lowerBound)) * 
            Math.max(...positions.map(p => p.upperBound))
        ),
        rangeFactor: Math.sqrt(
            Math.max(...positions.map(p => p.upperBound)) / 
            Math.min(...positions.map(p => p.lowerBound))
        )
    };
    
    // Calculate gamma at lower and upper bounds (where gamma is highest)
    const gammaLower = calculateGamma(singlePosition, singlePosition.lowerBound * 1.01);
    const gammaUpper = calculateGamma(singlePosition, singlePosition.upperBound * 0.99);
    
    // Return the maximum absolute gamma
    return Math.abs(gammaLower) > Math.abs(gammaUpper) ? gammaLower : gammaUpper;
}
