document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll("a[href]");
    links.forEach(link => {
      const href = link.getAttribute("href");
  
      // External links or links to PDF
      if (
        href.startsWith("http") && !href.includes(location.hostname)
        || href.endsWith(".pdf")
      ) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  });
  