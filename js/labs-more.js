/* More labs for the mid-term weeks: scaling & encoding (W4), Pandas explorer (W5),
   chart chooser (W7), train/validation/test split (W10). Registered in labs.js. */

/* ====================== Week 4: scaling and encoding ====================== */
function labScale(box){
  box.innerHTML=`<div class="card"><h3>Feature scaling and categorical encoding</h3>
   <p>Models and distance-based methods work better when numbers are on similar scales, and models need numbers instead of text categories.</p>
   <h4>A. Scaling numbers</h4>
   <label for="scIn">Numbers (for example ages or salaries)</label><textarea id="scIn" rows="2">20, 30, 40, 50, 100</textarea>
   <div id="scOut"></div>
   <h4>B. Encoding categories</h4>
   <label for="enIn">Categories (comma separated)</label><textarea id="enIn" rows="2">Lahore, Karachi, Lahore, Islamabad, Karachi</textarea>
   <div id="enOut"></div></div>`;
  const updA=()=>{
    const v=$("#scIn").value.split(/[\s,;]+/).map(parseFloat).filter(x=>isFinite(x));
    if(v.length<2){$("#scOut").innerHTML=`<div class="warn">Enter at least two numbers.</div>`;return}
    const mn=Math.min(...v),mx=Math.max(...v),m=mean(v),sd=Math.sqrt(sum(v.map(x=>(x-m)**2))/v.length);
    const mm=v.map(x=>mx===mn?0:(x-mn)/(mx-mn)),zs=v.map(x=>sd?(x-m)/sd:0);
    $("#scOut").innerHTML=`<div class="key"><b>Min-max normalisation:</b> (x − min) / (max − min) = (x − ${nf(mn,2)}) / ${nf(mx-mn,2)} → values between 0 and 1.<br><b>Standardisation (z-score):</b> (x − mean) / SD = (x − ${nf(m,2)}) / ${nf(sd,3)} → mean 0 and SD 1. (SD here divides by n, like the variance in the lecture.)</div>
     <div class="scroll"><table><tr><th>Original</th><th>Min-max</th><th>z-score</th></tr>${v.map((x,i)=>`<tr><td>${nf(x,3)}</td><td>${nf(mm[i],3)}</td><td>${nf(zs[i],3)}</td></tr>`).join("")}</table></div>
     ${chartBars(v.map((x,i)=>({label:String(nf(x,1)),value:mm[i]})),{max:1,title:"Min-max scaled values",fmt:q=>nf(q,2),yfmt:q=>nf(q,1)})}
     <div class="warn"><b>Data leakage:</b> learn the min, max, mean and SD from the <b>training data only</b>, then apply them to the test data.</div>`;
  };
  const updB=()=>{
    const c=$("#enIn").value.split(",").map(x=>x.trim()).filter(Boolean);
    if(!c.length){$("#enOut").innerHTML=`<div class="warn">Enter some categories.</div>`;return}
    const u=[...new Set(c)].sort();
    $("#enOut").innerHTML=`<div class="scroll"><table><tr><th>Category</th><th>Label encoding</th>${u.map(x=>`<th>one-hot: ${esc(x)}</th>`).join("")}</tr>
      ${c.map(x=>`<tr><td>${esc(x)}</td><td>${u.indexOf(x)}</td>${u.map(y=>`<td>${x===y?1:0}</td>`).join("")}</tr>`).join("")}</table></div>
     <div class="key"><b>Label encoding</b> gives each category a number (here in alphabetical order). It suggests an order, so use it for <b>ordinal</b> data (low &lt; medium &lt; high).<br><b>One-hot encoding</b> makes one 0/1 column per category, so it suits <b>nominal</b> data like city.</div>`;
  };
  $("#scIn").oninput=updA;$("#enIn").oninput=updB;updA();updB();
}

/* ====================== Week 5: Pandas explorer ====================== */
const PD_STUDENTS=[
 {name:"Ali",city:"Lahore",marks:78,hours:5},{name:"Sara",city:"Karachi",marks:91,hours:8},{name:"Usman",city:"Lahore",marks:55,hours:2},
 {name:"Hina",city:"Islamabad",marks:84,hours:6},{name:"Bilal",city:"Karachi",marks:67,hours:4},{name:"Zara",city:"Lahore",marks:72,hours:5},
 {name:"Omar",city:"Islamabad",marks:45,hours:1},{name:"Maha",city:"Karachi",marks:88,hours:7}];
