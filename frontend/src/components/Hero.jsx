import React from "react";
import headphones from "../assets/headphones.png";
import { FaArrowRightLong } from "react-icons/fa6";

const Hero = () => {
  return (
    <section className="max-padd-container">
      <div className="grid grid-cols-2 bg-hero bg-cover bg-center bg-no-repeat rounded-2xl h-[633px]">
        <div className="place-content-end max-xs:min-w-80">
          <div className="p-4">
          
            <button className="btn-white mt-6">Explore more</button>
          </div>
        </div>
    
      </div>
    </section>
  );
};

export default Hero;
