(() => {
  const url = window.ARMADA_SUPABASE_URL;
  const key = window.ARMADA_SUPABASE_ANON_KEY;
  if (!url || !key || !window.supabase) return;
  const client = window.supabase.createClient(url,key);
  const fallback = {
    hero_image:"",
    approach_image:"",
    gallery_1:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    gallery_2:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
    gallery_3:"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85",
    case_image_1:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
    case_image_2:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
    case_image_3:"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85"
  };
  const setText = (selector,value) => {
    const node=document.querySelector(selector); if(!node || value == null || value === "") return;
    node.textContent=value;
  };
  const setLines = (selector,value) => {
    const node=document.querySelector(selector); if(!node || value == null || value === "") return;
    node.replaceChildren();
    String(value).split(/\n/).forEach((line,index)=>{if(index)node.append(document.createElement("br"));node.append(document.createTextNode(line));});
  };
  const setImage = (selector,value) => {
    const node=document.querySelector(selector); if(!node || !value) return;
    if(node.tagName==="IMG") node.src=value;
    else node.style.backgroundImage='url("'+String(value).replace(/["\\\n\r]/g,"")+'")';
  };
  client.from("site_content").select("content").eq("id","main").maybeSingle().then(({data,error})=>{
    if(error || !data?.content) return;
    const c=data.content;
    setText(".hero .eyebrow-light"," "+(c.hero_kicker||"СТРОИТЕЛЬСТВО ПОД КЛЮЧ"));
    setLines(".hero h1",c.hero_title);
    setText(".hero-description",c.hero_description);
    setLines(".intro-copy h2",c.about_title);
    setText(".intro-bottom p",c.about_text);
    for(let i=1;i<=4;i++){setText(".service-card:nth-child("+i+") h3",c["service_"+i+"_title"]);setText(".service-card:nth-child("+i+") p",c["service_"+i+"_text"]);}
    setLines(".project-content h2",c.approach_title);
    setText(".project-content > p",c.approach_text);
    for(let i=1;i<=3;i++){const li=document.querySelector(".benefit-list li:nth-child("+i+")");if(li && c["approach_"+i]){const n=li.querySelector("span");li.textContent="";if(n)li.append(n);li.append(document.createTextNode(" "+c["approach_"+i]));}}
    setLines(".gallery-heading h2",c.gallery_title);
    for(let i=1;i<=3;i++)setImage(".gallery-item:nth-child("+i+") img",c["gallery_"+i]);
    setLines(".contact-copy h2",c.contact_title);
    setText(".contact-copy > p",c.contact_text);
    if(c.contact_email){document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.href="mailto:"+c.contact_email;a.textContent=c.contact_email+" ↗";});}
    setLines(".case-hero h1",c.case_title);
    setText(".case-lead",c.case_lead);
    for(let i=1;i<=3;i++)setImage(".case-image:nth-child("+i+") img",c["case_image_"+i]);
    if(c.hero_image){const hero=document.querySelector(".hero-image");if(hero)hero.style.backgroundImage='url("'+c.hero_image.replace(/["\\\n\r]/g,"")+'")';}
    if(c.approach_image)setImage(".project-photo",c.approach_image);
    if(c.case_image_1 && document.querySelector(".case-hero")) {
      let style=document.getElementById("admin-case-image");
      if(!style){style=document.createElement("style");style.id="admin-case-image";document.head.append(style);}
      style.textContent='.case-hero:before{background-image:url("'+c.case_image_1.replace(/["\\\n\r]/g,"")+'")!important}';
    }
  });
})();