const PD_CITIES=[{city:"Lahore",province:"Punjab"},{city:"Karachi",province:"Sindh"},{city:"Islamabad",province:"ICT"}];
const PD_COLS=["name","city","marks","hours"];
const pdRows=(rs,cols)=>rs.map(r=>cols.map(c=>r[c]));
const PD_OPS=[
 {k:"head",label:"head()",code:'df.head(3)',note:"Shows the first rows (default 5). Index starts at 0.",
  run:()=>({cols:PD_COLS,index:[0,1,2],rows:pdRows(PD_STUDENTS.slice(0,3),PD_COLS)})},
 {k:"describe",label:"describe()",code:'df["marks"].describe()',note:"Count, mean, std (sample), min, quartiles and max of one column.",
  run:()=>{const v=PD_STUDENTS.map(r=>r.marks),s=v.slice().sort((a,b)=>a-b),m=mean(v),sd=Math.sqrt(sum(v.map(x=>(x-m)**2))/(v.length-1));
   return{cols:["marks"],index:["count","mean","std","min","25%","50%","75%","max"],rows:[[v.length],[m],[sd],[s[0]],[quantile(s,.25)],[quantile(s,.5)],[quantile(s,.75)],[s[s.length-1]]]}}},
 {k:"filter",label:"filter rows",code:'df[df["marks"] > 70]',note:"Keeps only the rows where the condition is True. Original index labels are kept.",
  run:()=>{const ix=[],rs=[];PD_STUDENTS.forEach((r,i)=>{if(r.marks>70){ix.push(i);rs.push(r)}});return{cols:PD_COLS,index:ix,rows:pdRows(rs,PD_COLS)}}},
 {k:"sort",label:"sort_values()",code:'df.sort_values("marks", ascending=False)',note:"Orders rows by a column. Index labels move with their rows.",
  run:()=>{const ix=PD_STUDENTS.map((_,i)=>i).sort((a,b)=>PD_STUDENTS[b].marks-PD_STUDENTS[a].marks);return{cols:PD_COLS,index:ix,rows:pdRows(ix.map(i=>PD_STUDENTS[i]),PD_COLS)}}},
 {k:"groupby",label:"groupby() + mean",code:'df.groupby("city")["marks"].mean()',note:"Split into groups by city, then aggregate each group. Group keys are sorted.",
  run:()=>{const g={};PD_STUDENTS.forEach(r=>{(g[r.city]=g[r.city]||[]).push(r.marks)});const keys=Object.keys(g).sort();return{cols:["marks (mean)"],index:keys,rows:keys.map(k=>[mean(g[k])]),indexName:"city"}}},
 {k:"counts",label:"value_counts()",code:'df["city"].value_counts()',note:"Counts how often each value appears, most frequent first.",
  run:()=>{const c={},order=[];PD_STUDENTS.forEach(r=>{if(!(r.city in c)){c[r.city]=0;order.push(r.city)}c[r.city]++});const keys=order.slice().sort((a,b)=>c[b]-c[a]||order.indexOf(a)-order.indexOf(b));return{cols:["count"],index:keys,rows:keys.map(k=>[c[k]]),indexName:"city"}}},
 {k:"merge",label:"merge()",code:'df.merge(cities, on="city")',note:"Joins two tables on a shared key column (inner join keeps rows that match in both).",
  run:()=>{const cols=PD_COLS.concat(["province"]),rs=PD_STUDENTS.map(r=>({...r,province:(PD_CITIES.find(c=>c.city===r.city)||{}).province})).filter(r=>r.province);return{cols,index:rs.map((_,i)=>i),rows:pdRows(rs,cols)}}}
];
const pdFmt=v=>typeof v==="number"?(Number.isInteger(v)?String(v):String(Math.round(v*10000)/10000)):String(v);
const pdTable=(cols,rows,index,indexName)=>`<div class="scroll"><table class="pd"><tr><th>${esc(indexName||"")}</th>${cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr>${rows.map((r,i)=>`<tr><td><b>${esc(index?index[i]:i)}</b></td>${r.map(v=>`<td>${esc(pdFmt(v))}</td>`).join("")}</tr>`).join("")}</table></div>`;
function labPandas(box){
  let cur="head";
  const draw=()=>{
    const op=PD_OPS.find(o=>o.k===cur),res=op.run();
    box.innerHTML=`<div class="card"><h3>Pandas explorer</h3>
     <p>A small DataFrame <span class="code">df</span> of students. Pick an operation to see the pandas code and what it returns. <small class="muted">(The results are computed by the page to match what pandas prints. To run real pandas yourself, open the Python playground lab.)</small></p>
     <b>df</b>${pdTable(PD_COLS,pdRows(PD_STUDENTS,PD_COLS))}
     <b>cities</b> (second table, used by merge)${pdTable(["city","province"],pdRows(PD_CITIES,["city","province"]))}
     <div class="chips" role="group" aria-label="Pandas operation">${PD_OPS.map(o=>`<button class="chip ${o.k===cur?"on":""}" data-op="${o.k}" aria-pressed="${o.k===cur}">${o.label}</button>`).join("")}</div>
     <pre class="code py">import pandas as pd
${op.code}</pre>
     <div class="key">${esc(op.note)}</div><b>Result</b>${pdTable(res.cols,res.rows,res.index,res.indexName)}</div>`;
    $$("[data-op]",box).forEach(b=>b.onclick=()=>{cur=b.dataset.op;draw()});
  };
  draw();
}

