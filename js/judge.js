/* Python code judge: real Python runs in the browser through Pyodide (WebAssembly) inside a Web Worker,
   so an infinite loop can be stopped. The engine (~10 MB) is downloaded from a CDN on first use only. */
const PYODIDE_URL="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const PY_HARNESS=[
"import io, sys, json, math, traceback",
"def _same(a, b):",
"    if isinstance(a, bool) or isinstance(b, bool):",
"        return a == b",
"    if isinstance(a, (int, float)) and isinstance(b, (int, float)):",
"        return math.isclose(a, b, rel_tol=1e-6, abs_tol=1e-9)",
"    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):",
"        return len(a) == len(b) and all(_same(x, y) for x, y in zip(a, b))",
"    if isinstance(a, dict) and isinstance(b, dict):",
"        return a.keys() == b.keys() and all(_same(a[k], b[k]) for k in a)",
"    return a == b",
"def judge(code, tests_json):",
"    tests = json.loads(tests_json)",
"    res = {'error': None, 'stdout': '', 'tests': []}",
"    ns = {'__name__': '__main__'}",
"    buf = io.StringIO()",
"    old = sys.stdout",
"    sys.stdout = buf",
"    try:",
"        try:",
"            exec(compile(code, '<your code>', 'exec'), ns)",
"        except BaseException as e:",
"            line = None",
"            for fr in traceback.extract_tb(e.__traceback__):",
"                if fr.filename == '<your code>':",
"                    line = fr.lineno",
"            if isinstance(e, SyntaxError):",
"                line = e.lineno",
"            msg = e.msg if isinstance(e, SyntaxError) else str(e)",
"            res['error'] = type(e).__name__ + ': ' + str(msg) + ((' (line ' + str(line) + ')') if line else '')",
"        if res['error'] is None:",
"            for expr, exp in tests:",
"                item = {'expr': expr, 'expected': exp}",
"                try:",
"                    got = eval(expr, ns)",
"                    item['got'] = repr(got)",
"                    item['pass'] = bool(_same(got, eval(exp, {})))",
"                except BaseException as e:",
"                    item['got'] = type(e).__name__ + ': ' + str(e)",
"                    item['pass'] = False",
"                res['tests'].append(item)",
"    finally:",
"        sys.stdout = old",
"    res['stdout'] = buf.getvalue()[-2000:]",
"    return json.dumps(res)"
].join("\n");

const WORKER_SRC=`
importScripts("${PYODIDE_URL}pyodide.js");
let py=null;
const HARNESS=${JSON.stringify(PY_HARNESS)};
(async()=>{try{py=await loadPyodide({indexURL:"${PYODIDE_URL}"});py.runPython(HARNESS);postMessage({t:"ready"})}catch(e){postMessage({t:"fatal",msg:String(e)})}})();
onmessage=e=>{const d=e.data;if(d.t!=="run")return;
  try{const out=py.globals.get("judge")(d.code,JSON.stringify(d.tests));postMessage({t:"result",id:d.id,res:String(out)})}
  catch(err){postMessage({t:"result",id:d.id,res:JSON.stringify({error:String(err),stdout:"",tests:[]})})}};
`;

