import React from 'react'
import { Link } from "react-router-dom";

function Navbar() {
  return (

    <div className='mb-5 color-[#FF5C00] flex justify-center items-center gap-10'>
      <Link
        to={"/"}
        className='border-[#FF5C00] text-lg border-2 p-1 px-2 text-[#FF5C00] text-shadow-[0_0_8px_#FF5C00] shadow-[0_0_8px_#FF5C00] transition duration-200 hover:bg-[#ff5e0047] hover:scale-105 hover:font-bold'
      >
        PRODUCTS
      </Link>

      <Link
        to={"/cart"}
        className='border-[#FF5C00] text-lg border-2 p-1 px-2 text-[#FF5C00] text-shadow-[0_0_8px_#FF5C00] shadow-[0_0_8px_#FF5C00] transition duration-200 hover:bg-[#ff5e0047] hover:scale-105 hover:font-bold'
      >
        CART
      </Link>
    </div>

  )
}

export default Navbar