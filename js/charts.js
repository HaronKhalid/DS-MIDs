/* Small dependency-free SVG chart helpers. Every function returns an HTML/SVG string.
   Colours come from CSS variables, so charts follow the light/dark theme. */
const COL={brand:"var(--brand)",ok:"var(--ok)",bad:"var(--bad)",warn:"#d9822b",muted:"var(--muted)",line:"var(--line)",ink:"var(--ink)",purple:"#8a5cd0"};
/* chart width follows the page width, so text stays readable on phones */
const chW=()=>{const m=document.querySelector("main");const w=m?m.clientWidth:640;return Math.max(300,Math.min(620,w-56))};
const nf=(v,d=2)=>{const r=Math.round(v*Math.pow(10,d))/Math.pow(10,d);return String(r)};

/* shared frame: axes, ticks, labels. Returns scale functions and the svg prefix/suffix */
function chFrame(o){
  const W=o.w||chW(),H=o.h||280,L=o.left||46,R=o.right||14,T=o.top||16,B=o.bottom||44;
  const X=v=>L+(v-o.xmin)/(o.xmax-o.xmin||1)*(W-L-R);
  const Y=v=>H-B-(v-o.ymin)/(o.ymax-o.ymin||1)*(H-B-T);
  const nx=o.xticks||5,ny=o.yticks||5;
  let g="";
  for(let i=0;i<=ny;i++){const v=o.ymin+(o.ymax-o.ymin)*i/ny;
    g+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)" stroke-width="1"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" font-size="11" style="fill:var(--muted)">${o.yfmt?o.yfmt(v):nf(v,2)}</text>`}
  if(!o.xcats)for(let i=0;i<=nx;i++){const v=o.xmin+(o.xmax-o.xmin)*i/nx;
    g+=`<line x1="${X(v)}" x2="${X(v)}" y1="${H-B}" y2="${H-B+4}" style="stroke:var(--muted)"/><text x="${X(v)}" y="${H-B+16}" text-anchor="middle" font-size="11" style="fill:var(--muted)">${o.xfmt?o.xfmt(v):nf(v,2)}</text>`}
  g+=`<line x1="${L}" x2="${L}" y1="${T}" y2="${H-B}" style="stroke:var(--muted)"/><line x1="${L}" x2="${W-R}" y1="${H-B}" y2="${H-B}" style="stroke:var(--muted)"/>`;
  if(o.xlabel)g+=`<text x="${(L+W-R)/2}" y="${H-6}" text-anchor="middle" font-size="12" style="fill:var(--ink)">${esc(o.xlabel)}</text>`;
  if(o.ylabel)g+=`<text transform="translate(13 ${(T+H-B)/2}) rotate(-90)" text-anchor="middle" font-size="12" style="fill:var(--ink)">${esc(o.ylabel)}</text>`;
  return{X,Y,W,H,L,R,T,B,open:`<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(o.alt||o.title||"chart")}">${o.title?`<text x="${W/2}" y="12" text-anchor="middle" font-size="13" font-weight="700" style="fill:var(--ink)">${esc(o.title)}</text>`:""}${g}`,close:"</svg>"};
}
function chLegend(items){return `<div class="legend">${items.map(([c,t])=>`<span><i style="background:${c}"></i>${esc(t)}</span>`).join("")}</div>`}

/* bar chart. items: [{label,value,color}] */
function chartBars(items,o={}){
  const max=o.max||Math.max(...items.map(i=>i.value),1)*1.15;
  const n=items.length,W=o.w||chW(),H=o.h||260,L=46,R=14,T=26,B=o.bottom||56;
  const f=chFrame({w:W,h:H,xmin:0,xmax:n,ymin:0,ymax:max,xcats:true,bottom:B,top:T,yfmt:o.yfmt,title:o.title,ylabel:o.ylabel,alt:o.alt});
  const bw=(W-L-R)/n;
  let g="";
  items.forEach((it,i)=>{
    const x=L+i*bw+bw*0.15,w=bw*0.7,y=f.Y(it.value);
    g+=`<rect x="${x}" y="${y}" width="${w}" height="${f.Y(0)-y}" rx="4" style="fill:${it.color||COL.brand}"/>`;
    g+=`<text x="${x+w/2}" y="${y-5}" text-anchor="middle" font-size="12" font-weight="700" style="fill:var(--ink)">${o.fmt?o.fmt(it.value):nf(it.value,2)}</text>`;
    const words=String(it.label).split(" ");
    g+=words.map((wd,k)=>`<text x="${x+w/2}" y="${H-B+16+k*13}" text-anchor="middle" font-size="11" style="fill:var(--muted)">${esc(wd)}</text>`).join("");
  });
  return `<div class="chartbox">${f.open}${g}${f.close}</div>`;
}

