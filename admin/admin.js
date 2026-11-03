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
    about_title:"Строим не просто здания. Создаём основу вашей жизни.",about_text:"АРМАДА — команда специалистов, которая превращает сложные строительные задачи в понятный и предсказуемый процесс. Честная смета, открытая коммуникация и внимание к качеству на каждом этапе.",
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
        const preview = document.createElement("img"); preview.className = "image-preview"; preview.alt = "Предпросмотр изображения"; preview.src = value(key) || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        const actions = document.createElement("div"); actions.className = "image-actions";
        const url = document.createElement("input"); url.type = "url"; url.placeholder = "Или вставь URL изображения"; url.value = value(key); url.dataset.key = key;
        const file = document.createElement("input"); file.type = "file"; file.accept = "image/jpeg,image/png,image/webp,image/avif";
        file.addEventListener("change", async () => {
          const image = file.files?.[0]; if (!image) return;
          if (image.size > 10 * 1024 * 1024) { showMessage("Максимальный размер изображения — 10 МБ.",true); file.value=""; return; }
          showMessage("Загружаю изображение…");
          const ext = (image.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
          const path = Date.now() + "-" + Math.random().toString(36).slice(2,8) + "." + ext;
          const {error} = await db.storage.from("armada-images").upload(path,image,{cacheControl:"3600",upsert:false,contentType:image.type});
          if (error) { showMessage(error.message,true); return; }
          const {data} = db.storage.from("armada-images").getPublicUrl(path);
          url.value = data.publicUrl; preview.src = data.publicUrl; url.dispatchEvent(new Event("input"));
          showMessage("Фото загружено. Не забудь сохранить изменения.");
        });
        url.addEventListener("input",()=>{preview.src=url.value || "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";});
        actions.append(url,file); holder.append(preview,actions); wrap.append(title,holder);
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
    e.preventDefault(); $("#login-message").textContent="Проверяю данные…";
    const {error}=await db.auth.signInWithPassword({email:$("#email").value,password:$("#password").value});
    if(error){$("#login-message").textContent="Не удалось войти: "+error.message;return;}
    await showEditor();
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
  $("#content-form").addEventListener("submit",async e=>{
    e.preventDefault();
    $("#saved-state").textContent="Сохраняю…";
    $("#fields").querySelectorAll("[data-key]").forEach(input=>{content[input.dataset.key]=input.value.trim();});
    const {error}=await db.from("site_content").upsert({id:"main",content,updated_at:new Date().toISOString()},{onConflict:"id"});
    if(error){showMessage("Ошибка сохранения: "+error.message,true);$("#saved-state").textContent="Не сохранено";return;}
    $("#saved-state").textContent="Сохранено";showMessage("Изменения сохранены. Обнови сайт, чтобы увидеть результат.");
  });
  db.auth.getSession().then(({data})=>{if(data.session)showEditor();});
})();
