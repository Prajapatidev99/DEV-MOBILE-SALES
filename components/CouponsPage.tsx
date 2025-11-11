import * as React from 'react';

const CouponsPage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Coupons</h1>
      <div className="space-y-4 text-gray-700">
        <p>Check back here for the latest deals and coupons available at DEV MOBILE.</p>
        <p>No active coupons at this time. Please check back later!</p>
      </div>
    </div>
  );
};

export default CouponsPage;