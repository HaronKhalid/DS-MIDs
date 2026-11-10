/* Core: helpers, navigation, collapsible lessons, progress tracking, reusable 'sorter' game */

/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const fmt=n=>Math.round(n).toLocaleString("en-US");
const esc=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

/* ---------- chapter + page info ---------- */
/* Mid-term scope (confirmed): lecture-plan weeks 1-7 and week 10 */
const WEEKS=[1,2,3,4,5,6,7,10];
const CHAPTERS=[
  ["c1","Introduction to Data Science"],["c2","Python for Data Science"],["c3","Data Acquisition"],["c4","Data Cleaning"],
  ["c5","Pandas & Data Manipulation"],["c6","Exploratory Data Analysis (EDA)"],["c7","Data Visualization"],["c8","Machine Learning Fundamentals"]];
const NAV=[["home","🏠","Home"],["learn","📚","Learn"],["labs","🧪","Labs"],["scenarios","🧩","Scenarios"],["quiz","✍️","Quiz"],["revise","🃏","Revise"]];
const PAGE_IDS=["home","labs","scenarios","quiz","cards","sheet",...CHAPTERS.map(c=>c[0])];
const isChap=id=>/^c\d$/.test(id);

/* ---------- navigation ---------- */
function buildNav(){
  $("#tabs").innerHTML=NAV.map(([id,ic,t])=>`<button data-go="${id}" aria-label="${t}"><span class="ic">${ic}</span><span>${t}</span></button>`).join("");
  $$("#tabs button").forEach(b=>b.onclick=()=>go(b.dataset.go));
  $("#chapbar").innerHTML=`<div class="chapbar-in">${CHAPTERS.map(([id],i)=>`<button class="pill" data-go="${id}">W${WEEKS[i]}<small id="pc-${id}"></small></button>`).join("")}</div>`;
  $$("#chapbar .pill").forEach(b=>b.onclick=()=>go(b.dataset.go));
}
function go(id,topic){
  if(id==="learn")id=store.get("ds-last","c1");
  if(id==="revise")id="cards";
  if(!PAGE_IDS.includes(id))id="home";
  if(isChap(id))store.set("ds-last",id);
  $$(".page").forEach(p=>p.classList.toggle("on",p.id===id));
  const navId=isChap(id)?"learn":(id==="cards"||id==="sheet")?"revise":id;
  $$("#tabs button").forEach(b=>b.classList.toggle("on",b.dataset.go===navId));
  $$("#chapbar .pill").forEach(b=>b.classList.toggle("on",b.dataset.go===id));
  document.body.classList.toggle("in-chapter",isChap(id));
  document.body.classList.toggle("in-scen",id==="scenarios"||id==="labs");
  if(id==="scenarios"&&typeof scShow==="function")scShow();
  if(id==="labs"&&typeof labsShow==="function")labsShow();
  try{history.replaceState(null,"","#"+id)}catch(e){}
  if(topic){
    const el=document.querySelector(`[data-id="${topic}"]`);
    if(el){setOpen(el,true);setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),60)}
  }else window.scrollTo(0,0);
}