/* ====================== Week 7: chart chooser ====================== */
const VIZ_STUDY={hours:[1,2,3,4,5,6,7,8,2,6],att:[60,65,70,72,80,85,90,95,55,88],marks:[48,55,52,63,70,74,80,88,50,78],sleep:[8,7,7,6,7,6,5,6,8,7]};
function vizCorrMatrix(){const k=["hours","att","marks","sleep"];return{labels:["Study hrs","Attendance","Marks","Sleep"],m:k.map(a=>k.map(b=>pearson(VIZ_STUDY[a],VIZ_STUDY[b])))}}
const VIZ=[
 {k:"bar",label:"Bar chart",shows:"Compares values across categories.",use:"Sales by product, students per city.",poor:"Too many categories, or data over time (use a line).",code:'plt.bar(names, values)  # or sns.barplot()'},
 {k:"line",label:"Line chart",shows:"A trend over time.",use:"Monthly revenue, daily temperature.",poor:"Unordered categories.",code:'plt.plot(months, revenue)'},
 {k:"pie",label:"Pie chart",shows:"Simple part-to-whole shares.",use:"Market share of 3 or 4 companies.",poor:"Many slices or similar sizes: hard to compare (use a bar).",code:'plt.pie(values, labels=names, autopct="%1.0f%%")'},
 {k:"hist",label:"Histogram",shows:"The distribution of ONE numerical variable (how values are spread).",use:"Age or marks distribution.",poor:"Categories (use a bar) or two variables (use a scatter).",code:'plt.hist(ages, bins=5)  # or sns.histplot()'},
 {k:"scatter",label:"Scatter plot",shows:"The relationship between TWO numerical variables.",use:"Study hours vs marks.",poor:"Categorical variables.",code:'plt.scatter(hours, marks)  # or sns.scatterplot()'},
 {k:"box",label:"Box plot",shows:"Median, quartiles, spread and outliers.",use:"Salary distribution; compare groups.",poor:"Very small samples, or when exact shape matters.",code:'sns.boxplot(x=salaries)'},
 {k:"heat",label:"Heatmap",shows:"A table of values as colours, such as a correlation matrix.",use:"Which features are related?",poor:"Few numbers: a plain table is clearer.",code:'sns.heatmap(df.corr(), annot=True)'}
];
function vizSample(k,opts){
 if(k==="bar"){const ymin=opts.axis0?0:80;return chartBars([{label:"Phone A",value:92},{label:"Phone B",value:88},{label:"Phone C",value:85},{label:"Phone D",value:82}],{max:100,ymin,title:"Customer rating by phone",fmt:v=>String(v),yfmt:v=>nf(v,0)})}
 if(k==="line")return chartLines([{name:"Revenue (Rs thousand)",color:COL.brand,dots:true,pts:[[1,40],[2,44],[3,43],[4,52],[5,58],[6,61],[7,59],[8,67],[9,72],[10,70],[11,78],[12,90]]}],{xmin:1,xmax:12,xticks:11,ymin:0,ymax:100,xlabel:"month",ylabel:"revenue",title:"Monthly revenue"});
 if(k==="pie")return chartPie([{label:"Company A",value:50},{label:"Company B",value:30},{label:"Company C",value:20}],{title:"Market share"});
 if(k==="hist")return chartHist([18,19,19,20,20,20,21,21,22,22,22,23,24,25,27,30,34],{bins:6,xlabel:"age",title:"Age of students"});
 if(k==="scatter")return chartScatter(VIZ_STUDY.hours.map((h,i)=>[h,VIZ_STUDY.marks[i]]),{xlabel:"study hours",ylabel:"marks",title:"Study hours vs marks"});
 if(k==="box"){const s=[30,32,35,36,38,40,45,160].slice().sort((a,b)=>a-b);const q1=quantile(s,.25),q3=quantile(s,.75),iqr=q3-q1,hi=q3+1.5*iqr;const inl=s.filter(x=>x<=hi);return chartBox({min:inl[0],q1,med:quantile(s,.5),q3,max:inl[inl.length-1],outliers:s.filter(x=>x>hi)},{xlabel:"salary (thousand Rs)"})}
 const c=vizCorrMatrix();return chartHeat(c.labels,c.m,{title:"Correlation heatmap"});
}
function labCharts(box){
  let cur="bar",axis0=true;
  const draw=()=>{
    const v=VIZ.find(x=>x.k===cur);
    box.innerHTML=`<div class="card"><h3>Chart chooser</h3><p>Pick a chart to see an example, what it is for and when it is a poor choice. <b>Choose the chart by the question you want to answer.</b></p>
     <div class="chips" role="group" aria-label="Chart type">${VIZ.map(x=>`<button class="chip ${x.k===cur?"on":""}" data-v="${x.k}" aria-pressed="${x.k===cur}">${x.label}</button>`).join("")}</div>
     ${cur==="bar"?`<div class="chips"><button class="chip ${axis0?"on":""}" data-ax="1">Axis starts at 0 (honest)</button><button class="chip ${axis0?"":"on"}" data-ax="0">Axis starts at 80 (misleading)</button></div>`:""}
     ${vizSample(cur,{axis0})}
     <div class="scroll"><table><tr><th>Shows</th><td>${esc(v.shows)}</td></tr><tr><th>Use when</th><td>${esc(v.use)}</td></tr><tr><th>Poor choice when</th><td>${esc(v.poor)}</td></tr><tr><th>Python</th><td class="code">${esc(v.code)}</td></tr></table></div>
     ${cur==="bar"&&!axis0?`<div class="warn"><b>Misleading!</b> Cutting the axis at 80 makes Phone A look about four times better than Phone D, but the ratings are 92 and 82.</div>`:""}
     ${cur==="heat"?`<div class="key">Each cell is the correlation r between two variables (−1 to +1). Check which pairs are strongly related.</div>`:""}</div>`;
    $$("[data-v]",box).forEach(b=>b.onclick=()=>{cur=b.dataset.v;draw()});
    $$("[data-ax]",box).forEach(b=>b.onclick=()=>{axis0=b.dataset.ax==="1";draw()});
  };
  draw();
}

