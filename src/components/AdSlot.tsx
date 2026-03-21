"use client";

import { useEffect } from "react";

interface Props {
  slot: string;
}

export function AdSlot({ slot }: Props) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[336px] sm:max-w-[468px] md:max-w-[728px]">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-7976139023602789"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
}
