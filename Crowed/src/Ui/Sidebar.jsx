import React from "react";
import { Car, MoveLeft, User, Users, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import assets from "../assets/assets.js";

const Sidebar = ({title,subtitle,links}) => {


  return (
    <div className="left 2xl:flex-1/12 flex-wrap inline p-4 bg-white/10 border border-white/10 text-white max-sm:hidden ">
      <Link to="/">
        <div className="text-center flex gap-4 items-center bg-white/10 p-2 rounded-md cursor-pointer">
          <MoveLeft /> Back to Home
        </div>
      </Link>
      {/* image */}

      <div className="image mt-4 ">
        <img src={assets.card4} className="size-13 flex mx-auto" />
      </div>

      <div className="mt-4 text-left text-xl font-semibold">
        {title}
      </div>
      <div className=" text-left text-[12px] font-semibold text-[#b6c1d3]">
        {subtitle}
      </div>

      {links.map((link, index) => (
        <div key={index} className="links mt-8">
          <Link to ={link.to}>
          <div
            
            className={
              "w-full  p-3 rounded-md flex cursor-pointer  mb-4 hover:bg-white/5 border-l-3 border-[#3a80f3] : border-transparent'}"
            }
          >
            <div className="size-6">{link.icon}</div>
            <span className="ml-3 font-semibold">{link.name}</span>
          </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
