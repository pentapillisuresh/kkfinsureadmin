import React from 'react';

const Card = ({ children, className = '', title, subtitle, actions }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;