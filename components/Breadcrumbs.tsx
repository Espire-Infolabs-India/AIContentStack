import React from "react";
import { Breadcrumbs, Typography } from "@mui/material";
import Link from "next/link";

interface PathsProps {
  label: string;
  href: string;
}

interface BreadcrumbspageProps {
  paths: PathsProps[];
}

const Breadcrumbspage = ({ paths }: BreadcrumbspageProps) => {
  return (
    <>
      <h3>
        <Breadcrumbs aria-label="breadcrumb">
          {paths.map((item: any) => (
            <Link key={item.index} href="/">
              <Typography
                sx={{
                  cursor: "pointer",
                  color: "primary.main",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {item.label}
              </Typography>
            </Link>
          ))}
        </Breadcrumbs>
      </h3>
    </>
  );
};

export default Breadcrumbspage;
