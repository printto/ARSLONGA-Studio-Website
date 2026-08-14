/*
 * Art wall — iPhone / iPod build.
 *
 * Written from scratch for iOS rather than adapted from the desktop version.
 * Renders each image exactly ONCE per row and recycles tiles: when a tile scrolls
 * off the left edge it is repositioned to the right end, so the marquee is endless
 * with no duplicate sets and no cloning. That keeps the DOM and the number of
 * decoded images to the minimum (9-10 per row instead of ~30), which is what iOS
 * WebKit needs — a device audit confirmed every CSS/JS API here is supported, so
 * the failure was sheer volume of tiles being rasterized, not missing features.
 *
 * iPad has its own copy (art-wall-ipad.js) so the two can be tuned separately.
 * Desktop/Android use art-wall.js, untouched.
 */
(function () {
  const ua = navigator.userAgent || "";
  const isIPhone = /iPhone|iPod/.test(ua);
  if (!isIPhone) return;

  function gapFor(wall, rowEl) {
    const rowH = rowEl.getBoundingClientRect().height;
    const gap = rowH > 0 ? Math.max(3, Math.min(10, rowH * 0.045)) : 10;
    wall.style.setProperty("--art-wall-gap", `${gap}px`);
    return gap;
  }

  function buildImages(path, from, to) {
    const images = [];
    // Lightweight copies ("img/img26" -> "img/img26-ios"); originals stay for desktop.
    for (let i = from; i <= to; i++) images.push(`${path}-ios/${i}.jpg`);
    return images;
  }

  function createTile(src, index, rowIndex) {
    const tile = document.createElement("div");
    tile.className = "art-wall__tile";
    if ((index + rowIndex) % 6 === 0) tile.classList.add("wide");
    if ((index + rowIndex) % 7 === 0) tile.classList.add("tall");

    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    tile.appendChild(img);
    return tile;
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function run(rowEl, tiles, speed, reverse) {
    let widths = [];
    let starts = [];
    let total = 0;
    let offset = 0;
    let last = 0;

    function measure() {
      const w = tiles.map((t) => t.getBoundingClientRect().width);
      if (w.some((x) => x < 1)) return false; // images not sized yet
      const gap = gapFor(rowEl.closest(".art-wall"), rowEl);
      widths = w;
      starts = [];
      let acc = 0;
      for (let i = 0; i < tiles.length; i++) {
        starts.push(acc);
        acc += widths[i] + gap;
      }
      total = acc;
      return total > 0;
    }

    function frame(now) {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (total <= 0) {
        measure();
      } else {
        offset += (total / speed) * dt * (reverse ? -1 : 1);
        offset = mod(offset, total);

        const rowW = rowEl.clientWidth;
        for (let i = 0; i < tiles.length; i++) {
          let x = mod(starts[i] - offset, total);
          // A tile past the right edge belongs just off the left edge instead —
          // this is the recycle step that makes the loop endless.
          if (x > rowW) x -= total;
          tiles[i].style.transform = `translateX(${x}px)`;
        }
      }

      requestAnimationFrame(frame);
    }

    // Re-measure once everything has loaded, and on orientation change.
    let pending = tiles.length;
    tiles.forEach((t) => {
      const img = t.querySelector("img");
      const done = () => {
        if (--pending <= 0) total = 0; // force a re-measure on the next frame
      };
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });

    window.addEventListener("resize", () => { total = 0; }, { passive: true });

    requestAnimationFrame(frame);
  }

  function buildRow(rowEl, rowIndex) {
    const path = rowEl.dataset.path;
    const from = Number(rowEl.dataset.from);
    const to = Number(rowEl.dataset.to);
    const speed = Number(rowEl.dataset.speed || "200");

    if (!path || !Number.isFinite(from) || !Number.isFinite(to) || from > to) return;

    const images = buildImages(path, from, to);

    rowEl.innerHTML = "";
    const tiles = images.map((src, i) => {
      const tile = createTile(src, i, rowIndex);
      rowEl.appendChild(tile);
      return tile;
    });

    run(rowEl, tiles, Math.max(10, speed), rowEl.dataset.reverse === "1");
  }

  function init() {
    const wall = document.querySelector(".containervideo.art-wall");
    if (!wall) return;

    wall.classList.add("art-wall--fixed");
    wall.querySelectorAll(".art-wall__row").forEach((rowEl, idx) => buildRow(rowEl, idx));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
