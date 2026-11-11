/* Code editor with VS Code "Dark+" colours, built for phones first.
   A real <textarea> does the typing (so the phone keyboard, selection, copy and paste all behave normally);
   a coloured copy of the same text sits underneath it.
   pyHighlight(code)       -> HTML with syntax colours (also used for the code blocks in the lessons)
   codeEditor(host, opts)  -> editor with line numbers, auto-indent, a symbol key row and a status bar */

/* ---------- Python syntax colours ---------- */
const pyHighlight=(()=>{
  const words=s=>new Set(s.split(" "));
  const CTRL=words("if elif else for while break continue return try except finally raise with as import from pass yield await assert del");
  const KW=words("def class lambda and or not in is global nonlocal async True False None");
  const FN=words("print len range input sum min max abs round sorted reversed enumerate zip map filter open isinstance issubclass any all id repr format iter next divmod pow hash callable getattr setattr hasattr dir vars help ord chr bin hex oct exit quit display");
  const TY=words("int float str bool list dict set tuple complex bytes bytearray frozenset object type super Exception BaseException ValueError TypeError KeyError IndexError NameError ZeroDivisionError AttributeError ImportError ModuleNotFoundError FileNotFoundError RuntimeError StopIteration AssertionError NotImplementedError OSError EOFError KeyboardInterrupt ArithmeticError LookupError OverflowError RecursionError IndentationError SyntaxError");
  const RE=/(#[^\n]*)|((?:[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\[\s\S]|[^"\\\n])*"?|'(?:\\[\s\S]|[^'\\\n])*'?))|(0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?[jJ]?)|([A-Za-z_\u0080-\uFFFF][\w\u0080-\uFFFF]*)|(\s+)|([()\[\]{}])|([^\s\w()\[\]{}#"']+|[\s\S])/y;
  const h=s=>s.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  const sp=(c,s)=>`<span class="t-${c}">${h(s)}</span>`;

  function str(tok,mods){
    const pre=/^[rRbBuUfF]{0,2}/.exec(tok)[0],body=tok.slice(pre.length),raw=/r/i.test(pre),f=/f/i.test(pre);
    let out=pre?sp("k",pre):"";
    if(raw&&!f)return out+sp("s",body);
    const re=f?/(\{\{|\}\})|\{([^{}\n]*)\}|(\\(?:[\\'"abfnrtv0]|x[\da-fA-F]{2}|u[\da-fA-F]{4}))/g:/(\x00)|(\x00)|(\\(?:[\\'"abfnrtv0]|x[\da-fA-F]{2}|u[\da-fA-F]{4}))/g;
    let i=0,m;
    while((m=re.exec(body))){
      if(m[3]&&raw)continue;
      if(m.index>i)out+=sp("s",body.slice(i,m.index));
      if(m[1])out+=sp("s",m[1]);
      else if(m[2]!==undefined)out+=sp("k","{")+run(m[2],mods)+sp("k","}");
      else out+=sp("e",m[3]);
      i=m.index+m[0].length;
    }
    if(i<body.length)out+=sp("s",body.slice(i));
    return out;
  }

  function run(src,mods){
    mods=mods||new Set();
    const re=new RegExp(RE.source,"y");   /* own copy: f-strings call run() again for the part inside { } */
    let out="",m,prev="",depth=0,imp=0,impDepth=0,lineStart=true,deco=false;
    while(re.lastIndex<src.length&&(m=re.exec(src))){
      const tok=m[0];
      if(m[5]){ /* whitespace */
        out+=tok;
        if(tok.includes("\n")){lineStart=true;deco=false;if(imp&&depth<=impDepth)imp=0}
        continue;
      }
      if(m[1])out+=sp("c",tok);
      else if(m[2])out+=str(tok,mods);
      else if(m[3])out+=sp("n",tok);
      else if(m[4]){
        const next=/^[ \t]*(.)/.exec(src.slice(re.lastIndex,re.lastIndex+40)),call=!!next&&next[1]==="(";
        let c;
        if(deco)c="f";
        else if(prev==="."&&!imp)c=call?(/^[A-Z]/.test(tok)?"t":"f"):"v";
        else if(CTRL.has(tok)){
          c="x";
          if(tok==="import"){imp=imp===1?2:3;impDepth=depth}
          else if(tok==="from"&&lineStart){imp=1;impDepth=depth}
        }
        else if(KW.has(tok))c="k";
        else if(prev==="def")c="f";
        else if(prev==="class")c="t";
        else if(imp===1||imp===3){c="t";mods.add(tok)}                 /* import numpy as np  /  from pandas ... */
        else if(imp===2){c=/^[A-Z]/.test(tok)?"t":"v"}                  /* from x import name */
        else if(tok==="self"||tok==="cls")c="p";
        else if(mods.has(tok))c="t";
        else if(TY.has(tok))c="t";
        else if(FN.has(tok)&&call)c="f";
        else if(/^[A-Z][A-Z0-9_]+$/.test(tok))c="C";
        else if(/^[A-Z]/.test(tok)&&/[a-z]/.test(tok))c="t";
        else c=call?"f":"v";
        out+=sp(c,tok);
      }
      else if(m[6]){
        if("([{".includes(tok))out+=sp("b"+(depth++%3),tok);
        else{depth=Math.max(0,depth-1);out+=sp("b"+(depth%3),tok)}
      }
      else{
        if(tok==="@"&&lineStart){deco=true;out+=sp("f",tok)}
        else out+=sp("o",tok);
      }
      prev=tok;lineStart=false;
    }
    return out;
  }
  return src=>run(String(src));
})();

/* ---------- editor ---------- */
const CE_KEYS=[["⇥","tab","Indent"],["⇤","untab","Remove indent"],[":"],["("],[")"],["["],["]"],["="],['"'],["'"],["_"],["."],[","],["#"],["{"],["}"],["+"],["-"],["*"],["/"],["<"],[">"],["%"],["!"],["\\"]];
const CE_HAS_BEFOREINPUT=typeof InputEvent!=="undefined"&&typeof InputEvent.prototype.getTargetRanges==="function";
let ceMeasure=null;

function codeEditor(host,opts){
  opts=opts||{};
  const esc2=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let fs=store.get("ds-ce-fs",/iP(hone|ad|od)/.test(navigator.userAgent)?16:14);
  if(!(fs>=11&&fs<=24))fs=14;
  host.innerHTML=`<div class="ce" style="--ce-fs:${fs}px">
    <div class="ce-bar">
      <span class="ce-tab"><i aria-hidden="true">py</i>${esc2(opts.filename||"main.py")}</span>
      <span class="ce-sp"></span>
      <button type="button" class="ce-btn" data-a="undo" aria-label="Undo" title="Undo">↶</button>
      <button type="button" class="ce-btn" data-a="redo" aria-label="Redo" title="Redo">↷</button>
      <button type="button" class="ce-btn" data-a="minus" aria-label="Smaller text" title="Smaller text">A−</button>
      <button type="button" class="ce-btn" data-a="plus" aria-label="Larger text" title="Larger text">A+</button>
      <button type="button" class="ce-btn" data-a="copy" aria-label="Copy the code" title="Copy the code">⧉</button>
      ${opts.onRun?`<button type="button" class="ce-btn ce-run" data-a="run" aria-label="Run the code" title="Run (Ctrl + Enter)">▶ Run</button>`:""}
    </div>
    <div class="ce-scroll"><div class="ce-in">
      <div class="ce-gut" aria-hidden="true"></div>
      <div class="ce-area"><div class="ce-cur"></div><pre class="ce-hl" aria-hidden="true"></pre>
        <textarea class="ce-ta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${esc2(opts.label||"Python code editor")}"${opts.id?` id="${esc2(opts.id)}"`:""}></textarea>
      </div>
    </div></div>
    <div class="ce-keys" role="toolbar" aria-label="Insert a symbol">${CE_KEYS.map(([t,a,l])=>`<button type="button" data-k="${esc2(a||t)}" aria-label="${esc2(l||t)}">${esc2(t)}</button>`).join("")}</div>
    <div class="ce-foot"><span class="ce-pos">Ln 1, Col 1</span><span class="ce-sp"></span><span>Spaces: 4</span><span>UTF-8</span><span>Python</span></div>
  </div>`;
  const root=$(".ce",host),ta=$(".ce-ta",host),hl=$(".ce-hl",host),gut=$(".ce-gut",host),sc=$(".ce-scroll",host),cur=$(".ce-cur",host),pos=$(".ce-pos",host);
  let lines=0,onLine=-1,errLine=0,lh=fs*1.5,escArmed=false,busy=false;
  const PAD_T=10,PAD_L=12;

  /* ---- drawing ---- */
  function caret(){
    const p=ta.selectionStart,v=ta.value,ls=v.lastIndexOf("\n",p-1)+1;
    let ln=0;for(let i=v.indexOf("\n");i>=0&&i<p;i=v.indexOf("\n",i+1))ln++;
    return{p,ln,col:p-ls,ls};
  }
  function mark(){
    const c=caret();
    cur.style.transform=`translateY(${c.ln*lh}px)`;
    if(onLine!==c.ln){
      if(gut.children[onLine])gut.children[onLine].classList.remove("on");
      if(gut.children[c.ln])gut.children[c.ln].classList.add("on");
      onLine=c.ln;
    }
    pos.textContent=`Ln ${c.ln+1}, Col ${c.col+1}`;
  }
  function render(){
    const v=ta.value;
    hl.innerHTML=pyHighlight(v)+"\n";
    let n=1;for(let i=v.indexOf("\n");i>=0;i=v.indexOf("\n",i+1))n++;
    if(n!==lines){
      lines=n;onLine=-1;
      let s="";for(let i=1;i<=n;i++)s+=`<div${i===errLine?' class="err"':""}>${i}</div>`;
      gut.innerHTML=s;
    }
    ta.scrollTop=0;ta.scrollLeft=0;
    mark();
  }
  function textWidth(s){
    if(!ceMeasure)ceMeasure=document.createElement("canvas").getContext("2d");
    ceMeasure.font=`${fs}px ${getComputedStyle(ta).fontFamily}`;
    return ceMeasure.measureText(s).width;
  }
  /* keep the caret inside the visible part of the editor */
  function reveal(){
    const c=caret(),top=PAD_T+c.ln*lh,bottom=top+lh;
    if(top<sc.scrollTop+2)sc.scrollTop=Math.max(0,top-lh);
    else if(bottom>sc.scrollTop+sc.clientHeight-2)sc.scrollTop=bottom-sc.clientHeight+lh;
    const gw=gut.offsetWidth,room=sc.clientWidth-gw,x=PAD_L+textWidth(ta.value.slice(c.ls,c.p));
    if(x<sc.scrollLeft+8)sc.scrollLeft=Math.max(0,x-40);
    else if(x>sc.scrollLeft+room-16)sc.scrollLeft=x-room+40;
  }
  function setFont(n){
    fs=Math.max(11,Math.min(24,n));lh=fs*1.5;store.set("ds-ce-fs",fs);
    root.style.setProperty("--ce-fs",fs+"px");mark();
  }
  function clearErr(){
    if(!errLine)return;
    if(gut.children[errLine-1])gut.children[errLine-1].classList.remove("err");
    errLine=0;root.style.removeProperty("--ce-err");root.classList.remove("has-err");
  }

  /* ---- editing helpers (go through the browser's own undo history) ---- */
  function replace(from,to,text,selA,selB){
    busy=true;
    try{
      ta.focus();ta.setSelectionRange(from,to);
      let ok=false;
      if(text!==""||from!==to){
        try{ok=document.execCommand(text===""?"delete":"insertText",false,text)}catch(e){}
        if(!ok){ta.setRangeText(text,from,to,"end");ta.dispatchEvent(new Event("input",{bubbles:true}))}
      }
      if(selA!=null)ta.setSelectionRange(selA,selB==null?selA:selB);
    }finally{busy=false}
    mark();reveal();
  }
  const insert=text=>replace(ta.selectionStart,ta.selectionEnd,text);
  function newline(){
    const s=ta.selectionStart,e=ta.selectionEnd,v=ta.value,ls=v.lastIndexOf("\n",s-1)+1,before=v.slice(ls,s);
    let ind=/^[ \t]*/.exec(before)[0].replace(/\t/g,"    ");
    const code=before.replace(/#[^'"]*$/,"").trimEnd();
    if(/[:(\[{]$/.test(code))ind+="    ";
    else if(/^\s*(return|pass|break|continue|raise)\b/.test(before)&&ind.length>=4)ind=ind.slice(4);
    replace(s,e,"\n"+ind);
  }
  const balanced=(line,a,b)=>a===b?line.split(a).length%2===1:line.split(a).length===line.split(b).length;
  const lineOf=p=>{const v=ta.value,ls=v.lastIndexOf("\n",p-1)+1;let le=v.indexOf("\n",p);if(le<0)le=v.length;return v.slice(ls,le)};
  function smartBackspace(){
    const s=ta.selectionStart;if(s!==ta.selectionEnd||!s)return false;
    const v=ta.value,ls=v.lastIndexOf("\n",s-1)+1,before=v.slice(ls,s);
    if(before.length>1&&/^ +$/.test(before)){const k=(before.length-1)%4+1;if(k>1){replace(s-k,s,"");return true}}
    const pair=v.slice(s-1,s+1);
    if(["()","[]","{}","''",'""'].includes(pair)&&balanced(lineOf(s),pair[0],pair[1])){replace(s-1,s+1,"");return true}
    return false;
  }
  function block(){
    const s=ta.selectionStart,e=ta.selectionEnd,v=ta.value,ls=v.lastIndexOf("\n",s-1)+1;
    let le=v.indexOf("\n",e>s&&v[e-1]==="\n"?e-1:e);if(le<0)le=v.length;
    return{s,e,ls,le,rows:v.slice(ls,le).split("\n")};
  }
  function indent(out){
    const b=block();
    if(b.s===b.e&&!out){insert(" ".repeat(4-(b.s-b.ls)%4));return}
    let dFirst=0,dAll=0;
    const rows=b.rows.map((l,i)=>{
      if(out){const n=(/^(?: {1,4}|\t)/.exec(l)||[""])[0].length;if(!i)dFirst=-Math.min(n,b.s-b.ls);dAll-=n;return l.slice(n)}
      if(!l.trim()&&b.rows.length>1)return l;
      if(!i)dFirst=4;dAll+=4;return"    "+l;
    });
    replace(b.ls,b.le,rows.join("\n"),Math.max(b.ls,b.s+dFirst),Math.max(b.ls,b.e+dAll));
  }
  function toggleComment(){
    const b=block(),real=b.rows.filter(l=>l.trim());
    if(!real.length)return;
    const off=real.every(l=>/^\s*#/.test(l)),min=Math.min(...real.map(l=>/^ */.exec(l)[0].length));
    const rows=b.rows.map(l=>!l.trim()?l:off?l.replace(/^(\s*)# ?/,"$1"):l.slice(0,min)+"# "+l.slice(min));
    const text=rows.join("\n");
    replace(b.ls,b.le,text,b.ls,b.ls+text.length);
  }
  const OPEN={"(":")","[":"]","{":"}",'"':'"',"'":"'"},CLOSE=new Set([")","]","}"]);

  /* ---- events ---- */
  ta.addEventListener("input",ev=>{
    clearErr();render();
    if(!busy){
      /* phones that do not let us cancel Enter: add the indentation afterwards */
      if(ev.inputType==="insertLineBreak"&&!ev.__done){
        const p=ta.selectionStart,v=ta.value;
        if(v[p-1]==="\n"&&p===ta.selectionEnd){
          const pls=v.lastIndexOf("\n",p-2)+1,prevLine=v.slice(pls,p-1);
          let ind=/^ */.exec(prevLine)[0];
          if(/[:(\[{]$/.test(prevLine.replace(/#[^'"]*$/,"").trimEnd()))ind+="    ";
          if(ind&&!/^ /.test(v.slice(p,p+1)))replace(p,p,ind);
        }
      }
      /* iPhone "smart punctuation" turns quotes into curly ones, which Python rejects */
      if(ev.data&&/[\u2018\u2019\u201C\u201D]/.test(ev.data)){
        const p=ta.selectionStart,from=p-ev.data.length;
        if(from>=0&&ta.value.slice(from,p)===ev.data)replace(from,p,ev.data.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"'));
      }
      reveal();
    }
    if(opts.onChange)opts.onChange(ta.value);
  });
  ta.addEventListener("beforeinput",ev=>{
    if(busy||!ev.cancelable||ev.isComposing)return;
    const t=ev.inputType;
    if(t==="insertLineBreak"||t==="insertParagraph"){ev.preventDefault();newline()}
    else if(t==="deleteContentBackward"){if(smartBackspace())ev.preventDefault()}
  });
  ta.addEventListener("paste",ev=>{
    const d=ev.clipboardData&&ev.clipboardData.getData("text/plain");
    if(d==null||d==="")return;
    ev.preventDefault();
    insert(d.replace(/\r\n?/g,"\n").replace(/\t/g,"    ").replace(/\u00A0/g," "));
  });
  ta.addEventListener("keydown",ev=>{
    const k=ev.key,mod=ev.ctrlKey||ev.metaKey;
    if(ev.isComposing||ev.keyCode===229){escArmed=false;return}
    if(k==="Enter"&&mod){ev.preventDefault();if(opts.onRun)opts.onRun();return}
    if(k==="/"&&mod){ev.preventDefault();toggleComment();return}
    if(k==="Tab"&&!mod&&!ev.altKey){if(escArmed){escArmed=false;return}ev.preventDefault();indent(ev.shiftKey);return}
    escArmed=k==="Escape";
    if(mod||ev.altKey)return;
    if(!CE_HAS_BEFOREINPUT){
      if(k==="Enter"){ev.preventDefault();newline();return}
      if(k==="Backspace"&&smartBackspace()){ev.preventDefault();return}
    }
    const s=ta.selectionStart,e=ta.selectionEnd,v=ta.value,next=v[s]||"";
    if(OPEN[k]){
      if(s!==e){ev.preventDefault();replace(s,e,k+v.slice(s,e)+OPEN[k],s+1,e+1);return}
      const quote=k==='"'||k==="'";
      if(quote&&next===k&&balanced(lineOf(s),k,k)){ev.preventDefault();ta.setSelectionRange(s+1,s+1);mark();return}
      if(!/^[\s)\]},:]?$/.test(next))return;
      if(quote&&/[\w'"\\]/.test(v[s-1]||""))return;
      ev.preventDefault();replace(s,e,k+OPEN[k],s+1);return;
    }
    if(CLOSE.has(k)&&s===e&&next===k){
      const o=k===")"?"(":k==="]"?"[":"{";
      if(balanced(lineOf(s),o,k)){ev.preventDefault();ta.setSelectionRange(s+1,s+1);mark()}
    }
  });
  ta.addEventListener("keyup",ev=>{if(/^(Arrow|Home|End|Page)/.test(ev.key)){mark();reveal()}});
  ["click","focus","select"].forEach(t=>ta.addEventListener(t,mark));
  ta.addEventListener("focus",()=>root.classList.add("focus"));
  ta.addEventListener("blur",()=>root.classList.remove("focus"));
  ta.addEventListener("scroll",()=>{ta.scrollTop=0;ta.scrollLeft=0});
  ta.__ce={mark};

  /* buttons must not take the focus away from the code (that would close the phone keyboard) */
  const hold=el=>el.addEventListener("pointerdown",ev=>{if(ev.target.closest("button"))ev.preventDefault()});
  hold($(".ce-keys",host));hold($(".ce-bar",host));
  $(".ce-keys",host).addEventListener("click",ev=>{
    const b=ev.target.closest("button");if(!b)return;
    const k=b.dataset.k;
    if(k==="tab")indent(false);else if(k==="untab")indent(true);else insert(k);
  });
  $(".ce-bar",host).addEventListener("click",ev=>{
    const b=ev.target.closest("button");if(!b)return;
    const a=b.dataset.a;
    if(a==="run"){if(opts.onRun)opts.onRun()}
    else if(a==="plus")setFont(fs+1);
    else if(a==="minus")setFont(fs-1);
    else if(a==="undo"||a==="redo"){ta.focus();try{document.execCommand(a)}catch(e){}}
    else if(a==="copy"){
      const done=()=>{b.textContent="✓";setTimeout(()=>{b.textContent="⧉"},1200)};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(done,()=>{});
      else{ta.focus();ta.select();try{document.execCommand("copy");done()}catch(e){}}
    }
  });

  const api={
    el:root,ta,
    get value(){return ta.value},
    set value(v){ta.value=String(v).replace(/\r\n?/g,"\n");clearErr();lines=0;render();sc.scrollTop=0;sc.scrollLeft=0},
    focus(){ta.focus()},
    /* show where Python stopped: red line number and a red band */
    markError(n){
      clearErr();
      if(!(n>=1&&n<=lines))return;
      errLine=n;gut.children[n-1].classList.add("err");
      root.style.setProperty("--ce-err",(n-1)*lh+"px");root.classList.add("has-err");
      const top=PAD_T+(n-1)*lh;
      if(top<sc.scrollTop||top+lh>sc.scrollTop+sc.clientHeight)sc.scrollTop=Math.max(0,top-sc.clientHeight/2);
    },
    clearError:clearErr,
    gotoLine(n){
      const v=ta.value;let p=0;for(let i=1;i<n;i++){const j=v.indexOf("\n",p);if(j<0)break;p=j+1}
      let e=v.indexOf("\n",p);if(e<0)e=v.length;
      ta.focus();ta.setSelectionRange(e,e);mark();reveal();
    }
  };
  api.value=opts.value||"";
  return api;
}
document.addEventListener("selectionchange",()=>{const a=document.activeElement;if(a&&a.__ce)a.__ce.mark()});

/* ---------- colour the Python blocks in the lessons, scenarios and quiz ---------- */
function pyPaintBlocks(root){
  $$("pre.code.py:not(.painted)",root||document).forEach(el=>{
    if(el.children.length)return;
    el.classList.add("painted");el.innerHTML=pyHighlight(el.textContent);
  });
}
