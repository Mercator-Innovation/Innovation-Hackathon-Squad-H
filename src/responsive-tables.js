// On phones, tables show each row as a small card (see theme.css). This labels every cell with
// its column's heading for the card view, and keeps the table roles so screen readers still
// read it as a table. It runs again whenever the page redraws its tables.
(function () {
  function label(table) {
    const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    table.setAttribute("role", "table");
    table.querySelectorAll("thead, tbody").forEach((group) => group.setAttribute("role", "rowgroup"));
    table.querySelectorAll("tr").forEach((row) => {
      row.setAttribute("role", "row");
      [...row.children].forEach((cell, i) => {
        if (cell.tagName === "TH") cell.setAttribute("role", cell.getAttribute("scope") === "row" ? "rowheader" : "columnheader");
        else cell.setAttribute("role", "cell");
        if (!cell.closest("thead") && heads[i]) cell.setAttribute("data-label", heads[i]);
      });
    });
    table.classList.add("stack-on-phone");
  }

  function run() {
    document.querySelectorAll("main table:not(.stack-on-phone)").forEach(label);
  }

  run();
  new MutationObserver(run).observe(document.getElementById("main"), { childList: true, subtree: true });
})();
