import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

export function MultiLineChart({ 
  data, 
  showHoverInfo = false,
  showCrosshair = true,
  showHoverLabel = true,
  showValueNearMouse = false,
  amountLabel = "value",
  mainSymbol = null
}) {
  const { isDarkMode } = useTheme();
  const svgRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  
  // Filter out symbols with empty data series
  const validData = useMemo(() => 
    data.filter(d => d.dataSeries && d.dataSeries.length > 0),
    [data]
  );
  
  // Initialize selectedSymbols with mainSymbol if it exists and has data
  const [selectedSymbols, setSelectedSymbols] = useState(() => {
    if (mainSymbol && validData.some(d => d.symbol === mainSymbol)) {
      return [mainSymbol];
    }
    return [];
  });

  // Get secondary symbols (all except mainSymbol) that have data
  const secondarySymbols = useMemo(() => 
    validData
      .map(d => d.symbol)
      .filter(symbol => symbol !== mainSymbol),
    [validData, mainSymbol]
  );

  // Handle select all secondary symbols
  const handleSelectAll = (checked) => {
    setSelectedSymbols(prev => {
      const newSelection = checked ? [...secondarySymbols] : [];
      // Always keep mainSymbol in selection if it exists
      return mainSymbol ? [...newSelection, mainSymbol] : newSelection;
    });
  };

  // Modified toggle to prevent unselecting mainSymbol
  const handleSymbolToggle = (symbol) => {
    if (symbol === mainSymbol) return; // Prevent toggling mainSymbol
    setSelectedSymbols(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  };

  // Check if all secondary symbols are selected
  const areAllSecondarySelected = useMemo(() => 
    secondarySymbols.every(symbol => selectedSymbols.includes(symbol)),
    [secondarySymbols, selectedSymbols]
  );

  // Generate color scale for different lines
  const colorScale = useMemo(() => {
    const colors = d3.schemeCategory10;
    return d3.scaleOrdinal()
      .domain(data.map(d => d.symbol))
      .range(colors);
  }, [data]);

  useEffect(() => {
    if (!data || !data.length) return;
    drawChart();
  }, [data, isDarkMode, selectedSymbols]);

  const drawChart = () => {
    if (!svgRef.current?.parentElement) return;

    // Setup dimensions
    const margin = { top: 20, right: 80, bottom: 30, left: 60 };
    const width = svgRef.current.parentElement.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter data based on selected symbols
    const filteredData = data.filter(d => 
      selectedSymbols.length === 0 || selectedSymbols.includes(d.symbol)
    );

    // Get all dates and values for scales
    const allDates = filteredData.flatMap(d => d.dataSeries.map(h => new Date(h.date)));
    const allValues = filteredData.flatMap(d => d.dataSeries.map(h => h.value));

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(allDates))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(allValues) * 1.1])
      .range([height, 0]);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.value));

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1);

    // Add lines for each dataset
    filteredData.forEach(dataset => {
      svg.append("path")
        .datum(dataset.dataSeries)
        .attr("fill", "none")
        .attr("stroke", colorScale(dataset.symbol))
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });

    // Add legend
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(filteredData)
      .enter().append("g")
      .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => colorScale(d.symbol));

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d.symbol);

    // Add crosshair and hover functionality if enabled
    if (showCrosshair) {
      const crosshairX = svg.append("line")
        .attr("class", "crosshair crosshair-x")
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "#999")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "3,3")
        .style("visibility", "hidden");

      // Add hover interaction area
      svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => {
          crosshairX.style("visibility", "visible");
        })
        .on("mouseout", () => {
          crosshairX.style("visibility", "hidden");
          setHoverData(null);
          svg.selectAll(".hover-label").remove();
        })
        .on("mousemove", function(event) {
          const [mouseX] = d3.pointer(event);
          const xDate = xScale.invert(mouseX);
          
          // Find closest data points for each line
          const hoverPoints = filteredData.map(dataset => {
            const bisect = d3.bisector(d => new Date(d.date)).left;
            const index = bisect(dataset.dataSeries, xDate);
            return {
              symbol: dataset.symbol,
              ...dataset.dataSeries[index]
            };
          });

          setHoverData(hoverPoints);
          crosshairX.attr("x1", mouseX).attr("x2", mouseX);

          // Only show value labels near mouse if enabled
          if (showValueNearMouse) {
            svg.selectAll(".hover-label").remove();
            
            hoverPoints.forEach((point, i) => {
              svg.append("text")
                .attr("class", "hover-label")
                .attr("x", mouseX)
                .attr("y", 20 + (i * 20))
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", colorScale(point.symbol))
                .text(`${point.symbol}: ${point.value}`);
            });
          }
        });
    }
  };

  return (
    <div className="multi-line-chart">
      <div className="symbol-selector" style={{ marginBottom: '15px' }}>
        {/* Select All checkbox */}
        <label 
          style={{ 
            marginRight: '25px', 
            display: 'inline-flex', 
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <input
            type="checkbox"
            checked={areAllSecondarySelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          <span>Select All</span>
        </label>

        {/* Individual symbol checkboxes - only for valid data */}
        {validData.map(({ symbol }) => (
          <label 
            key={symbol} 
            style={{ 
              marginRight: '15px', 
              display: 'inline-flex', 
              alignItems: 'center',
              cursor: symbol === mainSymbol ? 'default' : 'pointer',
              opacity: symbol === mainSymbol ? 0.7 : 1
            }}
          >
            <input
              type="checkbox"
              checked={selectedSymbols.includes(symbol)}
              onChange={() => handleSymbolToggle(symbol)}
              disabled={symbol === mainSymbol}
              style={{ marginRight: '5px' }}
            />
            <span style={{ color: colorScale(symbol) }}>
              {symbol} {symbol === mainSymbol ? '(main)' : ''}
            </span>
          </label>
        ))}
      </div>
      <div className="hover-info" style={{ marginBottom: '10px', height: '20px' }}>
        {showHoverInfo && hoverData && (
          <>
            <span>Date: {new Date(hoverData[0]?.date).toLocaleDateString()}</span>
            {hoverData.map(point => (
              <span 
                key={point.symbol} 
                style={{ 
                  marginLeft: '15px',
                  color: colorScale(point.symbol)
                }}
              >
                {point.symbol}: {point.value}
              </span>
            ))}
          </>
        )}
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
}

MultiLineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    dataSeries: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired
    })).isRequired
  })).isRequired,
  showHoverInfo: PropTypes.bool,
  showCrosshair: PropTypes.bool,
  showHoverLabel: PropTypes.bool,
  showValueNearMouse: PropTypes.bool,
  amountLabel: PropTypes.string,
  mainSymbol: PropTypes.string
};