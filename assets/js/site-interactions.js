(function () {
  var navItems = [
    { label: "Home", path: "index.html" },
    { label: "About Us", path: "pages/about-me.html" },
    { label: "Services", path: "pages/services.html" }
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
      '<section><a class="mc-brand" href="' + toLocalPath("index.html") + '" aria-label="myComputerEngr home">' + iconMarkup() + '<span>myComputer<span class="mc-accent">Engr</span></span></a><p>B2B on-site computer and smartphone repair for businesses across Lagos, Nigeria.</p></section>',
      '<section><h3>Quick Link</h3><ul>',
      '<li><a href="' + toLocalPath("index.html") + '">Home</a></li>',
      '<li><a href="' + toLocalPath("pages/about-me.html") + '">About Us</a></li>',
      '<li><a href="' + toLocalPath("pages/services.html") + '">Services</a></li>',
      '<li><a href="' + toLocalPath("pages/contact-me.html") + '">Book a Repair</a></li>',
      "</ul></section>",
      '<section><h3>Visit Us</h3><ul>',
      "<li>myComputerENGR</li>",
      "<li>No 4 Olu Aina Street, Mushin, Lagos, Nigeria</li>",
      '<li><a href="mailto:support@mycomputerengr.ng">support@mycomputerengr.ng</a></li>',
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

  function setupHeroSection() {
    if (currentPathName() !== "index.html") { return; }
    var wixHero = document.getElementById("comp-mq99jgh1");
    if (wixHero) {
      wixHero.style.display = "none";
    }

    var hero = document.createElement("section");
    hero.className = "mc-hero-section";
    hero.setAttribute("aria-label", "Hero");
    hero.innerHTML = [
      '<div class="mc-hero-inner">',
      '<div class="mc-hero-content">',
      '<p class="mc-hero-eyebrow">B2B Device Repair &mdash; Lagos, Nigeria</p>',
      '<h1 class="mc-hero-heading">',
      'Your PC &amp; Smartphone<br>',
      '<span>Downtime Ends Here!</span>',
      '</h1>',
      '<p class="mc-hero-body">Minimise business technology downtime with our fast on-site support for Apple laptops, desktops, and smartphones, built exclusively for businesses and enterprises. Your team stays productive. Your data stays protected.</p>',
      '<p class="mc-hero-sub">We serve fintechs, startups, NGOs, Schools, Healthcare, Professional Services, Manufacturers, Churches, and SMEs across Lagos and Nigeria &mdash; fixing devices at your office, on your schedule.</p>',
      '<div class="mc-hero-actions">',
      '<a class="mc-repair-btn" href="' + toLocalPath("pages/contact-me.html") + '">Talk to an Engineer</a>',
      '</div>',
      '<ul class="mc-hero-trust">',
      '<li>On-site visits</li>',
      '<li>30-min WhatsApp response</li>',
      '<li>Data-safe technicians</li>',
      '</ul>',
      '</div>',
      '</div>'
    ].join("");

    var header = document.querySelector(".mc-site-header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(hero, header.nextSibling);
    } else {
      document.body.insertBefore(hero, document.body.firstChild);
    }
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

  function runScroller(track, speed) {
    var offset = 0;
    var half = 0;
    var raf;

    function tick() {
      offset += speed;
      if (offset >= half) { offset = 0; }
      track.style.transform = 'translateX(-' + offset + 'px)';
      raf = requestAnimationFrame(tick);
    }

    requestAnimationFrame(function () {
      half = track.scrollWidth / 2;
      tick();
    });
  }

  function setupPartnerMarquee() {
    var section = document.getElementById('comp-mqaur1nk');
    if (!section) { return; }
    section.style.display = 'none';

    var items = [
      'HP EXPERT', 'DELL SERVICE', 'LENOVO UPGRADES', 'APPLE AUTHORIZED',
      'MACBOOK REPAIR', 'DATA RECOVERY', 'MICROSOFT SUPPORT', 'SAMSUNG REPAIR',
      'ENTERPRISE IT', 'CISCO NETWORKING'
    ];

    function buildItems() {
      return items.map(function (t) {
        return '<span class="xq-badge">' + t + '<span class="xq-dot"></span></span>';
      }).join('');
    }

    var el = document.createElement('div');
    el.className = 'xq-ticker';
    el.innerHTML =
      '<div class="xq-ticker-fade xq-ticker-fade--l"></div>' +
      '<div class="xq-ticker-fade xq-ticker-fade--r"></div>' +
      '<div class="xq-ticker-track">' + buildItems() + buildItems() + '</div>';

    section.insertAdjacentElement('beforebegin', el);
    runScroller(el.querySelector('.xq-ticker-track'), 0.6);
  }

  function setupTestimonialsMarquee() {
    var section = document.getElementById('comp-mqaudlkd');
    if (!section) { return; }
    section.style.display = 'none';

    var cards = [
      { quote: 'They came to our office and fixed 5 company laptops on the same day. Exceptional service — zero disruption to our team.', name: 'Chioma O.', role: 'Operations Manager' },
      { quote: 'Fast WhatsApp response and a technician at our office within the hour. myComputerENGR runs like a professional IT department.', name: 'Adeyemi', role: 'IT Lead' },
      { quote: 'We outsource all device maintenance to myComputerENGR. Transparent pricing, always on-site, always reliable.', name: 'Tunde A.', role: 'CEO' },
      { quote: 'From our CEO’s MacBook to staff iPhones — myComputerENGR handles everything on-site. Data-safe and completely discreet.', name: 'Adekunle B.', role: 'CTO' },
      { quote: 'Best enterprise IT support we have had. Quick diagnosis, honest pricing, and they always show up on time.', name: 'Funke A.', role: 'Office Manager' },
      { quote: 'Our team of 20 relies on myComputerENGR for all hardware issues. They have never let us down. Highly recommended.', name: 'Emeka O.', role: 'Head of Engineering' }
    ];

    function stars() {
      return '<div class="xq-stars"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>';
    }

    function buildCards() {
      return cards.map(function (d) {
        return '<div class="xq-card">' +
          stars() +
          '<p class="xq-card-quote">' + d.quote + '</p>' +
          '<div class="xq-card-footer">' +
            '<div class="xq-avatar">' + d.name.charAt(0) + '</div>' +
            '<div>' +
              '<p class="xq-card-name">' + d.name + '</p>' +
              '<p class="xq-card-role">' + d.role + ', Lagos</p>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    var wrapper = document.createElement('section');
    wrapper.className = 'xq-reviews';
    wrapper.innerHTML =
      '<div class="xq-reviews-head">' +
        '<p class="xq-reviews-label">CLIENT REVIEWS</p>' +
        '<h2 class="xq-reviews-title">What Our Customers Say</h2>' +
      '</div>' +
      '<div class="xq-reviews-viewport">' +
        '<div class="xq-fade xq-fade--l"></div>' +
        '<div class="xq-fade xq-fade--r"></div>' +
        '<div class="xq-cards-track">' + buildCards() + buildCards() + '</div>' +
      '</div>';

    var footer = document.querySelector('.mc-site-footer');
    if (footer) {
      footer.insertAdjacentElement('beforebegin', wrapper);
    } else {
      document.body.appendChild(wrapper);
    }
    runScroller(wrapper.querySelector('.xq-cards-track'), 0.4);
  }


  function setupWhyChooseExtra() {
    var section = document.getElementById('comp-mqateoo3');
    if (!section) { return; }

    var extra = document.createElement('div');
    extra.className = 'mc-why-extra';
    extra.innerHTML =
      '<div class="mc-why-card">' +
        '<h3>Fast Response</h3>' +
        '<p>Prompt diagnostics and timely service to keep your business operating smoothly.</p>' +
      '</div>' +
      '<div class="mc-why-card">' +
        '<h3>Business-first Support</h3>' +
        '<p>Technology support tailored to the needs of organisations, helping your people stay productive.</p>' +
      '</div>';

    section.appendChild(extra);
  }

  function setupWhatsApp() {
    var btn = document.createElement('a');
    btn.className = 'mc-wa-fab';
    btn.href = 'https://wa.me/2349031832073';
    btn.target = '_blank';
    btn.rel = 'noreferrer noopener';
    btn.setAttribute('aria-label', 'Chat with us on WhatsApp');
    btn.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="#fff" d="M16 2C8.268 2 2 8.268 2 16c0 2.478.648 4.804 1.781 6.822L2 30l7.389-1.742A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.826-1.594l-.418-.249-4.385 1.034 1.057-4.272-.273-.438A11.451 11.451 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.27-8.453c-.344-.172-2.035-1.004-2.35-1.118-.316-.115-.546-.172-.775.172-.229.344-.887 1.118-1.087 1.348-.2.229-.401.258-.745.086-.344-.172-1.453-.536-2.768-1.707-1.023-.912-1.713-2.039-1.913-2.383-.2-.344-.021-.53.15-.701.155-.154.344-.401.516-.602.172-.2.229-.344.344-.573.115-.229.057-.43-.029-.602-.086-.172-.775-1.87-1.062-2.562-.28-.674-.563-.582-.775-.593l-.659-.011c-.229 0-.602.086-.917.43-.316.344-1.203 1.175-1.203 2.864s1.232 3.322 1.404 3.551c.172.229 2.426 3.705 5.879 5.194.822.355 1.463.567 1.963.727.824.263 1.574.226 2.167.137.66-.099 2.035-.832 2.322-1.635.287-.803.287-1.49.2-1.635-.086-.143-.315-.229-.659-.401z"/></svg>';
    document.body.appendChild(btn);
  }

  ready(function () {
    document.documentElement.classList.add("site-js");
    setupShell();
    setupHeroSection();
    setupImages();
    setupLearnAboutBackground();
    setupMobileMenu();
    setupFaqs();
    setupButtonFallbacks();
    setupSmoothAnchors();
    setupRevealAnimations();
    setupPartnerMarquee();
    setupTestimonialsMarquee();
    setupWhyChooseExtra();
    setupWhatsApp();
  });
}());
