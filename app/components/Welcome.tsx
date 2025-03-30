"use client";
import React from "react";
import { HeroParallax } from "../../components/ui/ui/hero-parallax"; // Import HeroParallax
import { AuroraBackground } from "../../components/ui/ui/aurora-background"; // Import AuroraBackground
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";

// Mock data for the HeroParallax component
const products = [
  {
    title: "Mesenchymal Stem Cell",
    thumbnail: "/image1.jpg", // Replace with actual image path
  },
  {
    title: "Mesenchymal Stem Cell Types",
    thumbnail: "/image2.jpg", // Replace with actual image path
  },
  {
    title: "Culturing of MSCs",
    thumbnail: "/image3.jpg", // Replace with actual image path
  },
  {
    title: "Image of MSC",
    thumbnail: "/image4.jpg", // Replace with actual image path
  },
  {
    title: "Image of Mesenchymal Stem Cell",
    thumbnail: "/image5.jpg", // Replace with actual image path
  },
  {
    title: "Product 6",
    thumbnail: "/image1.jpg", // Replace with actual image path
  },
  {
    title: "Microscopic image of MSC",
    thumbnail: "/image1.jpg", // Replace with actual image path
  },
  {
    title: "Stained MSC",
    thumbnail: "/image5.jpeg", // Replace with actual image path
  },
  {
    title: "Close up image of MSC",
    thumbnail: "/image6.jfif", // Replace with actual image path
  },
  {
    title: "Product 10",
    thumbnail: "/image7.jpg", // Replace with actual image path
  },
  {
    title: "Product 11",
    thumbnail: "/image7.jpg", // Replace with actual image path
  },
  {
    title: "Product 12",
    thumbnail: "/image7.jpg", // Replace with actual image path
  },
  {
    title: "Product 13",
    thumbnail: "/image8.jpeg", // Replace with actual image path
  },
  {
    title: "Product 14",
    thumbnail: "/image7.jpg", // Replace with actual image path
  },
  {
    title: "Product 15",
    thumbnail: "/image1.jpg", // Replace with actual image path
  },
];

export default function Welcome() {
  return (
    <div>
      <AuroraBackground>
        {/* HeroParallax Section */}
        <HeroParallax products={products} />
      </AuroraBackground>
      
      
    </div>
  );
}
