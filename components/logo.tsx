"use client"

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Logo() {
   return (
      <Link href="/" className="flex items-center group">
         <div className="relative">
            <Image
               src={'/logo.png'}
               alt="Mis Mangos"
               width={128}
               height={128}
               priority
               className='w-10 h-10 rounded-xl shadow-sm transition-transform group-hover:scale-105'
               sizes="(max-width: 768px) 40px, 40px"
            />
         </div>
      </Link>
   )
}
