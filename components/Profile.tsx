

// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { ProfileData } from '../types';

interface ProfileProps {
  profileData: ProfileData;
}

const Profile: React.FC<ProfileProps> = ({ profileData }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <img
        src={profileData.avatarUrl}
        alt={profileData.name}
        className="w-28 h-28 rounded-full border-4 border-slate-600 shadow-lg object-cover"
      />
      <h1 className="mt-4 text-2xl font-bold text-gray-100">
        @{profileData.name.toLowerCase().replace(' ', '')}
      </h1>
      <p className="mt-2 text-md text-gray-400 max-w-xs">
        {profileData.bio}
      </p>
    </div>
  );
};

export default Profile;