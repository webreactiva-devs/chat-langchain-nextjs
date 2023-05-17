import { IconExternalLink } from "@tabler/icons-react";
import TranscriptNote from "./TranscriptNote";

export default function ResultPill({ contents, metadata }) {
  return (
    <div className=" border border-zinc-600 rounded-lg p-2">
      <div className="flex justify-between">
        <div className="flex items-center">
          <div className="font-bold text-sm">
            <a
              className="hover:opacity-50"
              href={metadata.link}
              target="_blank"
              rel="noreferrer"
            >
              {metadata.title}
            </a>
          </div>
        </div>
        <a
          className="hover:opacity-50 ml-4"
          href={metadata.link}
          target="_blank"
          rel="noreferrer"
        >
          <IconExternalLink />
        </a>
      </div>
      {contents.map((pageContent, index) => (
        <TranscriptNote key={index} lineClamp="line-clamp-1">
          {pageContent}
        </TranscriptNote>
      ))}
    </div>
  );
}
