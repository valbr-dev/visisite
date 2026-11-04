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
  client.from("site_content").select("content").eq("id","main").maybeSingle().then(({data,error})=>{
    if(error)return;
    const projects=data?.content?.portfolio_projects;
    if(!Array.isArray(projects)||!projects.length)return;
    const valid=projects.filter(p=>p&&p.title&&Array.isArray(p.images)).slice(0,100);
    if(!valid.length)return;
    const grid=document.querySelector(".works-grid");
    if(!grid)return;
    const sectionIds=[];
    grid.innerHTML=valid.map((p,i)=>{
      const id="portfolio-"+(i+1);
      sectionIds.push(id);
      const category=categoryNames[p.category]?"": "ДРУГИЕ РАБОТЫ";
      return '<a class="works-card works-reveal" href="#'+id+'" data-category="'+escapeHtml(p.category||"house")+'"><div class="works-card-media"><img src="'+escapeHtml(p.images[0]||"")+'" alt="'+escapeHtml(p.title)+'" loading="lazy"></div><div class="works-card-content"><div class="works-card-meta"><b>'+String(i+1).padStart(2,"0")+'</b> '+(categoryNames[p.category]||category)+'</div><h3>'+escapeHtml(p.title)+'</h3><span class="works-card-link">СМОТРЕТЬ ПРОЕКТ <span>↗</span></span></div></a>';
    }).join("");
    const catalog=document.querySelector(".works-catalog");
    const disclaimer=catalog?.querySelector(".works-disclaimer");if(disclaimer)disclaimer.remove();
    const count=document.querySelector(".works-count strong");if(count)count.textContent=String(valid.length).padStart(2,"0");
    const details=valid.map((p,i)=>{
      const id=sectionIds[i],images=p.images.filter(Boolean).slice(0,15);
      const specs=[["area","Площадь"],["floors","Этажность"],["format","Формат"],["style","Стиль / назначение"]].filter(([key])=>p[key]);
      const embed=videoEmbed(p.videoUrl);
      const category=categoryNames[p.category]||"ПРОЕКТ";
      return '<section class="work-detail work-spoiler-section" id="'+id+'"><div class="container"><details class="work-spoiler"><summary class="work-spoiler-summary"><span class="work-spoiler-number">'+String(i+1).padStart(2,"0")+'</span><span class="work-spoiler-title"><small>'+category+'</small><strong>'+escapeHtml(p.title)+'</strong><em>'+escapeHtml(p.subtitle||p.area||"Портфолио АРМАДА")+'</em></span><span class="work-spoiler-toggle" aria-hidden="true">+</span></summary><div class="work-spoiler-content"><div class="work-detail-head works-reveal"><div><span class="work-detail-number">'+String(i+1).padStart(2,"0")+' / '+category+'</span><h2>'+escapeHtml(p.title)+'</h2></div><div><p>'+escapeHtml(p.description||"")+'</p>'+(specs.length?'<div class="work-specs">'+specs.map(([key,label])=>'<div><strong>'+escapeHtml(p[key])+'</strong><span>'+label+'</span></div>').join("")+'</div>':"")+'</div></div>'+(images.length?'<div class="work-media-grid">'+images.map((src,j)=>'<figure class="work-photo works-reveal"><img src="'+escapeHtml(src)+'" alt="'+escapeHtml(p.title)+' — фото '+(j+1)+'" loading="lazy"></figure>').join("")+'</div>':"")+(embed?'<div class="work-video-row works-reveal"><div class="work-video"><iframe src="'+escapeHtml(embed)+'" title="Видео проекта '+escapeHtml(p.title)+'" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><div class="work-video-copy"><span class="section-kicker">ВИДЕО / ПРОЕКТ</span><h3>'+escapeHtml(p.title)+'</h3><p>Видеоматериал проекта.</p><span class="work-video-label">ВИДЕООБЗОР</span></div></div>':"")+'</div></details></div></section>';
    }).join("");
    const quote=document.querySelector(".works-quote");
    quote?.insertAdjacentHTML("beforebegin",details);
    document.querySelectorAll(".work-spoiler-section").forEach((section,i)=>{
      const detail=section.querySelector("details");
      document.querySelector('.works-card[href="#'+sectionIds[i]+'"]')?.addEventListener("click",()=>{detail.open=true;});
    });
    document.querySelectorAll(".works-filter").forEach(button=>button.addEventListener("click",()=>{
      const filter=button.dataset.filter;
      document.querySelectorAll(".works-card").forEach(card=>{card.hidden=filter!=="all"&&card.dataset.category!==filter;});
    }));
    const side=document.querySelector(".works-side-index");
    if(side){
      side.innerHTML='<a href="#top">00</a><a href="#catalog" class="is-active">01</a>'+sectionIds.map((id,i)=>'<a href="#'+id+'">'+String(i+2).padStart(2,"0")+'</a>').join("")+'<a href="#contact">'+String(valid.length+2).padStart(2,"0")+'</a>';
    }
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
  });
})();