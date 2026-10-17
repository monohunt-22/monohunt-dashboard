'use strict';
(() => {
 const office=document.getElementById('office'), reference=document.getElementById('reference-image'), compare=document.getElementById('reference-toggle');
 // Whole character images stay still; message selection never starts animation.
 compare.addEventListener('click',()=>{reference.hidden=!reference.hidden;document.querySelector('.scene-caption').textContent=reference.hidden?'演出デモ・実際の稼働とは非連動':'A案原本：画像内の数値や作業は参考例';compare.setAttribute('aria-pressed',String(!reference.hidden));compare.textContent=reference.hidden?'A案原本と比較':'編集室に戻る';});
 const messages={relax:'ひと息ついて、次のアイデアへ。\n落ち着いた編集室です。',normal:'みんなで、ひとつずつ丁寧に。\n良い記事を届けましょう。',busy:'少しテンポを上げて集中。\n確認はひとつずつ、確実に。',overload:'忙しいときこそ、丁寧に。\n品質を大切に進めましょう。'};
 document.querySelectorAll('.modes button').forEach(b=>b.addEventListener('click',()=>{office.dataset.mode=b.dataset.mode;document.getElementById('mode-message').innerText=messages[b.dataset.mode];document.querySelectorAll('.modes button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});}));
 function clock(){document.getElementById('clock').textContent=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date());}clock();setInterval(clock,30000);
 const key='monohunt-office-personal-tasks-v1',list=document.getElementById('task-list');let tasks=[];
 function storageError(){document.getElementById('storage-status').textContent='保存を利用できないため、この画面内のみのメモです。';}
 try{const s=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(s))tasks=s.filter(t=>t&&typeof t.text==='string'&&typeof t.done==='boolean').slice(0,100).map(t=>({text:t.text.slice(0,100),done:t.done}));}catch{storageError();}
 function save(){try{localStorage.setItem(key,JSON.stringify(tasks));}catch{storageError();}}
 function render(){list.replaceChildren();document.getElementById('tasks-empty').hidden=tasks.length>0;tasks.forEach((t,i)=>{const li=document.createElement('li'),label=document.createElement('label'),input=document.createElement('input'),text=document.createElement('span'),remove=document.createElement('button');input.type='checkbox';input.checked=t.done;text.textContent=t.text;input.addEventListener('change',()=>{t.done=input.checked;save();});label.append(input,text);remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',t.text+'を削除');remove.addEventListener('click',()=>{tasks.splice(i,1);save();render();});li.append(label,remove);list.append(li);});}
 document.getElementById('task-form').addEventListener('submit',e=>{e.preventDefault();const input=document.getElementById('new-task'),text=input.value.trim();if(!text||tasks.length>=100)return;tasks.push({text,done:false});save();render();input.value='';input.focus();});render();
})();
