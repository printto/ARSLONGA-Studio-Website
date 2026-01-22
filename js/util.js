(function () {
  const dropdowns = document.querySelectorAll("details.footer-dropdown");

  document.addEventListener("click", function (e) {
    dropdowns.forEach(function (dd) {
      if (!dd.contains(e.target)) dd.removeAttribute("open");
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dropdowns.forEach(function (dd) {
        dd.removeAttribute("open");
      });
    }
  });

  dropdowns.forEach(function (dd) {
    dd.addEventListener("click", function (e) {
      const a = e.target.closest("a");
      if (a) dd.removeAttribute("open");
    });
  });
})();
