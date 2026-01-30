(function () {
  function init() {
    const wall = document.querySelector(".containervideo.art-wall");
    if (!wall) return;

    const rows = wall.querySelectorAll(".art-wall__row");

    function buildImages(path, from, to) {
      const images = [];
      for (let i = from; i <= to; i++) images.push(`${path}/${i}.jpg`);
      return images;
    }

    function createSet(images, rowIndex) {
      const set = document.createElement("div");
      set.className = "art-wall__set";
      set.style.display = "flex";
      set.style.gap = "10px";

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

      track.style.setProperty("--shift", `${setWidth}px`);

      const required = rowWidth + setWidth;
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

    rows.forEach((rowEl, idx) => buildRow(rowEl, idx));

    let raf = 0;
    window.addEventListener(
      "resize",
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
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