/* line chart. series: [{name,color,pts:[[x,y],...],dash,dots}] */
function chartLines(series,o={}){
  const pts=series.flatMap(s=>s.pts);
  const xmin=o.xmin??Math.min(...pts.map(p=>p[0])),xmax=o.xmax??Math.max(...pts.map(p=>p[0]));
  const ymin=o.ymin??0,ymax=o.ymax??Math.max(...pts.map(p=>p[1]))*1.1;
  const f=chFrame({...o,xmin,xmax,ymin,ymax});
  let g="";
  if(o.marker!==undefined)g+=`<line x1="${f.X(o.marker)}" x2="${f.X(o.marker)}" y1="${f.T}" y2="${f.H-f.B}" stroke-dasharray="5 4" style="stroke:var(--warn);stroke:#d9822b"/>`;
  series.forEach(s=>{
    g+=`<polyline fill="none" stroke-width="2.5" ${s.dash?'stroke-dasharray="6 4"':""} style="stroke:${s.color}" points="${s.pts.map(p=>f.X(p[0]).toFixed(1)+","+f.Y(p[1]).toFixed(1)).join(" ")}"/>`;
    if(s.dots)g+=s.pts.map(p=>`<circle cx="${f.X(p[0])}" cy="${f.Y(p[1])}" r="3.5" style="fill:${s.color}"/>`).join("");
  });
  return `<div class="chartbox">${f.open}${g}${f.close}${chLegend(series.map(s=>[s.color,s.name]))}</div>`;
}

/* scatter. points:[[x,y,group?]], opts.line=[slope,intercept], opts.curve=[[x,y]...], opts.groups:{name:color} */
function chartScatter(points,o={}){
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const pad=(a,b)=>{const d=(b-a)||1;return[a-d*0.08,b+d*0.08]};
  const [xmin,xmax]=o.xmin!==undefined?[o.xmin,o.xmax]:pad(Math.min(...xs),Math.max(...xs));
  const [ymin,ymax]=o.ymin!==undefined?[o.ymin,o.ymax]:pad(Math.min(...ys,...(o.curve||[]).map(p=>p[1])),Math.max(...ys,...(o.curve||[]).map(p=>p[1])));
  const f=chFrame({...o,xmin,xmax,ymin,ymax});
  let g="";
  if(o.curve)g+=`<polyline fill="none" stroke-width="2.5" style="stroke:${o.curveColor||COL.warn}" points="${o.curve.map(p=>f.X(p[0]).toFixed(1)+","+f.Y(p[1]).toFixed(1)).join(" ")}"/>`;
  if(o.truth)g+=`<polyline fill="none" stroke-width="2" stroke-dasharray="5 4" style="stroke:var(--muted)" points="${o.truth.map(p=>f.X(p[0]).toFixed(1)+","+f.Y(p[1]).toFixed(1)).join(" ")}"/>`;
  if(o.line)g+=`<line x1="${f.X(xmin)}" y1="${f.Y(o.line[0]*xmin+o.line[1])}" x2="${f.X(xmax)}" y2="${f.Y(o.line[0]*xmax+o.line[1])}" stroke-width="2.5" style="stroke:${COL.warn}"/>`;
  points.forEach(p=>{const c=(o.groups&&o.groups[p[2]])||COL.brand;g+=`<circle cx="${f.X(p[0])}" cy="${f.Y(p[1])}" r="${o.r||4.5}" fill-opacity=".85" style="fill:${c}"/>`});
  return `<div class="chartbox">${f.open}${g}${f.close}${o.legend?chLegend(o.legend):""}</div>`;
}

