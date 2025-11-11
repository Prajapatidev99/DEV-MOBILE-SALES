// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 .587l3.668 7.568L24 9.423l-6 5.845L19.335 24 12 19.725 4.665 24 6 15.268l-6-5.845 7.332-1.268L12 .587z" />
  </svg>
);

export default StarIcon;