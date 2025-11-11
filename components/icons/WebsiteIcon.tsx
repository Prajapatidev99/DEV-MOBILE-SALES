

// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';

const WebsiteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-1.02.25-1.97.68-2.82l5.47 5.47c-.52.2-1.09.35-1.7.42V17c0 .55-.45 1-1 1s-1-.45-1-1v-2.03c-1.63-.44-3-1.68-3.46-3.27-.12-.4-.18-.82-.19-1.25zm8.5 6.94c.62-.28 1.18-.65 1.68-1.08l-5.1-5.1c-.4.5-.72 1.06-.94 1.68-.83 2.33.16 4.93 2.49 5.76.69.25 1.42.37 2.15.37.33 0 .65-.04.97-.12a5.4 5.4 0 0 0-1.25-1.51zM12 10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm6.32 4.82c-.44.85-.99 1.62-1.62 2.26l-5.47-5.47c.52-.2 1.09-.35 1.7-.42V9c0-.55.45-1 1-1s1 .45 1 1v2.03c1.63.44 3 1.68 3.46 3.27.12.4.18.82.19 1.25z"
      clipRule="evenodd"
    />
  </svg>
);

export default WebsiteIcon;