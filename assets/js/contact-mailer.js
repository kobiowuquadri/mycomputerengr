(function () {
  var recipient = "Adedayoandadetunji@gmail.com";

  function valueByLabel(form, label) {
    var field = form.querySelector('[aria-label="' + label + '"]');
    return field && field.value ? field.value.trim() : "";
  }

  function submitByMail(form) {
    if (!form.reportValidity()) {
      return;
    }

    var firstName = valueByLabel(form, "First name");
    var email = valueByLabel(form, "Email");
    var message = valueByLabel(form, "Issue Description") || valueByLabel(form, "Message");
    var deviceButton = form.querySelector('[aria-label="Device Type"]');
    var deviceType = deviceButton ? deviceButton.textContent.replace(/\s+/g, " ").trim() : "";

    var subject = "New website message from " + (firstName || "myComputerEngr visitor");
    var body = [
      "Name: " + (firstName || "Not provided"),
      "Email: " + email,
      "Device Type: " + (deviceType && deviceType !== "Device Type" ? deviceType : "Not specified"),
      "",
      "Message:",
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

    var submitButton = form.querySelector('[data-hook="submit-button"]');
    if (submitButton) {
      submitButton.setAttribute("type", "submit");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submitByMail(form);
    });

    if (submitButton) {
      submitButton.addEventListener("click", function (event) {
        event.preventDefault();
        submitByMail(form);
      });
    }
  });
}());
