import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHashElement:React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element instanceof HTMLElement) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToHashElement;
