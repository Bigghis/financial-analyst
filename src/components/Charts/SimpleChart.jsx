import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

export function SimpleChart({ 
  data, 
  showHoverInfo = false,
  showCrosshair = true,
  showHoverLabel = true,
  showYearOverYear = false,
  amountLabel = "amount",
  chartType = 'line'
}) {
  const { isDarkMode } = useTheme();
  const svgRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);

  // Calculate year-over-year changes
  const yoyData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    return sortedData.map(currentPoint => {
      const currentDate = new Date(currentPoint.date);
      const previousYearDate = new Date(currentDate);
      previousYearDate.setFullYear(currentDate.getFullYear() - 1);

      // Find the closest data point from previous year
      const previousYearPoint = sortedData.find(point => {
        const pointDate = new Date(point.date);
        return pointDate.getFullYear() === previousYearDate.getFullYear() &&
               pointDate.getMonth() === previousYearDate.getMonth();
      });

      const yoyChange = previousYearPoint 
        ? ((currentPoint.amount - previousYearPoint.amount) / previousYearPoint.amount) * 100
        : null;

      return {
        ...currentPoint,
        yoyChange: yoyChange ? Number(yoyChange.toFixed(2)) : null
      };
    });
  }, [data]);

  useEffect(() => {
    if (!data || !data.length) return;
    drawChart();
  }, [data, isDarkMode]);

  const drawChart = () => {
    if (!svgRef.current?.parentElement) return;

    // Setup dimensions
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
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

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.amount) * 1.1])
      .range([height, 0]);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.amount));

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Modify chart rendering based on chartType
    if (chartType === 'histogram') {
      // Add bars
      const barWidth = width / data.length * 0.8; // 80% of available space
      
      svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(new Date(d.date)) - barWidth/2)
        .attr("y", d => yScale(d.amount))
        .attr("width", barWidth)
        .attr("height", d => height - yScale(d.amount))
        .attr("fill", "#2196f3");
    } else {
      // Original line chart code
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#2196f3")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    }

    // Add grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1);

    // Only add crosshair if enabled
    if (showCrosshair) {
      const crosshairX = svg.append("line")
        .attr("class", "crosshair crosshair-x")
        .attr("y1", 0)
        .attr("y2", height)
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

      // Add hover interaction area
      svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => {
          crosshairX.style("visibility", "visible");
          crosshairY.style("visibility", "visible");
        })
        .on("mouseout", () => {
          crosshairX.style("visibility", "hidden");
          crosshairY.style("visibility", "hidden");
          setHoverData(null);
          svg.selectAll(".hover-label").remove();
        })
        .on("mousemove", function(event) {
          const [mouseX] = d3.pointer(event);
          const xDate = xScale.invert(mouseX);
          
          const bisect = d3.bisector(d => new Date(d.date)).left;
          const index = bisect(yoyData, xDate);
          const d = yoyData[index];

          if (d) {
            setHoverData(d);
            
            // Update crosshair position
            crosshairX.attr("x1", xScale(new Date(d.date)))
                     .attr("x2", xScale(new Date(d.date)));
            crosshairY.attr("y1", yScale(d.amount))
                     .attr("y2", yScale(d.amount));

            if (showHoverLabel) {
              svg.selectAll(".hover-label").remove();

              // Add amount label
              svg.append("text")
                .attr("class", "hover-label")
                .attr("x", xScale(new Date(d.date)))
                .attr("y", yScale(d.amount) - 25)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", isDarkMode ? "#fff" : "#000")
                .text(`${d.amount}`);

              // Add YoY change label if available
              if (showYearOverYear && d.yoyChange !== null) {
                svg.append("text")
                  .attr("class", "hover-label")
                  .attr("x", xScale(new Date(d.date)))
                  .attr("y", yScale(d.amount) - 10)
                  .attr("text-anchor", "middle")
                  .style("font-size", "12px")
                  .style("fill", d.yoyChange >= 0 ? "#26a69a" : "#ef5350")
                  .text(`${d.yoyChange >= 0 ? '+' : ''}${d.yoyChange}% YoY`);
              }
            }
          }
        });
    }
  };

  return (
    <div className="simple-chart">
        <div className="hover-info" style={{ marginBottom: '10px', height: '15px' }}>
          {showHoverInfo && hoverData && (
            <>
              <span>Date: {new Date(hoverData.date).toLocaleDateString()}</span>
              <span style={{ marginLeft: '15px' }}>
                {amountLabel}: {hoverData.amount}
              </span>
              {Object.entries(hoverData).map(([key, value]) => {
                if (key !== 'date' && key !== 'amount' && key !== 'yoyChange') {
                  return <span key={key}>{key}: {value}</span>;
                }
                return null;
              })}
          {showYearOverYear && hoverData.yoyChange !== null && (
            <span style={{ 
              marginLeft: '15px',
              color: hoverData.yoyChange >= 0 ? '#26a69a' : '#ef5350'
            }}>
              YoY: {hoverData.yoyChange >= 0 ? '+' : ''}{hoverData.yoyChange}%
            </span>
            )}
          </>
        )}
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
}

SimpleChart.propTypes = {
  // Data should be an array of objects with date and amount properties
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })).isRequired,
  
  // Boolean flags for interactive features
  showHoverInfo: PropTypes.bool,
  showCrosshair: PropTypes.bool,
  showHoverLabel: PropTypes.bool,
  showYearOverYear: PropTypes.bool,
  amountLabel: PropTypes.string,
  chartType: PropTypes.oneOf(['line', 'histogram'])
};