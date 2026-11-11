/* Python engine shared by the playground and the code judge.
   Real Python (Pyodide = CPython compiled to WebAssembly) runs inside a Web Worker, so a runaway loop can be stopped.
   Libraries are downloaded only when your code imports them: numpy, pandas, matplotlib, scipy, scikit-learn, sqlite3 ...
   Everything comes from a CDN the first time and is then served from the browser cache. */
const PYODIDE_URL="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

/* Small practice files that exist in the Python working folder, so pd.read_csv("students.csv") works. */
const PY_FILES={
"students.csv":`name,city,gender,age,study_hours,marks
Ali,Lahore,M,20,6,78
Sara,Karachi,F,21,9,91
Usman,lahore,M,19,3,55
Hina,Islamabad,F,22,7,
Bilal,Karachi,M,,5,67
Zara,Lahore,F,20,8,88
Ali,Lahore,M,20,6,78
Omar,Islamabad,M,23,2,41
Ayesha,KARACHI,F,21,10,95
Hamza,Lahore,M,150,4,60
Noor,Islamabad,F,20,7,82
Fatima,Karachi,F,22,6,74
`,
"sales.csv":`month,product,region,units,price
Jan,Laptop,Punjab,12,150000
Jan,Phone,Punjab,30,60000
Jan,Phone,Sindh,22,60000
Feb,Laptop,Sindh,9,150000
Feb,Tablet,Punjab,14,45000
Feb,Phone,KPK,18,60000
Mar,Laptop,Punjab,15,150000
Mar,Tablet,Sindh,11,45000
Mar,Phone,Punjab,35,60000
Apr,Laptop,KPK,7,150000
Apr,Phone,Sindh,27,60000
Apr,Tablet,Punjab,16,45000
`,
"cities.csv":`city,province,population_million
Lahore,Punjab,13.0
Karachi,Sindh,18.9
Islamabad,Federal,1.2
Peshawar,KPK,2.0
`,
"marks.json":`[
  {"name": "Ali", "maths": 78, "physics": 65, "english": 72},
  {"name": "Sara", "maths": 91, "physics": 88, "english": 85},
  {"name": "Usman", "maths": 55, "physics": 61, "english": 70},
  {"name": "Zara", "maths": 88, "physics": 92, "english": 79}
]
`};

