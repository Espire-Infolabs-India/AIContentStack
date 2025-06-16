import Breadcrumbspage from "../../components/Breadcrumbs";
import Productlisting from "../../components/product-banner";
import ProductCategory from "../../components/product-category";

export default function Product() {
  const paths = [
    { label: "Home", href: "/" },
    { label: "WiFi", href: "/products" },
    { label: "Mesh", href: "" }, // Current page (no href)
  ];

  const ProductData = [
    {
      producteyes: "BE19000 WiFi Router (RS700S)",
      title: "Nighthawk WiFi 7 Router, 19Gbps",
      dis: "The most powerful & advanced Nighthawk router ever. Unrivaled WiFi 7 speeds up to 19Gbps for real-timing gaming, 4K/8K streaming, UHD video conferencing, and AR/VR entertainment",
      img: "https://www.netgear.com/media/rs700s_prod_1_tcm148-148711.webp",
      URL: "/product/RS700S",
    },
    {
      producteyes: "BE18000 WiFi Router (RS600)",
      title: "Nighthawk WiFi 7 Router RS600, 18Gbps",
      dis: "Enhanced WiFi performance for the latest devices. The RS600 provides unrivaled WiFi 7 speeds up to 18Gbps for real-time gaming, 4K/8K streaming, UHD video conferencing, and AR/VR entertainment​",
      img: "https://www.netgear.com/media/RS600_G1_779x536_tcm148-161817.webp",
      URL: "/product/RS600",
      
    },
    {
      producteyes: "BE27000 Mesh WiFi System (RBE973SB) ",
      title: "Orbi 970 Series Quad-band WiFi 7 Mesh 3-Pack, Black Edition",
      dis: "Our most powerful and advanced Orbi unleashes up to 27Gbps for unparalleled performance and coverage for your whole home​",
      img: "https://www.netgear.com/media/_hero_banner_15052024_tcm148-152227.webp",
      URL: "/product/RBE973SB",
    },
  ];

  return (
    <>
      <div className="w-full">
        <Productlisting />
      </div>
      <section className="w-full py-3">
        <div className="container">
          <Breadcrumbspage paths={paths} />
        </div>
      </section>
      <section className="w-full py-3">
        <div className="container">
          <div className="flex">
            <div className="bg-gray-300 basis-2/6"></div>
            <div className="ml-10 basis-2/2">
              {/* <div className="flex flex-col md:flex-row ">
                <div className="bg-blue-800 md:basis-2/5">01</div>
                <div className="bg-red-800 md:basis-2/3">02</div>
              </div> */}
              <ProductCategory ProductData={ProductData} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
