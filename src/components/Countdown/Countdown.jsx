import React, { useState, useEffect } from 'react';
import './Countdown.css';

const Countdown = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const addZero = (num) => (num < 10 ? `0${num}` : num);

  return (
    <div className="countdown-container">
      <div className="countdown-item">
        <span>{addZero(timeLeft.hours + (timeLeft.days * 24))}</span>
      </div>
      <span className="countdown-colon">:</span>
      <div className="countdown-item">
        <span>{addZero(timeLeft.minutes)}</span>
      </div>
      <span className="countdown-colon">:</span>
      <div className="countdown-item">
        <span>{addZero(timeLeft.seconds)}</span>
      </div>
    </div>
  );
};

export default Countdown;
