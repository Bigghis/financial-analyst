import { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { FaChartLine, FaChartBar } from 'react-icons/fa';
import * as d3 from 'd3';
import { useTheme } from '../../context/ThemeContext';

const TIME_RANGES = [
  // { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'MAX', value: 'max' }
];

const calculatePercentageChange = (firstPrice, lastPrice) => {
  const change = ((lastPrice - firstPrice) / firstPrice) * 100;
  return change.toFixed(2);
};

export function StockChart({ data: rawData, onRangeChange, singleAsset=true }) {
  const { isDarkMode } = useTheme();
  const svgRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState('1y');
  const [chartType, setChartType] = useState('line');
  const [hoverData, setHoverData] = useState(null);
  
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!rawData || !rawData.length) return;
    const cleanedData = singleAsset ? rawData.map(item => {
      const cleanedItem = {};
      Object.entries(item).forEach(([key, value]) => {
        const cleanKey = key.split('_')[0];
        cleanedItem[cleanKey] = value;
      });
      return cleanedItem;
    }) : rawData;

    setData(cleanedData);
  }, [rawData, singleAsset]);

  // 1. Add debounce utility
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // 2. Add throttle utility
  const throttle = useCallback((func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  // 3. Debounce resize handler
  useEffect(() => {
    const debouncedDrawChart = debounce(() => {
      drawChart();
    }, 250); // Wait 250ms after resize stops

    window.addEventListener('resize', debouncedDrawChart);
    return () => window.removeEventListener('resize', debouncedDrawChart);
  }, [data, selectedRange, chartType, isDarkMode]);

  useEffect(() => {
    if (!data || !data.length) return;
    
    drawChart();
  }, [data, selectedRange, chartType, isDarkMode]);

    // Format volume numbers (K, M, B)
    const formatVolume = (value) => {
      if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
      if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
      if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
      return value.toString();
    };

  const drawChart = () => {
    // Ensure the SVG container exists
    if (!svgRef.current?.parentElement) return;

    
    const margin = { top: 15, right: 50, bottom: 40, left: 70 };
    const width = svgRef.current.parentElement.clientWidth - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;
    const volumeHeight = 60;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);

    const volumeScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Volume)])
      .range([height, height - volumeHeight]);

    const volumeAxis = d3.axisLeft(volumeScale)
      .tickFormat(formatVolume)
      .ticks(3);

    const mainChartHeight = height - volumeHeight;

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.Low) * 0.99,
        d3.max(data, d => d.High) * 1.01
      ])
      .range([mainChartHeight, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(data.length, 10))
      .tickFormat(i => {
        const d = data[Math.floor(i)];
        return d ? new Date(d.Date).toLocaleDateString() : '';
      });
    const yAxis = d3.axisLeft(yScale).tickFormat(d => d.toFixed(2));

    // Add Y axis for price
    svg.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -(height - volumeHeight) / 2)
      .attr("text-anchor", "middle")
      // .text("Price ($)");

    // Add Y axis for volume
    svg.append("g")
      .attr("class", "volume-axis")
      .attr("transform", `translate(0, 0)`)
      .call(volumeAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -(height - volumeHeight) / 2)
      .attr("text-anchor", "middle")
      // .text("Volume");

    // Volume bars with gradient
    const volumeGradient = svg.append("defs")
       .append("linearGradient")
       .attr("id", "volume-gradient")
       .attr("gradientTransform", "rotate(90)");

    volumeGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#2196f3")
      .attr("stop-opacity", 0.2);

    volumeGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2196f3")
      .attr("stop-opacity", 0.5);

    // Volume bars - center them by adjusting x position
    const barWidth = width / data.length;
    svg.selectAll("volume-bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => {
        if (i === 0) {
          return 0; // First bar starts at 0
        }
        return xScale(i) - barWidth/2;
      })
      .attr("y", d => volumeScale(d.Volume))
      .attr("width", (d, i) => {
        if (i === 0 || i === data.length - 1) {
          return barWidth / 2;
        }
        return barWidth;
      })
      .attr("height", d => height - volumeScale(d.Volume))
      .attr("fill", "url(#volume-gradient)")
      .attr("opacity", 0.8);

    // Add X axis
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height  + 5})`)
      .call(xAxis);

    // Draw chart based on type
    if (chartType === 'line') {
      // Modify line chart to handle gaps
      const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d.Close));

      // Filter out invalid data points and sort by date
      const validData = data
        .filter(d => !isNaN(d.Close))
        .sort((a, b) => new Date(a.Date) - new Date(b.Date));

      svg.append("path")
        .datum(validData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#2196f3")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    } else {
      // Modify candlestick chart to handle gaps
      const validData = data
        .filter(d => !isNaN(d.Open) && !isNaN(d.Close) && !isNaN(d.High) && !isNaN(d.Low))
        .sort((a, b) => new Date(a.Date) - new Date(b.Date));

      const candleWidth = Math.max(1, (width / validData.length) * 0.8);

      svg.selectAll("candlesticks")
        .data(validData)
        .enter()
        .append("g")
        .each(function(d, i) {
          const g = d3.select(this);
          const isFirst = i === 0;
          const isLast = i === validData.length - 1;
          let x = xScale(i) - candleWidth/2;
          let width = candleWidth;

          let xWickPosition = x + width/2;

          // Adjust width and position for first/last candles
          if (isFirst) {
            width = candleWidth/2;
            xWickPosition = x + width;
            x = xScale(i);
          } else if (isLast) {
            width = candleWidth/2;
          }

          // Wick
          g.append("line")
            .attr("x1", xWickPosition)
            .attr("x2", xWickPosition)
            .attr("y1", yScale(d.High))
            .attr("y2", yScale(d.Low))
            .attr("stroke", d.Close > d.Open ? "#26a69a" : "#ef5350");

          // Body  
          g.append("rect")
            .attr("x", x)
            .attr("y", yScale(Math.max(d.Open, d.Close)))
            .attr("width", width)
            .attr("height", Math.abs(yScale(d.Open) - yScale(d.Close)))
            .attr("fill", d.Close > d.Open ? "#26a69a" : "#ef5350");
        });
    }

    // Create crosshair lines - extend Y height to include volume
    const crosshairX = svg.append("line")
      .attr("class", "crosshair crosshair-x")
      .attr("y1", 0)
      .attr("y2", height) // Extend to full height including volume
      .style("stroke", "#999")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "3,3")
      .style("visibility", "hidden");

    const crosshairY = svg.append("line")
      .attr("class", "crosshair crosshair-y")
      .attr("x1", 0)
      .attr("x2", width)
      .style("stroke", "#999")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "3,3")
      .style("visibility", "hidden");

    // 4. Throttle mousemove handler
    const throttledMouseMove = throttle(function(event) {
      const [mouseX] = d3.pointer(event, this);
      const index = Math.round(xScale.invert(mouseX));
      const d = data[index];
      
      if (d) {
        setHoverData(d);
        
        crosshairX
          .attr("x1", xScale(index))
          .attr("x2", xScale(index));

        crosshairY
          .attr("y1", yScale(d.Close))
          .attr("y2", yScale(d.Close));

        svg.selectAll(".volume-label").remove();
        svg.selectAll(".current-price-label").remove();
        
        svg.append("text")
          .attr("class", "volume-label")
          .attr("x", xScale(index))
          .attr("y", volumeScale(d.Volume) - 5)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "#999")
          .text(`Volume: ${formatVolume(d.Volume)}`);

        svg.append("text")
          .attr("class", "current-price-label")
          .attr("x", xScale(index))
          .attr("y", yScale(d.Close) + 20)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("fill", isDarkMode ? "#fff" : "#000")
          .text(`Price: ${d.Close.toFixed(2)}`);
      }
    }, 16); // ~60fps

    // Use throttled handler
    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height - volumeHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .style("cursor", "crosshair")
      .on("mouseover", function() {
        crosshairX.style("visibility", "visible");
        crosshairY.style("visibility", "visible");
      })
      .on("mousemove", throttledMouseMove)
      .on("mouseout", function() {
        // crosshairX.style("visibility", "hidden");
        // crosshairY.style("visibility", "hidden");
      //  svg.selectAll(".volume-label").remove(); // Remove volume label
       // setHoverData(null);
      });

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - volumeHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-(height - volumeHeight))
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1);

    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1);

    // Calculate max and min prices from current data range only
    const currentData = data.filter(d => !isNaN(d.High) && !isNaN(d.Low));
    const maxPrice = d3.max(currentData, d => d.Close);
    const minPrice = d3.min(currentData, d => d.Close);
    const maxDate = d3.max(currentData, d => new Date(d.Date));
    const minDate = d3.min(currentData, d => new Date(d.Date));

    // Find the exact data points for max and min prices
    const maxPricePoint = currentData.find(d => d.Close === maxPrice);
    const minPricePoint = currentData.find(d => d.Close === minPrice);

    // Calculate x positions for labels
    const maxPriceIndex = currentData.indexOf(maxPricePoint);
    const minPriceIndex = currentData.indexOf(minPricePoint);
    
    let maxPriceX = xScale(maxPriceIndex);
    let minPriceX = xScale(minPriceIndex);

    // Adjust label positions to prevent overflow
    const labelWidth = 120;
    maxPriceX = Math.min(Math.max(0, maxPriceX), width - labelWidth);
    minPriceX = Math.min(Math.max(0, minPriceX), width - labelWidth);

    // Add max price label and line
    svg.append("g")
      .attr("class", "price-label max-price")
      .attr("transform", `translate(${maxPriceX}, ${yScale(maxPrice)})`)
      .append("text")
      .attr("x", 10)
      .attr("y", -5)
      .attr("text-anchor", "start")
      .text(`Max Close: ${maxPrice.toFixed(2)}`);

    svg.append("line")
      .attr("class", "price-line")
      .attr("x1", 30)
      .attr("x2", width)
      .attr("y1", yScale(maxPrice))
      .attr("y2", yScale(maxPrice))
      .style("stroke-dasharray", "5,5")
      .style("stroke", "#26a69a")
      .style("opacity", 0.3);

    // Add min price label and line
    svg.append("g")
      .attr("class", "price-label min-price")
      .attr("transform", `translate(${minPriceX}, ${yScale(minPrice)})`)
      .append("text")
      .attr("x", 10)
      .attr("y", 15)
        .attr("text-anchor", "start")
        .text(`Min Close: ${minPrice.toFixed(2)}`);

    svg.append("line")
      .attr("class", "price-line")
      .attr("x1", 30)
      .attr("x2", width)
      .attr("y1", yScale(minPrice))
      .attr("y2", yScale(minPrice))
      .style("stroke-dasharray", "3,3")
      .style("stroke", "#ef5350")
      .style("opacity", 0.3);
  };

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    onRangeChange(range);
    setHoverData(null);
  };

  // Add this after the chart controls div
  const renderPercentageChange = () => {
    if (!data || data.length < 2) return null;
    const firstPrice = data[0].Close;
    const lastPrice = data[data.length - 1].Close;
    const percentChange = calculatePercentageChange(firstPrice, lastPrice);
    const isPositive = percentChange >= 0;

    return (
      <div className="percentage-change" style={{ color: isPositive ? '#26a69a' : '#ef5350' }}>
        {isPositive ? '+' : ''}{Number(percentChange).toLocaleString(navigator.language)}%
      </div>
    );
  };

  return (
    <div className="stock-chart">
      <div className="chart-controls">
        <div className="range-buttons">
          {TIME_RANGES.map(range => (
            <button
              key={range.value}
              className={`range-button ${selectedRange === range.value ? 'active' : ''}`}
              onClick={() => handleRangeChange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
        {renderPercentageChange()}
        <div className="chart-type-buttons">
          <button
            className={`type-button ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
            title="Line Chart"
          >
            <FaChartLine />
          </button>
          <button
            className={`type-button ${chartType === 'candlestick' ? 'active' : ''}`}
            onClick={() => setChartType('candlestick')}
            title="Candlestick Chart"
          >
            <FaChartBar />
          </button>
        </div>
      </div>
      
      <div className="data-summary">
          <div className="summary-item">
            <span className="label">Date:</span>
            <span className="value">{hoverData ? new Date(hoverData.Date).toLocaleDateString() : ''}</span>
          </div>
          <div className="summary-item">
            <span className="label">Open:</span>
              <span className="value">{hoverData ? hoverData.Open.toFixed(2) : ''}</span>
          </div>
          <div className="summary-item">
            <span className="label">High:</span>
            <span className="value">{hoverData ? hoverData.High.toFixed(2) : ''}</span>
          </div>
          <div className="summary-item">
            <span className="label">Low:</span>
            <span className="value">{hoverData ? hoverData.Low.toFixed(2) : ''}</span>
          </div>
          <div className="summary-item">
            <span className="label">Close:</span>
            <span className="value">{hoverData ? hoverData.Close.toFixed(2) : ''}</span>
          </div>
          <div className="summary-item">
            <span className="label">Volume:</span>
            <span className="value">{hoverData ? hoverData.Volume.toLocaleString() : ''}</span>
          </div>
      </div>
      
      <svg ref={svgRef}></svg>
    </div>
  );
}
