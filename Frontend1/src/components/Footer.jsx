import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#50B97E] text-[#111111] mt-32">
      <div className="container mx-auto h-20 px-4 md:px-8 relative flex items-center justify-center sm:justify-between">

        {/* Logo and @2024 centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center text-2xl font-customFont font-bold">
          <span>@2024</span>
          <img src="/images/logo.svg" alt="Logo" className="h-10 ml-2" />
        </div>

        {/* Contact link centered below logo on smaller screens, on the right on larger screens */}
        <div className="ml-auto text-xl font-customFont font-bold">
          <a href="/contact">
            Kontakt
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
