import React, {useMemo} from 'react';
import { quotes } from '../utils/quotes';

const DailyQuote = React.memo(() => {
  const images = ['../images/quote/1.jpg', '../images/quote/2.jpg', '../images/quote/3.jpg', '../images/quote/4.jpg'];
  const randomImage = images[Math.floor(Math.random() * images.length)];
  // Use useMemo to maintain the same quote throughout re-renders
  const todaysQuote = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;
    return quotes[quoteIndex];
  }, []); // Empty dependency array means this will only calculate once when component mounts

  return (
      <div
          className="flex flex-col md:flex-row justify-center items-center max-w-[80%] md:max-w-[60%] mx-auto my-12 md:mt-24 p-5 rounded-[20px] bg-[#f5f5f5] bg-opacity-70 shadow-lg">
          <img src={randomImage} alt="Random" className="w-3/4 md:w-[30%] h-auto mb-4 md:mb-0 md:mr-5 rounded-[10px]"/>
          <div className="w-full md:w-[70%] font-caveat text-center">
              <p className="text-xl md:text-2xl leading-relaxed">`{todaysQuote.text}`</p>
              <p className="text-lg md:text-xl mt-3 font-bold">- {todaysQuote.author}</p>
          </div>
      </div>
  );
});


export default DailyQuote;
