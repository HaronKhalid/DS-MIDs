/* Python code judge: your code runs as real Python (engine in pyengine.js), then a set of tests checks the result.
   The editor comes from editor.js. Exercises, tests and reference solutions are in judge-data.js. */
function labJudge(box){
  let cur=store.get("ds-ex",EXERCISES[0].id);if(!EXERCISES.some(e=>e.id===cur))cur=EXERCISES[0].id;
  box.innerHTML=`<div class="card"><h3>Python code judge</h3>
   <p>Solve the exercise and press <b>Run and judge</b>. Your code runs in your browser and a set of tests checks the result. <small class="muted">The first run downloads the Python engine (≈ 10 MB, needs internet once); later runs are fast. To try your own code freely, use the <b>Python playground</b> lab.</small></p>
   <div id="pyStatus" class="pystatus"></div>
   <label for="jSel">Exercise <span class="muted" id="jCount"></span></label><select id="jSel"></select>
   <div id="jTask"></div>
   <div id="jEd"></div>
   <div class="btnrow"><button class="b" id="jRun">▶ Run and judge</button><button class="b alt" id="jReset">Reset code</button><button class="b alt" id="jSol">Show reference solution</button></div>
   <div id="jOut" role="status" aria-live="polite"></div></div>`;
  if(PY.job)PY.stop();   /* the lab was re-opened while something was still running */
  PY.watch($("#pyStatus",box));
  const sel=$("#jSel",box),out=$("#jOut",box),btn=$("#jRun",box);
  const ex=()=>EXERCISES.find(e=>e.id===cur);
  const ed=codeEditor($("#jEd",box),{id:"jCode",label:"Your Python code",filename:"solution.py",onRun:()=>run(),onChange:v=>store.set("ds-code-"+cur,v)});
  const fillSel=()=>{
    const s=SQP.codeSolved();
    sel.innerHTML=EXERCISES.map(e=>`<option value="${e.id}" ${e.id===cur?"selected":""}>${s[e.id]?"✅ ":""}${e.title} (${e.level})</option>`).join("");
    $("#jCount",box).textContent=`· ${Object.keys(s).filter(k=>EXERCISES.some(e=>e.id===k)).length} of ${EXERCISES.length} solved`;
  };
  const load=()=>{
    const e=ex();
    $("#jTask",box).innerHTML=`<div class="case"><div class="case-h">${esc(e.topic)} · ${e.level}</div><p>${esc(e.task)}</p><details><summary>Show the tests that will run</summary><pre class="code">${e.tests.map(t=>pyHighlight(t[0])+`<span class="t-c">   →   </span>`+pyHighlight(t[1])).join("\n")}</pre></details></div>`;
    ed.value=store.get("ds-code-"+e.id,e.starter);out.innerHTML="";
  };
  let running=false;
  async function run(){
    if(running)return;
    const e=ex();running=true;btn.disabled=true;ed.clearError();
    out.innerHTML=`<div class="out">${PY.state==="ready"?"Running your code…":"Loading the Python engine and running… (the first time takes a while)"}</div>`;
    try{
      const r=await PY.exec({kind:"judge",code:ed.value,tests:e.tests,limit:8000});
      if(r.error){
        ed.markError(r.line);
        out.innerHTML=`<div class="fb fb-wrong"><div class="fb-h">✘ <b>Your code has an error</b></div><pre class="code">${esc(r.error)}</pre>${r.hint?`<p>💡 ${esc(r.hint)}</p>`:""}<p class="muted">Read the message and the line number (it is marked red in the editor), fix it and run again.</p></div>`;
      }else{
        const ok=r.tests.filter(t=>t.pass).length,all=ok===r.tests.length;
        if(all){SQP.markCode(e.id);fillSel()}
        out.innerHTML=`<div class="fb fb-${all?"correct":"partial"}"><div class="fb-h">${all?"✔ <b>All tests passed!</b>":"◐ <b>Some tests failed</b>"} · ${ok} / ${r.tests.length}</div>
         <div class="scroll"><table><tr><th>Test</th><th>Expected</th><th>Your result</th><th></th></tr>${r.tests.map(t=>`<tr><td class="code">${esc(t.expr)}</td><td class="code">${esc(t.expected)}</td><td class="code">${esc(t.got)}</td><td>${t.pass?"✔ pass":"✘ fail"}</td></tr>`).join("")}</table></div>
         ${r.stdout?`<p><b>Printed output:</b></p><pre class="code">${esc(r.stdout)}</pre>`:""}
         ${all?`<p class="good">Great work. Open the next exercise from the list above.</p>`:`<p class="muted">Compare ‘Expected’ with ‘Your result’ on the failing rows.</p>`}</div>`;
      }
    }catch(err){
      const m=err&&err.message;
      out.innerHTML=m==="timeout"?`<div class="fb fb-wrong"><div class="fb-h">⏱ <b>Your code took too long</b></div><p>It may contain an infinite loop (for example a <code>while</code> that never ends). The engine was stopped; fix the loop and run again.</p></div>`
        :m==="busy"?`<div class="fb fb-partial"><div class="fb-h">⏳ <b>Python is still busy</b></div><p>Another run has not finished yet. Wait a moment and press Run again.</p></div>`
        :`<div class="fb fb-wrong"><div class="fb-h">⚠ <b>The Python engine is not available</b></div><p>${esc(PY.msg||"Check your internet connection and try again.")}</p><p>You can still study the tests above, open the reference solution, and practise with the ‘predict the output’ questions in the Quiz.</p></div>`;
    }
    running=false;btn.disabled=false;
  }
  fillSel();load();
  sel.onchange=()=>{cur=sel.value;store.set("ds-ex",cur);load()};
  btn.onclick=run;
  $("#jReset",box).onclick=()=>{if(confirm("Replace your code with the starting template?")){ed.value=ex().starter;store.set("ds-code-"+cur,ed.value);out.innerHTML=""}};
  $("#jSol",box).onclick=()=>{
    out.innerHTML=`<div class="warn">Try the exercise yourself first. This is one possible solution:</div><pre class="code py">${esc(ex().solution)}</pre><div class="btnrow"><button class="b alt" id="jUse">Copy into the editor</button></div>`;
    $("#jUse",box).onclick=()=>{ed.value=ex().solution;store.set("ds-code-"+cur,ed.value);out.innerHTML=""};
  };
}
