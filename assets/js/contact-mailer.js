(function () {
  var recipient = "support@modules.ng";

  function value(form, selector) {
    var field = form.querySelector(selector);
    return field && field.value ? field.value.trim() : "";
  }

  function num(form, selector) {
    var v = value(form, selector);
    return v || "Not specified";
  }

  function submitByMail(form) {
    if (!form.reportValidity()) {
      return;
    }

    var companyName    = value(form, '[name="company_name"]');
    var contactPerson  = value(form, '[name="contact_person"]');
    var email          = value(form, '[name="email"]');
    var phone          = value(form, '[name="phone"]');
    var industry       = value(form, '[name="industry"]');
    var numEmployees   = value(form, '[name="num_employees"]') || "Not specified";
    var numLocations   = num(form, '[name="num_locations"]');
    var numComputers   = num(form, '[name="num_computers"]');
    var numApple       = num(form, '[name="num_apple"]');
    var numWindows     = num(form, '[name="num_windows"]');
    var numSmartphones = num(form, '[name="num_smartphones"]');
    var message        = value(form, '[name="message"]');

    var subject = "New business support request from " + (companyName || "a prospect");
    var body = [
      "── CONTACT DETAILS ─────────────────────────",
      "Company:         " + (companyName   || "Not provided"),
      "Contact person:  " + (contactPerson || "Not provided"),
      "Email:           " + (email         || "Not provided"),
      "Phone:           " + (phone         || "Not provided"),
      "",
      "── BUSINESS PROFILE ─────────────────────────",
      "Industry:        " + (industry    || "Not specified"),
      "Employees:       " + numEmployees,
      "Locations:       " + numLocations,
      "",
      "── DEVICE INVENTORY ─────────────────────────",
      "Total computers: " + numComputers,
      "Apple devices:   " + numApple,
      "Windows devices: " + numWindows,
      "Smartphones:     " + numSmartphones,
      "",
      "── PRIMARY ISSUE / SUPPORT NEED ─────────────",
      message
    ].join("\n");

    window.location.href = "mailto:" + recipient +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector('form[aria-label="Contact us"]');
    if (!form) {
      return;
    }

    form.setAttribute("action", "mailto:" + recipient);
    form.setAttribute("method", "post");
    form.setAttribute("enctype", "text/plain");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submitByMail(form);
    });
  });
}());
