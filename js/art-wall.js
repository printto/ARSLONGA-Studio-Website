(function () {
  function init() {
    const wall = document.querySelector(".containervideo.art-wall");
    if (!wall) return;

    const rows = wall.querySelectorAll(".art-wall__row");

    function buildImages(path, from, to) {
      const images = [];
      for (let i = from; i <= to; i++) {
        images.push(`${path}/${i}.jpg`);
      }
      return images;
    }

    function buildRow(rowEl) {
      const path = rowEl.dataset.path;
      const from = Number(rowEl.dataset.from);
      const to = Number(rowEl.dataset.to);
      const speed = Number(rowEl.dataset.speed || "200");

      if (!path || !from || !to || from > to) return;

      const images = buildImages(path, from, to);

      const track = document.createElement("div");
      track.className = "art-wall__track";
      track.style.setProperty("--dur", `${speed}s`);

      function createSet() {
        const set = document.createElement("div");
        set.style.display = "flex";
        set.style.gap = "10px";

        images.forEach((src, i) => {
          const tile = document.createElement("div");
          tile.className = "art-wall__tile";

          if (i % 6 === 0) tile.classList.add("wide");
          if (i % 7 === 0) tile.classList.add("tall");

          const img = document.createElement("img");
          img.loading = "lazy";
          img.decoding = "async";
          img.src = src;
          img.alt = "";

          tile.appendChild(img);
          set.appendChild(tile);
        });

        return set;
      }

      track.appendChild(createSet());
      track.appendChild(createSet()); // seamless loop

      rowEl.innerHTML = "";
      rowEl.appendChild(track);
    }

    rows.forEach(buildRow);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
