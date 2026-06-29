import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type = 'text', count = 1, width, height, style, className = '' }) => {
  const elements = Array.from({ length: count }, (_, i) => i);
  
  return (
    <>
      {elements.map((key) => (
        <div 
          key={key} 
          className={`skeleton skeleton-${type} ${className}`}
          style={{ width, height, ...style }}
        ></div>
      ))}
    </>
  );
};

export default Skeleton;
