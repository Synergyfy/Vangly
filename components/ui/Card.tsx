import React from 'react';
import './Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  glass = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`card ${glass ? 'glass-panel' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};
