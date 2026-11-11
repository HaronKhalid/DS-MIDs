/* Start-up: build navigation, topic cards, charts inside lessons, lesson links, progress, open the page from the URL */
buildNav();setupTopics();addTopicLinks();
$$(".chart-slot").forEach(el=>{try{el.innerHTML=chartFromSpec(JSON.parse(el.dataset.chart))}catch(e){el.innerHTML='<p class="muted">Chart could not be drawn.</p>'}});
$$("[data-lab]").forEach(b=>b.onclick=()=>{store.set("ds-lab",b.dataset.lab);go("labs")});
/* Python blocks: VS Code colours everywhere, plus Copy and Run on the blocks inside the lessons */
pgDecorateLessons();pyPaintBlocks();
new MutationObserver(()=>pyPaintBlocks()).observe($("main"),{childList:true,subtree:true});
progress();
go((location.hash||"#home").slice(1));
