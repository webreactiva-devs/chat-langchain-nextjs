import content from "@/config/content";
import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="flex h-[50px] border-t border-gray-300 py-2 px-8 items-center sm:justify-between justify-center">
      <div className="hidden sm:flex"></div>

      <div className="hidden sm:flex italic text-sm" dangerouslySetInnerHTML={{__html: content.footerMessage}}>
      </div>

      <div className="flex space-x-4">
        {" "}
      </div>
    </div>
  );
};
