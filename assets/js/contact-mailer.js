(function () {
  var recipient = "support@mycomputerengr.ng";

  function value(form, selector) {
    var field = form.querySelector(selector);
    return field && field.value ? field.value.trim() : "";
  }

  function checkedValue(form, selector) {
    var field = form.querySelector(selector + ":checked");
    return field && field.value ? field.value.trim() : "";
  }

  function submitByMail(form) {
    if (!form.reportValidity()) {
      return;
    }

    var firstName = value(form, '[name="first_name"], [aria-label="First name"]');
    var email = value(form, '[name="email"], [aria-label="Email"]');
    var serviceType = checkedValue(form, '[name="service_type"]') || "Not specified";
    var deviceType = value(form, '[name="device_type"], [aria-label="Device Type"]') || "Not specified";
    var message = value(form, '[name="message"], [aria-label="Issue Description"], [aria-label="Message"]');

    var subject = "New repair request from " + (firstName || "myComputerEngr visitor");
    var body = [
      "Name: " + (firstName || "Not provided"),
      "Email: " + email,
      "Service Type: " + serviceType,
      "Device Type: " + deviceType,
      "",
      "Issue Description:",
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
