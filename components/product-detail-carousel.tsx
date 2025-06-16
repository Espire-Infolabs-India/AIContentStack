import React, { useState, useEffect } from "react";

interface CarouselSlide {
  image: string;
}

interface CarouselImg {
  image: string;
}

interface ProductCarouselProps {
  slides: CarouselSlide[];
  thumbnails: CarouselImg[];
}

const ProductCarousel = ({ slides, thumbnails }: ProductCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="flex">
        {/* Thumbnails sidebar */}
        <div className="hidden md:flex flex-col items-center justify-start space-y-4 pr-4 w-24">
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
            onClick={() => {
              const newIndex =
                currentIndex === 0 ? thumbnails.length - 1 : currentIndex - 1;
              setCurrentIndex(newIndex);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>

          <div className="flex flex-col space-y-3 overflow-hidden">
            {thumbnails.map((thumbnail, index) => (
              <div
                key={index}
                className={`w-14 h-auto border-2 cursor-pointer transition-all duration-300 ${
                  index === currentIndex ? "border-blue-500" : "border-gray-200"
                }`}
                onClick={() => goToSlide(index)}
              >
                <img src={thumbnail.image} />
              </div>
            ))}
          </div>

          <button
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900"
            onClick={() => {
              const newIndex =
                currentIndex === thumbnails.length - 1 ? 0 : currentIndex + 1;
              setCurrentIndex(newIndex);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        {/* Main carousel */}
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="min-w-full h-full">
                <div className="relative flex flex-col md:flex-rowtext-white rounded-lg overflow-hidden">
                  <div className="flex items-center justify-center">
                    <img src={slide.image} />
                  </div>
                  
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md z-10"
            onClick={goToPrevious}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md z-10"
            onClick={goToNext}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile thumbnails */}
      <div className="flex justify-center mt-4 space-x-2 md:hidden">
        {thumbnails.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
