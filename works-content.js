(() => {
  const config=window.ARMADA_SUPABASE_URL&&window.ARMADA_SUPABASE_ANON_KEY&&window.supabase;
  if(!config)return;
  const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const videoEmbed=raw=>{
    if(!raw)return "";
    try{
      const u=new URL(raw);
      const host=u.hostname.toLowerCase().replace(/^www\./,"");
      if(host==="youtu.be"){const id=u.pathname.split("/").filter(Boolean)[0];return id?"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(id)+"?rel=0":"";}
      if(host.endsWith("youtube.com")||host==="m.youtube.com"){
        const id=u.searchParams.get("v")||u.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
        return id?"https://www.youtube-nocookie.com/embed/"+encodeURIComponent(id)+"?rel=0":"";
      }
      if(host==="vk.com"||host==="m.vk.com"||host==="vkvideo.ru"){
        if(u.pathname.includes("video_ext.php")&&u.searchParams.get("oid")&&u.searchParams.get("id"))return "https://vk.com/video_ext.php?oid="+encodeURIComponent(u.searchParams.get("oid"))+"&id="+encodeURIComponent(u.searchParams.get("id"))+(u.searchParams.get("hash")?"&hash="+encodeURIComponent(u.searchParams.get("hash")):"")+"&hd=2";
        const match=u.pathname.match(/video(-?\d+)_(\d+)/);
        if(match)return "https://vk.com/video_ext.php?oid="+match[1]+"&id="+match[2]+"&hd=2";
      }
    }catch(_){}
    return "";
  };
  const categoryNames={house:"ДОМА",interior:"ИНТЕРЬЕРЫ",commercial:"КОММЕРЦИЯ"};
  const client=window.supabase.createClient(window.ARMADA_SUPABASE_URL,window.ARMADA_SUPABASE_ANON_KEY);
  const grid=document.querySelector(".works-grid");
  const count=document.querySelector("#works-count");
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  async function loadProjects(){
    if(grid)grid.innerHTML='<p class="works-empty">Загружаем проекты…</p>';
    let data=null,lastError=null;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const result=await client.from("site_content").select("content").eq("id","main").maybeSingle();
        if(result.error)throw result.error;
        data=result.data;
        lastError=null;
        break;
      }catch(error){
        lastError=error;
        console.warn("ARMADA: ошибка загрузки портфолио, попытка "+(attempt+1),error);
        if(attempt<2)await wait(700*(attempt+1));
      }
    }
    if(lastError){
      if(grid)grid.innerHTML='<p class="works-empty">Не удалось загрузить проекты. Проверьте подключение и обновите страницу.</p>';
      if(count)count.textContent="—";
      console.error("ARMADA: портфолио не загружено после повторных попыток",lastError);
      return;
    }
    const projects=data?.content?.portfolio_projects;
    if(!Array.isArray(projects)||!projects.length){
      if(count)count.textContent="00";
      if(grid)grid.innerHTML='<p class="works-empty">Пока нет добавленных проектов. Добавьте первый проект через админ-панель.</p>';
      document.querySelectorAll(".work-spoiler-section,.works-video-section").forEach(section=>section.remove());
      return;
    }
    const valid=projects.filter(p=>p&&p.title&&Array.isArray(p.images)).slice(0,100);
    if(!valid.length){
      if(count)count.textContent="00";
      if(grid)grid.innerHTML='<p class="works-empty">В базе есть записи, но ни одна из них не содержит корректно заполненный проект.</p>';
      document.querySelectorAll(".work-spoiler-section,.works-video-section").forEach(section=>section.remove());
      return;
    }
    if(!grid)return;
    grid.innerHTML=valid.map((p,i)=>{
      const category=categoryNames[p.category]||"ДРУГИЕ РАБОТЫ";
      const title=escapeHtml(p.title);
      const cover=escapeHtml(p.images[0]||"");
      const images=p.images.filter(Boolean).slice(1,15);
      const specs=[["area","Площадь"],["floors","Этажность"],["format","Формат"],["style","Стиль / назначение"]].filter(([key])=>p[key]);
      const embed=videoEmbed(p.videoUrl);
      const gallery=images.length?'<div class="work-media-grid">'+images.map((src,j)=>'<figure class="work-photo works-reveal"><img src="'+escapeHtml(src)+'" alt="'+title+' — фото '+(j+2)+'" loading="lazy"></figure>').join("")+'</div>':"";
      const specMarkup=specs.length?'<div class="work-specs">'+specs.map(([key,label])=>'<div><strong>'+escapeHtml(p[key])+'</strong><span>'+label+'</span></div>').join("")+'</div>':"";
      const video=embed?'<div class="work-video-row works-reveal"><div class="work-video"><iframe src="'+escapeHtml(embed)+'" title="Видео проекта '+title+'" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><div class="work-video-copy"><span class="section-kicker">ВИДЕО / ПРОЕКТ</span><h3>'+title+'</h3><p>Видеоматериал проекта.</p><span class="work-video-label">ВИДЕООБЗОР</span></div></div>':"";
      return '<details class="works-card work-card-spoiler works-reveal" data-category="'+escapeHtml(p.category||"house")+'"><summary class="works-card-summary"><div class="works-card-media"><img src="'+cover+'" alt="'+title+'" loading="lazy"></div><div class="works-card-content"><div class="works-card-meta"><b>'+String(i+1).padStart(2,"0")+'</b> '+category+'</div><h3>'+title+'</h3><span class="works-card-link"><span class="work-card-open-label">СМОТРЕТЬ ПРОЕКТ</span><span class="work-card-plus" aria-hidden="true">+</span></span></div></summary><div class="work-spoiler-content"><div class="work-detail-head"><div><span class="work-detail-number">'+String(i+1).padStart(2,"0")+' / '+category+'</span><h2>'+title+'</h2></div><div><p>'+escapeHtml(p.description||"")+'</p>'+specMarkup+'</div></div>'+gallery+video+'</div></details>';
    }).join("");
    if(count)count.textContent=String(valid.length).padStart(2,"0");
    document.querySelectorAll(".work-spoiler-section").forEach(section=>section.remove());
    const sampleVideos=document.querySelector(".works-video-section");if(sampleVideos)sampleVideos.remove();
    document.querySelectorAll(".works-filter").forEach(button=>button.addEventListener("click",()=>{
      const filter=button.dataset.filter;
      document.querySelectorAll(".works-card").forEach(card=>{card.hidden=filter!=="all"&&card.dataset.category!==filter;});
    }));
    const lightbox=document.getElementById("works-lightbox"),lightboxImage=lightbox?.querySelector("img");
    if(lightbox&&lightboxImage){
      document.addEventListener("click",event=>{
        const img=event.target.closest(".work-photo img");if(!img)return;
        lightboxImage.src=img.currentSrc||img.src;lightboxImage.alt=img.alt;lightbox.classList.add("is-open");document.body.style.overflow="hidden";
      });
    }
    if("IntersectionObserver"in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-in");observer.unobserve(entry.target);}}),{threshold:.08});
      document.querySelectorAll(".works-reveal:not(.is-in)").forEach(el=>observer.observe(el));
    }else document.querySelectorAll(".works-reveal").forEach(el=>el.classList.add("is-in"));
  }
  loadProjects();
})();