/* ---------- Python side: runs your code, captures output, plots and errors ---------- */
const PY_HARNESS=String.raw`
import sys, io, os, ast, json, math, base64, builtins, traceback, linecache, importlib.util
import _host

_FN = "main.py"
os.makedirs("/tmp/mpl", exist_ok=True)
with open("/tmp/mpl/matplotlibrc", "w") as _f:
    _f.write("backend: Agg\nfigure.figsize: 5.6, 3.8\n")
os.environ["MATPLOTLIBRC"] = "/tmp/mpl/matplotlibrc"
os.environ["MPLBACKEND"] = "Agg"

_st = {"stdin": [], "i": 0, "need": False, "prompt": ""}

class _NeedInput(BaseException):
    pass

class _Out(io.TextIOBase):
    encoding = "utf-8"
    def __init__(self, kind):
        self._k = kind
    def writable(self):
        return True
    def isatty(self):
        return False
    def write(self, s):
        if not isinstance(s, str):
            raise TypeError("write() argument must be str, not " + type(s).__name__)
        if _st["need"]:
            raise _NeedInput()
        if s:
            _host.emit(self._k, s)
        return len(s)
    def flush(self):
        pass

def _input(prompt=""):
    prompt = "" if prompt is None else str(prompt)
    i = _st["i"]
    if i < len(_st["stdin"]):
        _st["i"] = i + 1
        v = _st["stdin"][i]
        _host.emit("p", prompt)
        _host.emit("i", v + "\n")
        return v
    _st["need"] = True
    _st["prompt"] = prompt
    raise _NeedInput()

_HINTS = {
 "NameError": "Python does not know this name. Check the spelling and capital letters, and make sure the variable is created (or the library imported) on an earlier line.",
 "IndentationError": "Indentation problem. Lines inside if / for / while / def must start with the same number of spaces (use 4).",
 "SyntaxError": "Look at this line and the line above it for a missing colon ( : ), bracket, comma or quote.",
 "ZeroDivisionError": "You divided by zero. Check the divisor with an if before dividing.",
 "IndexError": "That position does not exist. A list with n items has positions 0 to n-1.",
 "KeyError": "That key or column name does not exist. Check spelling and capital letters: print(df.columns) or print(d.keys()).",
 "TypeError": "Values of the wrong type were combined or passed, for example text + number. Convert with int(), float() or str().",
 "ValueError": "The type is right but the value is not acceptable, for example int('abc') or arrays of different lengths.",
 "AttributeError": "This object has no such attribute or method. Check the spelling, and check what the object is with type(x).",
 "ModuleNotFoundError": "This library is not available in the browser. numpy, pandas, matplotlib, seaborn, scipy and scikit-learn (sklearn) work here.",
 "ImportError": "The library exists but that name could not be imported from it. Check the spelling of what you import.",
 "FileNotFoundError": "That file is not in the playground folder. Use a built-in file (students.csv, sales.csv, cities.csv, marks.json) or add your own with 'Add a file'.",
 "URLError": "The browser blocked this download. Use a built-in file or add your own file instead.",
 "RecursionError": "A function keeps calling itself and never stops. Check the base case.",
 "EOFError": "Your program asked for input() but no more input was given.",
 "UnboundLocalError": "A variable is used inside a function before it gets a value there.",
}

def _hint(e):
    for c in type(e).__mro__:
        if c.__name__ in _HINTS:
            return _HINTS[c.__name__]
    return ""

def _explain(e):
    line = None
    if isinstance(e, SyntaxError) and e.filename == _FN:
        line = e.lineno
        text = "".join(traceback.format_exception_only(type(e), e))
    else:
        frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == _FN]
        if frames:
            line = frames[-1].lineno
        text = "Traceback (most recent call last):\n" + "".join(traceback.format_list(frames))
        text += "".join(traceback.format_exception_only(type(e), e))
    return {"etype": type(e).__name__, "line": line, "trace": text, "hint": _hint(e)}

def _imports(code):
    try:
        tree = ast.parse(code)
    except BaseException:
        return []
    out = set()
    for n in ast.walk(tree):
        if isinstance(n, ast.Import):
            out.update(a.name.split(".")[0] for a in n.names)
        elif isinstance(n, ast.ImportFrom) and n.module and not n.level:
            out.add(n.module.split(".")[0])
    return sorted(out)

def _has(name):
    try:
        return importlib.util.find_spec(name) is not None
    except BaseException:
        return False

def _flush_figs():
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is None:
        return
    try:
        for n in plt.get_fignums():
            buf = io.BytesIO()
            plt.figure(n).savefig(buf, format="png", dpi=144, bbox_inches="tight")
            _host.image(base64.b64encode(buf.getvalue()).decode("ascii"))
    finally:
        plt.close("all")

def _show(*args, **kwargs):
    _flush_figs()

def _prepare(code):
    """Import the libraries before the clock starts and make plt.show() draw into the page."""
    mods = _imports(code)
    for m in mods:
        try:
            __import__(m)
        except BaseException:
            pass
    if "matplotlib" in sys.modules or "matplotlib" in mods or "seaborn" in mods:
        try:
            import logging
            logging.getLogger("matplotlib.font_manager").setLevel(logging.ERROR)
            import matplotlib.pyplot as plt
            plt.show = _show
        except BaseException:
            pass
    if "pyodide_http" not in sys.modules and "http" in code and _has("pyodide_http"):
        try:
            import pyodide_http
            pyodide_http.patch_all()
        except BaseException:
            pass

def _is_plot_obj(v):
    def one(x):
        return (type(x).__module__ or "").split(".")[0] in ("matplotlib", "seaborn", "mpl_toolkits")
    if one(v):
        return True
    if isinstance(v, (list, tuple)):
        return any(one(x) for x in v)
    np = sys.modules.get("numpy")
    if np is not None and isinstance(v, np.ndarray) and v.dtype == object:
        return any(one(x) for x in v.ravel()[:4])
    return False

def _display(v):
    """Notebook style: show the value of the last line. DataFrames become real tables."""
    pd = sys.modules.get("pandas")
    if pd is not None and isinstance(v, pd.DataFrame):
        _host.html(v._repr_html_())
        return
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is not None and plt.get_fignums() and _is_plot_obj(v):
        return
    _host.emit("r", repr(v) + "\n")

def display(*values):
    for v in values:
        _display(v)

def _files():
    out = []
    try:
        for n in sorted(os.listdir(".")):
            if os.path.isfile(n) and not n.startswith("."):
                out.append([n, os.path.getsize(n)])
    except BaseException:
        pass
    return out[:60]

def _peek(name):
    try:
        ext = name.rsplit(".", 1)[-1].lower()
        with open(name, "rb") as f:
            if ext in ("png", "jpg", "jpeg", "gif"):
                b = f.read(3000000)
                return json.dumps({"kind": "img", "mime": "image/" + ("jpeg" if ext == "jpg" else ext), "data": base64.b64encode(b).decode("ascii")})
            b = f.read(6000)
        if b"\x00" in b:
            return json.dumps({"kind": "text", "data": "(binary file, " + str(os.path.getsize(name)) + " bytes)"})
        return json.dumps({"kind": "text", "data": b.decode("utf-8", "replace"), "more": os.path.getsize(name) > len(b)})
    except BaseException as e:
        return json.dumps({"kind": "text", "data": "Could not read the file: " + str(e)})

def _run(code, stdin_json, seed):
    _st.update(stdin=json.loads(stdin_json), i=0, need=False, prompt="")
    res = {"status": "ok"}
    linecache.cache[_FN] = (len(code), None, code.splitlines(True), _FN)
    ns = {"__name__": "__main__", "__builtins__": builtins, "display": display}
    old = (sys.stdout, sys.stderr, builtins.input)
    sys.stdout, sys.stderr, builtins.input = _Out("o"), _Out("e"), _input
    if seed is not None:
        import random
        random.seed(seed)
        np = sys.modules.get("numpy")
        if np is not None:
            np.random.seed(int(seed) % (2 ** 32))
    try:
        tree = ast.parse(code, _FN, "exec")
        last = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last = ast.Expression(tree.body.pop().value)
        exec(compile(tree, _FN, "exec"), ns)
        if last is not None:
            value = eval(compile(last, _FN, "eval"), ns)
            if value is not None:
                _display(value)
        _flush_figs()
    except _NeedInput:
        res = {"status": "input", "prompt": _st["prompt"]}
    except SystemExit:
        pass
    except BaseException as e:
        _st["need"] = False
        res = {"status": "error"}
        res.update(_explain(e))
        try:
            _flush_figs()
        except BaseException:
            pass
    finally:
        _st["need"] = False
        sys.stdout, sys.stderr, builtins.input = old
        plt = sys.modules.get("matplotlib.pyplot")
        if plt is not None:
            try:
                plt.close("all")
            except BaseException:
                pass
    res["files"] = _files()
    return json.dumps(res)

# ---- code judge: run the code, then evaluate each test expression ----
def _same(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return math.isclose(a, b, rel_tol=1e-6, abs_tol=1e-9)
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(_same(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_same(a[k], b[k]) for k in a)
    return a == b

def judge(code, tests_json):
    tests = json.loads(tests_json)
    res = {"error": None, "line": None, "stdout": "", "tests": []}
    ns = {"__name__": "__main__"}
    linecache.cache[_FN] = (len(code), None, code.splitlines(True), _FN)
    buf = io.StringIO()
    old = (sys.stdout, builtins.input)
    sys.stdout = buf
    def no_input(prompt=""):
        raise EOFError("input() is not used in the judge: the tests call your function directly")
    builtins.input = no_input
    try:
        try:
            exec(compile(code, _FN, "exec"), ns)
        except BaseException as e:
            info = _explain(e)
            res["error"] = info["trace"]
            res["line"] = info["line"]
            res["hint"] = info["hint"]
        if res["error"] is None:
            for expr, exp in tests:
                item = {"expr": expr, "expected": exp}
                try:
                    got = eval(expr, ns)
                    item["got"] = repr(got)
                    item["pass"] = bool(_same(got, eval(exp, {})))
                except BaseException as e:
                    item["got"] = type(e).__name__ + ": " + str(e)
                    item["pass"] = False
                res["tests"].append(item)
    finally:
        sys.stdout, builtins.input = old
    res["stdout"] = buf.getvalue()[-4000:]
    return json.dumps(res)
`;

