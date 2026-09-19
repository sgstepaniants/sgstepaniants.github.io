(function () {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("contact-form-status");
  const contactEmail = document.getElementById("contact-email");
  if (!form || !status || !contactEmail) return;

  const button = form.querySelector('button[type="submit"]');
  const emailClient = window.emailjs;
  const buttonLabel = button.textContent;
  let sending = false;

  function showStatus(message, includeEmail = false) {
    status.textContent = message;
    if (includeEmail) {
      const link = document.createElement("a");
      link.href = contactEmail.href;
      link.textContent = contactEmail.textContent;
      link.className = "text-primary underline";
      status.append(" ", link, ".");
    }
    status.hidden = false;
  }

  // Register before enabling the button, so no submission falls through to
  // a native POST. The Formspree URL bundled with the theme was not verified.
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (!emailClient) {
      showStatus("The form is unavailable. Please email me at", true);
      return;
    }

    sending = true;
    button.disabled = true;
    button.textContent = "Sending…";
    form.setAttribute("aria-busy", "true");
    showStatus("Sending your message…");

    try {
      // Keep the service and template explicitly configured for this website.
      // The recipient is set in the EmailJS template's To Email field.
      await emailClient.sendForm("service_jjj269v", "template_k0xotgp", form, "5xoqjxFFmSCUs9Tvf");
      form.reset();
      showStatus("Thank you. Your message has been submitted.");
    } catch (error) {
      showStatus("Your message could not be sent. Please email me at", true);
      // Log plain text so browser diagnostics retain the provider's response.
      const errorStatus = error?.status ?? "unknown";
      const errorMessage = error?.text || error?.message || String(error);
      console.error(`Contact form submission failed (${errorStatus}): ${errorMessage}`);
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent = buttonLabel;
      form.removeAttribute("aria-busy");
    }
  });

  if (emailClient) {
    button.disabled = false;
  } else {
    showStatus("The form is unavailable. Please email me at", true);
  }
})();
