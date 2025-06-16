import React, { useState, useEffect, ReactNode } from 'react';

interface SlideProps {
  backgroundImage: JSX.Element;  
  title: ReactNode;
  description: ReactNode;
  primaryCta: ReactNode;
  secondaryCta: ReactNode;
  badge?: ReactNode;
}

interface CarouselProps {
  fields: {
    slides: SlideProps[];
  };
}

const Carousel: React.FC<CarouselProps> = ({ fields }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalSlides = fields.slides.length;

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, isTransitioning]);

  return (
    <div className="relative w-full overflow-hidden bg-gray-900">
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {fields.slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0 w-full h-full">
              {slide.backgroundImage}
            </div>

            <div className="absolute inset-0 bg-black bg-opacity-30">
              <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full">
                <div className="flex flex-col justify-center h-full max-w-xl">
                  <div className="text-white text-3xl md:text-4xl lg:text-3xl font-bold mb-4">
                    {slide.title}
                  </div>
                  <div className="text-white text-base md:text-lg mb-6">
                    {slide.description}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {slide.primaryCta && (
                      <div className="inline-block">
                        <button className="bg-white hover:bg-blue-700 text-black font-bold py-3 px-6 rounded-full transition-colors">
                          {slide.primaryCta}
                        </button>
                      </div>
                    )}

                    <div className="inline-block">
                      <button className="bg-blue-900 hover:bg-blue-700 text-white border border-blue-700 font-bold py-3 px-6 rounded-full transition-colors">
                        {slide.secondaryCta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {fields?.slides?.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {fields?.slides?.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {fields.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full focus:outline-none transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}


    </div>
  );
};

export default Carousel;
