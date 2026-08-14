(function () {
  // iPhone and iPad have their own builders (art-wall-ios.js / art-wall-ipad.js),
  // which handle WebKit's issues with runtime measuring + cloned images. This
  // desktop/Android version stays as the original and simply steps aside for them.
  function handledByDeviceFile() {
    const ua = navigator.userAgent || "";
    const isIPhone = /iPhone|iPod/.test(ua);
    const isIPad =
      /iPad/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return isIPhone || isIPad;
  }

  function init() {
    if (handledByDeviceFile()) return;

    const wall = document.querySelector(".containervideo.art-wall");
    if (!wall) return;

    const rows = wall.querySelectorAll(".art-wall__row");

    function syncGap() {
      const rowH = rows[0] ? rows[0].getBoundingClientRect().height : 0;
      if (rowH <= 0) return currentGap();
      const gap = Math.max(3, Math.min(10, rowH * 0.045));
      wall.style.setProperty("--art-wall-gap", `${gap}px`);
      return gap;
    }

    function currentGap() {
      return parseFloat(getComputedStyle(wall).getPropertyValue("--art-wall-gap")) || 10;
    }

    function buildImages(path, from, to) {
      const images = [];
      for (let i = from; i <= to; i++) images.push(`${path}/${i}.jpg`);
      return images;
    }

    function createSet(images, rowIndex) {
      // display/gap come from .art-wall__set in art-wall.css.
      const set = document.createElement("div");
      set.className = "art-wall__set";

      images.forEach((src, i) => {
        const tile = document.createElement("div");
        tile.className = "art-wall__tile";

        if ((i + rowIndex) % 6 === 0) tile.classList.add("wide");
        if ((i + rowIndex) % 7 === 0) tile.classList.add("tall");

        const img = document.createElement("img");
        // img.loading = "lazy";
        // img.decoding = "async";
        img.src = src;
        img.alt = "";

        tile.appendChild(img);
        set.appendChild(tile);
      });

      return set;
    }

    function ensureNoGap(track, setTemplate, rowEl) {
      const rowWidth = rowEl.getBoundingClientRect().width;
      const setWidth = setTemplate.getBoundingClientRect().width;

      if (rowWidth <= 0 || setWidth <= 0) {
        requestAnimationFrame(() => ensureNoGap(track, setTemplate, rowEl));
        return;
      }

      const gap = currentGap();
      track.style.setProperty("--shift", `${setWidth + gap}px`);

      const required = rowWidth + setWidth + gap;
      while (track.getBoundingClientRect().width < required) {
        track.appendChild(setTemplate.cloneNode(true));
      }
    }

    function buildRow(rowEl, rowIndex) {
      const path = rowEl.dataset.path;
      const from = Number(rowEl.dataset.from);
      const to = Number(rowEl.dataset.to);
      const speed = Number(rowEl.dataset.speed || "200");

      if (!path || !Number.isFinite(from) || !Number.isFinite(to) || from > to) return;

      const images = buildImages(path, from, to);

      const track = document.createElement("div");
      track.className = "art-wall__track";
      track.style.setProperty("--dur", `${Math.max(10, speed)}s`);

      const set1 = createSet(images, rowIndex);
      track.appendChild(set1);
      track.appendChild(set1.cloneNode(true));

      rowEl.innerHTML = "";
      rowEl.appendChild(track);

      const finalize = () => requestAnimationFrame(() => ensureNoGap(track, set1, rowEl));
      finalize();

      const firstImg = track.querySelector("img");
      if (firstImg && !firstImg.complete) {
        firstImg.addEventListener("load", finalize, { once: true });
        firstImg.addEventListener("error", finalize, { once: true });
      }
    }

    syncGap();
    rows.forEach((rowEl, idx) => buildRow(rowEl, idx));

    let raf = 0;
    window.addEventListener(
      "resize",
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          syncGap();
          rows.forEach((rowEl, idx) => {
            const track = rowEl.querySelector(".art-wall__track");
            const set1 = rowEl.querySelector(".art-wall__set");
            if (track && set1) ensureNoGap(track, set1, rowEl);
          });
        });
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
