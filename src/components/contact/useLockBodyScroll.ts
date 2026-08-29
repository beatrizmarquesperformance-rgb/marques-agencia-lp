"use client";

import { useEffect } from "react";

/** Locks page scroll while `locked`, preserving position and avoiding layout shift. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const { body, documentElement: html } = document;
    const scrollY = window.scrollY;
    const scrollbar = window.innerWidth - html.clientWidth;

    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.paddingRight = prev.paddingRight;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
