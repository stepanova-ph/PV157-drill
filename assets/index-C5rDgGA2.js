(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const d of n.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function o(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(t){if(t.ep)return;t.ep=!0;const n=o(t);fetch(t.href,n)}})();let y=[],i=[],c=0,g="sequential",l=[],v=0,a={showCategories:!0,showAnswerCount:!0,showStats:!0,saveStats:!0};function A(e,s){if(!a.saveStats)return;const o=E();o[e]||(o[e]={correct:0,wrong:0}),s?o[e].correct++:o[e].wrong++,q(o)}function E(){const e=localStorage.getItem("pv157_stats");return e?JSON.parse(e):{}}function q(e){localStorage.setItem("pv157_stats",JSON.stringify(e))}function $(){localStorage.removeItem("pv157_stats")}function b(e){return E()[e]||{correct:0,wrong:0}}function p(){localStorage.setItem("pv157_settings",JSON.stringify(a))}function O(){const e=localStorage.getItem("pv157_settings");e&&(a={...a,...JSON.parse(e)})}function f(){const e=Array.from(document.querySelectorAll("#category-filters input:checked")).map(t=>t.value),s=Array.from(document.querySelectorAll('input[name="type-filter"]:checked')).map(t=>t.value),o=document.getElementById("filter-wrong").checked,r=parseInt(document.getElementById("wrong-threshold").value)||2;i=y.filter(t=>!(!t.categories.some(n=>e.includes(n))||!s.includes(t.type)||o&&b(t.id).wrong<r)),g==="random"?I():v=0,c=0,i.length>0?m():B()}function I(){l=Array.from({length:i.length},(e,s)=>s);for(let e=l.length-1;e>0;e--){const s=Math.floor(Math.random()*(e+1));[l[e],l[s]]=[l[s],l[e]]}}function m(){if(i.length===0){B();return}const e=g==="random"?l[c]:c,s=i[e],o=b(s.id),r=document.getElementById("question-container"),t=[];if(a.showCategories&&t.push(`<span class="badge">${s.categories.join(", ")}</span>`),a.showAnswerCount){const n=s.answers.filter(d=>d.right).length;t.push(`<span class="badge">${n} správné</span>`)}a.showStats&&(o.correct>0||o.wrong>0)&&(t.push(`<span class="stat-correct">✓ ${o.correct}</span>`),t.push(`<span class="stat-wrong">✗ ${o.wrong}</span>`)),r.innerHTML=`
    <div class="question-card">
      ${t.length>0?`<div class="question-meta">${t.join(" ")}</div>`:""}
      
      <h2 class="question-text">${s.name}</h2>
      
      <form class="answers-form" id="answers-form">
        ${s.answers.map((n,d)=>`
          <label class="answer-option" data-index="${d}">
            <input 
              type="${s.type==="single"?"radio":"checkbox"}" 
              name="answer" 
              value="${d}"
            >
            <span>${n.body}</span>
          </label>
        `).join("")}
      </form>
      
      <div class="question-actions">
        <button class="btn btn-primary" id="btn-evaluate">Vyhodnotit odpověď</button>
        <button class="btn" id="btn-show-answer">Zobrazit odpověď</button>
      </div>
      
      <div class="feedback" id="feedback"></div>
    </div>
  `,document.getElementById("btn-evaluate").addEventListener("click",S),document.getElementById("btn-show-answer").addEventListener("click",C),k()}function S(){const e=document.getElementById("answers-form"),s=Array.from(e.querySelectorAll("input:checked")).map(n=>parseInt(n.value));if(s.length===0){alert("Vyber alespoň jednu odpověď!");return}const o=g==="random"?l[c]:c,r=i[o],t=x(r,s);A(r.id,t),M(r,s,t),e.querySelectorAll("input").forEach(n=>n.disabled=!0),document.getElementById("btn-evaluate").disabled=!0,document.getElementById("btn-show-answer").disabled=!0}function C(){const e=g==="random"?l[c]:c,o=i[e].answers.map((t,n)=>t.right?n:-1).filter(t=>t!==-1),r=document.getElementById("answers-form");r.querySelectorAll(".answer-option").forEach((t,n)=>{o.includes(n)&&t.classList.add("answer-correct")}),r.querySelectorAll("input").forEach(t=>t.disabled=!0),document.getElementById("btn-evaluate").disabled=!0,document.getElementById("btn-show-answer").disabled=!0}function x(e,s){const o=e.answers.map((n,d)=>n.right?d:-1).filter(n=>n!==-1),r=new Set(s),t=new Set(o);return r.size===t.size&&[...r].every(n=>t.has(n))}function M(e,s,o){const r=e.answers.map((u,h)=>u.right?h:-1).filter(u=>u!==-1),t=document.getElementById("feedback"),n=r.map(u=>e.answers[u].body).join(", ");t.innerHTML=`
    <div class="feedback-box ${o?"feedback-correct":"feedback-wrong"}">
      ${o?"✓ Správně!":"✗ Špatně"}
      ${o?"":`<div class="feedback-detail">Správné odpovědi: ${n}</div>`}
    </div>
  `,document.getElementById("answers-form").querySelectorAll(".answer-option").forEach((u,h)=>{const L=s.includes(h),w=r.includes(h);w&&u.classList.add("answer-correct"),L&&!w&&u.classList.add("answer-wrong")})}function B(){document.getElementById("question-container").innerHTML=`
    <div class="info">
      <p>❌ Žádné otázky nevyhovují filtru.</p>
      <p>Zkus změnit nastavení filtrů.</p>
    </div>
  `,k()}function j(){const e=document.getElementById("answers-form");if(e&&!e.querySelector("input:disabled")&&Array.from(e.querySelectorAll("input:checked")).map(o=>parseInt(o.value)).length>0){S();return}c<i.length-1&&(c++,m())}function z(){c>0&&(c--,m())}function k(){const e=document.getElementById("counter");e.textContent=`${c+1} / ${i.length}`,document.getElementById("btn-prev").disabled=c===0||i.length===0,document.getElementById("btn-next").disabled=c>=i.length-1||i.length===0}function N(){const e=document.getElementById("order-select").value;e!==g&&(e==="random"?(v=c,I(),c=0):c=v,g=e,m())}function T(){document.getElementById("settings-panel").classList.add("active")}function Q(){document.getElementById("settings-panel").classList.remove("active")}function _(){document.getElementById("setting-show-categories").checked=a.showCategories,document.getElementById("setting-show-answer-count").checked=a.showAnswerCount,document.getElementById("setting-show-stats").checked=a.showStats,document.getElementById("setting-save-stats").checked=a.saveStats}function F(){document.getElementById("setting-show-categories").addEventListener("change",e=>{a.showCategories=e.target.checked,p(),m()}),document.getElementById("setting-show-answer-count").addEventListener("change",e=>{a.showAnswerCount=e.target.checked,p(),m()}),document.getElementById("setting-show-stats").addEventListener("change",e=>{a.showStats=e.target.checked,p(),m()}),document.getElementById("setting-save-stats").addEventListener("change",e=>{a.saveStats=e.target.checked,p()})}async function H(){try{y=await(await fetch("../data/questions.json")).json(),console.log(`✅ Loaded ${y.length} questions`),O(),_();const s=[...new Set(y.flatMap(r=>r.categories))].sort(),o=document.getElementById("category-filters");o.innerHTML=s.map(r=>`
      <label><input type="checkbox" value="${r}" checked> ${r}</label>
    `).join(""),document.getElementById("btn-settings").addEventListener("click",T),document.getElementById("btn-close-settings").addEventListener("click",Q),document.getElementById("btn-clear-stats").addEventListener("click",()=>{confirm("Opravdu smazat všechny statistiky?")&&($(),m())}),document.getElementById("btn-prev").addEventListener("click",z),document.getElementById("btn-next").addEventListener("click",j),document.getElementById("order-select").addEventListener("change",N),o.querySelectorAll("input").forEach(r=>{r.addEventListener("change",f)}),document.querySelectorAll('input[name="type-filter"]').forEach(r=>{r.addEventListener("change",f)}),document.getElementById("filter-wrong").addEventListener("change",f),document.getElementById("wrong-threshold").addEventListener("change",f),F(),f()}catch(e){console.error("Failed to load questions:",e),document.getElementById("question-container").innerHTML=`
      <div class="info error">
        <p>❌ Chyba při načítání otázek</p>
        <p>Zkontroluj konzoli pro více informací.</p>
      </div>
    `}}H();
