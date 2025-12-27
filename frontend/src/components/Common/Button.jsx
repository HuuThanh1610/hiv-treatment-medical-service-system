/**
 * Button.jsx - Reusable button component
 *
 * Chức năng:
 * - Customizable button với multiple variants
 * - Support cho loading state
 * - Icon integration
 * - Accessibility features
 * - Consistent styling across app
 */
import React from 'react';
import './Button.scss';

const Button = ({
    children,
    type = "button",
    variant = "primary",
    size = "medium",
    loading = false,
    disabled = false,
    onClick,
    className = "",
    ...props
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} btn-${size} ${loading ? 'loading' : ''} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <span className="loading-spinner">⏳</span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;