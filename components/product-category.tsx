import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";

interface ProductDataProp {
  producteyes: string;
  title: string;
  dis: string;
  img: string;
  URL: string;
}

interface ProductCategoryProps {
  ProductData: ProductDataProp[];
}

const ProductCategory: React.FC<ProductCategoryProps> = ({ ProductData }) => {
  return (
    <>
      <div className="w-full mb-5 mt-5">
        {ProductData.map((item: any) => {
          return (
            <>
              <div className="flex align-items-center py-5 border-bottom border-width-1">
                <div className="list-product-image">
                  <Image src={item.img} width={400} height={200} alt="" unoptimized />
                </div>
                <div>
                  <p>{item.producteyes}</p>
                  <h3 className="my-3">
                    <Link href={item.URL}>{item.title}</Link>
                  </h3>
                  {/* <p className="text-2">{item.dis}</p> */}
                  <div>
                    <Button className="mt-3" variant="contained" size="medium">Add to Card</Button>
                  </div>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </>
  );
}

export default ProductCategory;