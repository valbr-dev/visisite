(() => {
  const $ = (s) => document.querySelector(s);
  const configReady = Boolean(window.ARMADA_SUPABASE_URL && window.ARMADA_SUPABASE_ANON_KEY && window.supabase);
  if (!configReady) { $("#setup-warning").hidden = false; $("#login-panel").hidden = true; return; }
  const db = window.supabase.createClient(window.ARMADA_SUPABASE_URL, window.ARMADA_SUPABASE_ANON_KEY);
  let content = {};
  let activeSection = "home";
  const definitions = {
    home:{title:"Главный экран",eyebrow:"01 / ГЛАВНАЯ",fields:[
      ["hero_kicker","Надпись над заголовком","text"],["hero_title","Главный заголовок","textarea"],["hero_description","Описание главного экрана","textarea"],["hero_image","Фоновая фотография главного экрана","image"]
    ]},
    about:{title:"О компании",eyebrow:"02 / О КОМПАНИИ",fields:[
      ["about_title","Заголовок блока","textarea"],["about_text","Описание компании","textarea"],["about_stat_1","Первый показатель","text"],["about_stat_2","Второй показатель","text"],["about_stat_3","Третий показатель","text"]
    ]},
    services:{title:"Услуги",eyebrow:"03 / УСЛУГИ",fields:[
      ["service_1_title","Услуга 1 — название","text"],["service_1_text","Услуга 1 — описание","textarea"],["service_2_title","Услуга 2 — название","text"],["service_2_text","Услуга 2 — описание","textarea"],["service_3_title","Услуга 3 — название","text"],["service_3_text","Услуга 3 — описание","textarea"],["service_4_title","Услуга 4 — название","text"],["service_4_text","Услуга 4 — описание","textarea"]
    ]},
    approach:{title:"Наш подход",eyebrow:"04 / НАШ ПОДХОД",fields:[
      ["approach_title","Заголовок блока","textarea"],["approach_text","Описание","textarea"],["approach_1","Преимущество 1","text"],["approach_2","Преимущество 2","text"],["approach_3","Преимущество 3","text"],["approach_image","Фотография блока","image"]
    ]},
    gallery:{title:"Галерея",eyebrow:"05 / ГАЛЕРЕЯ",fields:[
      ["gallery_title","Заголовок галереи","textarea"],["gallery_1","Фотография 1","image"],["gallery_2","Фотография 2","image"],["gallery_3","Фотография 3","image"]
    ]},
    contacts:{title:"Контакты",eyebrow:"06 / КОНТАКТЫ",fields:[
      ["contact_title","Заголовок формы","textarea"],["contact_text","Текст рядом с формой","textarea"],["contact_email","Email для связи","text"]
    ]},
    example:{title:"Пример работ",eyebrow:"07 / ПРИМЕР РАБОТ",fields:[
      ["case_title","Заголовок проекта","textarea"],["case_lead","Описание проекта","textarea"],["case_image_1","Главная фотография проекта","image"],["case_image_2","Фотография 2","image"],["case_image_3","Фотография 3","image"]
    ]}
  };
  const defaults = {
    hero_kicker:"СТРОИТЕЛЬСТВО ПОД КЛЮЧ",hero_title:"Пространство для больших планов.",hero_description:"Создаём дома и коммерческие объекты, в которых хочется жить, работать и развиваться. От первого чертежа до последнего штриха.",
    about_title:"Строим не просто здания. Создаём основу вашей жизни.",about_stat_1:"12+",about_stat_2:"240",about_stat_3:"96%",about_text:"АРМАДА — команда специалистов, которая превращает сложные строительные задачи в понятный и предсказуемый процесс. Честная смета, открытая коммуникация и внимание к качеству на каждом этапе.",
    service_1_title:"Частные дома",service_1_text:"Строительство коттеджей и загородных домов под ключ — от фундамента до готового интерьера.",service_2_title:"Коммерческие объекты",service_2_text:"Офисы, торговые пространства и здания для вашего бизнеса.",service_3_title:"Ремонт и отделка",service_3_text:"Комплексный ремонт, инженерные системы и качественная отделка.",service_4_title:"Проектирование",service_4_text:"Архитектурные решения, рабочая документация и точные расчёты.",
    approach_title:"Продумано до мелочей.",approach_text:"Сильный проект начинается с диалога. Мы внимательно изучаем задачу, предлагаем практичные решения и остаёмся рядом на всём пути строительства.",approach_1:"Прозрачная смета без сюрпризов",approach_2:"Понятные сроки и этапы работ",approach_3:"Контроль качества на объекте",
    gallery_title:"Идеи для вашего будущего проекта.",contact_title:"Есть идея? Давайте обсудим.",contact_text:"Расскажите, что хотите построить или изменить. Мы получим вашу заявку на почту и свяжемся удобным для вас способом.",contact_email:"valerybragin1999@gmail.com",
    case_title:"Дом, в котором всё на своём месте.",case_lead:"Концепция современного загородного дома с просторной общей зоной, панорамным остеклением и лаконичной отделкой."
  };
  const imageFallbacks = {
    hero_image:"",approach_image:"",gallery_1:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    gallery_2:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
    gallery_3:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85",
    case_image_1:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    case_image_2:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    case_image_3:"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85"
  };
  const value = (key) => content[key] ?? defaults[key] ?? imageFallbacks[key] ?? "";
  async function loadContent() {
    const {data,error} = await db.from("site_content").select("content").eq("id","main").maybeSingle();
    if (error) throw error;
    content = data?.content || {};
    renderFields();
  }
  function resolveImageUrl(input) {
    const value = String(input || "").trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
    if (value.startsWith("/visisite/images/")) return new URL(value, window.location.origin).href;
    if (/^(images|\.\.\/images)\//i.test(value)) {
      const clean = value.replace(/^\.\.\//, "");
      return new URL("../" + clean, window.location.href).href;
    }
    return value;
  }
  function renderFields() {
    const section = definitions[activeSection];
    $("#section-title").textContent = section.title;
    $("#section-eyebrow").textContent = section.eyebrow;
    $("#fields").innerHTML = "";
    section.fields.forEach(([key,label,type]) => {
      const wrap = document.createElement("div");
      wrap.className = "field" + (type === "textarea" || type === "image" ? " full" : "");
      const title = document.createElement("label");
      title.textContent = label;
      if (type === "image") {
        const holder = document.createElement("div"); holder.className = "image-control";
        const preview = document.createElement("img"); preview.className = "image-preview"; preview.alt = "Предпросмотр изображения"; preview.src = resolveImageUrl(value(key)) || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        const actions = document.createElement("div"); actions.className = "image-actions";
        const url = document.createElement("input"); url.type = "text"; url.placeholder = "https://valbr-dev.github.io/visisite/images/…"; url.value = value(key); url.dataset.key = key; url.dataset.image = "true";
        const file = document.createElement("input"); file.type = "file"; file.accept = "image/jpeg,image/png,image/webp,image/avif";
        file.setAttribute("aria-label", "Выбрать фотографию");
        const upload = document.createElement("button"); upload.type = "button"; upload.className = "ghost upload-image"; upload.textContent = "Загрузить фотографию";
        const hint = document.createElement("small"); hint.textContent = "Выбери фото на устройстве. Оно загрузится в GitHub и автоматически появится на сайте.";
        url.addEventListener("input",()=>{
          preview.src = resolveImageUrl(url.value) || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
          $("#saved-state").textContent = "Есть несохранённые изменения";
        });
        upload.addEventListener("click", async () => {
          const selected = file.files && file.files[0];
          if (!selected) { showMessage("Сначала выбери фотографию.", true); return; }
          const extensions = {"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif"};
          const ext = extensions[selected.type];
          if (!ext) { showMessage("Поддерживаются JPG, PNG, WebP и AVIF.", true); return; }
          if (selected.size > 20 * 1024 * 1024) { showMessage("Файл больше 20 МБ. Уменьши фотографию перед загрузкой.", true); return; }
          let token = sessionStorage.getItem("armada_github_token");
          if (!token) {
            token = window.prompt("Вставь GitHub Fine-grained token с доступом Contents: Read and write только к репозиторию valbr-dev/visisite. Токен хранится только в этой вкладке до её закрытия.");
            if (!token) return;
            token = token.trim();
            if (!token) return;
            sessionStorage.setItem("armada_github_token", token);
          }
          upload.disabled = true; upload.textContent = "Загружаю…";
          try {
            const base64 = await new Promise((resolve,reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result).split(",")[1]);
              reader.onerror = () => reject(new Error("Не удалось прочитать выбранный файл."));
              reader.readAsDataURL(selected);
            });
            const safeKey = key.replace(/[^a-z0-9_-]/gi,"-");
            const filename = safeKey + "-" + Date.now() + "." + ext;
            const path = "images/uploads/" + filename;
            const response = await fetch("https://api.github.com/repos/valbr-dev/visisite/contents/" + path, {
              method:"PUT",
              headers:{
                "Authorization":"Bearer " + token,
                "Accept":"application/vnd.github+json",
                "X-GitHub-Api-Version":"2022-11-28",
                "Content-Type":"application/json"
              },
              body:JSON.stringify({message:"Upload image for " + key,content:base64})
            });
            const result = await response.json().catch(()=>({}));
            if (!response.ok) {
              if (response.status === 401 || response.status === 403) sessionStorage.removeItem("armada_github_token");
              throw new Error(result.message || ("GitHub вернул ошибку " + response.status));
            }
            const imageUrl = "https://valbr-dev.github.io/visisite/" + path + "?v=" + Date.now();
            url.value = imageUrl;
            preview.src = imageUrl;
            content[key] = imageUrl;
            const {error} = await db.from("site_content").upsert({id:"main",content,updated_at:new Date().toISOString()},{onConflict:"id"});
            if (error) throw new Error("Фото уже загружено в GitHub, но ссылка не сохранилась в контенте сайта: " + error.message);
            $("#saved-state").textContent = "Фотография опубликована";
            showMessage("Готово! Фото загружено в GitHub и автоматически установлено на сайте.");
          } catch(error) {
            showMessage("Не удалось загрузить фотографию: " + error.message, true);
          } finally {
            upload.disabled = false; upload.textContent = "Загрузить фотографию";
          }
        });
        actions.append(url,file,upload,hint); holder.append(preview,actions); wrap.append(title,holder);
      } else {
        const input = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
        input.value = value(key); input.dataset.key = key;
        if (type === "text") input.type = "text";
        input.addEventListener("input",()=>{ $("#saved-state").textContent = "Есть несохранённые изменения"; });
        wrap.append(title,input);
      }
      $("#fields").append(wrap);
    });
  }
  function showMessage(message,error=false) { const el=$("#editor-message"); el.textContent=message; el.className="message "+(error?"error":"success"); }
  $("#login-form").addEventListener("submit",async e=>{
    e.preventDefault();
    const button = $("#login-form").querySelector('button[type="submit"]');
    button.disabled = true;
    $("#login-message").textContent = "Проверяю данные…";
    try {
      const request = db.auth.signInWithPassword({
        email: $("#email").value.trim(),
        password: $("#password").value
      });
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase не ответил за 20 секунд. Проверь доступность соединения с "+window.ARMADA_SUPABASE_URL)), 20000)
      );
      const {error} = await Promise.race([request, timeout]);
      if (error) {
        $("#login-message").textContent = "Не удалось войти: " + error.message;
        return;
      }
      $("#login-message").textContent = "";
      await showEditor();
    } catch (error) {
      console.error("Supabase login error:", error);
      $("#login-message").textContent = "Ошибка подключения: " + (error?.message || String(error));
    } finally {
      button.disabled = false;
    }
  });
  async function showEditor() {
    $("#login-panel").hidden=true;$("#editor").hidden=false;
    try{await loadContent();}catch(e){showMessage("Не удалось загрузить данные. Проверь SQL-настройку Supabase: "+e.message,true);}
  }
  $("#logout").addEventListener("click",async()=>{await db.auth.signOut();$("#editor").hidden=true;$("#login-panel").hidden=false;});
  document.querySelectorAll(".nav-item").forEach(button=>button.addEventListener("click",()=>{
    activeSection=button.dataset.section;document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x===button));renderFields();
  }));
  $("#reload").addEventListener("click",renderFields);
  async function saveContent() {
    $("#fields").querySelectorAll("[data-key]").forEach(input=>{content[input.dataset.key]=input.dataset.image === "true" ? resolveImageUrl(input.value) : input.value.trim();});
    const {error}=await db.from("site_content").upsert({id:"main",content,updated_at:new Date().toISOString()},{onConflict:"id"});
    if(error) throw error;
    $("#saved-state").textContent="Сохранено";
  }
  $("#content-form").addEventListener("submit",async e=>{
    e.preventDefault();
    $("#saved-state").textContent="Сохраняю…";
    try{await saveContent();showMessage("Изменения сохранены. Обнови сайт, чтобы увидеть результат.");}
    catch(error){showMessage("Ошибка сохранения: "+error.message,true);$("#saved-state").textContent="Не сохранено";}
  });
  db.auth.getSession().then(({data})=>{if(data.session)showEditor();});
})();
