/* Interactive labs (calculators, simulators and graphs). The Python code judge lives in judge.js. */
const rngSeed=seed=>{let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const gauss=r=>{let u=0,v=0;while(!u)u=r();v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const sum=a=>a.reduce((x,y)=>x+y,0);
const mean=a=>sum(a)/a.length;
const quantile=(s,p)=>{const i=(s.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return s[lo]+(s[hi]-s[lo])*(i-lo)};
const numOr=(el,d)=>{const v=parseFloat(el.value);return isFinite(v)?v:d};
const pct=v=>isFinite(v)?nf(v*100,1)+"%":"undefined";
const dv=(a,b)=>b===0?NaN:a/b;

/* ---------- lab registry ---------- */
const LABS=[
 ["lifecycle","🔁","Lifecycle builder",labLifecycle],
 ["confusion","🎯","Confusion matrix",labConfusion],
 ["stats","📊","Descriptive stats",labStats],
 ["corr","📈","Correlation",labCorr],
 ["normal","🔔","Normal curve",labNormal],
 ["hyp","⚖️","Hypothesis test",labHyp],
 ["fit","📉","Over / underfitting",labFit],
 ["clean","🧹","Data cleaning",labClean],
 ["judge","🐍","Python code judge",b=>labJudge(b)]]; /* judge.js loads later, so look it up lazily */
function labsShow(){
  const cur=store.get("ds-lab","lifecycle");
  const id=LABS.some(l=>l[0]===cur)?cur:"lifecycle";
  $("#labTabs").innerHTML=LABS.map(([k,ic,t])=>`<button class="chip ${k===id?"on":""}" data-lab="${k}" aria-pressed="${k===id}">${ic} ${t}</button>`).join("");
  $$("#labTabs .chip").forEach(b=>b.onclick=()=>{store.set("ds-lab",b.dataset.lab);labsShow()});
  const lab=LABS.find(l=>l[0]===id);
  lab[3]($("#labBox"));
}

/* ====================== 1. Lifecycle builder ====================== */
const LIFE=[["Problem definition","Understand what must be solved; target and success criteria."],["Data acquisition","Collect data from databases, APIs, files, surveys, sensors."],["Data understanding / exploration","Inspect structure, variables, distributions and problems."],["Data cleaning / preparation","Fix missing, duplicate, incorrect and inconsistent data."],["Exploratory Data Analysis (EDA)","Use statistics and charts to find patterns."],["Feature engineering / selection","Create useful features and choose relevant variables."],["Model building","Train machine-learning or statistical models."],["Model evaluation","Test on unseen data with suitable metrics."],["Deployment","Put the model into real use."],["Monitoring and maintenance","Track performance, drift and retraining needs."]];
function labLifecycle(box){
  let pool=shuffle(LIFE.map((_,i)=>i)),seq=[],checked=false;
  const draw=()=>{
    box.innerHTML=`<div class="card"><h3>Build the Data Science lifecycle</h3><p>Tap the stages in the correct order. Tap a placed stage to take it back.</p>
    <div class="lc-cols"><div><b>Stages (shuffled)</b><div class="lc-pool">${pool.map(i=>`<button class="opt" data-add="${i}"><b>${LIFE[i][0]}</b><br><small>${LIFE[i][1]}</small></button>`).join("")||"<p class='muted'>All stages placed.</p>"}</div></div>
    <div><b>Your order</b><ol class="lc-seq">${seq.map((i,k)=>`<li><button class="opt ${checked?(i===k?"right":"wrong"):""}" data-rem="${k}">${checked?(i===k?"✔ ":"✘ "):""}${LIFE[i][0]}</button></li>`).join("")}</ol></div></div>
    <div class="btnrow"><button class="b" id="lcCheck" ${seq.length===LIFE.length?"":"disabled"}>Check order</button><button class="b alt" id="lcShow">Show correct order</button><button class="b alt" id="lcReset">Shuffle again</button></div>
    <div id="lcOut" role="status"></div></div>`;
    $$("[data-add]",box).forEach(b=>b.onclick=()=>{if(checked)return;const i=+b.dataset.add;pool=pool.filter(x=>x!==i);seq.push(i);draw()});
    $$("[data-rem]",box).forEach(b=>b.onclick=()=>{if(checked)return;const k=+b.dataset.rem;pool.push(seq[k]);seq.splice(k,1);draw()});
    $("#lcCheck").onclick=()=>{checked=true;draw();const ok=seq.filter((i,k)=>i===k).length;$("#lcOut").innerHTML=`<div class="out"><span class="score">${ok} / ${LIFE.length}</span> in the right place. ${ok===LIFE.length?'<span class="good">Perfect order!</span>':"Tap ‘Show correct order’ to see the sequence."}</div>`};
    $("#lcShow").onclick=()=>{checked=true;seq=LIFE.map((_,i)=>i);pool=[];draw();$("#lcOut").innerHTML=`<div class="out">Exam focus: Understand → Acquire → Explore → Clean → Analyse → Engineer → Model → Evaluate → Deploy → Monitor.</div>`};
    $("#lcReset").onclick=()=>{pool=shuffle(LIFE.map((_,i)=>i));seq=[];checked=false;draw()};
  };
  draw();
}

/* ====================== 2. Confusion matrix ====================== */
const CM_PRESETS={"Bank fraud example":[40,45,5,10],"Always says ‘no fraud’ (imbalanced)":[0,990,0,10],"Spam filter":[90,870,30,10],"Disease screening":[45,130,10,15]};
function labConfusion(box){
  box.innerHTML=`<div class="card"><h3>Confusion matrix and classification metrics</h3>
   <p>Change the four counts. Everything below updates. <b>Positive</b> = the class you are looking for (e.g. fraud).</p>
   <div class="chips" id="cmPre">${Object.keys(CM_PRESETS).map(k=>`<button class="chip" data-p="${esc(k)}">${esc(k)}</button>`).join("")}</div>
   <div class="row"><div><label for="cmTP">TP (true positive)</label><input type="number" id="cmTP" min="0" value="40"></div><div><label for="cmTN">TN (true negative)</label><input type="number" id="cmTN" min="0" value="45"></div>
   <div><label for="cmFP">FP (false positive)</label><input type="number" id="cmFP" min="0" value="5"></div><div><label for="cmFN">FN (false negative)</label><input type="number" id="cmFN" min="0" value="10"></div></div>
   <div id="cmOut"></div></div>`;
  const get=()=>["cmTP","cmTN","cmFP","cmFN"].map(id=>Math.max(0,Math.round(numOr($("#"+id),0))));
  const upd=()=>{
    const [tp,tn,fp,fn]=get(),tot=tp+tn+fp+fn;
    const acc=dv(tp+tn,tot),pre=dv(tp,tp+fp),rec=dv(tp,tp+fn),spe=dv(tn,tn+fp),f1=(isFinite(pre)&&isFinite(rec)&&pre+rec>0)?2*pre*rec/(pre+rec):NaN;
    const row=(n,fm,sub,v)=>`<tr><td><b>${n}</b></td><td>${fm}</td><td class="code">${sub}</td><td><b>${pct(v)}</b></td></tr>`;
    let tip="";
    if(isFinite(acc)&&acc>=0.9&&isFinite(rec)&&rec<0.5)tip=`<div class="warn"><b>Accuracy paradox:</b> accuracy is ${pct(acc)} but recall is only ${pct(rec)}. The model misses most real positives. Never judge imbalanced data by accuracy alone.</div>`;
    else if(tot&&!isFinite(pre))tip=`<div class="warn">Precision is undefined because the model never predicted ‘positive’ (TP + FP = 0).</div>`;
    else if(tot)tip=`<div class="key">${fp>fn?"More false alarms (FP) than misses (FN): precision suffers.":fn>fp?"More misses (FN) than false alarms (FP): recall suffers.":"FP and FN are equal."}</div>`;
    $("#cmOut").innerHTML=`<div class="lab-grid"><div>${chartConfusion(tp,tn,fp,fn)}<p class="muted">Total = ${tot}</p></div>
     <div>${chartBars([{label:"Accuracy",value:isFinite(acc)?acc:0},{label:"Precision",value:isFinite(pre)?pre:0,color:COL.warn},{label:"Recall",value:isFinite(rec)?rec:0,color:COL.ok},{label:"F1",value:isFinite(f1)?f1:0,color:COL.purple}],{max:1,fmt:v=>nf(v*100,1)+"%",yfmt:v=>Math.round(v*100)+"%",h:230})}</div></div>
     <div class="scroll"><table><tr><th>Metric</th><th>Formula</th><th>With your numbers</th><th>Value</th></tr>
      ${row("Accuracy","(TP + TN) / Total",`(${tp}+${tn}) / ${tot}`,acc)}${row("Precision","TP / (TP + FP)",`${tp} / (${tp}+${fp})`,pre)}${row("Recall (sensitivity)","TP / (TP + FN)",`${tp} / (${tp}+${fn})`,rec)}
      ${row("Specificity","TN / (TN + FP)",`${tn} / (${tn}+${fp})`,spe)}${row("F1 score","2·P·R / (P + R)",isFinite(pre)&&isFinite(rec)?`2·${nf(pre,3)}·${nf(rec,3)} / (${nf(pre,3)}+${nf(rec,3)})`:"—",f1)}</table></div>${tip}`;
  };
  $$("#cmTP,#cmTN,#cmFP,#cmFN",box).forEach(e=>e.oninput=upd);
  $$("#cmPre .chip",box).forEach(c=>c.onclick=()=>{const v=CM_PRESETS[c.dataset.p];["cmTP","cmTN","cmFP","cmFN"].forEach((id,i)=>$("#"+id).value=v[i]);upd()});
  upd();
}

/* ====================== 3. Descriptive statistics ====================== */
function labStats(box){
  box.innerHTML=`<div class="card"><h3>Descriptive statistics and charts</h3>
   <p>Type numbers separated by commas or spaces. Try adding an outlier and watch the <b>mean</b> move while the <b>median</b> stays put.</p>
   <label for="stIn">Your data</label><textarea id="stIn" rows="3">55, 62, 62, 70, 74, 78, 81, 85, 90, 98</textarea>
   <div class="btnrow"><button class="b alt" id="stOut1">Add outlier (500)</button><button class="b alt" id="stEx1">Example: salaries</button><button class="b alt" id="stEx2">Example: quiz scores</button></div>
   <div id="stOut"></div></div>`;
  const upd=()=>{
    const v=$("#stIn").value.split(/[\s,;]+/).map(parseFloat).filter(x=>isFinite(x));
    if(v.length<2){$("#stOut").innerHTML=`<div class="warn">Enter at least two numbers.</div>`;return}
    const s=v.slice().sort((a,b)=>a-b),n=v.length,m=mean(v);
    const med=quantile(s,.5),q1=quantile(s,.25),q3=quantile(s,.75),iqr=q3-q1;
    const cnt={};v.forEach(x=>cnt[x]=(cnt[x]||0)+1);const mx=Math.max(...Object.values(cnt));
    const modes=mx>1?Object.keys(cnt).filter(k=>cnt[k]===mx).map(Number).sort((a,b)=>a-b):[];
    const pv=sum(v.map(x=>(x-m)**2))/n,sv=n>1?sum(v.map(x=>(x-m)**2))/(n-1):NaN;
    const lo=q1-1.5*iqr,hi=q3+1.5*iqr,out=s.filter(x=>x<lo||x>hi);
    const inl=s.filter(x=>x>=lo&&x<=hi);
    $("#stOut").innerHTML=`<div class="scroll"><table>
     <tr><th>Measure</th><th>Value</th><th>Meaning</th></tr>
     <tr><td>Count</td><td>${n}</td><td>number of values</td></tr>
     <tr><td>Mean</td><td><b>${nf(m,3)}</b></td><td>sum / count = ${nf(sum(v),3)} / ${n}</td></tr>
     <tr><td>Median</td><td><b>${nf(med,3)}</b></td><td>middle value after sorting</td></tr>
     <tr><td>Mode</td><td><b>${modes.length?modes.join(", "):"none"}</b></td><td>most frequent value${modes.length?" (appears "+mx+"×)":" (all values are different)"}</td></tr>
     <tr><td>Min / Max</td><td>${nf(s[0],3)} / ${nf(s[n-1],3)}</td><td></td></tr>
     <tr><td>Range</td><td><b>${nf(s[n-1]-s[0],3)}</b></td><td>max − min</td></tr>
     <tr><td>Variance</td><td><b>${nf(pv,3)}</b></td><td>average squared deviation (population, divide by n)</td></tr>
     <tr><td>Std deviation</td><td><b>${nf(Math.sqrt(pv),3)}</b></td><td>√variance, typical distance from the mean</td></tr>
     <tr><td>Sample variance / SD</td><td>${nf(sv,3)} / ${nf(Math.sqrt(sv),3)}</td><td>divide by n − 1 (used when data is a sample)</td></tr>
     <tr><td>Q1 / Q3 / IQR</td><td>${nf(q1,3)} / ${nf(q3,3)} / ${nf(iqr,3)}</td><td>quartiles (linear interpolation)</td></tr>
     <tr><td>Outliers (1.5×IQR rule)</td><td>${out.length?"<b class='badc'>"+out.join(", ")+"</b>":"none"}</td><td>values outside [${nf(lo,2)}, ${nf(hi,2)}]</td></tr></table></div>
     ${out.length?`<div class="warn">Outlier found. The mean is <b>${nf(m,2)}</b> but the median is <b>${nf(med,2)}</b>. The mean is pulled toward extreme values; the median is robust. Investigate: is it an error or a real value?</div>`:`<div class="key">Mean and median are close, so the data has no strong extreme values.</div>`}
     ${chartHist(v,{mean:m,median:med,xlabel:"value"})}
     ${chartBox({min:inl.length?inl[0]:s[0],q1,med,q3,max:inl.length?inl[inl.length-1]:s[n-1],outliers:out})}`;
  };
  $("#stIn").oninput=upd;
  $("#stOut1").onclick=()=>{$("#stIn").value=$("#stIn").value.trim()+", 500";upd()};
  $("#stEx1").onclick=()=>{$("#stIn").value="30, 32, 35, 36, 38, 40, 400";upd()};
  $("#stEx2").onclick=()=>{$("#stIn").value="2, 4, 4, 4, 5, 5, 7, 9";upd()};
  upd();
}

/* ====================== 4. Correlation ====================== */
const CORR_SETS={
 "Study hours vs marks":{x:[1,2,3,4,5,6,7,8],y:[48,55,52,63,70,74,80,88],xl:"study hours",yl:"marks",note:"A strong positive correlation. More study goes with higher marks (and here a causal link is plausible, but correlation alone cannot prove it)."},
 "Ice cream vs drownings":{x:[10,14,18,25,30,38,45,52,60],y:[1,2,2,4,5,6,8,8,10],xl:"ice-cream sales",yl:"drownings",note:"Strong correlation, but NOT causation: hot weather increases both."},
 "Phone price vs battery life":{x:[100,200,300,400,500,600,700,800],y:[30,12,41,18,36,22,45,28],xl:"phone price ($)",yl:"battery life (h)",note:"Almost no relationship, r is close to 0."}};
function pearson(x,y){const mx=mean(x),my=mean(y);let a=0,b=0,c=0;for(let i=0;i<x.length;i++){a+=(x[i]-mx)*(y[i]-my);b+=(x[i]-mx)**2;c+=(y[i]-my)**2}return a/Math.sqrt(b*c)}
function labCorr(box){
  box.innerHTML=`<div class="card"><h3>Correlation: strength, direction and the causation trap</h3>
   <p>Correlation r runs from −1 (perfect negative) through 0 (none) to +1 (perfect positive). Formula: r = Cov(X, Y) / (sx · sy).</p>
   <div class="chips" id="coPre">${Object.keys(CORR_SETS).map(k=>`<button class="chip" data-p="${esc(k)}">${esc(k)}</button>`).join("")}<button class="chip on" data-p="__gen">Generate my own</button></div>
   <div id="coGen"><label for="coR">Target correlation: <b id="coRv">0.8</b></label><input type="range" id="coR" min="-1" max="1" step="0.05" value="0.8"><div class="btnrow"><button class="b alt" id="coNew">New random sample</button></div></div>
   <div id="coOut"></div></div>`;
  let seed=7,mode="__gen";
  const gen=r=>{const g=rngSeed(seed),x=[],y=[];for(let i=0;i<40;i++){const a=gauss(g),b=gauss(g);x.push(50+a*10);y.push(50+10*(r*a+Math.sqrt(Math.max(0,1-r*r))*b))}return{x,y,xl:"X",yl:"Y"}};
  const upd=()=>{
    const r0=numOr($("#coR"),0.8);$("#coRv").textContent=nf(r0,2);
    const d=mode==="__gen"?gen(r0):CORR_SETS[mode];
    $("#coGen").style.display=mode==="__gen"?"block":"none";
    const r=pearson(d.x,d.y);const a=Math.abs(r);
    const strength=a>=0.8?"very strong":a>=0.6?"strong":a>=0.4?"moderate":a>=0.2?"weak":"very weak / none";
    const dir=a<0.2?"":r>0?"positive (as X rises, Y tends to rise)":"negative (as X rises, Y tends to fall)";
    const mx=mean(d.x),my=mean(d.y);const slope=sum(d.x.map((v,i)=>(v-mx)*(d.y[i]-my)))/sum(d.x.map(v=>(v-mx)**2));
    $("#coOut").innerHTML=`<div class="out"><span class="score">r = ${nf(r,3)}</span><br>${strength} ${dir}</div>
     ${chartScatter(d.x.map((v,i)=>[v,d.y[i]]),{xlabel:d.xl,ylabel:d.yl,line:[slope,my-slope*mx],title:"Scatter plot with best-fit line"})}
     ${mode!=="__gen"?`<div class="key">${CORR_SETS[mode].note}</div>`:""}
     <div class="warn"><b>Correlation does not mean causation.</b> A third factor (a confounder) can drive both variables, like hot weather with ice cream and drowning.</div>`;
  };
  $("#coR").oninput=upd;$("#coNew").onclick=()=>{seed=Math.floor(Math.random()*1e6);upd()};
  $$("#coPre .chip",box).forEach(c=>c.onclick=()=>{mode=c.dataset.p;$$("#coPre .chip",box).forEach(x=>x.classList.toggle("on",x===c));upd()});
  upd();
}

/* ====================== 5. Normal curve ====================== */
function labNormal(box){
  box.innerHTML=`<div class="card"><h3>The normal distribution (bell curve)</h3>
   <p>About <b>68%</b> of data lies within 1 standard deviation of the mean, <b>95%</b> within 2 and <b>99.7%</b> within 3.</p>
   <div class="row"><div><label for="nMu">Mean μ: <b id="nMuv">60</b></label><input type="range" id="nMu" min="0" max="100" value="60"></div><div><label for="nSd">Std deviation σ: <b id="nSdv">10</b></label><input type="range" id="nSd" min="1" max="30" value="10"></div></div>
   <div class="chips" id="nK"><button class="chip on" data-k="1">±1σ</button><button class="chip" data-k="2">±2σ</button><button class="chip" data-k="3">±3σ</button></div>
   <div id="nChart"></div><div id="nInfo"></div>
   <h4>z-score and probability</h4>
   <div class="row"><div><label for="nX">A value x</label><input type="number" id="nX" value="80"></div><div><label for="nA">From a</label><input type="number" id="nA" value="50"></div><div><label for="nB">To b</label><input type="number" id="nB" value="70"></div></div>
   <div id="nCalc"></div></div>`;
  let k=1;
  const upd=()=>{
    const mu=numOr($("#nMu"),60),sd=numOr($("#nSd"),10);$("#nMuv").textContent=mu;$("#nSdv").textContent=sd;
    const x=numOr($("#nX"),mu),a=numOr($("#nA"),mu-sd),b=numOr($("#nB"),mu+sd);
    const within=erf(k/Math.SQRT2);
    $("#nChart").innerHTML=chartNormal({mu,sd,k,marker:x,xlabel:"value",dec:0,title:`μ = ${mu}, σ = ${sd}: shaded μ ± ${k}σ = [${nf(mu-k*sd,1)}, ${nf(mu+k*sd,1)}]`});
    $("#nInfo").innerHTML=`<div class="out">Within ±${k}σ: <b>${nf(within*100,2)}%</b> of values. Outside: ${nf((1-within)*100,2)}%.</div>`;
    const z=(x-mu)/sd,p=normCdf(z),pab=a<=b?normCdf((b-mu)/sd)-normCdf((a-mu)/sd):NaN;
    $("#nCalc").innerHTML=`<div class="scroll"><table><tr><th>Question</th><th>Working</th><th>Answer</th></tr>
      <tr><td>z-score of x = ${x}</td><td>(x − μ) / σ = (${x} − ${mu}) / ${sd}</td><td><b>${nf(z,2)}</b> (${Math.abs(z)<1e-9?"exactly at the mean":nf(Math.abs(z),2)+" SD "+(z>0?"above":"below")+" the mean"})</td></tr>
      <tr><td>P(X ≤ ${x})</td><td>Φ(${nf(z,2)})</td><td><b>${nf(p*100,2)}%</b></td></tr>
      <tr><td>P(${a} ≤ X ≤ ${b})</td><td>Φ(z<sub>b</sub>) − Φ(z<sub>a</sub>)</td><td><b>${isFinite(pab)?nf(pab*100,2)+"%":"a must be ≤ b"}</b></td></tr></table></div>
      <p class="muted">The orange line marks x. Probabilities use the normal CDF.</p>`;
  };
  $$("#nMu,#nSd,#nX,#nA,#nB",box).forEach(e=>e.oninput=upd);
  $$("#nK .chip",box).forEach(c=>c.onclick=()=>{k=+c.dataset.k;$$("#nK .chip",box).forEach(x=>x.classList.toggle("on",x===c));upd()});
  upd();
}

/* ====================== 6. Hypothesis test (one-sample z-test) ====================== */
function labHyp(box){
  box.innerHTML=`<div class="card"><h3>Hypothesis testing step by step</h3>
   <p>Example test: a <b>one-sample z-test</b> (population standard deviation known). Claim: the true average is μ₀.</p>
   <div class="row"><div><label for="hM0">Claimed mean μ₀</label><input type="number" id="hM0" value="30"></div><div><label for="hXb">Sample mean x̄</label><input type="number" id="hXb" value="32" step="0.1"></div>
   <div><label for="hSd">Known σ</label><input type="number" id="hSd" value="6" min="0.01" step="0.1"></div><div><label for="hN">Sample size n</label><input type="number" id="hN" value="36" min="2"></div></div>
   <div class="row"><div><label for="hA">Significance level α</label><select id="hA"><option>0.01</option><option selected>0.05</option><option>0.10</option></select></div>
   <div><label for="hT">Alternative H1</label><select id="hT"><option value="two">μ ≠ μ₀ (two-sided)</option><option value="gt">μ &gt; μ₀ (right-tailed)</option><option value="lt">μ &lt; μ₀ (left-tailed)</option></select></div></div>
   <div id="hOut"></div></div>`;
  const upd=()=>{
    const m0=numOr($("#hM0"),30),xb=numOr($("#hXb"),30),sd=Math.max(0.0001,numOr($("#hSd"),1)),n=Math.max(2,Math.round(numOr($("#hN"),2))),al=parseFloat($("#hA").value),t=$("#hT").value;
    const se=sd/Math.sqrt(n),z=(xb-m0)/se;
    const p=t==="two"?2*(1-normCdf(Math.abs(z))):t==="gt"?1-normCdf(z):normCdf(z);
    const rej=p<al;
    let tails=[];const zc=t==="two"?inv(1-al/2):inv(1-al);
    if(t==="two")tails=[[-4,-zc],[zc,4]];else if(t==="gt")tails=[[zc,4]];else tails=[[-4,-inv(1-al)]];
    const h1=t==="two"?"μ ≠ "+m0:t==="gt"?"μ > "+m0:"μ < "+m0;
    $("#hOut").innerHTML=`<ol class="steps">
      <li><b>Define H0:</b> μ = ${m0} (the claim: no difference)</li>
      <li><b>Define H1:</b> ${h1}</li>
      <li><b>Set α:</b> ${al}</li>
      <li><b>Run the test:</b> z = (x̄ − μ₀) / (σ/√n) = (${xb} − ${m0}) / (${nf(sd,2)}/√${n}) = <b>${nf(z,3)}</b></li>
      <li><b>p-value:</b> <b>${p<0.0001?"< 0.0001":nf(p,4)}</b> (probability of a result at least this extreme if H0 were true)</li>
      <li><b>Compare:</b> p ${rej?"<":"≥"} α (${nf(p,4)} ${rej?"<":"≥"} ${al})</li>
      <li><b>Decision:</b> ${rej?'<span class="badc">Reject H0</span>: the result is statistically significant at α = '+al:'<span class="good">Fail to reject H0</span>: not enough evidence against it'}</li></ol>
     ${chartNormal({mu:0,sd:1,tails,marker:Math.max(-3.9,Math.min(3.9,z)),xlabel:"z",dec:1,title:"Standard normal: red = rejection region, orange = your z"})}
     <div class="key">Careful wording: ‘fail to reject H0’ does not prove H0 true, and the p-value is <b>not</b> the probability that H0 is true.</div>`;
  };
  $$("#hM0,#hXb,#hSd,#hN,#hA,#hT",box).forEach(e=>{e.oninput=upd;e.onchange=upd});
  upd();
}
function inv(p){ /* inverse normal CDF by bisection */ let lo=-8,hi=8;for(let i=0;i<60;i++){const m=(lo+hi)/2;normCdf(m)<p?lo=m:hi=m}return(lo+hi)/2}

/* ====================== 7. Over / underfitting ====================== */
function polyFit(xs,ys,deg){
  const n=deg+1,A=Array.from({length:n},()=>new Array(n+1).fill(0));
  for(let k=0;k<xs.length;k++){const t=2*xs[k]-1;const pw=[1];for(let i=1;i<=2*deg;i++)pw.push(pw[i-1]*t);
    for(let i=0;i<n;i++){for(let j=0;j<n;j++)A[i][j]+=pw[i+j];A[i][n]+=ys[k]*pw[i]}}
  for(let i=0;i<n;i++)A[i][i]+=1e-8; /* tiny ridge keeps the maths numerically stable */
  for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];
    for(let r=c+1;r<n;r++){const f=A[r][c]/A[c][c];for(let j=c;j<=n;j++)A[r][j]-=f*A[c][j]}}
  const w=new Array(n).fill(0);
  for(let i=n-1;i>=0;i--){let s=A[i][n];for(let j=i+1;j<n;j++)s-=A[i][j]*w[j];w[i]=s/A[i][i]}
  return w;
}
const polyEval=(w,x)=>{const t=2*x-1;let s=0,p=1;for(let i=0;i<w.length;i++){s+=w[i]*p;p*=t}return s};
const mse=(w,xs,ys)=>mean(xs.map((x,i)=>(polyEval(w,x)-ys[i])**2));
function makeFitData(seed,nTrain){
  const g=rngSeed(seed),f=x=>Math.sin(2*Math.PI*x);
  const mkset=n=>{const xs=Array.from({length:n},(_,i)=>(i+0.15+0.7*g())/n);return{xs,ys:xs.map(x=>f(x)+0.25*gauss(g))}};
  return{train:mkset(nTrain),test:mkset(40),f};
}
function fitDiagnosis(tr,te){
  if(tr>0.15&&te>0.15)return["Underfitting","Both errors are high: the model is too simple to learn the pattern.","bad"];
  if(te>2*tr&&te>0.12)return["Overfitting","Training error is very low but test error is much higher: it memorised noise.","bad"];
  return["Good fit","Both errors are low and close: the model captured the real pattern.","good"];
}
function labFit(box){
  box.innerHTML=`<div class="card"><h3>See underfitting and overfitting happen</h3>
   <p>The dashed grey line is the <b>true pattern</b> (a sine wave). Dots are noisy measurements. Slide the model complexity (polynomial degree) and watch the training error and the test error.</p>
   <div class="row"><div><label for="fDeg">Model complexity (degree): <b id="fDegv">3</b></label><input type="range" id="fDeg" min="1" max="12" value="3"></div>
   <div><label for="fN">Training points</label><select id="fN"><option value="12">12 (small dataset)</option><option value="30">30</option><option value="100">100 (large dataset)</option></select></div></div>
   <div class="btnrow"><button class="b alt" id="fNew">New random data</button></div>
   <div id="fOut"></div></div>`;
  let seed=11;
  const upd=()=>{
    const deg=numOr($("#fDeg"),3),n=+$("#fN").value;$("#fDegv").textContent=deg;
    const d=makeFitData(seed,n);
    const w=polyFit(d.train.xs,d.train.ys,deg);
    const tr=mse(w,d.train.xs,d.train.ys),te=mse(w,d.test.xs,d.test.ys);
    const curve=[],truth=[];for(let i=0;i<=120;i++){const x=i/120;curve.push([x,Math.max(-2.2,Math.min(2.2,polyEval(w,x)))]);truth.push([x,d.f(x)])}
    const pts=d.train.xs.map((x,i)=>[x,d.train.ys[i],"train"]).concat(d.test.xs.map((x,i)=>[x,d.test.ys[i],"test"]));
    const errs=[];const trE=[],teE=[];
    for(let k=1;k<=12;k++){const wk=polyFit(d.train.xs,d.train.ys,k);trE.push([k,mse(wk,d.train.xs,d.train.ys)]);teE.push([k,Math.min(mse(wk,d.test.xs,d.test.ys),1.5)])}
    const [name,why,cls]=fitDiagnosis(tr,te);
    $("#fOut").innerHTML=`<div class="out"><b class="${cls==="good"?"good":"badc"}">${name}</b><br>${why}<br>Training error (MSE): <b>${nf(tr,3)}</b> · Test error (MSE): <b>${nf(te,3)}</b> · Gap: <b>${nf(te-tr,3)}</b></div>
     ${chartScatter(pts,{xmin:0,xmax:1,ymin:-2.2,ymax:2.2,curve,truth,groups:{train:COL.brand,test:COL.warn},xlabel:"x",ylabel:"y",title:`Degree ${deg} model on ${n} training points`,legend:[[COL.brand,"training data"],[COL.warn,"new (test) data"],["#d9822b","fitted model"],["#8a96a3","true pattern"]],r:4})}
     ${chartLines([{name:"Training error",color:COL.brand,pts:trE,dots:true},{name:"Test error",color:COL.warn,pts:teE,dots:true}],{xmin:1,xmax:12,ymin:0,ymax:1.5,xticks:11,marker:deg,xlabel:"model complexity (degree)",ylabel:"error (MSE)",title:"Error vs complexity (dashed line = your model)"})}
     <div class="key"><b>Notice:</b> training error keeps falling as complexity grows, but test error is U-shaped. The best model is where the <b>test</b> error is lowest. Try 12 training points at degree 12, then switch to 100 points: more data reduces overfitting. (Test errors above 1.5 are clipped in the graph.)</div>`;
  };
  $("#fDeg").oninput=upd;$("#fN").onchange=upd;$("#fNew").onclick=()=>{seed=Math.floor(Math.random()*1e6);upd()};
  upd();
}

/* ====================== 8. Data cleaning ====================== */
const CLEAN_START=[{name:"Ali",age:20,city:"Lahore",marks:78},{name:"Sara",age:21,city:"lahore ",marks:85},{name:"Sara",age:21,city:"lahore ",marks:85},{name:"Usman",age:19,city:"LAHORE",marks:null},{name:"Hina",age:22,city:"Karachi",marks:91},{name:"Bilal",age:250,city:"Karachi",marks:67},{name:"Zara",age:20,city:"karachi",marks:null},{name:"Omar",age:23,city:"Islamabad",marks:72},{name:"Maha",age:21,city:"Islamabad",marks:88},{name:"Ahmed",age:20,city:"Lahore",marks:70}];
const titleCase=s=>s.trim().toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
function labClean(box){
  let rows=CLEAN_START.map(r=>({...r})),log=[];
  const issues=()=>{
    const seen=new Set(),dups=[];rows.forEach((r,i)=>{const k=JSON.stringify([r.name,r.age,r.city,r.marks]);if(seen.has(k))dups.push(i);seen.add(k)});
    return{dups,missing:rows.map((r,i)=>r.marks===null?i:-1).filter(i=>i>=0),city:rows.map((r,i)=>r.city!==titleCase(r.city)?i:-1).filter(i=>i>=0),age:rows.map((r,i)=>(r.age>100||r.age<5)?i:-1).filter(i=>i>=0)};
  };
  const draw=()=>{
    const is=issues(),total=is.dups.length+is.missing.length+is.city.length+is.age.length;
    box.innerHTML=`<div class="card"><h3>Clean the messy student table</h3>
     <p>Problems: a <b>duplicate</b> row, <b>missing</b> marks, <b>inconsistent</b> city spelling and an impossible <b>age</b>. Apply the fixes and aim for zero problems. Order matters: remove duplicates <i>before</i> filling with the mean.</p>
     <div class="btnrow"><button class="b alt" data-a="dup">Remove duplicates</button><button class="b alt" data-a="mean">Fill missing marks with mean</button><button class="b alt" data-a="median">Fill missing marks with median</button><button class="b alt" data-a="drop">Drop rows with missing marks</button><button class="b alt" data-a="std">Standardise city text</button><button class="b alt" data-a="age">Remove impossible ages</button><button class="b alt" data-a="reset">Reset</button></div>
     <div class="scroll"><table class="cl"><tr><th>#</th><th>Name</th><th>Age</th><th>City</th><th>Marks</th></tr>${rows.map((r,i)=>`<tr class="${is.dups.includes(i)?"dupr":""}"><td>${i+1}</td><td>${esc(r.name)}</td><td class="${is.age.includes(i)?"bad":""}">${r.age}</td><td class="${is.city.includes(i)?"bad":""}">${esc(JSON.stringify(r.city))}</td><td class="${r.marks===null?"bad":""}">${r.marks===null?"missing":r.marks}</td></tr>`).join("")}</table></div>
     <div class="out"><b>Problems left: ${total}</b> (duplicates ${is.dups.length}, missing ${is.missing.length}, inconsistent city ${is.city.length}, impossible age ${is.age.length})${total===0?`<br><span class="good">✔ Clean! ${rows.length} rows remain.</span>`:""}</div>
     ${log.length?`<div class="key"><b>What you did:</b><ul>${log.map(l=>`<li>${l}</li>`).join("")}</ul></div>`:""}
     <p class="muted">Highlighted cells show problems. Remember: cleaning is not just deleting rows. An age of 250 is a clear error, but an unusual value may be real, so investigate first.</p></div>`;
    $$("[data-a]",box).forEach(b=>b.onclick=()=>act(b.dataset.a));
  };
  const act=a=>{
    const ms=rows.filter(r=>r.marks!==null).map(r=>r.marks);
    if(a==="reset"){rows=CLEAN_START.map(r=>({...r}));log=[]}
    if(a==="dup"){const seen=new Set(),n0=rows.length;rows=rows.filter(r=>{const k=JSON.stringify([r.name,r.age,r.city,r.marks]);if(seen.has(k))return false;seen.add(k);return true});log.push(`Removed ${n0-rows.length} duplicate row(s).`)}
    if(a==="mean"||a==="median"){if(!rows.some(r=>r.marks===null))log.push("No missing marks to fill.");else{const v=a==="mean"?mean(ms):quantile(ms.slice().sort((x,y)=>x-y),.5);rows.forEach(r=>{if(r.marks===null)r.marks=Math.round(v*100)/100});log.push(`Filled missing marks with the ${a} (${nf(v,2)}) of ${ms.length} known value(s).`)}}
    if(a==="drop"){const n0=rows.length;rows=rows.filter(r=>r.marks!==null);log.push(`Dropped ${n0-rows.length} row(s) with missing marks (we lose data!).`)}
    if(a==="std"){rows.forEach(r=>r.city=titleCase(r.city));log.push("Standardised city text (trim spaces, Title Case).")}
    if(a==="age"){const n0=rows.length;rows=rows.filter(r=>!(r.age>100||r.age<5));log.push(`Removed ${n0-rows.length} row(s) with impossible age.`)}
    draw();
  };
  draw();
}