/* ---------- topics: collapsible cards, tools hidden, mark learned ---------- */
let done=store.get("ds-done",{});
function setOpen(t,open){
  t.classList.toggle("open",open);
  const h=$("h3",t);if(h)h.setAttribute("aria-expanded",open?"true":"false");
}
function setupTopics(){
  /* wrap wide tables so phones can scroll them sideways */
  $$(".topic table").forEach(t=>{
    if(!t.parentElement.classList.contains("scroll")){
      const w=document.createElement("div");w.className="scroll";t.parentNode.insertBefore(w,t);w.appendChild(t);
    }
  });
  /* practice tools: hide inside a tap-to-open box */
  $$(".lab").forEach(lab=>{
    const title=($("h4",lab)||{}).textContent||"Practice";
    const d=document.createElement("details");d.className="labbox";
    const s=document.createElement("summary");s.textContent="🧪 Practice: "+title;
    lab.parentNode.insertBefore(d,lab);d.append(s,lab);
  });
  $$(".topic[data-id]").forEach(t=>{
    const h=$("h3",t),id=t.dataset.id;
    /* header = number + title + tick + arrow */
    const tt=document.createElement("span");tt.className="tt";
    while(h.firstChild)tt.appendChild(h.firstChild);
    const num=document.createElement("span");num.className="tn";num.textContent=id.split("-")[1];
    const tick=document.createElement("span");tick.className="tick";tick.textContent="✅";
    const chev=document.createElement("span");chev.className="chev";chev.textContent="▼";
    h.append(num,tt,tick,chev);
    h.setAttribute("role","button");h.tabIndex=0;
    /* everything else goes into the body */
    const body=document.createElement("div");body.className="tbody";
    [...t.children].filter(c=>c!==h).forEach(c=>body.appendChild(c));
    t.appendChild(body);
    const btn=document.createElement("button");btn.className="learn-btn";
    const upd=()=>{t.classList.toggle("done",!!done[id]);btn.textContent=done[id]?"✅ Learned (tap to undo)":"✓ I have learned this"};
    btn.onclick=()=>{done[id]=!done[id];store.set("ds-done",done);upd();progress()};
    body.appendChild(btn);upd();
    const toggle=()=>setOpen(t,!t.classList.contains("open"));
    h.onclick=toggle;
    h.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}};
    setOpen(t,false);
  });
  /* per chapter: toolbar (open all / close all), first topic open, next-chapter button */
  CHAPTERS.forEach(([cid,name],i)=>{
    const page=$("#"+cid);if(!page)return;
    const h1=$("h1",page);h1.insertAdjacentHTML("beforebegin",`<div class="muted" style="font-size:.85rem;font-weight:700;letter-spacing:.06em">WEEK ${WEEKS[i]} (TOPIC ${i+1} OF ${CHAPTERS.length})</div>`);
    const sub=$("h1 + p",page);if(sub)sub.classList.add("sub");
    const tb=document.createElement("div");tb.className="toolbar";
    tb.innerHTML=`<button class="b alt" data-a="open">Open all</button><button class="b alt" data-a="close">Close all</button><span class="count" id="cnt-${cid}"></span>`;
    (sub||h1).insertAdjacentElement("afterend",tb);
    $$("button",tb).forEach(b=>b.onclick=()=>$$(".topic",page).forEach(t=>setOpen(t,b.dataset.a==="open")));
    const first=$(".topic",page);if(first)setOpen(first,true);
    const nx=document.createElement("div");nx.className="nextbar";
    const next=CHAPTERS[i+1];
    nx.innerHTML=(next?`<button class="b" data-go="${next[0]}">Next: Week ${WEEKS[i+1]} → ${next[1]}</button>`:`<button class="b" data-go="quiz">Finished! Take the quiz ✍️</button>`)+`<button class="b alt" data-go="quiz">Practice quiz</button>`;
    page.appendChild(nx);
    $$("button",nx).forEach(b=>b.onclick=()=>go(b.dataset.go));
  });
}