/* ---- UI ---- */
let pyWorker=null,pyState="idle",pyMsg="",pyRunId=0,pyPending={},pyReadyCbs=[],pyStatusEl=null;
function pySetState(s,m){pyState=s;pyMsg=m||"";if(pyStatusEl&&document.body.contains(pyStatusEl))pyPaintStatus()}
function pyPaintStatus(){
  const t={idle:"Python engine: not loaded yet (it loads when you press Run).",loading:"Python engine: loading… (about 10 MB the first time, please wait)",ready:"Python engine: ready ✔",error:"Python engine could not load. "+pyMsg}[pyState];
  pyStatusEl.className="pystatus "+pyState;pyStatusEl.textContent=t;
}
function pyStart(){
  if(pyWorker||pyState==="loading")return;
  pySetState("loading");
  try{
    const url=URL.createObjectURL(new Blob([WORKER_SRC],{type:"text/javascript"}));
    pyWorker=new Worker(url);
  }catch(e){pySetState("error","Your browser blocked the background worker.");return}
  pyWorker.onmessage=ev=>{
    const d=ev.data;
    if(d.t==="ready"){pySetState("ready");pyReadyCbs.splice(0).forEach(f=>f(true))}
    else if(d.t==="fatal"){pyKill();pySetState("error","Check your internet connection (the engine downloads once from a CDN).");pyReadyCbs.splice(0).forEach(f=>f(false))}
    else if(d.t==="result"&&pyPending[d.id]){const p=pyPending[d.id];delete pyPending[d.id];clearTimeout(p.timer);p.resolve(JSON.parse(d.res))}
  };
  pyWorker.onerror=()=>{pyKill();pySetState("error","The worker failed to start (offline?).");pyReadyCbs.splice(0).forEach(f=>f(false))};
}
function pyKill(){if(pyWorker){pyWorker.terminate();pyWorker=null}}
function pyWhenReady(){
  return new Promise(res=>{
    if(pyState==="ready"){res(true);return}
    pyReadyCbs.push(res);pyStart();
    setTimeout(()=>{const i=pyReadyCbs.indexOf(res);if(i>=0){pyReadyCbs.splice(i,1);pyKill();pySetState("error","Loading took too long.");res(false)}},90000);
  });
}
function pyRun(code,tests){
  return pyWhenReady().then(ok=>{
    if(!ok)return Promise.reject(new Error("engine"));
    return new Promise((resolve,reject)=>{
      const id=++pyRunId;
      const timer=setTimeout(()=>{delete pyPending[id];pyKill();pySetState("idle");reject(new Error("timeout"))},8000);
      pyPending[id]={resolve,timer};
      pyWorker.postMessage({t:"run",id,code,tests});
    });
  });
}

