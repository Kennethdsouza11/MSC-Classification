import Link from "next/link";
import { UserNav } from "./UserNav";
import  Image  from "next/image";
import DesktopLogo from "../../public/mahe_logo.jpg"
import MobileLogo from "../../public/mobilelogo.png"

export function Navbar() {
  return (
    <nav className="w-full border-b">
      <div className="flex items-center justify-between container mx-auto px-5 lg: px-10 py-5">
        <Link href="/">
          <Image src={DesktopLogo} alt="Desktop Logo" className = "w-52 hidden lg:block"></Image>
          <Image src = {MobileLogo} alt = "Mobile Logo" className = "w-12 block lg:hidden"></Image>
        </Link>

        <UserNav />
      </div>
    </nav>
  );
}