/* histogram of raw values */
function chartHist(values,o={}){
  const mn=Math.min(...values),mx=Math.max(...values);
  const bins=o.bins||Math.max(4,Math.min(10,Math.ceil(Math.sqrt(values.length))));
  const w=(mx-mn)/bins||1;
  const counts=new Array(bins).fill(0);
  values.forEach(v=>{let i=Math.floor((v-mn)/w);if(i>=bins)i=bins-1;counts[i]++});
  const ymax=Math.max(...counts)+1;
  const f=chFrame({w:o.w||chW(),h:o.h||250,xmin:mn,xmax:mx===mn?mn+1:mx,ymin:0,ymax,yticks:Math.min(ymax,5),xfmt:v=>nf(v,1),yfmt:v=>nf(v,0),xlabel:o.xlabel||"value",ylabel:"count",title:o.title,alt:o.alt||"histogram"});
  let g="";
  counts.forEach((c,i)=>{const x0=f.X(mn+i*w),x1=f.X(mn+(i+1)*w);g+=`<rect x="${x0+1}" y="${f.Y(c)}" width="${x1-x0-2}" height="${f.Y(0)-f.Y(c)}" style="fill:${COL.brand}" fill-opacity=".85"/>`;if(c)g+=`<text x="${(x0+x1)/2}" y="${f.Y(c)-4}" text-anchor="middle" font-size="11" style="fill:var(--ink)">${c}</text>`});
  if(o.mean!==undefined)g+=`<line x1="${f.X(o.mean)}" x2="${f.X(o.mean)}" y1="${f.T}" y2="${f.H-f.B}" stroke-width="2" style="stroke:${COL.bad}"/>`;
  if(o.median!==undefined)g+=`<line x1="${f.X(o.median)}" x2="${f.X(o.median)}" y1="${f.T}" y2="${f.H-f.B}" stroke-width="2" stroke-dasharray="5 4" style="stroke:${COL.ok}"/>`;
  return `<div class="chartbox">${f.open}${g}${f.close}${o.mean!==undefined?chLegend([[COL.bad,"mean"],[COL.ok,"median"]]):""}</div>`;
}

/* horizontal box plot. q:{min,q1,med,q3,max,outliers[]} */
function chartBox(q,o={}){
  const all=[q.min,q.max,...q.outliers];
  const lo=Math.min(...all),hi=Math.max(...all);
  const f=chFrame({w:o.w||chW(),h:130,xmin:lo-(hi-lo)*0.05,xmax:hi+(hi-lo)*0.05||1,ymin:0,ymax:1,yticks:1,yfmt:()=>"",xfmt:v=>nf(v,0),bottom:30,top:10,left:14,xlabel:o.xlabel||"value",alt:"box plot"});
  const y=f.Y(0.5),h=34;
  let g=`<line x1="${f.X(q.min)}" x2="${f.X(q.q1)}" y1="${y}" y2="${y}" style="stroke:var(--ink)" stroke-width="2"/><line x1="${f.X(q.q3)}" x2="${f.X(q.max)}" y1="${y}" y2="${y}" style="stroke:var(--ink)" stroke-width="2"/>`;
  g+=`<rect x="${f.X(q.q1)}" y="${y-h/2}" width="${f.X(q.q3)-f.X(q.q1)}" height="${h}" fill-opacity=".35" style="fill:${COL.brand};stroke:${COL.brand}" stroke-width="2"/>`;
  g+=`<line x1="${f.X(q.med)}" x2="${f.X(q.med)}" y1="${y-h/2}" y2="${y+h/2}" stroke-width="3" style="stroke:${COL.ok}"/>`;
  [q.min,q.max].forEach(v=>g+=`<line x1="${f.X(v)}" x2="${f.X(v)}" y1="${y-9}" y2="${y+9}" style="stroke:var(--ink)" stroke-width="2"/>`);
  q.outliers.forEach(v=>g+=`<circle cx="${f.X(v)}" cy="${y}" r="5" fill="none" stroke-width="2" style="stroke:${COL.bad}"/>`);
  return `<div class="chartbox">${f.open}${g}${f.close}${chLegend([[COL.brand,"box = Q1 to Q3"],[COL.ok,"median"],[COL.bad,"outlier"]])}</div>`;
}

/* normal-distribution maths */
function erf(x){const s=x<0?-1:1;x=Math.abs(x);const t=1/(1+0.3275911*x);const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y}
const normCdf=z=>0.5*(1+erf(z/Math.SQRT2));
const normPdf=(x,mu,sd)=>Math.exp(-0.5*((x-mu)/sd)**2)/(sd*Math.sqrt(2*Math.PI));

