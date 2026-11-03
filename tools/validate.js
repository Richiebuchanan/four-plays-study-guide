// node validate.js  -> checks every data/*.js against schema
const fs=require('fs'),path=require('path'),vm=require('vm');
const dir=path.join(__dirname,'..','data');let bad=0;
function err(f,m){console.log('  ✗ '+f+': '+m);bad++;}
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.js'))){
  const ctx={window:{}};vm.createContext(ctx);
  try{vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx);}catch(e){err(f,'syntax '+e.message);continue;}
  const id=f.replace('.js','');const p=ctx.window.PLAYS&&ctx.window.PLAYS[id];
  if(!p){err(f,'no PLAYS["'+id+'"]');continue;}
  const need=['title','author','year','edition','context','sections','characters','themes','symbols','craft','vocab','quotes','whoSaid','timeline','themeMatch','flashcards','quizzes','examQuestions','essayPrompts','watch'];
  need.forEach(k=>{if(p[k]==null)err(f,'missing '+k)});
  if(id==='salesman'&&!p.presentMemory)err(f,'missing presentMemory');
  const mc=(q,where)=>{if(!q.q||!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.why)err(f,'bad MC '+where+': '+(q.q||'').slice(0,40));};
  (p.sections||[]).forEach(s=>{['id','label','where','summary','why'].forEach(k=>{if(!s[k])err(f,'section '+s.id+' missing '+k)});
    const qs=p.quizzes&&p.quizzes[s.id];if(!qs||qs.length<3)err(f,'quiz <3 for '+s.id);else qs.forEach(q=>mc(q,s.id));});
  (p.examQuestions||[]).forEach(q=>mc(q,'exam'));
  ((p.watch||{}).after||{quiz:[]}).quiz.forEach(q=>mc(q,'watch'));
  (p.whoSaid||[]).forEach(w=>{if(!w.line||w.options.length!==4||w.answer<0||w.answer>3)err(f,'bad whoSaid')});
  (p.themeMatch||[]).forEach(w=>{if(w.options.length!==4||w.answer<0||w.answer>3)err(f,'bad themeMatch')});
  (p.essayPrompts||[]).forEach(e=>{['id','prompt','targetWords','rubricFocus','thesisStarters','modelOutline','modelParagraph','annotation','checklist'].forEach(k=>{if(!e[k])err(f,'essay '+e.id+' missing '+k)})});
  const wc=s=>s.split(/\s+/).length;
  (p.quotes||[]).forEach(q=>{if(id!=='trifles'&&wc(q.text)>12)err(f,'quote >12 words: '+q.text)});
  (p.whoSaid||[]).forEach(q=>{if(id!=='trifles'&&wc(q.line)>14)err(f,'whoSaid line >14 words: '+q.line)});
  // answer position balance
  const all=[].concat(...Object.values(p.quizzes||{}),p.examQuestions||[]);const c=[0,0,0,0];all.forEach(q=>c[q.answer]++);
  console.log(f+': sections='+(p.sections||[]).length+' quizQs='+all.length+' flash='+(p.flashcards||[]).length+' quotes='+(p.quotes||[]).length+' ans-dist='+c.join('/'));
  if(all.length&&c[0]/all.length>0.4)err(f,'answer index 0 over 40%');
}
console.log(bad?('\n'+bad+' problems'):'\nAll good');process.exit(bad?1:0);
