import * as React from 'react';

interface CountdownTimerProps {
  expiry: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = React.useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(expiry) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial call

    return () => clearInterval(timer);
  }, [expiry]);

  if (!timeLeft) {
    return (
      <div className="text-center font-bold text-red-600">
        Offer Expired
      </div>
    );
  }

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center space-x-2">
      <div className="bg-red-600 text-white font-bold py-1 px-2 rounded-md text-lg">{format(timeLeft.hours)}</div>
      <span className="font-bold text-lg text-red-600">:</span>
      <div className="bg-red-600 text-white font-bold py-1 px-2 rounded-md text-lg">{format(timeLeft.minutes)}</div>
      <span className="font-bold text-lg text-red-600">:</span>
      <div className="bg-red-600 text-white font-bold py-1 px-2 rounded-md text-lg">{format(timeLeft.seconds)}</div>
    </div>
  );
};

export default CountdownTimer;
