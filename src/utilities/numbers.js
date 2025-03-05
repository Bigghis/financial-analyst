export function toLocaleString(value, decimals = null) {
    if (!value && value !== 0) return '-';
    if (decimals === null) return Number(value).toLocaleString(navigator.language);
    return Number(value).toLocaleString(navigator.language, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercentage(value, decimals = 2) {
    if (!value && value !== 0) return '-';
    return `${toLocaleString(value * 100, decimals)} %`;
}

export function formatNumber(value, format = 'AUTO', decimals = 2) {
  // For AUTO format, determine the best unit based on value
  let _value;
  let _format;
  if (value === Infinity) {
    return '-';
  }
  if (format === 'AUTO') {
    switch (true) {
      case value >= 1e9:
        _value = (value / 1e9).toFixed(1);
        _format = 'B';
        break;
      case value >= 1e6:
        _value = (value / 1e6).toFixed(1);
        _format = 'M';
        break;
      case value >= 1e3:
        _value = (value / 1e3).toFixed(1);
        _format = 'K';
        break;
      default:
        _value = value;
        _format = null;
        break;
    }
  } else {
        switch (format) {
        case 'B':
            _value = (value / 1e9).toFixed(1);
            break;
        case 'M':
            _value = (value / 1e6).toFixed(1);  
            break;
        case 'K':
            _value = (value / 1e3).toFixed(1);
            break;
        default:
            _value = value;
        }
        _format = format;
    }
    if (_value && _format) {
        return `${toLocaleString(_value, decimals)} ${_format}`;
      }
    if (_value && _format === null) {
      return `${toLocaleString(_value, decimals)}`;
    }
    return '-'
}

export function formatFinancial(value, unit, decimals = 2) {
    if (!value && value !== 0) return '-';
    // console.log("value", value);
    // Convert to positive number for formatting
    const absValue = Math.abs(value);
    // console.log("absValue", formatNumber(absValue, unit, decimals));

    // console.log("navigator.language", navigator.language);
    
    // Return with parentheses if negative, otherwise as-is
    return value < 0 
    ? `<span style="color: red">(${formatNumber(absValue, unit, decimals)})</span>` 
    : formatNumber(absValue, unit, decimals)
}
