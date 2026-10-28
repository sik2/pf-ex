(() => {
 const list=document.querySelector('#news-list');
 const status=document.querySelector('#news-status');
 const updated=document.querySelector('#news-updated');
 const select=document.querySelector('#news-date');
 let currentRequest=0;
 const format=value=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
 const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text)node.textContent=text;return node};
 const safeURL=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null}catch{return null}};
 async function read(name){const response=await fetch(`data/news/${name}.json`,{cache:'no-cache'});if(!response.ok)throw Error('News unavailable');return response.json()}
 function render(edition){
  if(!Array.isArray(edition.items)||!Number.isFinite(Date.parse(edition.generated_at)))throw Error('Invalid news data');
  list.replaceChildren();
  for(const item of edition.items){
   const url=safeURL(item.url);if(!url||!Number.isFinite(Date.parse(item.published_at)))continue;
   const article=element('article','news-article');
   const meta=element('div','news-meta');
   const time=element('time','',format(item.published_at));time.dateTime=item.published_at;
   meta.append(element('span','news-category',item.category),element('span','',item.source),time);
   const heading=element('h3');const link=element('a','',item.title_ko||item.title);link.href=url;link.target='_blank';link.rel='noopener noreferrer';heading.append(link);
   const summary=element('p','',item.summary||(item.title_ko?'원문에서 자세한 내용을 확인하세요.':item.excerpt)||'원문에서 자세한 내용을 확인하세요.');
   const kind=element('span','news-kind',item.summary_kind==='ai'?'한국어 AI 요약 · RSS 기준':item.summary_kind==='translated'?'한국어 번역 · RSS 기준':'출처 제공 내용 발췌');
   const source=element('a','news-source-link','원문 읽기 ↗');source.href=url;source.target='_blank';source.rel='noopener noreferrer';
   const translated=element('a','news-source-link news-translate','한국어로 원문 읽기 ↗');translated.href='https://translate.google.com/translate?sl=auto&tl=ko&u='+encodeURIComponent(url);translated.target='_blank';translated.rel='noopener noreferrer';
   article.append(meta,heading,summary,kind,element('br'),source,translated);list.append(article);
  }
  if(!list.children.length)list.append(element('p','news-empty','해당 날짜에 표시할 뉴스가 없습니다.'));
  updated.textContent=`수집 시각 ${format(edition.generated_at)} KST`;
 }
 async function load(name='latest',manual=false){
  const request=++currentRequest;status.textContent='뉴스를 불러오는 중입니다.';status.classList.remove('warning');
  try{
   const [edition,health]=await Promise.all([read(name),read('status').catch(()=>null)]);
   if(request!==currentRequest)return;
   render(edition);
   const messages=[`${edition.items.length}개의 글 · ${edition.date} 수집본`];
   if(name==='latest'&&Date.now()-Date.parse(edition.generated_at)>36*3600000)messages.push('마지막 수집 후 시간이 지났습니다.');
   if(health&&!health.ok){messages.push('최근 수집에 실패해 이전 수집본을 표시합니다.');status.classList.add('warning')}
   else if(health?.sources?.some(s=>!s.ok)){messages.push('일부 출처를 수집하지 못했습니다.');status.classList.add('warning')}
   if(health?.warnings?.length)messages.push('AI 요약을 완료하지 못한 글은 출처 발췌문으로 표시합니다.');
   status.textContent=messages.join(' · ');
   if(!manual&&[...select.options].some(o=>o.value===edition.date))select.value=edition.date;
  }catch{
   if(request!==currentRequest)return;
   status.classList.add('warning');status.textContent=location.protocol==='file:'?'뉴스를 보려면 로컬 미리보기 서버로 접속해 주세요.':'뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
   if(!list.children.length)list.append(element('p','news-empty','수집된 뉴스가 아직 없거나 연결을 확인할 수 없습니다.'));
  }
 }
 async function start(){
  try{const index=await read('index');select.replaceChildren();
   const latest=element('option','','최신 수집본');latest.value='latest';select.append(latest);
   for(const edition of index.editions||[]){if(!/^\d{4}-\d{2}-\d{2}$/.test(edition.date))continue;const option=element('option','',`${edition.date} · ${edition.count}개`);option.value=edition.date;select.append(option)}
   select.disabled=false;
  }catch{select.replaceChildren();const option=element('option','','최신 수집본');option.value='latest';select.append(option)}
  await load();
 }
 select.addEventListener('change',()=>{const name=select.value;if(name==='latest'||/^\d{4}-\d{2}-\d{2}$/.test(name))load(name,true)});
 start();
})();
