"use client";

import { useBackgroundImage } from "@/hooks/useBackgroundImage";

export function AdminBackground() {
  const { background } = useBackgroundImage();

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url('${background.url}')` }}
      />
      <div className="fixed inset-0 -z-10 bg-slate-950/40" />
    </>
  );
}
