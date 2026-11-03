const RECIPIENT_EMAIL = "valerybragin1999@gmail.com";

function doPost(e) {
  try {
    const data = e && e.parameter ? e.parameter : {};
    // Honeypot: bots often fill hidden fields; silently reject those submissions.
    if (data.website) return resultPage("ok");

    const name = clean(data["ФИО"]);
    const contacts = clean(data["Контакты"]);
    const details = clean(data["Описание задачи"]);
    const budget = clean(data["Бюджет"]);

    if (!name || !contacts || !details) {
      throw new Error("Please fill in all required fields.");
    }

    const body = [
      "Новая заявка с сайта АРМАДА",
      "",
      "ФИО: " + name,
      "Контакты: " + contacts,
      "Что требуется: " + details,
      "Бюджет: " + (budget || "Не указан"),
      "",
      "Источник: сайт visisite"
    ].join("\n");

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: "Новая заявка с сайта АРМАДА",
      body: body,
      name: "Сайт АРМАДА"
    });

    return resultPage("ok");
  } catch (error) {
    console.error(error);
    return resultPage("error");
  }
}

function clean(value) {
  return String(value || "").trim().slice(0, 5000);
}

function resultPage(status) {
  const safeStatus = status === "ok" ? "ok" : "error";
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><script>' +
    'window.top.postMessage({type:"monolit-contact-result",status:"' + safeStatus + '"},"*");' +
    '</script></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
