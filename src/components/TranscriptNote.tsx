import React, { Fragment } from "react";
import useTruncatedElement from "@/hooks/useTruncatedElement";
import { IconArrowsDown, IconArrowsUp } from "@tabler/icons-react";

export default function TranscriptNote({
  children,
  lineClamp = "line-clamp-3",
}) {
  const ref = React.useRef(null);
  const { isTruncated, isShowingMore, toggleIsShowingMore } =
    useTruncatedElement({
      ref,
    });
  const classParagraph = isShowingMore
    ? "opacity-100 delay-100 transition-opacity"
    : "opacity-0 delay-0 transition-opacity h-0";

  return (
    <div className="flex flex-col gap-1">
      <button
        className="border border-zinc-600 text-sm rounded-lg p-1 w-48 flex justify-center items-center gap-2 text-gray-500 hover:opacity-50"
        onClick={toggleIsShowingMore}
      >
        {isShowingMore ? (
          <Fragment>
            <span>Ocultar</span> <IconArrowsUp size={16} />
          </Fragment>
        ) : (
          <Fragment>
            <span>Ver extracto</span> <IconArrowsDown size={16} />
          </Fragment>
        )}
      </button>

      <p
        ref={ref}
        className={`break-words text-sm text-white ${classParagraph}`}
      >
        {children}
      </p>
    </div>
  );
}
