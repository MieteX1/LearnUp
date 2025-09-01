import React from 'react';

const CircularProgress = ({ percentage }) => {
  const validatedPercentage = Math.min(100, Math.max(0, percentage));
  const angle = (validatedPercentage / 100) * 360;

  // Logika do ustalenia kolorów
  let color;
  if (validatedPercentage <= 33) {
    color = "#FF4500"; // Czerwony
  } else if (validatedPercentage <= 66) {
    color = "#FFA500"; // Pomarańczowy
  } else {
    color = "#52C41A"; // Zielony
  }

  return (
    <div className="w-1/4 flex flex-col items-center">
      {/* Okrąg z dynamicznym borderem */}
      <div className="relative flex items-center justify-center">
        {/* Okrąg z gradientowym borderem */}
        <div
          className="w-64 h-64 rounded-full"
          style={{
            background: `conic-gradient(
              ${color} ${angle}deg,
              #F5F5F510 ${angle}deg
            )`,
            mask: "radial-gradient(circle, transparent 60%, black)",
            WebkitMask: "radial-gradient(circle, transparent 40%, black)",
          }}
        ></div>

        {/* Tekst w środku */}
        <div className="absolute flex flex-col items-center">
            <span
            className="text-4xl font-bold"
            style={{ color: color }} // Kolor tekstu w zależności od wartości
            >
            {validatedPercentage}%
            </span>
            <span className="text-sm font-medium text-black">
                wykonano zbioru
            </span>
        </div>
      </div>
    </div>
  );
};

export default CircularProgress;
