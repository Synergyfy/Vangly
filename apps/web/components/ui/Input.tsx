"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  fullWidth = true,
  className = '',
  id,
  type,
  icon,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || Math.random().toString(36).substring(7);

  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full' : ''} ${className}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <div className="input-container">
        {icon && <div className="input-icon-left">{icon}</div>}
        <input 
          id={inputId}
          type={currentType}
          className={`input-field ${error ? 'input-error' : ''} ${icon ? 'has-icon-left' : ''} ${isPassword ? 'has-password-toggle' : ''}`}
          {...props} 
        />
        {isPassword && (
          <button 
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};
