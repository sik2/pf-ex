const content = window.portfolioContent;
const $ = (s) => document.querySelector(s);
const dialog = $('#detail');
let lastFocus;
function openDetail(label, title, sections) {
 lastFocus=document.activeElement;
 $('#detail-label').textContent=label;
 const body=$('#detail-body'); body.replaceChildren();
 const heading=document.createElement('h2'); heading.textContent=title; body.append(heading);
 sections.forEach(s=>{const section=document.createElement('section');const h=document.createElement('h3');h.textContent=s.title;const p=document.createElement('p');p.textContent=s.text;section.append(h,p);body.append(section)});
 dialog.showModal(); document.body.classList.add('modal-open');
}
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastFocus?.focus()});
function renderProjects(filter='all') {
 $('#projects').innerHTML=content.projects.filter(p=>filter==='all'||p.category===filter).map(p=>`<button class="project" data-project="${p.id}" aria-label="${p.title} 프로젝트 상세 보기"><div class="project-visual ${p.visual}">${p.visual==='booking'?`<div class="mini-app"><div class="mini-side"><b>예약노트<span>·</span></b><small>Overview</small><i class="selected">예약 관리</i><i>고객 목록</i><i>설정</i></div><div class="mini-main"><div class="mini-top">예약 관리 <span>+ 새 예약</span></div><div class="mini-date">이번 주 일정 <span>‹　›</span></div><div class="calendar"><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><b>12</b><b>13</b><b class="today">14</b><b>15</b><b>16</b></div><div class="mini-row"><i></i><div>오전 상담<small>10:00 — 11:00</small></div><em>예약 확정</em></div><div class="mini-row"><i></i><div>프로젝트 미팅<small>14:00 — 15:00</small></div><em>예약 확정</em></div></div></div>`:`<div class="flow-board"><div class="flow-top"><span class="flow-symbol">↳</span><span>REPORT FLOW<small>반복 작업을 연결합니다</small></span><i>WORKFLOW</i></div><div class="flow-line"><span>▤<small>자료 입력</small></span><b>→</b><span>≋<small>형식 검사</small></span><b>→</b><span class="flow-end">✓<small>보고서 생성</small></span></div><div class="flow-bottom"><i></i> 데이터 입력부터 결과 검토까지</div></div>`}<span class="visual-label">INTERFACE CONCEPT</span></div><div class="project-meta"><span>${p.type}</span><span>↗</span></div><h3>${p.title}</h3><p>${p.subtitle}</p><div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div></button>`).join('');
 document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>{const p=content.projects.find(p=>p.id===b.dataset.project);openDetail('PROJECT / 구성 예시',p.title,[{title:'문제',text:p.problem},{title:'관찰과 조사',text:p.research},{title:'해결 방향',text:p.solution},{title:'검증할 내용',text:p.validation}])}));
}
renderProjects();
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});renderProjects(b.dataset.filter)}));
$('#notes').innerHTML=content.notes.map((n,i)=>`<button class="note" data-note="${i}"><span class="note-category">${n.category}</span><div><h3>${n.title}</h3><p>${n.summary}</p></div><span class="note-arrow">↗</span></button>`).join('');
document.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>{const n=content.notes[Number(b.dataset.note)];openDetail('FIELD NOTE / 예시 기록',n.title,[{title:n.category,text:n.body}])}));

let savedTheme;try{savedTheme=localStorage.getItem('portfolio-theme')}catch{}
function setTheme(theme){document.documentElement.dataset.theme=theme;$('.theme').setAttribute('aria-label',theme==='dark'?'밝은 테마로 변경':'어두운 테마로 변경')}
setTheme(savedTheme||'light');
$('.theme').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(next);try{localStorage.setItem('portfolio-theme',next)}catch{}});
$('#brief-form').addEventListener('submit',e=>{e.preventDefault();const subject=$('#subject').value.trim();const message=$('#message').value.trim();if(!subject||!message){$('#form-status').textContent='작업 제목과 현재 상황을 입력해 주세요.';return}const blob=new Blob([`문의 내용\n\n작업: ${subject}\n\n현재 상황과 원하는 변화\n${message}\n`],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='project-brief.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#form-status').textContent='문의 내용을 파일로 저장했습니다. 실제 전송은 하지 않았습니다.'});
