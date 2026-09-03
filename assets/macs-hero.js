(() => {
  const PAGE_WRAPPER_SELECTOR = ".page-wrapper";

  const root = document.documentElement;
  const squeezeQuery = window.matchMedia("(min-width: 990px)");
  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  let animationFrame = null;
  let currentScrollContainer = null;

  const getScrollContainer = () => {
    if (squeezeQuery.matches) {
      return (
        document.querySelector(PAGE_WRAPPER_SELECTOR) ??
        document.scrollingElement ??
        document.documentElement
      );
    }

    return document.scrollingElement ?? document.documentElement;
  };

  const setHeroMotion = (progress) => {
    const scale = 1 + progress * 0.1;

    root.style.setProperty("--macs-hero__dog-scale", scale.toFixed(3));
    root.style.setProperty(
      "--macs-hero__bag-x",
      `${(-54 * progress).toFixed(1)}px`,
    );
    root.style.setProperty(
      "--macs-hero__bag-y",
      `${(15 * progress).toFixed(1)}px`,
    );
    root.style.setProperty(
      "--macs-hero__can-x",
      `${(48 * progress).toFixed(1)}px`,
    );
    root.style.setProperty(
      "--macs-hero__can-y",
      `${(14 * progress).toFixed(1)}px`,
    );
    root.style.setProperty(
      "--macs-hero__snack-x",
      `${(44 * progress).toFixed(1)}px`,
    );
    root.style.setProperty(
      "--macs-hero__snack-y",
      `${(-26 * progress).toFixed(1)}px`,
    );
  };

  const updateHeroMotion = () => {
    const hero = document.querySelector(".macs-hero__section");

    if (!hero) {
      animationFrame = null;
      return;
    }

    if (reduceMotionQuery.matches) {
      setHeroMotion(0);
      animationFrame = null;
      return;
    }

    const scrollTop = getScrollContainer().scrollTop;
    const progress = clamp(scrollTop / 320, 0, 1);

    setHeroMotion(progress);

    animationFrame = null;
  };

  const requestUpdate = () => {
    if (animationFrame) return;

    animationFrame = window.requestAnimationFrame(updateHeroMotion);
  };

  const initAllHeroes = () => {
    const nextScrollContainer = getScrollContainer();

    if (currentScrollContainer !== nextScrollContainer) {
      currentScrollContainer?.removeEventListener("scroll", requestUpdate);
      currentScrollContainer = nextScrollContainer;
      currentScrollContainer.addEventListener("scroll", requestUpdate, {
        passive: true,
      });
    }

    requestUpdate();
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", initAllHeroes, { passive: true });
  window.addEventListener("load", initAllHeroes, { passive: true });
  squeezeQuery.addEventListener?.("change", initAllHeroes);
  reduceMotionQuery.addEventListener?.("change", requestUpdate);
  document.addEventListener("shopify:section:load", initAllHeroes);
  document.addEventListener("shopify:section:unload", initAllHeroes);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllHeroes, {
      once: true,
    });
  } else {
    initAllHeroes();
  }
})();
