import React, { useState, useEffect } from 'react';

interface StickyNavigationProps {
  fields: {
    productImage: JSX.Element;
    productTitle: string;
    productDescription: string;
    productPrice: string;
    priceSubtext: string;
    ctaButton: JSX.Element;
  };
}

const StickyProductNavigation: React.FC<StickyNavigationProps> = ({ fields }) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`w-full bg-white border-b border-gray-200 transition-all duration-300 ${isSticky ? 'fixed bottom-0 left-0 z-50 shadow-md' : ''}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 flex-shrink-0">
            {fields.productImage}
          </div>
          <div className="flex flex-col">
            <div className="text-gray-800 font-semibold text-lg">
              {fields.productTitle}
            </div>
            <div className="text-gray-600 text-sm">
              {fields.productDescription}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <div className="text-xl font-bold">
              {fields.productPrice}
            </div>
            <div className="text-gray-500 text-xs">
              {fields.priceSubtext}
            </div>
          </div>
          <div className="ml-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition-colors duration-200">
              {fields.ctaButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyProductNavigation;