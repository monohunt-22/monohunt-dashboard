'use strict';
(() => {
 const teams=[['research','企画班'],['a','A班'],['b','B班'],['c','C班']];
 const labels={unconfirmed:'未確認',in_progress:'作業中',waiting:'待機・確認待ち',blocked:'問題あり',completed:'完了'};
 const fields=['schema_version','team_id','updated_at','status','task','progress','last_report','issues','source_urls'];
 const state=new Map(teams.map(([id])=>[id,{report:null,error:false}]));
 const dateFormat=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
 let running=false,lastSignature='',lastFetch=null;
 function text(tag,value,className){const e=document.createElement(tag);e.textContent=value;if(className)e.className=className;return e;}
 function validUrl(value){try{const u=new URL(value);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password;}catch{return false;}}
 function validate(r,id){
  if(!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).length!==fields.length||fields.some(k=>!Object.hasOwn(r,k))||r.schema_version!==1||r.team_id!==id||!Object.hasOwn(labels,r.status))throw Error('Invalid team report');
  for(const [key,max] of [['task',160],['progress',500],['last_report',2000]])if(r[key]!==null&&(typeof r[key]!=='string'||!r[key].trim()||[...r[key]].length>max))throw Error('Invalid report text');
  for(const [key,max,length] of [['issues',10,500],['source_urls',5,1000]])if(!Array.isArray(r[key])||r[key].length>max||r[key].some(v=>typeof v!=='string'||!v.trim()||[...v].length>length))throw Error('Invalid report list');
  if(r.source_urls.some(v=>!validUrl(v)))throw Error('Invalid source URL');
  if(r.updated_at===null){if(r.status!=='unconfirmed'||['task','progress','last_report'].some(k=>r[k]!==null)||r.issues.length||r.source_urls.length)throw Error('Unreported team has activity');}
  else if(typeof r.updated_at!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(r.updated_at)||!Number.isFinite(Date.parse(r.updated_at))||Date.parse(r.updated_at)>Date.now()+300000||r.status==='unconfirmed'||['task','progress','last_report'].some(k=>!r[k]))throw Error('Invalid reporting time or status');
  return r;
 }
 function old(r){return r&&r.updated_at&&Date.now()-Date.parse(r.updated_at)>86400000;}
 function reported(r){return !!(r&&r.updated_at);}
 function status(s){if(!reported(s.report))return '未確認';if(old(s.report))return '現在は未確認';return '報告：'+labels[s.report.status];}
 function render(){
  const signature=JSON.stringify([...state])+teams.map(([id])=>old(state.get(id).report)).join();
  if(signature===lastSignature)return;lastSignature=signature;
  const details=document.getElementById('team-report-list'),activity=document.getElementById('team-activity');
  details.replaceChildren();activity.replaceChildren();
  const known=[];
  for(const [id,name] of teams){
   const s=state.get(id),r=s.report,hasReport=reported(r);
   const row=document.querySelector('.team-row[data-team="'+id+'"]');
   row.querySelector('.team-task').textContent=hasReport?r.task:'報告は未確認';
   row.querySelector('em').textContent=status(s)+(s.error&&hasReport?'・前回取得':'');
   document.querySelector('.station[data-team="'+id+'"] .speech p').textContent=hasReport?status(s):'報告は未確認です。';
   const card=text('article','', 'team-report');card.dataset.team=id;
   const heading=text('h3',name);heading.append(text('span',status(s),'report-badge'));card.append(heading);
   const dl=document.createElement('dl');
   for(const [label,value] of [['担当作業',hasReport?r.task:'未確認'],['進捗',hasReport?r.progress:'未確認'],['最終報告',hasReport?r.last_report:'未確認'],['更新日時',hasReport?dateFormat.format(new Date(r.updated_at))+' JST':'未確認'],['問題点',hasReport?(r.issues.length?r.issues.join('\n'):'報告上の問題点なし'):'未確認']]){dl.append(text('dt',label),text('dd',value));}
   card.append(dl);
   if(s.error)card.append(text('p',hasReport?'取得失敗のため、前回取得できた報告を表示しています。':'報告を取得できないため未確認です。','report-error'));
   if(old(r))card.append(text('p','最終報告から24時間以上経過しています。現在の状況は未確認です。','report-note'));
   if(hasReport){
    const sources=text('p','', 'report-sources');
    r.source_urls.forEach((url,index)=>{const a=text('a','根拠 '+(index+1));a.href=url;a.target='_blank';a.rel='noopener noreferrer';sources.append(a);});
    if(r.source_urls.length)card.append(sources);
    known.push({name,report:r,error:s.error});
   }
   details.append(card);
  }
  known.sort((a,b)=>Date.parse(b.report.updated_at)-Date.parse(a.report.updated_at));
  if(!known.length)activity.append(text('p','保存済みの報告は未確認です。','activity-empty'));
  for(const item of known){const entry=text('article','', 'report-activity');entry.append(text('strong',item.name+'｜'+labels[item.report.status]));const time=text('time',dateFormat.format(new Date(item.report.updated_at))+' JST');time.dateTime=item.report.updated_at;entry.append(time,text('p',item.report.last_report));if(item.error)entry.append(text('small','前回取得した報告'));activity.append(entry);}
 }
 function connection(){
  const count=teams.filter(([id])=>reported(state.get(id).report)).length;
  document.getElementById('progress-summary').textContent=count+'班の報告';
  const errors=teams.filter(([id])=>state.get(id).error).map(([,name])=>name);
  const message=errors.length?'取得失敗：'+errors.join('・')+'。前回取得の情報と未確認を区別しています。':'GitHub報告を30秒ごとに取得｜最終取得 '+dateFormat.format(lastFetch)+' JST｜報告あり '+count+'/4班';
  document.getElementById('progress-connection-status').textContent=message;
 }
 async function refresh(){
  if(running||document.hidden)return;running=true;
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
  try{
   const results=await Promise.allSettled(teams.map(async([id])=>{
    const url=new URL('progress/teams/'+id+'.json',document.baseURI);url.searchParams.set('_',String(Date.now()));
    const response=await fetch(url,{cache:'no-store',credentials:'omit',signal:controller.signal});
    if(!response.ok)throw Error('Report unavailable');const payload=await response.text();if(payload.length>20000)throw Error('Report too large');return validate(JSON.parse(payload),id);
   }));
   results.forEach((result,index)=>{const s=state.get(teams[index][0]);if(result.status==='fulfilled'){s.report=result.value;s.error=false;}else s.error=true;});
   lastFetch=new Date();render();connection();
  }finally{clearTimeout(timeout);running=false;}
 }
 function poll(){refresh().catch(()=>{document.getElementById('progress-connection-status').textContent='連携表示を更新できません。報告は未確認として確認してください。';});}
 render();poll();setInterval(poll,30000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});
 window.addEventListener('online',poll);
})();
