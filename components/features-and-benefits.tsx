import React from 'react';
interface FeatureProps {
    title: string;
    description: string;
    isNew?: boolean;
  }
  
  interface FeaturesAndBenefitsProps {
    heading: string;
    features: FeatureProps[];
  }

const FeaturesAndBenefits: React.FC<FeaturesAndBenefitsProps> = ({ heading, features }) => {
    return (
      <div className="bg-gray-100 py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl md:text-3xl font-normal text-gray-900">{heading}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center mb-2">
                  <div className="text-xl md:text-2xl font-bold text-gray-900">{feature.title}</div>
                  {feature.isNew && (
                    <span className="ml-2 text-sm font-medium text-blue-600">New!</span>
                  )}
                </div>
                <div className="text-base md:text-lg text-gray-700 mt-1">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default FeaturesAndBenefits;
  