/* ---------- Worker side ---------- */
const PY_WORKER_SRC=`
const BASE=${JSON.stringify(PYODIDE_URL)};
const HARNESS=${JSON.stringify(PY_HARNESS)};
const FILES=${JSON.stringify(PY_FILES)};
/* pure-Python extras that are not in the Pyodide bundle: installed from PyPI only when the code needs them */
const EXTRAS=[["seaborn",/\\bseaborn\\b/],["openpyxl",/read_excel|to_excel|openpyxl/],["tabulate",/\\btabulate\\b|to_markdown/]];
const LIMIT=200000;
importScripts(BASE+"pyodide.js");
let py=null,F={},cur=0,buf=[],pend=0,last=0,total=0,cut=false;
function flush(){if(buf.length){postMessage({t:"out",id:cur,items:buf});buf=[];pend=0}last=Date.now()}
function push(k,s){
  s=String(s);
  if(k==="o"||k==="e"||k==="r"){
    if(cut)return;
    total+=s.length;
    if(total>LIMIT){cut=true;buf.push({k:"x",s:""});flush();return}
  }
  const l=buf[buf.length-1];
  if(l&&l.k===k&&k!=="img"&&k!=="html")l.s+=s;else buf.push({k:k,s:s});
  pend+=s.length;
  if(k==="img"||k==="html"||pend>8192||Date.now()-last>80)flush();
}
const boot=(async()=>{
  py=await loadPyodide({indexURL:BASE});
  py.registerJsModule("_host",{emit:push,image:b=>push("img",b),html:h=>push("html",h)});
  for(const n in FILES)py.FS.writeFile(n,FILES[n]);
  py.runPython(HARNESS);
  for(const k of ["_run","judge","_prepare","_peek","_has"])F[k]=py.globals.get(k);
  postMessage({t:"ready"});
})();
boot.catch(e=>postMessage({t:"fatal",msg:String(e)}));
async function run(d){
  cur=d.id;buf=[];pend=0;total=0;cut=false;last=Date.now();
  const say=m=>postMessage({t:"status",id:d.id,msg:String(m)});
  try{
    await py.loadPackagesFromImports(d.code,{messageCallback:say,errorCallback:say});
    const more=[];
    if(/\\bpandas\\b/.test(d.code)&&/\\.(plot|hist|boxplot)\\b/.test(d.code))more.push("matplotlib");
    if(/https?:\\/\\//.test(d.code))more.push("pyodide-http");
    if(more.length)await py.loadPackage(more,{messageCallback:say,errorCallback:say});
    const want=EXTRAS.filter(x=>x[1].test(d.code)&&!F._has(x[0])).map(x=>x[0]);
    if(want.length){
      await py.loadPackage("micropip",{messageCallback:say,errorCallback:say});
      const mp=py.pyimport("micropip");
      for(const w of want){say("Loading "+w);try{await mp.install(w)}catch(e){say("Could not install "+w)}}
    }
    say("Starting");
    F._prepare(d.code);
  }catch(e){}
  postMessage({t:"begin",id:d.id});
  let res;const t0=performance.now();
  try{res=d.kind==="judge"?F.judge(d.code,JSON.stringify(d.tests)):F._run(d.code,JSON.stringify(d.stdin||[]),d.seed==null?undefined:d.seed)}
  catch(e){
    const m=String(e&&e.message||e);
    res=JSON.stringify(d.kind==="judge"?{error:m,stdout:"",tests:[]}:{status:"error",etype:"EngineError",line:null,trace:m,hint:"Python itself stopped (often very deep recursion or too much memory). Press Run again."});
  }
  const ms=performance.now()-t0;
  flush();
  postMessage({t:"done",id:d.id,res:String(res),ms:ms});
}
let chain=boot;
onmessage=e=>{const d=e.data;chain=chain.then(()=>{
  if(d.t==="run")return run(d);
  if(d.t==="file"){py.FS.writeFile(d.name,d.data);return}
  if(d.t==="peek"){postMessage({t:"peek",id:d.id,res:String(F._peek(d.name))})}
}).catch(()=>{})};
`;