/* normal curve. o:{mu,sd,k (shade mu±k sd) | from,to, marker} */
function chartNormal(o){
  const mu=o.mu,sd=o.sd,xmin=mu-4*sd,xmax=mu+4*sd,ymax=normPdf(mu,mu,sd)*1.15;
  const f=chFrame({w:o.w||chW(),h:o.h||260,xmin,xmax,ymin:0,ymax,xticks:8,yticks:3,xfmt:v=>nf(v,o.dec??1),yfmt:()=>"",left:14,xlabel:o.xlabel||"value",title:o.title,alt:o.alt||"normal curve"});
  const curve=(a,b)=>{const p=[];for(let i=0;i<=80;i++){const x=a+(b-a)*i/80;p.push(f.X(x).toFixed(1)+","+f.Y(normPdf(x,mu,sd)).toFixed(1))}return p};
  let g="";
  const a=o.from!==undefined?o.from:(o.k!==undefined?mu-o.k*sd:null),b=o.to!==undefined?o.to:(o.k!==undefined?mu+o.k*sd:null);
  if(a!==null){const lo=Math.max(a,xmin),hi=Math.min(b,xmax);g+=`<polygon fill-opacity=".35" style="fill:${COL.brand}" points="${f.X(lo)},${f.Y(0)} ${curve(lo,hi).join(" ")} ${f.X(hi)},${f.Y(0)}"/>`}
  if(o.tails){o.tails.forEach(([lo,hi])=>{lo=Math.max(lo,xmin);hi=Math.min(hi,xmax);g+=`<polygon fill-opacity=".45" style="fill:${COL.bad}" points="${f.X(lo)},${f.Y(0)} ${curve(lo,hi).join(" ")} ${f.X(hi)},${f.Y(0)}"/>`})}
  g+=`<polyline fill="none" stroke-width="2.5" style="stroke:var(--ink)" points="${curve(xmin,xmax).join(" ")}"/>`;
  g+=`<line x1="${f.X(mu)}" x2="${f.X(mu)}" y1="${f.T}" y2="${f.H-f.B}" stroke-dasharray="4 4" style="stroke:var(--muted)"/>`;
  if(o.marker!==undefined&&o.marker>=xmin&&o.marker<=xmax)g+=`<line x1="${f.X(o.marker)}" x2="${f.X(o.marker)}" y1="${f.T}" y2="${f.H-f.B}" stroke-width="2.5" style="stroke:${COL.warn}"/>`;
  return `<div class="chartbox">${f.open}${g}${f.close}</div>`;
}

/* confusion matrix as a coloured grid (HTML) */
function chartConfusion(tp,tn,fp,fn){
  const tot=tp+tn+fp+fn||1;
  const cell=(v,l,cls)=>`<div class="cm-cell ${cls}"><b>${v}</b><small>${l}</small><small>${Math.round(v/tot*100)}%</small></div>`;
  return `<div class="cm" role="table" aria-label="Confusion matrix"><div class="cm-h"></div><div class="cm-h">Predicted<br>Positive</div><div class="cm-h">Predicted<br>Negative</div>
    <div class="cm-h">Actual<br>Positive</div>${cell(tp,"TP (correct)","good")}${cell(fn,"FN (Type II)","bad")}
    <div class="cm-h">Actual<br>Negative</div>${cell(fp,"FP (Type I)","bad")}${cell(tn,"TN (correct)","good")}</div>`;
}

/* build a chart from a plain spec (used by scenarios) */
function chartFromSpec(s){
  if(!s)return "";
  if(s.type==="confusion")return chartConfusion(s.tp,s.tn,s.fp,s.fn);
  if(s.type==="bars")return chartBars(s.items.map(i=>({label:i[0],value:i[1],color:i[2]})),{title:s.title,ylabel:s.ylabel,fmt:s.fmt==="pct"?v=>nf(v*100,0)+"%":undefined,yfmt:s.fmt==="pct"?v=>nf(v*100,0)+"%":undefined,max:s.max});
  if(s.type==="lines")return chartLines(s.series.map((x,i)=>({name:x.name,color:x.color||[COL.brand,COL.warn,COL.ok,COL.bad][i%4],pts:x.pts,dots:true})),{title:s.title,xlabel:s.xlabel,ylabel:s.ylabel,xticks:s.xticks,ymax:s.ymax,ymin:s.ymin,xmin:s.xmin,xmax:s.xmax});
  if(s.type==="hist")return chartHist(s.values,{title:s.title,xlabel:s.xlabel,bins:s.bins,mean:s.mean,median:s.median});
  if(s.type==="scatter")return chartScatter(s.points,{title:s.title,xlabel:s.xlabel,ylabel:s.ylabel,line:s.line});
  if(s.type==="normal")return chartNormal(s);
  return "";
}
