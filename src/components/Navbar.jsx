import React from 'react'
import { Link } from "react-router-dom";

function Navbar() {
  return (

    <div className='mb-5 flex justify-center items-center gap-4 sm:gap-8 text-xl sm:text-2xl text-[#FF5C00] text-shadow-[0_0_5px_#FF5C00]'>
      <Link
        to={"/"}
        className='border-[#FF5C00] border-2 p-1 px-3 shadow-[0_0_5px_#FF5C00] transition duration-200 hover:bg-[#ff5e0036] hover:scale-105 hover:font-bold'
      >
        PRODUCTS
      </Link>

      <Link
        to={"/cart"}
        className='border-[#FF5C00] border-2 p-1 px-3 shadow-[0_0_5px_#FF5C00] transition duration-200 hover:bg-[#ff5e0036] hover:scale-105 hover:font-bold'
      >
        CART
      </Link>
    </div>

  )
}

export default Navbar