const $=id=>document.getElementById(id);
const cfg=window.CURE_CONFIG||{};
const messagesEl=$("messages"), input=$("messageInput"), form=$("chatForm");
let selectedModel=cfg.MODEL||"Qwen/Qwen3.8-27B:novita";
let history=JSON.parse(localStorage.getItem("cure_history")||"[]");

function toast(t){const x=$("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2400)}
function addMessage(role,text,save=true){
  const d=document.createElement("div"); d.className="msg "+role; d.textContent=text; messagesEl.appendChild(d); messagesEl.scrollTop=messagesEl.scrollHeight;
  if(save){history.push({role:role==="user"?"user":"assistant",content:text});localStorage.setItem("cure_history",JSON.stringify(history.slice(-30)))}
}
function resetChat(){messagesEl.innerHTML="";history=[];localStorage.removeItem("cure_history");addMessage("ai","Hello! 👋 I'm Cure AI. How can I help you today?",false)}
function loadHistory(){messagesEl.innerHTML="";if(!history.length){addMessage("ai","Hello! 👋 I'm Cure AI. How can I help you today?",false);return}history.forEach(m=>addMessage(m.role==="user"?"user":"ai",m.content,false))}
function setPrompt(p){input.value=p;input.focus();input.style.height="auto";input.style.height=input.scrollHeight+"px";document.querySelector(".chat-panel").scrollIntoView({behavior:"smooth",block:"center"})}

async function sendMessage(text){
  text=text.trim();if(!text)return;
  addMessage("user",text);input.value="";input.style.height="auto";
  const thinking=document.createElement("div");thinking.className="msg ai";thinking.textContent="Cure AI is thinking…";messagesEl.appendChild(thinking);messagesEl.scrollTop=messagesEl.scrollHeight;
  try{
    const res=await fetch(cfg.API_URL||"/api/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:selectedModel,messages:history.slice(-20)})
    });
    let data={};try{data=await res.json()}catch{}
    thinking.remove();
    if(!res.ok)throw new Error(data?.error||("Server error: HTTP "+res.status));
    const answer=data?.answer;
    if(!answer)throw new Error("No response returned by the AI.");
    addMessage("ai",answer);
  }catch(e){thinking.remove();addMessage("error","API error: "+e.message)}
}

form.addEventListener("submit",e=>{e.preventDefault();sendMessage(input.value)});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
input.addEventListener("input",()=>{input.style.height="auto";input.style.height=Math.min(input.scrollHeight,120)+"px"});
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>setPrompt(b.dataset.prompt)));

document.querySelectorAll(".model").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".model").forEach(x=>x.classList.remove("selected"));
  b.classList.add("selected");selectedModel=b.dataset.model;toast("Model selected: "+selectedModel)
}));

$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("themeBtn").addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("cure_theme",document.body.classList.contains("light")?"light":"dark")});
if(localStorage.getItem("cure_theme")==="light")document.body.classList.add("light");

document.querySelectorAll('[data-action="new"]').forEach(x=>x.addEventListener("click",resetChat));
$("imageBtn").addEventListener("click",()=>setPrompt("Create a detailed image prompt for "));
$("micBtn").addEventListener("click",()=>{
  if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){toast("Voice input is not supported in this browser.");return}
  const R=window.SpeechRecognition||window.webkitSpeechRecognition,r=new R();r.lang="en-IN";
  r.onresult=e=>setPrompt(input.value+e.results[0][0].transcript);r.start();toast("Listening…")
});
$("fileInput").addEventListener("change",e=>{const f=e.target.files[0];if(f){setPrompt("I uploaded a file named "+f.name+". Help me analyze it.");toast(f.name+" selected")}});
$("upgradeBtn").onclick=$("upgradeBtn2").onclick=()=>toast("Cure AI Pro is ready for your future payment integration.");
document.querySelectorAll('[data-action="image"]').forEach(x=>x.addEventListener("click",()=>setPrompt("Create an image prompt for ")));
document.querySelectorAll('[data-action="file"]').forEach(x=>x.addEventListener("click",()=>toast("Choose a file using the paperclip button.")));
document.querySelectorAll('[data-action="voice"]').forEach(x=>x.addEventListener("click",()=>$("micBtn").click()));
loadHistory();
