(function () {
  var executiveWhatsApp = "2347078817981";

  function value(form, selector) {
    var field = form.querySelector(selector);
    return field && field.value ? field.value.trim() : "";
  }

  function selectedDevices(form) {
    var field = form.querySelector('[name="device"]');
    if (!field) {
      return "Not specified";
    }
    var values = Array.prototype.slice.call(field.selectedOptions).map(function (option) {
      return option.value || option.textContent;
    });
    return values.length ? values.join(", ") : "Not specified";
  }

  function buildWhatsAppUrl(name) {
    var message = "Hello, I have just requested Executive Device Care through your website. My name is " +
      (name || "________") +
      ". I would like to schedule my appointment.";
    return "https://wa.me/" + executiveWhatsApp + "?text=" + encodeURIComponent(message);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector('form[aria-label="Executive support request"]');
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) {
        return;
      }

      var name = value(form, '[name="full_name"]');
      var details = {
        company: value(form, '[name="company"]'),
        position: value(form, '[name="position"]'),
        email: value(form, '[name="business_email"]'),
        phone: value(form, '[name="phone"]'),
        location: value(form, '[name="location"]'),
        devices: selectedDevices(form),
        supportNeed: value(form, '[name="support_need"]'),
        appointment: value(form, '[name="preferred_appointment"]'),
        appointmentDate: value(form, '[name="appointment_date"]'),
        preferredTime: value(form, '[name="preferred_time"]')
      };

      try {
        window.sessionStorage.setItem("mcExecutiveSupportRequest", JSON.stringify({
          name: name,
          submittedAt: new Date().toISOString(),
          details: details
        }));
      } catch (error) {
        // Storage is a convenience only; WhatsApp remains the handoff.
      }

      var success = form.querySelector(".mc-form-success");
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      var submit = form.querySelector('[type="submit"]');
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Opening WhatsApp...";
      }

      window.setTimeout(function () {
        window.location.href = buildWhatsAppUrl(name);
      }, 900);
    });
  });
}());
