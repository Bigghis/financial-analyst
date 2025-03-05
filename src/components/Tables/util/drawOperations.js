const PADDING_LEFT = 15;
const HORIZONTAL_LINE_WIDTH = 10;
const DASH_ARRAY = "5,5";
const OPERATOR_OFFSET = 4;

export const drawOperationLines = (svg, calc, metricToLabelMap) => {
    if (!svg || calc.type !== "distant") return;

    const columns = Array.from(document.querySelectorAll('thead th'))
        .filter(th => th.textContent !== 'Metric');

    columns.forEach(column => {
        const columnIndex = Array.from(column.parentElement.children).indexOf(column);
        drawColumnOperations(svg, calc, columnIndex, metricToLabelMap);
    });
};

const drawColumnOperations = (svg, calc, columnIndex, metricToLabelMap) => {
    const operandElements = findOperandElements(calc.operands, columnIndex, metricToLabelMap);
    const resultElement = findResultElement(calc.result, columnIndex, metricToLabelMap);
    if (!operandElements.length || !resultElement) return;

    const tableRect = document.querySelector('.table-container').getBoundingClientRect();
    
    // Get positions for first operand and result
    const firstOperandRect = operandElements[0].getBoundingClientRect();
    const resultRect = resultElement.getBoundingClientRect();

    const x = firstOperandRect.left - tableRect.left + PADDING_LEFT;
    const y1 = firstOperandRect.top + (firstOperandRect.height / 2) - tableRect.top;
    const y2 = resultRect.top + (resultRect.height / 2) - tableRect.top;

    // Draw the main vertical line from first operand to result
    drawVerticalLine(svg, x, y1, y2, calc.operator);

    // Draw horizontal connectors and operators for operands only
    operandElements.forEach(element => {        
        const elementRect = element.getBoundingClientRect();
        const yPos = elementRect.top + (elementRect.height / 2) - tableRect.top;
        
        // Draw horizontal connector
        drawHorizontalConnector(svg, x, yPos, calc.operator);
        
        // Draw operator text
        drawOperatorText(svg, x, yPos, calc.operator);
    });

    // Draw result connector and equals sign at the result cell position
    drawHorizontalConnector(svg, x, y2, calc.operator);
    drawEqualsSign(svg, x, y2, calc.operator);
};

const findOperandElements = (operands, columnIndex, metricToLabelMap) => {
    return operands.map(operand => {
        const row = Array.from(document.querySelectorAll('tr')).find(    
            tr => {
                return tr.children[0].textContent === metricToLabelMap[operand]
                }
        );
        return row ? row.children[columnIndex] : null;
    }).filter(Boolean);
};

const findResultElement = (result, columnIndex, metricToLabelMap) => {
    // Find row that contains result text and has a cell with 'result' class
    const resultRow = Array.from(document.querySelectorAll('tr')).find(tr => {
        const hasResultText = tr.textContent.includes(metricToLabelMap[result]);
        const hasResultClass = Array.from(tr.children).some(td => 
            td.className && td.className.includes('result')
        );
        return hasResultText && hasResultClass;
    });
    // const resultRow = Array.from(document.querySelectorAll('tr')).find(
    //     tr => tr.textContent.includes(result) // && tr.querySelector('td.result')
    // );
    return resultRow ? resultRow.children[columnIndex] : null;
};

const drawVerticalLine = (svg, x, y1, y2, operator) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x);
    line.setAttribute('y2', y2);
    line.setAttribute('class', `operation-line ${getOperationClass({ operator })}`);
    line.setAttribute('stroke-dasharray', DASH_ARRAY);
    svg.appendChild(line);
};

const drawHorizontalConnector = (svg, x, y, operator) => {
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', x);
    horizontalLine.setAttribute('y1', y);
    horizontalLine.setAttribute('x2', x + HORIZONTAL_LINE_WIDTH);
    horizontalLine.setAttribute('y2', y);
    horizontalLine.setAttribute('class', `operation-line ${getOperationClass({ operator })}`);
    svg.appendChild(horizontalLine);
};

