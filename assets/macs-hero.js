(() => {
  const controllerBySection = new WeakMap();
  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const initHero = (section) => {
    const dog = section.querySelector(".macs-hero__dog");

    if (!dog) return;

    controllerBySection.get(section)?.abort();

    if (reduceMotionQuery.matches) {
      dog.style.setProperty("--macs-hero__dog-scale", "1");
      return;
    }

    const controller = new AbortController();
    controllerBySection.set(section, controller);
    (() => {
      const previousController = window.MacsHeroScroll?.controller;

      if (previousController) {
        previousController.abort();
      }

      const controller = new AbortController();

      window.MacsHeroScroll = {
        controller,
        animationFrame: null,
      };

      const START_SCALE = 1;
      const MAXIMUM_SCALE = 1.1;
      const SCROLL_DISTANCE = 650;

      const updateDogScale = () => {
        const heroes = document.querySelectorAll(".macs-hero__section");

        heroes.forEach((hero) => {
          const dog = hero.querySelector(".macs-hero__dog");

          if (!dog) return;

          const progress = Math.min(
            Math.max(window.scrollY / SCROLL_DISTANCE, 0),
            1,
          );

          const scale = START_SCALE + (MAXIMUM_SCALE - START_SCALE) * progress;

          dog.style.setProperty("--macs-hero__dog-scale", scale.toFixed(4));
        });

        window.MacsHeroScroll.animationFrame = null;
      };

      const requestUpdate = () => {
        if (window.MacsHeroScroll.animationFrame) return;

        window.MacsHeroScroll.animationFrame =
          window.requestAnimationFrame(updateDogScale);
      };

      window.addEventListener("scroll", requestUpdate, {
        passive: true,
        signal: controller.signal,
      });

      window.addEventListener("resize", requestUpdate, {
        signal: controller.signal,
      });

      document.addEventListener("shopify:section:load", requestUpdate, {
        signal: controller.signal,
      });

      updateDogScale();
    })();
    let ticking = false;

    const updateDogScale = () => {
      const rect = section.getBoundingClientRect();
      const distance = Math.min(section.offsetHeight * 0.85, 700);
      const progress = clamp(-rect.top / distance, 0, 1);
      const scale = 1 + progress * 0.07;

      dog.style.setProperty("--macs-hero__dog-scale", scale.toFixed(3));
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(updateDogScale);
    };

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
      signal: controller.signal,
    });

    window.addEventListener("resize", requestUpdate, {
      passive: true,
      signal: controller.signal,
    });

    updateDogScale();
  };

  const initAllHeroes = () => {
    document.querySelectorAll(".macs-hero__section").forEach(initHero);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllHeroes, {
      once: true,
    });
  } else {
    initAllHeroes();
  }

  document.addEventListener("shopify:section:load", (event) => {
    if (event.target.matches(".macs-hero__shopify-section")) {
      const section = event.target.querySelector(".macs-hero__section");
      if (section) initHero(section);
    }
  });

  document.addEventListener("shopify:section:unload", (event) => {
    const section = event.target.querySelector(".macs-hero__section");
    controllerBySection.get(section)?.abort();
  });
})();
