import React, { useState, useEffect } from 'react';
import Select from './Select';

const FilterInput = ({ onChange, value }) => {
  const operatorOptions = [
    { value: 'gt', label: '>' },
    { value: 'lt', label: '<' },
    { value: 'eq', label: '=' },
    { value: 'btwn', label: '<>' }
  ];

  const [operator, setOperator] = useState(value?.operator ? 
    { value: value.operator, label: operatorOptions.find(op => op.value === value.operator)?.label || 'Any' } 
    : { value: '', label: 'Any' });
  const [value1, setValue1] = useState(value?.value1 || '');
  const [value2, setValue2] = useState(value?.value2 || '');
  const [error, setError] = useState('');


  useEffect(() => {
    if (!value || Object.keys(value).length === 0) {
      setOperator({ value: '', label: 'Any' });
      setValue1('');
      setValue2('');
      setError('');
    } else {
      setOperator(value.operator ? 
        { value: value.operator, label: operatorOptions.find(op => op.value === value.operator)?.label || 'Any' } 
        : { value: '', label: 'Any' });
      setValue1(value.value1 || '');
      setValue2(value.value2 || '');
    }
  }, [value]);

  const handleOperatorChange = (selectedOperator) => {
    if (selectedOperator.value){
      const selectedOperatorObj = operatorOptions.find(op => op.value === selectedOperator.value);
      setOperator(selectedOperatorObj);
      setError(''); // Clear error on operator change
      
      if (selectedOperator.value === '') {
        setValue1('');
        setValue2('');
      } else if (selectedOperator.value !== 'btwn') {
        setValue2('');
      }
      
      emitChange(selectedOperator.value, value1, value2);
    }
  };

  const handleValue1Change = (e) => {
    const newValue = e.target.value;
    setValue1(newValue);

    if (operator.value === 'btwn' && value2 !== '') {
      if (Number(newValue) > Number(value2)) {
        setError('First value cannot be higher than second value');
        return;
      } else {
        setError('');
      }
    }
    emitChange(operator.value, newValue, value2);
  };

  const handleValue2Change = (e) => {
    const newValue = e.target.value;
    setValue2(newValue);

    if (operator.value === 'btwn' && value1 !== '') {
      if (Number(value1) > Number(newValue)) {
        setError('First value cannot be higher than second value');
        return;
      } else {
        setError('');
      }
    }

    emitChange(operator.value, value1, newValue);
  };

  const emitChange = (op, val1, val2) => {
    if (onChange && (!error || error === '')) {
      onChange({
        operator: op,
        value1: val1,
        value2: val2
      });
    }
  };

  return (
    <div className="filter-input">
      <div className="filter-input-container">
        <div className="filter-input-operator">
          <Select
            options={operatorOptions}
            value={operator?.label || ''}
            selectedLabel={operator?.label || ''}
            onChange={handleOperatorChange}
          />
        </div>
        {operator?.value && operator?.value !== '' && (
          <div className="filter-input-values">
            <input
              type="number"
              value={value1}
              onChange={handleValue1Change}
              className={`filter-value-input ${error ? 'error-validation' : ''}`}
            />
            {operator?.value === 'btwn' && (
              <>
                <span className="filter-input-separator">and</span>
                <input
                  type="number"
                  value={value2}
                  onChange={handleValue2Change}
                  className={`filter-value-input ${error ? 'error-validation' : ''}`}
                />
              </>
            )}
          </div>
        )}
      </div>
      {error && <div className="filter-input-error">{error}</div>}
    </div>
  );
};

export default FilterInput;
