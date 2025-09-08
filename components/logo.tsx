"use client"

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Logo() {
   return (
      <Link href="/" className="flex items-center">
         <Image
            src={'/logo.png'}
            alt="Logo"
            width={128}
            height={128}
            priority
            className='w-12 h-12 rounded-full'
            sizes="(max-width: 768px) 48px, 48px"
         />
      </Link>
   )
}
