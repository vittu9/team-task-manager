import React from 'react';

const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div
      className={`rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
