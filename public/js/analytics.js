/* eslint-env browser */
/* eslint no-undef: "off" */
// Google Analytics Implementation
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-30EX1TYBPM");

// Landing Page Conversion Tracking
document.addEventListener("DOMContentLoaded", function () {
  // Track landing page views
  if (
    window.location.pathname.startsWith("/for-") ||
    window.location.pathname.startsWith("/privacy-first")
  ) {
    const landingPageType = window.location.pathname
      .replace("/", "")
      .replace("-", "_");
    gtag("event", "landing_page_view", {
      page_type: landingPageType,
      page_location: window.location.href,
      page_title: document.title,
    });
  }

  // Track CTA clicks
  document.addEventListener("click", function (e) {
    const target = e.target.closest("a");
    if (!target) return;

    // Track Chrome extension install clicks
    if (target.href && target.href.includes("chrome.google.com/webstore")) {
      const landingPage =
        window.location.pathname.replace("/", "") || "homepage";

      // Determine button location/type
      let buttonLocation = "other";
      if (target.className.includes("btn-primary") || target.className.includes("primary")) {
        buttonLocation = "primary";
      } else if (target.className.includes("btn-secondary") || target.className.includes("secondary")) {
        buttonLocation = "secondary";
      } else if (target.className.includes("install")) {
        buttonLocation = "nav_install";
      } else if (target.className.includes("desktop-cta")) {
        buttonLocation = "hero_desktop";
      } else if (target.closest(".mobile-email-form")) {
        buttonLocation = "hero_mobile";
      }

      // Determine context/section based on parent elements
      let context = "general";
      const section = target.closest("section");
      if (section) {
        const sectionId = section.id || section.className;
        if (sectionId.includes("hero")) context = "hero";
        else if (sectionId.includes("features")) context = "features";
        else if (sectionId.includes("conversation") || sectionId.includes("chat")) context = "conversation";
        else if (sectionId.includes("pricing")) context = "pricing";
        else if (sectionId.includes("get-started") || sectionId.includes("cta")) context = "call_to_action";
        else if (sectionId.includes("guide")) context = "guide";
        else if (sectionId.includes("faq")) context = "faq";
        else if (sectionId) context = sectionId;
      }

      // Check for conversation-related context in surrounding text
      const parentText = target.parentElement?.textContent?.toLowerCase() || "";
      if (parentText.includes("chat") || parentText.includes("conversation") ||
          parentText.includes("ask") || parentText.includes("follow-up") ||
          parentText.includes("q&a") || parentText.includes("interact")) {
        context = "conversation_feature";
      }

      gtag("event", "chrome_extension_click", {
        landing_page: landingPage,
        button_text: target.textContent.trim(),
        button_location: buttonLocation,
        click_context: context,
        event_category: "conversion",
        event_label: `${landingPage}_${context}`,
      });
    }

    // Track secondary CTA clicks
    if (
      target.href &&
      (target.href.includes("#") ||
        target.href.includes("/blog") ||
        target.href.includes("guide"))
    ) {
      const actionType = target.href.includes("#")
        ? "scroll_to_section"
        : target.href.includes("/blog")
          ? "blog_visit"
          : "guide_access";
      gtag("event", "secondary_cta_click", {
        action_type: actionType,
        landing_page: window.location.pathname.replace("/", "") || "homepage",
        button_text: target.textContent.trim(),
      });
    }
  });

  // Track form submissions (if any future forms are added)
  document.addEventListener("submit", function (e) {
    if (e.target.tagName === "FORM") {
      gtag("event", "form_submit", {
        form_type: e.target.id || "unknown",
        landing_page: window.location.pathname.replace("/", "") || "homepage",
      });
    }
  });

  // Track scroll depth for engagement
  let maxScroll = 0;
  let scrollTimer;
  window.addEventListener("scroll", function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100,
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        // Track milestone scrolls
        if (scrollPercent >= 25 && maxScroll < 50) {
          gtag("event", "scroll_depth", {
            depth: "25",
            landing_page:
              window.location.pathname.replace("/", "") || "homepage",
          });
        } else if (scrollPercent >= 50 && maxScroll < 75) {
          gtag("event", "scroll_depth", {
            depth: "50",
            landing_page:
              window.location.pathname.replace("/", "") || "homepage",
          });
        } else if (scrollPercent >= 75 && maxScroll < 90) {
          gtag("event", "scroll_depth", {
            depth: "75",
            landing_page:
              window.location.pathname.replace("/", "") || "homepage",
          });
        } else if (scrollPercent >= 90) {
          gtag("event", "scroll_depth", {
            depth: "90",
            landing_page:
              window.location.pathname.replace("/", "") || "homepage",
          });
        }
      }
    }, 500);
  });

  // Track time on page for engagement analysis
  const startTime = Date.now();
  let engagementSent = false;

  function trackEngagement() {
    if (!engagementSent) {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      if (timeOnPage >= 30) {
        // 30 seconds threshold
        gtag("event", "engaged_session", {
          time_on_page: timeOnPage,
          landing_page: window.location.pathname.replace("/", "") || "homepage",
        });
        engagementSent = true;
      }
    }
  }

  // Track engagement on page leave
  window.addEventListener("beforeunload", trackEngagement);

  // Track engagement after 30 seconds
  setTimeout(trackEngagement, 30000);

  // Mobile menu functionality for non-landing pages (landing pages attach their own handler)
  const isLandingPage = document.body.dataset.isLandingPage === "true";
  if (!isLandingPage) {
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
    const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");

    if (mobileMenuToggle && mobileMenuOverlay) {
      // Function to close menu
      function closeMenu() {
        mobileMenuOverlay.classList.remove("active");
        mobileMenuToggle.classList.remove("active");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        mobileMenuOverlay.setAttribute("aria-hidden", "true");
      }

      // Function to open menu
      function openMenu() {
        mobileMenuOverlay.classList.add("active");
        mobileMenuToggle.classList.add("active");
        mobileMenuToggle.setAttribute("aria-expanded", "true");
        mobileMenuOverlay.setAttribute("aria-hidden", "false");
      }

      mobileMenuToggle.addEventListener("click", function () {
        const isActive = mobileMenuOverlay.classList.contains("active");
        if (isActive) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      // Close menu when clicking overlay
      mobileMenuOverlay.addEventListener("click", function (e) {
        if (e.target === mobileMenuOverlay) {
          closeMenu();
        }
      });

      // Close menu when clicking links
      const mobileMenuLinks = mobileMenuOverlay.querySelectorAll("a");
      mobileMenuLinks.forEach((link) => {
        link.addEventListener("click", function () {
          closeMenu();
        });
      });

      // Close menu on Escape key
      document.addEventListener("keydown", function (e) {
        if (
          e.key === "Escape" &&
          mobileMenuOverlay.classList.contains("active")
        ) {
          closeMenu();
        }
      });
    }
  }
});
