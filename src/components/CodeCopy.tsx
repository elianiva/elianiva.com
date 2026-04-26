import { useEffect, useRef } from "react";

export function CodeCopy() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preElements = container.querySelectorAll("pre");
    const buttons: HTMLButtonElement[] = [];

    preElements.forEach((pre) => {
      const wrapper = document.createElement("div");
      wrapper.className = "relative group";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const button = document.createElement("button");
      button.className =
        "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 border border-pink-200 p-1.5 text-pink-700 hover:bg-white hover:text-pink-900 focus:outline-none focus:ring focus:ring-pink-400 focus:ring-offset-2";
      button.setAttribute("aria-label", "Copy code");
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v16H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-16h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V64h112Zm48-48h-32V56a8 8 0 0 0-8-8H96V48h112z"/></svg>`;

      button.addEventListener("click", async () => {
        const code = pre.querySelector("code")?.textContent || pre.textContent || "";
        try {
          await navigator.clipboard.writeText(code);
          button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z"/></svg>`;
          button.setAttribute("aria-label", "Copied!");
          setTimeout(() => {
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256"><path fill="currentColor" d="M216 32H88a8 8 0 0 0-8 8v16H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-16h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8m-56 176H48V64h112Zm48-48h-32V56a8 8 0 0 0-8-8H96V48h112z"/></svg>`;
            button.setAttribute("aria-label", "Copy code");
          }, 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      });

      wrapper.appendChild(button);
      buttons.push(button);
    });

    return () => {
      preElements.forEach((pre) => {
        const wrapper = pre.parentElement;
        if (wrapper?.classList.contains("group")) {
          wrapper.parentNode?.insertBefore(pre, wrapper);
          wrapper.remove();
        }
      });
    };
  }, []);

  return <div ref={containerRef} className="contents" />;
}
