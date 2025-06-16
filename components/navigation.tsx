import Link from "next/link";
import React, { useState, useEffect } from "react";
import { HeaderEntryResponse } from "../typescript/header";

const Navigation: React.FC<HeaderEntryResponse> = (
  entry: HeaderEntryResponse
) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuToggle = (menuName: string) => {
    if (isMobile) {
      setActiveMenu(activeMenu === menuName ? null : menuName);
    }
  };

  const handleMouseEnter = (menuName: string) => {
    if (!isMobile) {
      setActiveMenu(menuName);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveMenu(null);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="mr-8">
              <b style={{fontSize: "30px"}}>Espire</b>
            </div>

            {/* Main Nav Links */}
            <div className="hidden lg:flex flex-grow">
                <div className="relative group mr-8">
                  <Link
                    href="#"
                    className="font-medium text-gray-800 hover:text-gray-600 pb-5 uppercase"
                  >
                    Services
                  </Link>
                </div>
                <div className="relative group mr-8">
                  <Link
                    href="#"
                    className="font-medium text-gray-800 hover:text-gray-600 pb-5 uppercase"
                  >
                    Technology Partners
                  </Link>
                </div>
                <div className="relative group mr-8">
                  <Link
                    href="#"
                    className="font-medium text-gray-800 hover:text-gray-600 pb-5 uppercase"
                  >
                    Industries
                  </Link>
                </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Navigation;
