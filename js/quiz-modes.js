/* Quiz with modes: Quick, Scenario, Mixed, Chapter Practice, Full Mock Exam.
   Uses the concept questions (QZ and QCODE in quiz-data.js) and the scenario questions (scenario-data.js).
   Question rendering / grading is shared with scenarios.js. */
const QMODES={
  quick:["Quick Quiz","Short concept questions from all lessons."],
  scenario:["Scenario Quiz","Multiple-choice, select-all and matching questions based on realistic cases."],
  mixed:["Mixed Quiz","Concept and scenario questions together."],
  chapter:["Topic Practice","Concept and scenario questions from one topic. Pick the topic below."],
  mock:["Full Mock Exam","30 mixed questions, 30-minute timer. Answers and explanations appear only after you submit. Filters are ignored."]};
let QS=null,qTimerId=null;

function qConceptPool(){
  const a=QZ.map((r,i)=>({id:"c"+i,src:"q",ch:r[0],type:"single",prompt:r[1],options:r[2],answer:[r[3]],explain:r[4],marks:1,diff:"easy",tags:[]}));
  const b=QCODE.map((r,i)=>({id:"k"+i,src:"q",ch:r.ch,type:"single",prompt:r.prompt,code:r.code,options:r.options,answer:[r.answer],explain:r.explain,marks:1,diff:"medium",tags:[]}));
  return a.concat(b);
}
function qScenarioPool(){
  const out=[];
  SC.forEach(s=>s.questions.forEach(q=>{if(q.type==="written")return;out.push({...q,id:s.id+":"+q.id,src:"s",ch:s.chapter,scId:s.id,scTitle:s.title,desc:s.description,diff:s.difficulty,tags:s.tags})}));
  return out;
}
function qStopTimer(){if(qTimerId){clearInterval(qTimerId);qTimerId=null}}

