import React, { useState } from "react";
import Image from "next/image";
interface ProductOption {
  id: string;
  title: string;
  description: string;
  image: string;
  isNew?: boolean;
  specs: {
    coverage: string;
    speed: string;
    technology: string;
    devices: string;
  };
  ctaButton: JSX.Element;
}

interface ProductSelectorProps {
  products: ProductOption[];
  selectedProductId?: string;
  onProductSelect?: (productId: string) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProductId,
  onProductSelect,
}) => {
  const [selected, setSelected] = useState<string>(
    selectedProductId || products[0]?.id || ""
  );

  const handleSelect = (productId: string) => {
    setSelected(productId);
    if (onProductSelect) {
      onProductSelect(productId);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col items-center">
            <div className="relative w-full h-48 sm:h-56 md:h-64 mb-10 text-center">
              <Image className="inline-block" src={product.image} width={288} height={288} style={{width:"auto"}} alt="" unoptimized />
              {product.isNew}
            </div>

            <div className="flex items-center justify-center mb-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="hidden"
                  checked={selected === product.id}
                  onChange={() => handleSelect(product.id)}
                />
                <span
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selected === product.id
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selected === product.id && (
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  )}
                </span>
              </label>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
              {product.title}
            </h2>
            <p className="text-center mb-4 text-gray-700">
              {product.description}
            </p>

            <div className="w-full space-y-2 mb-6">
              <div className="flex justify-center [&>*]:px-1">
                <span className="font-semibold">Coverage:</span>
                <span>{product.specs.coverage}</span>
              </div>
              <div className="flex justify-center [&>*]:px-1">
                <span className="font-semibold">Speed:</span>
                <span>{product.specs.speed}</span>
              </div>
              <div className="flex justify-center [&>*]:px-1">
                <span className="font-semibold">Technology:</span>
                <span>{product.specs.technology}</span>
              </div>
              <div className="flex justify-center [&>*]:px-1">
                <span className="font-semibold">Devices:</span>
                <span>{product.specs.devices}</span>
              </div>
            </div>

            <div className="mt-auto">{product.ctaButton}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;
