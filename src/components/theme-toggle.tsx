"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ ghost = false }: { ghost?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("btm-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <Button type="button" variant={ghost ? "ghost" : "secondary"} aria-pressed={dark} onClick={toggle}>
      {dark ? "Light mode" : "Dark mode"}
    </Button>
  );
}
