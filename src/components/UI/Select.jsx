import React, { useState, useRef, useEffect } from 'react';

const Select = ({ label, options = [], value, onChange, placeholder = 'Any' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(value || placeholder);
  const selectRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected option when value prop changes
  useEffect(() => {
    setSelectedOption(value || placeholder);
  }, [value, placeholder]);

  const handleOptionClick = (option) => {
    setSelectedOption(option.label || option.value);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  // Always include "Any" option at the top of the list
  const selectOptions = [
    { value: '', label: 'Any' }, // Empty value for unselect
    ...(options.length > 0 
      ? options 
      : [])
  ];

  return (
    <div className="select-container" ref={selectRef}>
      {label && <label>{label}</label>}
      <div 
        className={`select-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="select-value">{selectedOption}</span>
        <span className={`select-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="select-options">
          {selectOptions.map((option) => (
            <div
              key={option.value}
              className={`select-option ${
                (option.label || option.value) === selectedOption ? 'selected' : ''
              }`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label || option.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;