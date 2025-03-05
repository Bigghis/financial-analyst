import React from 'react';

const Input = ({ 
    label, 
    value, 
    onChange, 
    type = 'text',
    className = '',
    placeholder = ''
}) => {
    return (
        <div className="input-container">
            {label && <label>{label}</label>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                className={`${className} value-input`}
                placeholder={placeholder}
            />
        </div>
    );
};

export default Input;



// <div className="screener-group">
// <label>Cash Flow</label>
// <div className="filter-input">
//     <input
//         type="number"
//         value={inputs.cashFlow}
//         onChange={(e) => setInputs({...inputs, cashFlow: Number(e.target.value)})}
//         className="filter-value-input"
//     />
// </div>
// </div>