function qSetup(){
  qStopTimer();QS=null;
  const mode=$("#qMode").value,isMock=mode==="mock";
  $("#qModeNote").textContent=QMODES[mode][1];
  ["qCh","qDiff","qWhich","qCount"].forEach(id=>$("#"+id).disabled=isMock);
  $("#qBox").innerHTML="";
  qHistory();
}
function qHistory(){
  const h=SQP.history().slice(-5).reverse();
  $("#qHistory").innerHTML=h.length?`<div class="card"><b>Recent quizzes</b><ul class="plain">${h.map(x=>`<li>${new Date(x.ts).toLocaleDateString()} · ${esc(QMODES[x.mode]?QMODES[x.mode][0]:x.mode)} · ${fmtn(x.score)}/${x.max} (${x.max?Math.round(x.score/x.max*100):0}%)</li>`).join("")}</ul><small class="muted">Saved in this browser only.</small></div>`:"";
}
function qStart(){
  const mode=$("#qMode").value,chap=$("#qCh").value,diff=$("#qDiff").value,which=$("#qWhich").value,cnt=$("#qCount").value;
  let pool;
  if(mode==="mock"){
    pool=shuffle(qConceptPool()).slice(0,20).concat(shuffle(qScenarioPool().filter(x=>x.type!=="written")).slice(0,10));
    pool=shuffle(pool);
  }else{
    pool=mode==="quick"?qConceptPool():mode==="scenario"?qScenarioPool():qConceptPool().concat(qScenarioPool());
    const st=SQP.stats();
    pool=pool.filter(q=>(chap==="all"||q.ch===+chap)&&(diff==="all"||q.diff===diff)&&(which==="all"||(which==="new"?!st.seen[q.id]:!!st.wrong[q.id])));
    pool=shuffle(pool);
    /* show questions not seen before first, so the same ones do not repeat too often */
    pool.sort((a,b)=>(st.seen[a.id]?1:0)-(st.seen[b.id]?1:0));
    if(cnt!=="all")pool=pool.slice(0,+cnt);
    pool=shuffle(pool);
  }
  if(!pool.length){$("#qBox").innerHTML=`<div class="warn">No questions match these filters. Try “All” for chapter, difficulty or question status.</div>`;return}
  QS={mode,exam:mode==="mock",qs:pool,ans:pool.map(()=>null),checked:pool.map(()=>false),i:0,t0:Date.now(),timeUp:false};
  qDraw();
  if(QS.exam){
    const end=Date.now()+30*60000;qStopTimer();
    qTimerId=setInterval(()=>{
      const t=document.getElementById("qTimer");
      if(!t||!QS){qStopTimer();return}
      const left=Math.max(0,Math.round((end-Date.now())/1000));
      t.textContent="⏱ "+Math.floor(left/60)+":"+String(left%60).padStart(2,"0");t.classList.toggle("low",left<=120);
      if(left<=0){QS.timeUp=true;qStopTimer();qFinish()}
    },1000);
  }
}
function qSave(){
  if(!QS)return;
  const box=document.getElementById("qBox");
  if(!QS.checked[QS.i]&&box.querySelector("#qFs"))QS.ans[QS.i]=qRead(QS.qs[QS.i],box,"qz");
}
function qDraw(){
  const box=$("#qBox"),q=QS.qs[QS.i],n=QS.qs.length,locked=!QS.exam&&QS.checked[QS.i];
  const answered=QS.ans.filter(a=>a!==null).length;
  box.innerHTML=`<div class="card qcard">
    ${QS.exam?`<div class="timerbar" id="qTimer" role="timer">⏱ 30:00</div>`:""}
    <div class="qhead"><span>Question ${QS.i+1} of ${n} · Week ${WEEKS[q.ch-1]}${q.src==="s"?" · "+DIFF_L[q.diff]:""}</span><span>${QS.exam?answered+" answered":"Score so far: "+fmtn(QS.qs.reduce((a,x,i)=>a+(QS.checked[i]?qGrade(x,QS.ans[i]).got:0),0))}</span></div>
    <div class="meter"><i style="width:${Math.round((QS.i+1)/n*100)}%"></i></div>
    ${q.src==="s"?`<div class="case" style="margin-top:12px"><div class="case-h">📋 Scenario: ${esc(q.scTitle)}</div><p>${esc(q.desc)}</p></div>`:""}
    <fieldset class="qbox" id="qFs" ${locked?"disabled":""}><legend>${esc(q.prompt)} <span class="marks">${marksLabel(q)}</span></legend><p class="qnote">${typeNote(q)}</p>${qCode(q)}${qInputs(q,"qz",QS.ans[QS.i])}</fieldset>
    <div id="qFb"></div>
    <div class="btnrow" id="qNav"></div>
    ${QS.exam?`<div class="qdots" aria-label="Jump to question">${QS.qs.map((_,i)=>`<button class="dot ${i===QS.i?"cur":""} ${QS.ans[i]!==null?"ans":""}" data-j="${i}" aria-label="Question ${i+1}${QS.ans[i]!==null?" answered":" not answered"}">${i+1}</button>`).join("")}</div>`:""}
  </div>`;
  const nav=$("#qNav");
  if(QS.exam){
    nav.innerHTML=`<button class="b alt" id="qPrev" ${QS.i?"":"disabled"}>← Previous</button><button class="b alt" id="qNextE" ${QS.i<n-1?"":"disabled"}>Next →</button><button class="b" id="qSubmit">Submit exam</button>`;
    $("#qPrev").onclick=()=>{qSave();QS.i--;qDraw()};
    $("#qNextE").onclick=()=>{qSave();QS.i++;qDraw()};
    $("#qSubmit").onclick=()=>{qSave();const blank=QS.ans.filter(a=>a===null).length;if(blank&&!confirm(blank+" question(s) are not answered. Submit anyway?"))return;qFinish()};
    $$(".dot",box).forEach(d=>d.onclick=()=>{qSave();QS.i=+d.dataset.j;qDraw()});
  }else if(locked){
    const g=qGrade(q,QS.ans[QS.i]);
    $("#qFb").innerHTML=qFeedback(q,QS.ans[QS.i],g);
    nav.innerHTML=`<button class="b" id="qNextP">${QS.i<n-1?"Next question →":"Finish and see results"}</button>`;
    $("#qNextP").onclick=()=>{if(QS.i<n-1){QS.i++;qDraw();$("#qBox").scrollIntoView({behavior:"smooth",block:"start"})}else qFinish()};
  }else{
    nav.innerHTML=`<button class="b" id="qCheck">Check answer</button>`;
    $("#qCheck").onclick=()=>{
      const a=qRead(q,box,"qz");
      if(a===null){$("#qFb").innerHTML=`<div class="warn">Choose an answer first.</div>`;return}
      QS.ans[QS.i]=a;QS.checked[QS.i]=true;qDraw();
    };
  }
}
function qFinish(){
  qStopTimer();
  const box=$("#qBox");
  if(!QS.exam||box.querySelector("#qFs"))qSave();
  const grades=QS.qs.map((q,i)=>qGrade(q,QS.ans[i]));
  const score=grades.reduce((a,g)=>a+g.got,0),max=grades.reduce((a,g)=>a+g.max,0);
  const secs=Math.round((Date.now()-QS.t0)/1000),pct=max?Math.round(score/max*100):0;
  const per={};
  QS.qs.forEach((q,i)=>{const p=per[q.ch]=per[q.ch]||{got:0,max:0};p.got+=grades[i].got;p.max+=grades[i].max});
  SQP.addHistory({ts:Date.now(),mode:QS.mode,score:Math.round(score*100)/100,max,seconds:secs,perChapter:per});
  SQP.record(QS.qs.map((q,i)=>({id:q.id,ok:grades[i].status==="correct"})));
  const weakCh=Object.keys(per).filter(c=>per[c].max&&per[c].got/per[c].max<0.7).sort();
  const wrongTags=[...new Set(QS.qs.flatMap((q,i)=>grades[i].status!=="correct"?q.tags:[]))].slice(0,4);
  const review=QS.qs.map((q,i)=>({q,i,g:grades[i]})).filter(x=>x.g.status!=="correct");
  const unans=grades.filter(g=>g.status==="unanswered").length;
  box.innerHTML=`<div class="card result" id="qRes" tabindex="-1">
    <h3>${QS.exam?"Mock exam result":"Quiz result"}</h3>
    ${QS.timeUp?`<div class="warn">Time was up, so the exam was submitted automatically.</div>`:""}
    <div class="big">${fmtn(score)} / ${max} <small>(${pct}%)</small></div>
    <p>${pct>=85?"Excellent work.":pct>=60?"Good. Review the weak areas below.":"Keep practising: revise the lessons, then try again."}</p>
    <p class="muted">Correct: ${grades.filter(g=>g.status==="correct").length} · Partly correct: ${grades.filter(g=>g.status==="partial").length} · Incorrect: ${grades.filter(g=>g.status==="wrong").length} · Unanswered: ${unans} · Time: ${Math.floor(secs/60)}m ${secs%60}s</p>
    <b>Week-wise performance</b>
    ${Object.keys(per).sort().map(c=>{const p=per[c],pc=p.max?Math.round(p.got/p.max*100):0;return `<div class="perf"><span>Week ${WEEKS[c-1]}: ${fmtn(p.got)}/${p.max} (${pc}%) ${pc>=70?"✔":"⚠ revise"}</span><div class="meter"><i style="width:${pc}%"></i></div></div>`}).join("")}
    ${weakCh.length||wrongTags.length?`<div class="card"><b>Review weak topics</b><div class="relbtns">${weakCh.map(c=>`<button class="chip" data-rev="c${c}">📖 Read Week ${WEEKS[c-1]}</button><button class="chip" data-sc="${c}">🧩 Scenarios: Week ${WEEKS[c-1]}</button>`).join("")}${wrongTags.map(t=>`<button class="chip" data-tag="${esc(t)}">🧩 Practise #${esc(t)}</button>`).join("")}</div></div>`:`<p class="good">No weak areas found.</p>`}
    <div class="btnrow"><button class="b" id="qAgain">Try again</button><button class="b alt" id="qNew">Change settings</button></div>
    ${review.length?`<h3>Review: ${review.length} question${review.length>1?"s":""} to look at</h3>${review.map(x=>(x.q.src==="s"?`<p class="muted"><small>Scenario: ${esc(x.q.scTitle)}</small></p>`:"")+qFeedback(x.q,QS.ans[x.i],x.g,"Q"+(x.i+1))).join("")}`:""}
  </div>`;
  $$("[data-rev]",box).forEach(b=>b.onclick=()=>go(b.dataset.rev));
  $$("[data-sc]",box).forEach(b=>b.onclick=()=>{Object.assign(SCS,{ch:b.dataset.sc,cat:"all",diff:"all",status:"all",q:"",tag:""});scView="list";go("scenarios")});
  $$("[data-tag]",box).forEach(b=>b.onclick=()=>scByTag(b.dataset.tag));
  $("#qAgain").onclick=qStart;$("#qNew").onclick=()=>{qSetup();window.scrollTo(0,0)};
  const r=$("#qRes");r.scrollIntoView({behavior:"smooth",block:"start"});r.focus({preventScroll:true});
  qHistory();
}
$("#qMode").onchange=qSetup;$("#qStart").onclick=qStart;
qSetup();
