

// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { Link } from '../types';

interface LinkCardProps {
  link: Link;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-center w-full p-4 bg-slate-700 rounded-lg shadow-md hover:bg-slate-600 transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      <div className="flex items-center w-full">
        {link.icon && <span className="mr-4 text-gray-300 group-hover:text-white">{link.icon}</span>}
        <span className="flex-grow text-center font-semibold text-gray-200 group-hover:text-white">{link.title}</span>
        {/* Placeholder for alignment */}
        {link.icon && <span className="ml-4 w-6"></span>}
      </div>
    </a>
  );
};

export default LinkCard;