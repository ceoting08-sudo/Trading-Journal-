const KEY="tradingJournal_v1";
let trades=JSON.parse(localStorage.getItem(KEY)||"[]");
const $=id=>document.getElementById(id);
$("date").value=new Date().toISOString().slice(0,10);

function money(n){return new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2}).format(n)}
function save(){localStorage.setItem(KEY,JSON.stringify(trades));render()}
function render(){
  const n=trades.length, wins=trades.filter(t=>t.result==="WIN").length;
  const totalR=trades.reduce((s,t)=>s+Number(t.r),0);
  const profit=trades.reduce((s,t)=>s+Number(t.profit),0);
  $("trades").textContent=n;
  $("winrate").textContent=(n?(wins/n*100):0).toFixed(1)+"%";
  $("totalR").textContent=totalR.toFixed(2)+" R";
  $("profitFcfa").textContent=money(profit);
  $("avgR").textContent=(n?totalR/n:0).toFixed(2)+" R";
  const ws=trades.filter(t=>t.r>0).map(t=>Number(t.r)), ls=trades.filter(t=>t.r<0).map(t=>Number(t.r));
  const aw=ws.length?ws.reduce((a,b)=>a+b,0)/ws.length:0;
  const al=ls.length?ls.reduce((a,b)=>a+b,0)/ls.length:0;
  $("avgWin").textContent=aw.toFixed(2)+" R";
  $("avgLoss").textContent=al.toFixed(2)+" R";
  $("expectancy").textContent=(n?totalR/n:0).toFixed(2)+" R";
  const tbody=$("history"); tbody.innerHTML="";
  [...trades].reverse().forEach((t,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${t.date}<br>${t.time}</td><td>${t.asset}</td><td>${t.direction}</td><td>${t.result}</td><td>${Number(t.r).toFixed(2)} R</td><td><button class="delete" data-i="${trades.length-1-i}">✕</button></td>`;
    tbody.appendChild(tr);
  });
  $("empty").style.display=n?"none":"block";
  document.querySelectorAll(".delete").forEach(b=>b.onclick=()=>{trades.splice(Number(b.dataset.i),1);save()});
}
$("tradeForm").addEventListener("submit",e=>{
 e.preventDefault();
 const r=Number($("realizedR").value||0), risk=Number($("risk").value||0);
 trades.push({
  id:Date.now(),date:$("date").value,time:$("time").value,asset:$("asset").value.trim(),
  session:$("session").value,tf:$("tf").value,direction:$("direction").value,risk,
  plannedRR:Number($("plannedRR").value||0),result:$("result").value,r,
  profit:r*risk*600,setup:$("setup").value.trim(),rules:$("rules").value,
  mental:$("mental").value,lesson:$("lesson").value.trim()
 });
 e.target.reset();$("asset").value="XAUUSD";$("date").value=new Date().toISOString().slice(0,10);save();
 alert("Trade enregistré ✅");
});
$("clearBtn").onclick=()=>{if(confirm("Effacer définitivement tous les trades enregistrés sur cet appareil ?")){trades=[];save()}};
$("exportBtn").onclick=()=>{
 if(!trades.length){alert("Aucun trade à exporter.");return}
 const headers=["Date","Heure","Actif","Session","Timeframe","Direction","Risque USD","RR prévu","Résultat","R réalisé","Profit FCFA","Setup","Règles","État mental","Leçon"];
 const rows=trades.map(t=>[t.date,t.time,t.asset,t.session,t.tf,t.direction,t.risk,t.plannedRR,t.result,t.r,t.profit,t.setup,t.rules,t.mental,t.lesson]);
 const csv=[headers,...rows].map(row=>row.map(x=>`"${String(x??"").replaceAll('"','""')}"`).join(";")).join("\n");
 const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="trading-journal.csv";a.click();URL.revokeObjectURL(a.href);
};
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
render();