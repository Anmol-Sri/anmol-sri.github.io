(function () {
  "use strict";

  var root = document.documentElement;
  var header = document.querySelector("[data-header]");
  var progress = document.querySelector(".scroll-progress");
  var navProgress = document.querySelector("[data-nav-progress]");
  var themeToggle = document.querySelector("[data-theme-toggle]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var tiltCards = Array.prototype.slice.call(document.querySelectorAll(".tilt-card, .timeline-item, .skill-card, .focus-card, .achievement-pill, .education-card"));
  var cursorOrb = document.querySelector(".cursor-orb");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setTheme(theme) {
    var nextTheme = theme === "light" ? "light" : "dark";
    root.classList.toggle("dark", nextTheme === "dark");
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    try {
      localStorage.setItem("anmol-theme", nextTheme);
    } catch (error) {
      // Theme persistence is optional.
    }
  }

  function updateScrollState() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var percent = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;

    if (progress) {
      if (!progress.classList.contains("is-loading")) {
        progress.style.width = percent + "%";
      }
    }

    if (navProgress) {
      navProgress.textContent = Math.round(percent) + "%";
    }

    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 12);
    }

    var activeId = "";
    var offset = window.innerHeight * 0.35;
    document.querySelectorAll("main section[id]").forEach(function (section) {
      if (section.getBoundingClientRect().top <= offset) {
        activeId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + activeId);
    });
  }

  function closeMenu() {
    if (!menuToggle || !navMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    navMenu.classList.remove("is-open");
  }

  function setupSectionNavigation() {
    navLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href");
        var target = href ? document.querySelector(href) : null;

        if (!target) return;

        event.preventDefault();
        closeMenu();

        var headerOffset = header ? header.offsetHeight + 18 : 92;
        var targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: reducedMotion ? "auto" : "smooth"
        });

        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", href);
        }

        window.setTimeout(updateScrollState, reducedMotion ? 0 : 420);
      });
    });
  }

  function setupReveal() {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -80px 0px"
    });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  function setupTilt() {
    if (reducedMotion) return;

    tiltCards.forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var rotateY = ((x / rect.width) - 0.5) * 9;
        var rotateX = ((y / rect.height) - 0.5) * -9;

        card.style.setProperty("--mx", (x / rect.width) * 100 + "%");
        card.style.setProperty("--my", (y / rect.height) * 100 + "%");
        if (card.classList.contains("timeline-item")) {
          card.style.transform = "translateY(-2px)";
        } else {
          card.style.transform = "perspective(900px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-3px)";
        }
      });

      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  function setupCursor() {
    if (!cursorOrb || reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    window.addEventListener("pointermove", function (event) {
      cursorOrb.classList.add("is-active");
      cursorOrb.style.transform = "translate(" + event.clientX + "px, " + event.clientY + "px) translate(-50%, -50%)";
    });

    document.querySelectorAll("a, button, .tilt-card").forEach(function (element) {
      element.addEventListener("pointerenter", function () {
        cursorOrb.classList.add("is-hovering");
      });
      element.addEventListener("pointerleave", function () {
        cursorOrb.classList.remove("is-hovering");
      });
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(root.dataset.theme === "light" ? "dark" : "light");
    });
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      navMenu.classList.toggle("is-open", !isOpen);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);

  setupReveal();
  setupTilt();
  setupCursor();
  setupSectionNavigation();
  updateScrollState();

  if (progress) {
    window.setTimeout(function () {
      progress.classList.remove("is-loading");
      updateScrollState();
    }, 900);
  }
})();
