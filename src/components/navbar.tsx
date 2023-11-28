import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';

const NavBar = () => {
  return (
    <nav className='flex justify-between bg-white text-black p-2 shadow-lg fixed w-full'>
      <div>
        <Link href='/'>
          <Image
            src='/logo.png'
            alt='logo'
            width={150}
            height={50}
          />
        </Link>
      </div>
      <ConnectButton />
    </nav>
  )
}

export default NavBar
