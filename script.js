const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Открыть меню" : "Закрыть меню");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Открыть меню");
      navigation.classList.remove("is-open");
    });
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// Contact form: submits to a Google Apps Script web app through a hidden iframe.
const contactForm = document.querySelector("#contact-form");
const contactFrame = document.querySelector("#contact-submit-frame");
const formStatus = document.querySelector("#form-status");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBenhxZXcO6YYE2i0Z-3BIBfLY01PP0i0Rby54iOMfIj-M95EfGSaJtIbp8pXoSwI/exec"; // Add the deployed Google Apps Script web app URL here.

if (contactForm && contactFrame && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    if (!GOOGLE_SCRIPT_URL) {
      event.preventDefault();
      formStatus.textContent = "Форма почти готова. Осталось подключить адрес обработчика Google Apps Script.";
      formStatus.className = "form-status is-error";
      return;
    }
    contactForm.action = GOOGLE_SCRIPT_URL;
    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.innerHTML;
      submitButton.textContent = "Отправляем...";
    }
    formStatus.textContent = "Отправляем вашу заявку...";
    formStatus.className = "form-status";
  });

  window.addEventListener("message", (event) => {
    if (event.source !== contactFrame.contentWindow || !event.data || event.data.type !== "monolit-contact-result") return;
    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = submitButton.dataset.originalText || "Отправить заявку ↗";
    }
    if (event.data.status === "ok") {
      contactForm.reset();
      formStatus.textContent = "Заявка отправлена. Спасибо! Мы свяжемся с вами.";
      formStatus.className = "form-status is-success";
    } else {
      formStatus.textContent = "Не удалось отправить заявку. Попробуйте ещё раз или напишите на valerybragin1999@gmail.com.";
      formStatus.className = "form-status is-error";
    }
  });
}