/* ---------- progress + home page ---------- */
function progress(){
  const all=$$(".topic[data-id]");let d=0;const per={};
  all.forEach(t=>{const c=t.closest(".page").id;per[c]=per[c]||[0,0];per[c][1]++;if(done[t.dataset.id]){d++;per[c][0]++}});
  const pct=all.length?Math.round(d/all.length*100):0;
  $("#pfill").style.width=pct+"%";
  $("#ptop").textContent=pct+"% done";
  $("#ptext").textContent=pct+"% complete ("+d+" of "+all.length+" topics learned)";
  CHAPTERS.forEach(([c])=>{
    const p=per[c]||[0,1];
    const e=$("#pc-"+c);if(e)e.textContent=p[0]+"/"+p[1];
    const n=$("#cnt-"+c);if(n)n.textContent=p[0]+" of "+p[1]+" learned";
  });
  buildHome(per,d,all.length);
  if(typeof renderHomeScenarios==="function")renderHomeScenarios();
}
function buildHome(per,d,total){
  $("#chapCards").innerHTML=CHAPTERS.map(([c,name],i)=>{
    const p=per[c]||[0,0],pc=p[1]?Math.round(p[0]/p[1]*100):0;
    return `<button class="chap-card" data-go="${c}"><div class="n">Week ${WEEKS[i]}</div><div class="t">${name}</div><div class="meter"><i style="width:${pc}%"></i></div><div class="s">${p[0]} of ${p[1]} topics learned</div></button>`}).join("");
  $$("#chapCards .chap-card").forEach(b=>b.onclick=()=>go(b.dataset.go));
  /* continue button: first topic not yet learned */
  const next=$$(".topic[data-id]").find(t=>!done[t.dataset.id]);
  const cb=$("#continueBtn");
  if(!next){cb.textContent="🎉 All lessons done: take the quiz";cb.onclick=()=>go("quiz")}
  else{cb.textContent=d?"▶ Continue where you left off":"▶ Start learning";cb.onclick=()=>go(next.closest(".page").id,next.dataset.id)}
  /* all-topics checklist */
  $("#covmap").innerHTML=CHAPTERS.map(([c,name],i)=>`<h4>Week ${WEEKS[i]}: ${name}</h4>`+$$(`#${c} .topic[data-id]`).map(t=>`<a href="#${c}" data-c="${c}" data-t="${t.dataset.id}"><span class="ck">${done[t.dataset.id]?"✅":"⬜"}</span>${t.dataset.title}</a>`).join("")).join("");
  $$("#covmap a").forEach(a=>a.onclick=e=>{e.preventDefault();go(a.dataset.c,a.dataset.t)});
}
$("#resetP").onclick=()=>{if(confirm("Reset ALL progress on this device (topics, scenarios and quizzes)?")){if(window.SQP)SQP.reset();done={};store.set("ds-done",done);$$(".topic").forEach(t=>{t.classList.remove("done");const b=$(".learn-btn",t);if(b)b.textContent="✓ I have learned this"});progress()}};
$$("[data-go]").forEach(b=>{if(!b.closest("#tabs")&&!b.closest("#chapbar"))b.onclick=()=>go(b.dataset.go)});

/* ---------- theme + print ---------- */
$("#themeBtn").onclick=()=>{const r=document.documentElement;const n=r.dataset.theme==="dark"?"light":"dark";r.dataset.theme=n;store.set("ds-theme",n)};
(function(){const t=store.get("ds-theme",null)||(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t})();
function printSheet(){document.body.classList.add("print-sheet");window.print();setTimeout(()=>document.body.classList.remove("print-sheet"),500)}

/* ---------- generic sorter (classify game) ---------- */
function sorter(id,cats,items){
  const el=document.getElementById(id);let q=shuffle(items),i=0,score=0,locked=false;
  function draw(){
    if(i>=q.length){el.innerHTML=`<div class="out"><span class="score">${score} / ${q.length}</span> ${score===q.length?"🎉 Perfect!":score>=q.length*0.7?"👍 Good, revise the missed ones.":"📚 Read the topic again, then retry."}<br><button class="b" style="margin-top:10px">Play again</button></div>`;
      $("button",el).onclick=()=>{q=shuffle(items);i=0;score=0;draw()};return}
    const it=q[i];locked=false;
    el.innerHTML=`<div class="out"><small>Question ${i+1} of ${q.length}</small><div class="urtxt" dir="auto" style="font-size:1.15rem;margin:6px 0">${esc(it.t)}</div>${it.e?`<div class="urtxt" dir="auto" style="color:var(--muted)">${esc(it.e)}</div>`:""}</div><div>${cats.map((c,k)=>`<button class="opt" data-k="${k}">${esc(c)}</button>`).join("")}</div><div id="${id}-fb"></div>`;
    $$("button.opt",el).forEach(b=>b.onclick=()=>{
      if(locked)return;locked=true;const k=+b.dataset.k;const ok=k===it.a;
      if(ok)score++;b.classList.add(ok?"right":"wrong");
      if(!ok)$$("button.opt",el)[it.a].classList.add("right");
      $("#"+id+"-fb").innerHTML=`<div class="out">${ok?'<span class="good">✔ Correct.</span>':'<span class="badc">✘ Not quite.</span>'} ${esc(it.w||"")}<br><button class="b" style="margin-top:10px">${i+1<q.length?"Next":"See score"}</button></div>`;
      $("#"+id+"-fb button").onclick=()=>{i++;draw()};
    });
  }
  draw();
}
