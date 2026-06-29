(function () {
  var navItems = [
    { label: "Home", path: "index.html" },
    { label: "About Me", path: "pages/about-me.html" },
    { label: "Services", path: "pages/services.html" },
    { label: "Portfolio", path: "pages/portfolio.html" }
  ];

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function isInPages() {
    return window.location.pathname.indexOf("/pages/") !== -1;
  }

  function toLocalPath(pathFromRoot) {
    if (isInPages()) {
      if (pathFromRoot.indexOf("pages/") === 0) {
        return pathFromRoot.replace(/^pages\//, "");
      }
      return "../" + pathFromRoot;
    }
    return pathFromRoot;
  }

  function assetPath(pathFromAssets) {
    return (isInPages() ? "../assets/" : "assets/") + pathFromAssets;
  }

  function currentPathName() {
    var name = window.location.pathname.split("/").pop() || "index.html";
    return name.toLowerCase();
  }

  function iconMarkup() {
    return [
      '<svg class="mc-brand-mark" viewBox="0 0 64 64" aria-hidden="true">',
      '<rect x="8" y="12" width="48" height="34" rx="5" fill="none" stroke="#00e5ff" stroke-width="3"/>',
      '<path d="M21 53h22M28 46v7M36 46v7" fill="none" stroke="#dce8ff" stroke-width="3" stroke-linecap="round"/>',
      '<circle cx="32" cy="29" r="7" fill="none" stroke="#00e5ff" stroke-width="2.5"/>',
      '<path d="M32 18v4M32 36v4M21 29h4M39 29h4M24 21l3 3M37 34l3 3M40 21l-3 3M27 34l-3 3" stroke="#00e5ff" stroke-width="2" stroke-linecap="round"/>',
      "</svg>"
    ].join("");
  }

  function buildNav() {
    var active = currentPathName();
    return navItems.map(function (item) {
      var href = toLocalPath(item.path);
      var itemName = item.path.split("/").pop().toLowerCase();
      var aria = active === itemName || (active === "" && itemName === "index.html") ? ' aria-current="page"' : "";
      return '<a href="' + href + '"' + aria + ">" + item.label + "</a>";
    }).join("") + '<a class="mc-mobile-repair-link" href="' + toLocalPath("pages/contact-me.html") + '">Book a Repair</a>';
  }

  function setupShell() {
    if (document.querySelector(".mc-site-header")) {
      return;
    }

    document.body.classList.add("mc-has-shell");

    var header = document.createElement("header");
    header.className = "mc-site-header";
    header.innerHTML = [
      '<div class="mc-header-inner">',
      '<a class="mc-brand" href="' + toLocalPath("index.html") + '" aria-label="myComputerEngr home">',
      iconMarkup(),
      '<span>myComputer<span>Engr</span></span>',
      "</a>",
      '<nav class="mc-primary-nav" aria-label="Primary navigation">',
      buildNav(),
      "</nav>",
      '<div class="mc-header-actions">',
      '<a class="mc-repair-btn" href="' + toLocalPath("pages/contact-me.html") + '">Book a Repair</a>',
      '<button class="mc-menu-toggle" type="button" aria-label="Menu" aria-expanded="false"><span></span></button>',
      "</div>",
      "</div>"
    ].join("");
    document.body.insertBefore(header, document.body.firstChild);

    var footer = document.createElement("footer");
    footer.className = "mc-site-footer mc-footer";
    footer.innerHTML = [
      '<div class="mc-footer-grid">',
      '<section><a class="mc-brand" href="' + toLocalPath("index.html") + '" aria-label="myComputerEngr home">' + iconMarkup() + '<span>myComputer<span class="mc-accent">Engr</span></span></a><p>Premium computer repair and supply services in Nigeria.</p></section>',
      '<section><h3>Quick Link</h3><ul>',
      '<li><a href="' + toLocalPath("index.html") + '">Home</a></li>',
      '<li><a href="' + toLocalPath("pages/about-me.html") + '">About Me</a></li>',
      '<li><a href="' + toLocalPath("pages/services.html") + '">Services</a></li>',
      '<li><a href="' + toLocalPath("pages/portfolio.html") + '">Portfolio</a></li>',
      '<li><a href="' + toLocalPath("pages/contact-me.html") + '">Book a Repair</a></li>',
      "</ul></section>",
      '<section><h3>Visit Us</h3><ul>',
      "<li>myComputerENGR</li>",
      "<li>Akala Express, New Garage Ibadan, Nigeria</li>",
      '<li><a href="mailto:Adedayoandadetunji@gmail.com">Adedayoandadetunji@gmail.com</a></li>',
      '<li><a href="tel:09031832073">09031832073</a></li>',
      "</ul></section>",
      '<section><h3>Social</h3><div class="mc-socials">',
      '<a href="https://www.linkedin.com/company/mycomputerengr/" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn"><img src="' + assetPath("images/linkedin.svg") + '" alt=""></a>',
      '<a href="https://x.com/myComputerENGR" target="_blank" rel="noreferrer noopener" aria-label="X"><img src="' + assetPath("images/x.svg") + '" alt=""></a>',
      "</div></section>",
      "</div>",
      '<div class="mc-footer-bottom">&copy; 2026 by myComputerEngr. Designed by <a href="https://devquat.xyz" target="_blank" rel="noreferrer noopener" class="mc-accent">DevQuat</a></div>'
    ].join("");
    document.body.appendChild(footer);
  }

  function textOf(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (img) {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
      img.removeAttribute("data-animate-blur");
    });
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".mc-menu-toggle");
    if (!toggle) {
      return;
    }

    function closeMenu() {
      document.body.classList.remove("site-menu-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = !document.body.classList.contains("site-menu-open");
      document.body.classList.toggle("site-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.querySelectorAll(".mc-primary-nav a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  function setupFaqs() {
    document.querySelectorAll("[data-faq-toggle]").forEach(function (button) {
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) {
        return;
      }

      button.addEventListener("click", function () {
        var expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
        var icon = button.querySelector("[aria-hidden]");
        if (icon) {
          icon.textContent = expanded ? "v" : "^";
        }
      });
    });
  }

  function setupButtonFallbacks() {
    document.querySelectorAll("button, [role='button']").forEach(function (button) {
      var label = textOf(button).toLowerCase();
      if (label === "book a repair") {
        button.addEventListener("click", function (event) {
          if (button.closest("a")) {
            return;
          }
          event.preventDefault();
          window.location.href = toLocalPath("pages/contact-me.html");
        });
        button.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            window.location.href = toLocalPath("pages/contact-me.html");
          }
        });
      }
      if (label === "send" && !button.closest("form")) {
        button.addEventListener("click", function (event) {
          if (button.closest("a")) {
            return;
          }
          event.preventDefault();
          window.location.href = toLocalPath("pages/contact-me.html");
        });
      }
    });
  }

  function setupSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var target = document.querySelector(link.getAttribute("href"));
        if (!target) {
          return;
        }
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupLearnAboutBackground() {
    var section = document.getElementById("comp-mqak9pft");
    if (section) {
      section.classList.add("mc-learn-about-section", "mc-reveal");
      var oldImage = section.querySelector("img");
      if (oldImage) {
        oldImage.src = assetPath("images/laptop-repair-workbench.jpg");
        oldImage.removeAttribute("srcset");
        oldImage.width = 1536;
        oldImage.height = 1024;
      }
    }
  }

  function setupRevealAnimations() {
    var targets = Array.prototype.slice.call(document.querySelectorAll(".mc-reveal, main section, .wixui-repeater__item"));
    targets.forEach(function (target) {
      target.classList.add("mc-reveal");
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (target) {
        target.classList.add("mc-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("mc-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  ready(function () {
    document.documentElement.classList.add("site-js");
    setupShell();
    setupImages();
    setupLearnAboutBackground();
    setupMobileMenu();
    setupFaqs();
    setupButtonFallbacks();
    setupSmoothAnchors();
    setupRevealAnimations();
  });
}());
