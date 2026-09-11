import { useEffect, useState } from "react";
import { DEMO_BASE_URL, withUtm } from "@/lib/logixtic";

/** Returns the demo booking URL, preserving UTM params from the current page. */
export function useDemoUrl() {
  const [url, setUrl] = useState(DEMO_BASE_URL);

  useEffect(() => {
    setUrl(withUtm(DEMO_BASE_URL, window.location.search));
  }, []);

  return url;
}