function labJudge(box){
  const solved=SQP.codeSolved();
  let cur=store.get("ds-ex",EXERCISES[0].id);if(!EXERCISES.some(e=>e.id===cur))cur=EXERCISES[0].id;
  box.innerHTML=`<div class="card"><h3>Python code judge</h3>
   <p>Write real Python and press <b>Run</b>. Your code runs in your browser and a set of tests judges the output. <small class="muted">The first run downloads the Python engine (≈10 MB, needs internet once); later runs are fast.</small></p>
   <div id="pyStatus" class="pystatus"></div>
   <label for="jSel">Exercise <span class="muted" id="jCount"></span></label><select id="jSel"></select>
   <div id="jTask"></div>
   <label for="jCode">Your code <small class="muted">(Tab inserts spaces; press Esc then Tab to leave the box)</small></label>
   <textarea id="jCode" class="codeedit" spellcheck="false" autocapitalize="off" autocomplete="off" rows="12"></textarea>
   <div class="btnrow"><button class="b" id="jRun">▶ Run and judge</button><button class="b alt" id="jReset">Reset code</button><button class="b alt" id="jSol">Show reference solution</button></div>
   <div id="jOut" role="status" aria-live="polite"></div></div>`;
  pyStatusEl=$("#pyStatus",box);pyPaintStatus();
  const sel=$("#jSel",box),code=$("#jCode",box),out=$("#jOut",box);
  const fillSel=()=>{const s=SQP.codeSolved();sel.innerHTML=EXERCISES.map(e=>`<option value="${e.id}" ${e.id===cur?"selected":""}>${s[e.id]?"✅ ":""}${e.title} (${e.level})</option>`).join("");$("#jCount",box).textContent=`· ${Object.keys(s).filter(k=>EXERCISES.some(e=>e.id===k)).length} of ${EXERCISES.length} solved`};
  const ex=()=>EXERCISES.find(e=>e.id===cur);
  const load=()=>{
    const e=ex();
    $("#jTask",box).innerHTML=`<div class="case"><div class="case-h">${esc(e.topic)} · ${e.level}</div><p>${esc(e.task)}</p><details><summary>Show the tests that will run</summary><pre class="code">${e.tests.map(t=>esc(t[0]+"   →   "+t[1])).join("\n")}</pre></details></div>`;
    code.value=store.get("ds-code-"+e.id,e.starter);out.innerHTML="";
  };
  fillSel();load();
  sel.onchange=()=>{cur=sel.value;store.set("ds-ex",cur);load()};
  code.oninput=()=>store.set("ds-code-"+cur,code.value);
  code.onkeydown=ev=>{if(ev.key==="Tab"&&!ev.shiftKey&&!ev.ctrlKey&&!ev.metaKey&&!code._esc){ev.preventDefault();const s=code.selectionStart,e2=code.selectionEnd;code.value=code.value.slice(0,s)+"    "+code.value.slice(e2);code.selectionStart=code.selectionEnd=s+4;code.oninput()}
    code._esc=ev.key==="Escape"};
  $("#jReset",box).onclick=()=>{if(confirm("Replace your code with the starting template?")){code.value=ex().starter;code.oninput();out.innerHTML=""}};
  $("#jSol",box).onclick=()=>{out.innerHTML=`<div class="warn">Try the exercise yourself first. This is one possible solution:</div><pre class="code">${esc(ex().solution)}</pre><div class="btnrow"><button class="b alt" id="jUse">Copy into the editor</button></div>`;$("#jUse",box).onclick=()=>{code.value=ex().solution;code.oninput();out.innerHTML=""}};
  $("#jRun",box).onclick=async()=>{
    const e=ex(),btn=$("#jRun",box);btn.disabled=true;
    out.innerHTML=`<div class="out">${pyState==="ready"?"Running your code…":"Loading the Python engine and running… (first time takes a while)"}</div>`;
    try{
      const r=await pyRun(code.value,e.tests);
      if(r.error){out.innerHTML=`<div class="fb fb-wrong"><div class="fb-h">✘ <b>Your code has an error</b></div><pre class="code">${esc(r.error)}</pre><p class="muted">Read the message and the line number, fix it and run again.</p></div>`}
      else{
        const ok=r.tests.filter(t=>t.pass).length,all=ok===r.tests.length;
        if(all){SQP.markCode(e.id);fillSel()}
        out.innerHTML=`<div class="fb fb-${all?"correct":"partial"}"><div class="fb-h">${all?"✔ <b>All tests passed!</b>":"◐ <b>Some tests failed</b>"} · ${ok} / ${r.tests.length}</div>
         <div class="scroll"><table><tr><th>Test</th><th>Expected</th><th>Your result</th><th></th></tr>${r.tests.map(t=>`<tr><td class="code">${esc(t.expr)}</td><td class="code">${esc(t.expected)}</td><td class="code">${esc(t.got)}</td><td>${t.pass?"✔ pass":"✘ fail"}</td></tr>`).join("")}</table></div>
         ${r.stdout?`<p><b>Printed output:</b></p><pre class="code">${esc(r.stdout)}</pre>`:""}
         ${all?`<p class="good">Great work. Open the next exercise from the list above.</p>`:`<p class="muted">Compare ‘Expected’ with ‘Your result’ on the failing rows.</p>`}</div>`;
      }
    }catch(err){
      out.innerHTML=err.message==="timeout"?`<div class="fb fb-wrong"><div class="fb-h">⏱ <b>Your code took too long</b></div><p>It may contain an infinite loop (for example a <code>while</code> that never ends). The engine was stopped; fix the loop and run again.</p></div>`
        :`<div class="fb fb-wrong"><div class="fb-h">⚠ <b>The Python engine is not available</b></div><p>${esc(pyMsg||"Check your internet connection and try again.")}</p><p>You can still study the tests above, open the reference solution, and practise with the ‘predict the output’ questions in the Quiz.</p></div>`;
    }
    btn.disabled=false;
  };
}