/* ---------- Page side ---------- */
const PY={
  state:"idle",msg:"",worker:null,job:null,seq:0,statusEl:null,waiters:[],peeks:{},userFiles:new Map(),

  /* status line (one element at a time: the lab that is open) */
  watch(el){this.statusEl=el;this.paint()},
  set(state,msg){this.state=state;this.msg=msg||"";this.paint()},
  paint(){
    const el=this.statusEl;if(!el||!document.body.contains(el))return;
    const text={
      idle:this.msg||"Python engine: not loaded yet. It loads when you press Run.",
      loading:"Python engine: loading… (about 10 MB the first time, please wait)",
      ready:"Python engine: ready ✔",
      busy:this.msg||"Running…",
      error:"Python engine could not load. "+this.msg}[this.state];
    el.className="pystatus "+this.state;el.textContent=text;
  },

  kill(){if(this.worker){this.worker.terminate();this.worker=null}},
  settle(ok){this.waiters.splice(0).forEach(f=>f(ok))},
  start(){
    if(this.worker)return;
    this.set("loading");
    try{this.worker=new Worker(URL.createObjectURL(new Blob([PY_WORKER_SRC],{type:"text/javascript"})))}
    catch(e){this.set("error","Your browser blocked the background worker.");this.settle(false);return}
    const w=this.worker;
    w.onmessage=ev=>{
      if(w!==this.worker)return;
      const d=ev.data,j=this.job;
      if(d.t==="ready"){
        this.userFiles.forEach((data,name)=>w.postMessage({t:"file",name,data}));
        this.set("ready");this.settle(true);
      }else if(d.t==="fatal"){
        this.kill();this.set("error","Check your internet connection (the engine downloads once from a CDN).");this.settle(false);
      }else if(d.t==="peek"){
        const p=this.peeks[d.id];delete this.peeks[d.id];if(p)p(JSON.parse(d.res));
      }else if(j&&d.id===j.id){
        if(d.t==="status"){
          const m=/^Load(?:ing|ed)\s+(.*)/.exec(d.msg);
          if(m&&/^Loading/.test(d.msg))this.set("busy","Getting "+m[1].split(/,\s*/).slice(0,4).join(", ")+"… (first time only)");
          else if(d.msg==="Starting")this.set("busy","Starting your code…");
        }else if(d.t==="begin"){
          this.set("busy","Running…");
          j.timer=setTimeout(()=>this.stop("timeout"),j.limit);
        }else if(d.t==="out"){if(j.onOut)j.onOut(d.items)}
        else if(d.t==="done"){clearTimeout(j.timer);this.job=null;this.set("ready");const r=JSON.parse(d.res);r.ms=d.ms;j.resolve(r)}
      }
    };
    w.onerror=()=>{
      if(w!==this.worker)return;
      this.kill();this.set("error","The worker failed to start (are you offline?).");this.settle(false);
      const j=this.job;if(j&&j.reject){this.job=null;j.reject(new Error("engine"))}
    };
  },
  ready(){
    return new Promise(res=>{
      if(this.state==="ready"&&this.worker){res(true);return}
      this.waiters.push(res);this.start();
      setTimeout(()=>{const i=this.waiters.indexOf(res);if(i>=0){this.waiters.splice(i,1);this.kill();this.set("error","Loading took too long. Check your internet and press Run again.");res(false)}},300000);
    });
  },

  /* Run code. o = {kind:"exec"|"judge", code, tests, stdin, seed, limit, onOut}. Rejects with "timeout", "stopped", "engine" or "busy". */
  async exec(o){
    if(this.job)throw new Error("busy");
    const job={id:++this.seq,limit:o.limit||30000,onOut:o.onOut};this.job=job;
    try{
      const ok=await this.ready();
      if(job.dead)throw new Error(job.dead);
      if(!ok)throw new Error("engine");
      return await new Promise((resolve,reject)=>{
        job.resolve=resolve;job.reject=reject;
        this.worker.postMessage({t:"run",id:job.id,kind:o.kind||"exec",code:o.code,tests:o.tests||[],stdin:o.stdin||[],seed:o.seed==null?null:o.seed});
      });
    }finally{clearTimeout(job.timer);if(this.job===job)this.job=null}
  },
  /* Stop whatever is running. The worker is thrown away; the next Run starts a fresh one (from the browser cache). */
  stop(why){
    const j=this.job;this.job=null;
    this.kill();this.settle(false);
    this.set("idle","Python engine: stopped. It restarts when you press Run.");
    if(j){clearTimeout(j.timer);j.dead=why||"stopped";if(j.reject)j.reject(new Error(j.dead))}
  },

  /* files */
  addFile(name,data){this.userFiles.set(name,data);if(this.worker&&this.state!=="loading")this.worker.postMessage({t:"file",name,data})},
  peek(name){
    return new Promise(res=>{
      if(!this.worker||this.state!=="ready"){res(null);return}
      const id=++this.seq;this.peeks[id]=res;this.worker.postMessage({t:"peek",id,name});
    });
  }
};
