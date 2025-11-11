import * as React from 'react';

interface AnimatedAuthButtonProps {
  onClick: () => void;
  label: string;
  isLight?: boolean;
  type: 'login' | 'logout';
}

const AnimatedAuthButton: React.FC<AnimatedAuthButtonProps> = ({ onClick, label, isLight, type }) => {
  const buttonClasses = `auth-btn ${isLight ? 'auth-btn--light' : ''}`;

  return (
    <button className={buttonClasses} onClick={onClick}>
      <span>{label}</span>
    </button>
  );
};

export default AnimatedAuthButton;