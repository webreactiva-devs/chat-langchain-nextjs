import content from "@/config/content";
import { IconExternalLink } from "@tabler/icons-react";
import Image from "next/image";
import { FC } from "react";

export const Navbar: FC = () => {
  return (
    <div className="flex h-[60px] border-b border-gray-300 py-2 px-8 items-center justify-between">
      <div className="flex align-middle items-center  gap-2">
        <div className="">
          <a href="/">
            <Image
              src="/robotito.png"
              alt="Robotito Responde"
              width="30"
              height="30"
              priority
            />
          </a>
        </div>
        <div className="hidden md:flex font-bold text-2xl  items-center">
          <a className="flex hover:opacity-50 items-center" href="/">
            <div className="ml-2">{content.siteName}</div>
          </a>
        </div>
      </div>

      <div className="flex align-middle items-center gap-2">
        <div>
          <a
            className="flex items-center bg-red-600 p-2 rounded-md text-white hover:opacity-50"
            href={content.menuAboutUsLink}
          >
            <div className="flex">{content.menuAboutUsText}</div>
          </a>
        </div>
        <div>
          <a
            className="flex items-center hover:opacity-50"
            href={content.menuExternalLink}
            target="_blank"
            rel="noreferrer"
          >
            <div className="hidden sm:flex">{content.menuExternalText}</div>

            <IconExternalLink className="ml-1" size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};
