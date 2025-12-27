/**
 * FormInput.jsx - Reusable form input component
 *
 * Chức năng:
 * - Standardized input fields
 * - Built-in validation display
 * - Password visibility toggle
 * - Error state handling
 * - Consistent styling và accessibility
 */
import React, { useState } from 'react';
import './FormInput.scss';
import { LuEye, LuEyeClosed } from "react-icons/lu"; // Icons cho password toggle
const FormInput = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    icon,
    options = []
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const renderInput = () => {
        if (type === 'select') {
            return (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`form-control ${error ? 'error' : ''}`}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <input
                type={type === 'password' && showPassword ? 'text' : type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`form-control ${error ? 'error' : ''} ${icon ? 'with-icon' : ''}`}
            />
        );
    };

    return (
        <div className="form-input">
            {label && <label htmlFor={name} className="form-label">{label}</label>}
            <div className="input-wrapper">
                {icon && <span className="input-icon">{icon}</span>}
                {renderInput()}
                {type === 'password' && (
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                    >   
                        {showPassword ? <LuEye /> : <LuEyeClosed />}
                    </button>
                )}
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default FormInput;