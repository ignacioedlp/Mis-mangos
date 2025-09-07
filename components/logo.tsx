import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Logo() {
   return (
      <Link href="/" className="flex justify-start w-full px-2">
         <Image
            src={'/logo.png'}
            alt="Logo"
            width={50}
            height={50}
            priority
            className='rounded-full'
         />
      </Link>
   )
}
