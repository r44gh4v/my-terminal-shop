import React from 'react'
import { Link } from "react-router-dom";

function Navbar() {
    return (

        <div className='bg-amber-600'>
            <Link
                to={"/"}
                className=''
            >Home</Link>

            <Link
                to={"/cart"}
                className=''
            >Cart</Link>
        </div>

    )
}

export default Navbar