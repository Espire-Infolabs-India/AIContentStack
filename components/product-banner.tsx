import Image from "next/image";
import { Box, Typography, Button } from "@mui/material";
import ListingBanner from "../public/Mesh_home.webp";
export default function Banner() {
  return (
    <>
      <div className="w-full">

        <Image width={1920} height={768} src={ListingBanner} alt="" />
        
      </div>
    </>
  );
}