/* ====================== Week 10: train / validation / test split ====================== */
function labSplit(box){
  box.innerHTML=`<div class="card"><h3>Train / validation / test split</h3>
   <p>100 rows of data. Each dot is one row. Split them so the model can <b>learn</b>, be <b>tuned</b> and be <b>tested fairly</b>.</p>
   <div class="row"><div><label for="spTr">Training: <b id="spTrv">70</b>%</label><input type="range" id="spTr" min="50" max="90" step="5" value="70"></div>
   <div><label for="spVa">Validation: <b id="spVav">15</b>%</label><input type="range" id="spVa" min="0" max="30" step="5" value="15"></div></div>
   <div class="btnrow"><button class="b alt" id="spShuf">Shuffle rows</button></div>
   <div id="spOut"></div></div>`;
  let seed=5;
  const upd=()=>{
    let tr=+$("#spTr").value,va=+$("#spVa").value;if(tr+va>95)va=95-tr;
    const te=100-tr-va;$("#spTrv").textContent=tr;$("#spVav").textContent=va;
    const g=rngSeed(seed),idx=Array.from({length:100},(_,i)=>i).sort(()=>g()-0.5);
    const role=new Array(100);idx.forEach((i,k)=>{role[i]=k<tr?"tr":k<tr+va?"va":"te"});
    $("#spOut").innerHTML=`<div class="dots" role="img" aria-label="${tr} training, ${va} validation, ${te} test rows">${role.map(r=>`<i class="dot-${r}"></i>`).join("")}</div>
     <div class="legend"><span><i style="background:var(--brand)"></i>Training ${tr}</span><span><i style="background:${COL.warn}"></i>Validation ${va}</span><span><i style="background:var(--bad)"></i>Test ${te}</span></div>
     <div class="grid" style="margin-top:12px">
      <div class="mini"><b>Training set</b>The model learns patterns from these rows.</div>
      <div class="mini"><b>Validation set</b>Used while building: compare models and tune settings.${va===0?" <i>(none here: you can use cross-validation instead)</i>":""}</div>
      <div class="mini"><b>Test set</b>Kept aside until the very end for one honest final check on unseen data.</div></div>
     <div class="warn"><b>Data leakage:</b> if test rows influence training (or you keep tuning on the test set), the score looks better than reality. Scaling and imputation values must also be learned from the training data only.</div>
     ${tr<60?`<div class="key">Only ${tr}% for training: the model has less to learn from, which can make underfitting more likely.</div>`:te<10?`<div class="key">Only ${te}% for testing: the final score will be noisy because there are few test rows.</div>`:`<div class="key">A common choice is about 70–80% training, the rest for validation and testing.</div>`}`;
  };
  $("#spTr").oninput=upd;$("#spVa").oninput=upd;$("#spShuf").onclick=()=>{seed=Math.floor(Math.random()*1e6);upd()};
  upd();
}
