import * as React from 'react';
import { ChevronRightIcon } from './icons';

export interface Breadcrumb {
  name: string;
  href: string;
  isCurrent: boolean;
}

interface BreadcrumbsProps {
  crumbs: Breadcrumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ crumbs }) => {
  if (crumbs.length <= 1) {
    return null; 
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 text-sm text-gray-600 flex-wrap">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
            )}
            <a
              href={crumb.href}
              className={`hover:text-blue-600 transition-colors truncate max-w-[150px] sm:max-w-none ${
                crumb.isCurrent ? 'font-semibold text-gray-800 cursor-default pointer-events-none' : ''
              }`}
              aria-current={crumb.isCurrent ? 'page' : undefined}
            >
              {crumb.name}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;