import { useRef, useState } from "react";

export default function RefTest() {
  const [startTime, setStartTime] = useState(0);
  const [now, setNow] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const handleStart = () => {
    setStartTime(Date.now());
    setNow(Date.now());

    if (intervalRef.current !== undefined) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 10);
  };

  const handleStop = () => {
    if (intervalRef.current !== undefined) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  let secondsPassed = 0;
  if (startTime != null && now != null) {
    secondsPassed = (now - startTime) / 1000;
  }

  return (
    <div className="`h-screen p-10">
      <h1 className="font-bold text-5xl">{secondsPassed.toFixed(3)}</h1>
      <button
        onClick={handleStart}
        className="px-3 py-2 rounded bg-emerald-200 text-gray-600 m-5"
      >
        Start
      </button>
      <button
        onClick={handleStop}
        className="px-3 py-2 rounded bg-emerald-800 text-gray-100 m-5"
      >
        Stop
      </button>
    </div>
  );
}