const drawOperatorText = (svg, x, y, operator) => {
    const operatorText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    operatorText.setAttribute('x', x + HORIZONTAL_LINE_WIDTH + OPERATOR_OFFSET);
    operatorText.setAttribute('y', y + 4);
    operatorText.setAttribute('class', `operation-text ${getOperationClass({ operator })}`);
    operatorText.textContent = operator;
    svg.appendChild(operatorText);
};

const drawEqualsSign = (svg, x, y, operator ) => {
    const equalsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    equalsText.setAttribute('x', x + HORIZONTAL_LINE_WIDTH + OPERATOR_OFFSET);
    equalsText.setAttribute('y', y + 4);
    equalsText.setAttribute('class', `operation-text ${getOperationClass({ operator })}`);
    equalsText.textContent = '=';
    svg.appendChild(equalsText);
};

export const getOperationClass = (calc) => {
    if (!calc) return '';

    const operationType = calc.type || 'adjacent';
    switch (calc.operator) {
        case '+':
            return `${operationType} adding`;
        case '-':
        case "−":
            return `${operationType} subtracting`;
        case '/':
            return `${operationType} dividing`;
        default:
            return operationType;
    }
}

export const drawLines = (settings, highlightedMetrics, metricToLabelMap) => {
    const svg = document.querySelector('.operation-lines svg');
    if (!svg || !highlightedMetrics) return;
   // if (!svg) return;



    svg.innerHTML = '';

    // Only draw lines for calculations that match or are below the current level
    const relevantMetrics = highlightedMetrics.filter(calc => 
        !calc.level || calc.level <= settings.operations
    );

    relevantMetrics.forEach((calc) => {
        drawOperationLines(svg, calc, metricToLabelMap);
    });
};

export const createCellDrawingsParts = (visibleRows, cell, settings, highlightedMetrics) => { 
    let cellClasses = '';
    let cellSign = '';
    let calcType = '';
  //  return { cellClasses, cellSign, calcType };
    // Transform settings.operations to a number if it's a string
    const operation = typeof settings?.operations === 'string' ? Number(settings?.operations) : settings?.operations;

    if (cell.row.original.metric && highlightedMetrics.length > 0 && operation > 0) {
        // Get the level of operation for this cell
        const distantCalcLevel = operation;

        // Filter calculations that match the current level only
        let calculations = [];

        if (distantCalcLevel === 1) {
            // Level 1: Get ONLY adjacent operations
            calculations = highlightedMetrics.filter(calc => 
                (calc.type === 'adjacent')
            );
        } else if (distantCalcLevel > 1) {
            calculations = highlightedMetrics.filter(calc => 
                calc.type === 'distant' && 
                calc.level === distantCalcLevel - 1
            );
        }

        if (calculations.length > 0) { 
            const calculation = calculations.find(calc => {
                if (calc.result === cell.row.original.metric) return true;
                return calc.operands.includes(cell.row.original.metric);
            });

            if (calculation) {
                calcType = calculation.type || 'adjacent';
                const classPrefix = getOperationClass(calculation);    
                
                if (calculation.result === cell.row.original.metric) {
                    cellClasses = `${classPrefix}-result`;
                } else if (calculation.operands.includes(cell.row.original.metric)) {
                    // Get visible operands only
                    const visibleOperands = calculation.operands.filter(operand =>
                        visibleRows.some(row => row.original.metric === operand)
                    );
                    
                    // Get current operand index among visible operands
                    const currentOperandIndex = visibleOperands.indexOf(cell.row.original.metric);
                    
                    // Determine if this is the last visible operand
                    const isLastVisibleOperand = currentOperandIndex === visibleOperands.length - 1;
                    
                    // Special case: if there's only one operand in total
                    const isSingleOperand = calculation.operands.length === 1;
                    
                    if (isSingleOperand || isLastVisibleOperand) {
                        cellClasses = `${classPrefix}-2`;
                        cellSign = '=';
                    } else {
                        cellClasses = `${classPrefix}-1`;
                        cellSign = distantCalcLevel === 1 ? calculation.operator : '';
                    }
                }
            }
        }
         
    }

    return { cellClasses, cellSign, calcType };
}