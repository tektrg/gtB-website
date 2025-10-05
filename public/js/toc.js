/* eslint-env browser */
/* eslint no-undef: "off" */
// Table of Contents functionality
document.addEventListener("DOMContentLoaded", function () {
  // Focus trap utility function
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleTabKey(e) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    element.addEventListener("keydown", handleTabKey);
    return function () {
      element.removeEventListener("keydown", handleTabKey);
    };
  }

  const tocList = document.getElementById("toc-list");
  const tocListMobile = document.getElementById("toc-list-mobile");
  const mobileBtn = document.getElementById("toc-mobile-btn");
  const mobileOverlay = document.getElementById("toc-mobile-overlay");
  const mobileClose = document.getElementById("toc-mobile-close");
  const desktopBtn = document.getElementById("toc-desktop-btn");
  const desktopOverlay = document.getElementById("toc-desktop-overlay");
  const desktopClose = document.getElementById("toc-desktop-close");

  if (!tocList || !tocListMobile) return;

  // Generate TOC from headings
  function generateTOC() {
    const headings = document.querySelectorAll(
      "main h1, main h2, main h3, main h4, main h5, main h6",
    );
    if (headings.length === 0) {
      // Hide TOC elements if no headings found
      if (desktopBtn) desktopBtn.style.display = "none";
      if (mobileBtn) mobileBtn.style.display = "none";
      return;
    }

    const tocItems = [];

    headings.forEach((heading, index) => {
      // Create unique ID if not exists
      if (!heading.id) {
        // Generate ID from heading text, ensuring it's a valid CSS selector
        let id = heading.textContent
          .trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/^[\d-]+/, "") // Remove leading numbers and hyphens
          .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

        // If ID is empty or invalid after cleaning, use fallback
        if (!id || id.length === 0) {
          id = `heading-${index}`;
        }

        // Ensure uniqueness by checking if ID already exists
        let finalId = id;
        let counter = 1;
        while (document.getElementById(finalId)) {
          finalId = `${id}-${counter}`;
          counter++;
        }

        heading.id = finalId;
      }

      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent.trim();
      const id = heading.id;

      const listItem = document.createElement("li");
      const link = document.createElement("a");

      link.href = `#${id}`;
      link.textContent = text;
      link.className = `block py-1 px-2 rounded text-brand-muted hover:bg-gray-100 hover:text-brand-fg transition-colors no-underline`;

      // Add indentation based on heading level
      if (level > 1) {
        link.style.paddingLeft = `${(level - 1) * 0.75}rem`;
        link.classList.add("text-muted-light");
      }

      link.addEventListener("click", function (e) {
        e.preventDefault();
        heading.scrollIntoView({ behavior: "smooth", block: "start" });

        // Close overlays if open
        if (mobileOverlay && !mobileOverlay.classList.contains("hidden")) {
          mobileOverlay.classList.add("hidden");
        }
        if (desktopOverlay && desktopOverlay.style.display !== "none") {
          desktopOverlay.style.display = "none";
        }

        // Update active state
        document
          .querySelectorAll(".toc-active")
          .forEach((el) =>
            el.classList.remove(
              "toc-active",
              "bg-accent-blue-light",
              "text-accent-blue",
              "bg-gray-200",
              "text-brand-fg",
            ),
          );
        link.classList.add("toc-active", "bg-gray-200", "text-brand-fg");
      });

      listItem.appendChild(link);
      tocItems.push({ element: listItem.cloneNode(true), level });
    });

    // Populate both desktop and mobile TOCs
    tocItems.forEach((item) => {
      tocList.appendChild(item.element);
      tocListMobile.appendChild(item.element.cloneNode(true));
    });

    // Add click handlers for desktop TOC
    tocList.querySelectorAll("a").forEach((link, index) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        let target = null;

        try {
          target = document.querySelector(targetId);
        } catch {
          // If selector is invalid, try to find by ID directly
          const id = targetId.replace("#", "");
          target = document.getElementById(id);
        }

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          // Close desktop overlay
          if (desktopOverlay) {
            desktopOverlay.style.display = "none";
          }

          // Update active state in both TOCs
          document
            .querySelectorAll(".toc-active")
            .forEach((el) =>
              el.classList.remove(
                "toc-active",
                "bg-accent-blue-light",
                "text-accent-blue",
              ),
            );
          link.classList.add(
            "toc-active",
            "bg-accent-blue-light",
            "text-accent-blue",
          );

          // Also update corresponding mobile TOC link
          const mobileLinks = tocListMobile.querySelectorAll("a");
          if (mobileLinks[index]) {
            mobileLinks[index].classList.add(
              "toc-active",
              "bg-accent-blue-light",
              "text-accent-blue",
            );
          }
        }
      });
    });

    // Re-bind click events for mobile TOC
    tocListMobile.querySelectorAll("a").forEach((link, index) => {
      const desktopLink = tocList.querySelectorAll("a")[index];
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        let target = null;

        try {
          target = document.querySelector(targetId);
        } catch {
          // If selector is invalid, try to find by ID directly
          const id = targetId.replace("#", "");
          target = document.getElementById(id);
        }

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          mobileOverlay.classList.add("hidden");
          if (desktopOverlay && desktopOverlay.style.display !== "none") {
            desktopOverlay.style.display = "none";
          }

          // Update active state in both TOCs
          document
            .querySelectorAll(".toc-active")
            .forEach((el) =>
              el.classList.remove(
                "toc-active",
                "bg-accent-blue-light",
                "text-accent-blue",
              ),
            );
          link.classList.add(
            "toc-active",
            "bg-accent-blue-light",
            "text-accent-blue",
          );
          if (desktopLink) {
            desktopLink.classList.add(
              "toc-active",
              "bg-accent-blue-light",
              "text-accent-blue",
            );
          }
        }
      });
    });
  }

  // Mobile toggle functionality
  if (mobileBtn && mobileOverlay && mobileClose) {
    let mobileFocusTrapCleanup;

    function closeMobileTOC() {
      mobileOverlay.classList.add("hidden");
      mobileOverlay.setAttribute("aria-hidden", "true");
      if (mobileFocusTrapCleanup) {
        mobileFocusTrapCleanup();
        mobileFocusTrapCleanup = null;
      }
      mobileBtn.focus(); // Return focus to button
    }

    function openMobileTOC() {
      mobileOverlay.classList.remove("hidden");
      mobileOverlay.setAttribute("aria-hidden", "false");
      // Set up focus trapping
      mobileFocusTrapCleanup = trapFocus(mobileOverlay);
      // Focus first link for keyboard navigation
      const firstLink = mobileOverlay.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    mobileBtn.addEventListener("click", function () {
      if (mobileOverlay.classList.contains("hidden")) {
        openMobileTOC();
      } else {
        closeMobileTOC();
      }
    });

    mobileClose.addEventListener("click", function () {
      closeMobileTOC();
    });

    mobileOverlay.addEventListener("click", function (e) {
      if (e.target === mobileOverlay) {
        closeMobileTOC();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobileOverlay.classList.contains("hidden")) {
        closeMobileTOC();
        mobileBtn.focus(); // Return focus to button
      }
    });
  }

  // Desktop toggle functionality
  if (desktopBtn && desktopOverlay && desktopClose) {
    let desktopFocusTrapCleanup;

    function closeDesktopTOC() {
      desktopOverlay.style.display = "none";
      desktopOverlay.setAttribute("aria-hidden", "true");
      if (desktopFocusTrapCleanup) {
        desktopFocusTrapCleanup();
        desktopFocusTrapCleanup = null;
      }
      desktopBtn.focus(); // Return focus to button
    }

    function openDesktopTOC() {
      desktopOverlay.style.display = "block";
      desktopOverlay.setAttribute("aria-hidden", "false");
      // Set up focus trapping
      desktopFocusTrapCleanup = trapFocus(desktopOverlay);
      // Focus first link for keyboard navigation
      const firstLink = desktopOverlay.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    desktopBtn.addEventListener("click", function () {
      if (desktopOverlay.style.display === "none") {
        openDesktopTOC();
      } else {
        closeDesktopTOC();
      }
    });

    desktopClose.addEventListener("click", function () {
      closeDesktopTOC();
    });

    desktopOverlay.addEventListener("click", function (e) {
      if (e.target === desktopOverlay) {
        closeDesktopTOC();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && desktopOverlay.style.display !== "none") {
        closeDesktopTOC();
        desktopBtn.focus(); // Return focus to button
      }
    });
  }

  // Initialize TOC
  generateTOC();

  // Highlight current section on scroll (optional enhancement)
  let ticking = false;
  function updateActiveSection() {
    if (!ticking) {
      requestAnimationFrame(function () {
        const headings = document.querySelectorAll(
          "main h1, main h2, main h3, main h4, main h5, main h6",
        );

        let current = null;
        headings.forEach((heading) => {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 100) {
            current = heading;
          }
        });

        if (current) {
          document
            .querySelectorAll(".toc-active")
            .forEach((el) =>
              el.classList.remove(
                "toc-active",
                "bg-accent-blue-light",
                "text-accent-blue",
              ),
            );

          // Find active links safely, handling invalid CSS selectors
          let activeLinks = [];
          try {
            activeLinks = document.querySelectorAll(`a[href="#${current.id}"]`);
          } catch {
            // If selector is invalid, find links by iterating through all TOC links
            const allTocLinks = document.querySelectorAll(
              "#toc-list a, #toc-list-mobile a",
            );
            activeLinks = Array.from(allTocLinks).filter(
              (link) => link.getAttribute("href") === `#${current.id}`,
            );
          }

          activeLinks.forEach((link) =>
            link.classList.add(
              "toc-active",
              "bg-accent-blue-light",
              "text-accent-blue",
            ),
          );
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", updateActiveSection);
});
