import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center text-xs text-slate-500 py-3 overflow-x-auto whitespace-nowrap">
      <Link to="/" className="flex items-center hover:text-blue-600 transition-colors">
        <Home size={14} className="mr-1" />
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={12} className="mx-2 text-slate-400 flex-shrink-0" />
          {item.link ? (
            <Link to={item.link} className="hover:text-blue-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800 truncate max-w-[200px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
