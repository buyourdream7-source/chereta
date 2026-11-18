(function(){
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function fmt(n){return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2})}
function dt(ts){return ts?new Date(ts).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'-'}
function d0(ts){return ts?new Date(ts).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'-'}
var ME=null, TAB='dashboard', CACHE={}, F={};
var NAV=[['dashboard','Dashboard'],['branches','Branches'],['lots','Lots'],['orders','Sales and payments'],['bidders','Bidders'],['posts','News and tenders'],['staff','Administrators'],['settings','Settings'],['audit','Activity log']];
var ERR={bad_login:'Wrong username or password.',too_many:'Too many attempts. Wait a few minutes.',suspended:'Account suspended.',username_taken:'That username is already used.',bad_username:'Username needs 3 to 30 characters (letters, numbers, dot, dash) and at least one letter.',bad_password:'Password needs 8 or more characters.',bad_name:'Enter a name (2 or more characters).',bad_title:'Title is too short.',bad_input:'Please check the values entered.',has_lots:'This branch has lots. Suspend it instead of deleting.',forbidden:'Not allowed.',self:'You cannot do that to your own account.',not_found:'Not found.',closed:'That lot is already closed.',server:'Something went wrong.'};
function API(m,u,b){return fetch(u,{method:m,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Requested-With':'chereta'},body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(!r.ok){var e=new Error(j.error||'server');e.code=j.error||'server';e.status=r.status;throw e}return j})})}
function em(e){return ERR[e.code]||('Error: '+e.code)}
var tt;function toast(m,bad){var t=$('#toast');t.textContent=m;t.className='toast show'+(bad?' bad':'');clearTimeout(tt);tt=setTimeout(function(){t.className='toast'},2800)}
function modal(html){$('#mbox').innerHTML=html;$('#modal').hidden=false;var f=$('#mbox input,#mbox textarea,#mbox select');if(f)f.focus()}
function closeModal(){$('#modal').hidden=true;$('#mbox').innerHTML=''}
function tag(t,c){return '<span class="tag'+(c?' '+c:'')+'">'+esc(t)+'</span>'}
function stTag(s){var m={active:'ok',open:'gold',sold:'ok',paid:'ok',collected:'ok',suspended:'bad',cancelled:'bad',unsold:'bad',defaulted:'bad',awaiting_payment:'gold'};return tag(String(s).replace('_',' '),m[s]||'')}

/* ---------- boot ---------- */
function boot(){API('GET','/api/state').then(function(st){
  if(st.me&&st.me.role==='admin'){ME=st.me;$('#login').hidden=true;$('#app').hidden=false;$('#who').textContent=ME.name+' ('+ME.username+')';buildNav();go(TAB);if(ME.mustChange)changePw(true)}
  else{$('#app').hidden=true;$('#login').hidden=false;if(st.me){$('#lerr').textContent='This page is for Commission administrators only.'}}
},function(){$('#login').hidden=false})}
$('#lf').addEventListener('submit',function(e){e.preventDefault();$('#lerr').textContent='';
  API('POST','/api/login',{identifier:$('#lu').value.trim(),password:$('#lp').value}).then(function(r){if(r.user.role!=='admin'){return API('POST','/api/logout').then(function(){$('#lerr').textContent='This page is for Commission administrators only.'})}$('#lp').value='';boot()},function(x){$('#lerr').textContent=em(x)})});
$('#out').onclick=function(){API('POST','/api/logout').then(function(){location.reload()})};
$('#chpw').onclick=function(){changePw(false)};
$('#burger').onclick=function(){$('#side').classList.toggle('open')};
$('#modal').addEventListener('mousedown',function(e){if(e.target===this&&!this.hasAttribute('data-lock'))closeModal()});
function buildNav(){$('#nav').innerHTML=NAV.map(function(n){return '<button data-tab="'+n[0]+'"'+(n[0]===TAB?' aria-current="page"':'')+'>'+n[1]+'</button>'}).join('')}
$('#nav').addEventListener('click',function(e){var b=e.target.closest('[data-tab]');if(b){go(b.getAttribute('data-tab'));$('#side').classList.remove('open')}});
function go(t){TAB=t;buildNav();var n=NAV.filter(function(x){return x[0]===t})[0];$('#title').textContent=n[1];var ta=$('#topact');ta.hidden=true;ta.onclick=null;$('#main').innerHTML='<p class="note">Loading...</p>';VIEWS[t]()}
function guard(p){return p.catch(function(e){if(e.status===401||e.status===403){location.reload()}else toast(em(e),true);throw e})}
function topAct(label,fn){var b=$('#topact');b.textContent=label;b.hidden=false;b.onclick=fn}
function table(cols,rows,empty){if(!rows.length)return '<div class="tw"><div class="empty">'+(empty||'Nothing here yet.')+'</div></div>';
  return '<div class="tw"><table><thead><tr>'+cols.map(function(c){return '<th'+(c[1]?' class="num"':'')+'>'+c[0]+'</th>'}).join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>'}

/* ---------- dashboard ---------- */
function kpi(l,v,s){return '<div class="kpi"><small>'+l+'</small><b>'+v+'</b>'+(s?'<span>'+s+'</span>':'')+'</div>'}
var VIEWS={
dashboard:function(){guard(API('GET','/api/admin/overview')).then(function(o){
  var max=Math.max.apply(null,o.byBranch.map(function(b){return b.value}).concat([1]));
  $('#main').innerHTML='<div class="cards">'+kpi('Branches',o.activeBranches+' / '+o.branches,'active / total')+kpi('Registered bidders',fmt(o.bidders))+kpi('Open lots',fmt(o.openLots),o.liveLots+' live')+kpi('Listed value (ETB)',fmt(o.listedValue),'initial prices')+
   kpi('Lots sold',fmt(o.soldLots),o.unsold+' closed unsold')+kpi('Sales value (ETB)',fmt(o.soldValue),'winning bids')+kpi('Buyer fees collected (ETB)',fmt(o.fees),'Commission income from paid sales')+kpi('Awaiting payment',fmt(o.awaiting),fmt(o.awaitingValue)+' ETB; fees due '+fmt(o.feesDue))+'</div>'+
   '<div class="two"><div class="panel"><h3>Sales by branch</h3>'+(o.byBranch.length?o.byBranch.map(function(b){return '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;gap:8px"><span>'+esc(b.name)+(b.status!=='active'?' '+tag('suspended','bad'):'')+'</span><b>'+fmt(b.value)+' ETB</b></div><div class="bar"><i style="width:'+Math.round(b.value*100/max)+'%"></i></div><span class="note">'+b.open+' open, '+b.sold+' sold</span></div>'}).join(''):'<p class="note">No branches yet. Add the first one under Branches.</p>')+'</div>'+
   '<div class="panel"><h3>Closing soon</h3>'+(o.closingSoon.length?o.closingSoon.map(function(l){return '<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line)"><span>'+esc(l.title)+'<br><span class="note">'+esc(l.org||'')+' &middot; '+esc(l.id)+'</span></span><span class="note" style="white-space:nowrap">'+dt(l.end_at)+'</span></div>'}).join(''):'<p class="note">No open lots.</p>')+'</div></div>'})},

/* ---------- branches ---------- */
branches:function(){topAct('Add branch',addBranch);guard(API('GET','/api/admin/branches')).then(function(r){CACHE.branches=r.branches;
  $('#main').innerHTML='<p class="note" style="margin-top:0">Each branch signs in at the public site (menu: For customs branches) with the username and password you create here.</p>'+
  table([['Branch'],['Username'],['Status'],['Lots',1],['Open',1],['Last sign-in'],['']],r.branches.map(function(b){
   return '<tr><td><b>'+esc(b.name)+'</b></td><td>'+esc(b.username)+'</td><td>'+stTag(b.status)+'</td><td class="num">'+b.lots+'</td><td class="num">'+b.open+'</td><td>'+dt(b.lastLogin)+'</td><td><div class="acts"><button data-ba="rename" data-id="'+b.id+'">Rename</button><button data-ba="reset" data-id="'+b.id+'">Reset password</button><button data-ba="'+(b.status==='active'?'suspend':'activate')+'" data-id="'+b.id+'" class="'+(b.status==='active'?'d':'')+'">'+(b.status==='active'?'Suspend':'Activate')+'</button><button class="d" data-ba="del" data-id="'+b.id+'">Delete</button></div></td></tr>'}),'No branches yet. Tap Add branch to create the first login.')})},
lots:function(){guard(API('GET','/api/admin/lots')).then(function(r){CACHE.lots=r.lots;drawLots()})},
orders:function(){topAct('Export CSV',function(){location.href='/api/admin/orders.csv'});guard(API('GET','/api/admin/orders')).then(function(r){
  $('#main').innerHTML=table([['Lot'],['Branch'],['Buyer'],['Winning bid',1],['Fee',1],['Total',1],['Due'],['Status']],r.orders.map(function(o){return '<tr><td><b>'+esc(o.title)+'</b><br><span class="note">'+esc(o.lotId)+'</span></td><td>'+esc(o.branch)+'</td><td>'+esc(o.buyer)+'<br><span class="note">+251 '+esc(o.buyerPhone)+'</span></td><td class="num">'+fmt(o.amount)+'</td><td class="num">'+fmt(o.fee)+'</td><td class="num">'+fmt(o.total)+'</td><td>'+d0(o.dueAt)+'</td><td>'+stTag(o.status)+'</td></tr>'}),'No sales yet. Orders appear here when lots close with a winner.')})},
bidders:function(){guard(API('GET','/api/admin/users?role=bidder')).then(function(r){
  $('#main').innerHTML=table([['Name'],['Phone'],['Status'],['Lots bid on',1],['Registered'],['Last sign-in'],['']],r.users.map(function(u){return '<tr><td><b>'+esc(u.name)+'</b></td><td>+251 '+esc(u.phone||u.username)+'</td><td>'+stTag(u.status)+'</td><td class="num">'+(u.bids||0)+'</td><td>'+d0(u.createdAt)+'</td><td>'+dt(u.lastLogin)+'</td><td><div class="acts"><button data-ua="reset" data-id="'+u.id+'">Reset password</button><button data-ua="'+(u.status==='active'?'suspend':'activate')+'" data-id="'+u.id+'" class="'+(u.status==='active'?'d':'')+'">'+(u.status==='active'?'Suspend':'Activate')+'</button></div></td></tr>'}),'No bidders have registered yet.')})},
staff:function(){topAct('Add administrator',addStaff);guard(API('GET','/api/admin/users?role=admin')).then(function(r){
  $('#main').innerHTML='<p class="note" style="margin-top:0">Administrators can control everything in the system. Add only trusted Commission staff.</p>'+table([['Name'],['Username'],['Status'],['Last sign-in'],['']],r.users.map(function(u){return '<tr><td><b>'+esc(u.name)+'</b></td><td>'+esc(u.username)+'</td><td>'+stTag(u.status)+'</td><td>'+dt(u.lastLogin)+'</td><td><div class="acts">'+(u.id===ME.id?'<span class="note">You</span>':'<button data-ua="reset" data-id="'+u.id+'">Reset password</button><button data-ua="'+(u.status==='active'?'suspend':'activate')+'" data-id="'+u.id+'" class="'+(u.status==='active'?'d':'')+'">'+(u.status==='active'?'Suspend':'Activate')+'</button>')+'</div></td></tr>'}))})},
posts:function(){topAct('New post',addPost);Promise.all([guard(API('GET','/api/state')),guard(API('GET','/api/admin/branches'))]).then(function(a){CACHE.branches=a[1].branches;var ps=a[0].posts;
  $('#main').innerHTML=table([['Type'],['Title'],['Branch / ref'],['Closes'],['Posted'],['']],ps.map(function(p){return '<tr><td>'+tag(p.kind==='tender'?'Tender':'News',p.kind==='tender'?'gold':'')+'</td><td><b>'+esc(p.title)+'</b></td><td>'+esc((p.org_id&&(CACHE.branches.filter(function(b){return b.id===p.org_id})[0]||{}).name)||'')+' '+esc(p.ref||'')+'</td><td>'+d0(p.closes_at)+'</td><td>'+d0(p.created_at)+'</td><td><div class="acts"><button class="d" data-pa="del" data-id="'+p.id+'">Delete</button></div></td></tr>'}),'No news or tenders yet.')})},
settings:function(){guard(API('GET','/api/admin/settings')).then(function(r){var s=r.settings;
  function f(k,l,t,h){return '<label for="s_'+k+'">'+l+'</label>'+(t==='ta'?'<textarea class="inp" id="s_'+k+'">'+esc(s[k]||'')+'</textarea>':'<input class="inp" id="s_'+k+'" value="'+esc(s[k]||'')+'">')+(h?'<span class="note">'+h+'</span>':'')}
  $('#main').innerHTML='<div class="two"><div class="panel"><h3>Money rules</h3>'+f('buyerFeePercent','Buyer fee (% of winning bid)',0,'Added on top of the winning bid. This is the Commission\'s platform income.')+f('depositPercent','Deposit (% of initial price)',0,'Shown to bidders and included in the invoice.')+f('paymentDays','Days to pay after winning',0)+f('antiSnipeMinutes','Anti-sniping extension (minutes)',0,'A live bid in the last minutes extends the closing time by this much. 0 turns it off.')+f('payInstructions','Payment instructions shown to winners',"ta")+'</div>'+
   '<div class="panel"><h3>Site identity and contact</h3>'+f('brandName','Site name',0)+f('supportPhone','Support phone',0)+f('supportEmail','Support email',0)+f('supportAddress','Head office address',0)+'</div></div><button class="btn" id="savesettings">Save settings</button>'})},
audit:function(){guard(API('GET','/api/admin/audit')).then(function(r){$('#main').innerHTML=table([['When'],['Who'],['Action'],['Target'],['Detail']],r.entries.map(function(e){return '<tr><td style="white-space:nowrap">'+dt(e.ts)+'</td><td>'+esc(e.actor)+'</td><td>'+esc(e.action)+'</td><td>'+esc(e.target)+'</td><td>'+esc(e.detail)+'</td></tr>'}),'No activity yet.')})}
};

function drawLots(){
  var q=(F.lotq||'').toLowerCase(), st=F.lotst||'all';
  var rows=CACHE.lots.filter(function(l){return (st==='all'||l.status===st)&&(!q||(l.title+' '+l.id+' '+(l.org||'')).toLowerCase().indexOf(q)>=0)});
  $('#main').innerHTML='<div class="tbar"><input class="inp" id="lotq" placeholder="Search title, lot number or branch" value="'+esc(F.lotq||'')+'"><select class="inp" id="lotst" style="max-width:180px">'+['all','open','sold','unsold','cancelled'].map(function(s){return '<option'+(s===st?' selected':'')+' value="'+s+'">'+(s==='all'?'All statuses':s)+'</option>'}).join('')+'</select><span class="note">'+rows.length+' lots</span></div>'+
  table([['Lot'],['Branch'],['Type'],['Status'],['Price',1],['Bidders',1],['Closes'],['Winner'],['']],rows.map(function(l){return '<tr><td><b>'+esc(l.title)+'</b><br><span class="note">'+esc(l.id)+'</span></td><td>'+esc(l.org)+'</td><td>'+esc(l.mode)+'</td><td>'+stTag(l.status)+(l.note?'<br><span class="note">'+esc(l.note)+'</span>':'')+'</td><td class="num">'+fmt(l.status==='sold'?l.finalPrice:l.price)+'</td><td class="num">'+l.bidders+'</td><td>'+dt(l.end)+'</td><td>'+esc(l.winner||'-')+'</td><td><div class="acts"><button data-la="bids" data-id="'+esc(l.id)+'">Bids</button>'+(l.status==='open'?'<button data-la="extend" data-id="'+esc(l.id)+'">Extend</button><button class="d" data-la="cancel" data-id="'+esc(l.id)+'">Cancel</button>':'')+'</div></td></tr>'}),'No lots match.');
  var q2=$('#lotq');if(q2&&F.focus){q2.focus();q2.setSelectionRange(q2.value.length,q2.value.length)}
}
document.addEventListener('input',function(e){if(e.target.id==='lotq'){F.lotq=e.target.value;F.focus=1;drawLots()}});
document.addEventListener('change',function(e){if(e.target.id==='lotst'){F.lotst=e.target.value;F.focus=0;drawLots()}});

/* ---------- modals ---------- */
function mform(title,body,okLabel,onOk,extra){
  modal('<h2>'+title+'</h2>'+body+'<div class="err" id="merr"></div><div class="mbtns"><button class="btn ghost" data-m="cancel">Cancel</button><button class="btn'+(extra==='danger'?' danger':'')+'" id="mok">'+okLabel+'</button></div>');
  $('#mok').onclick=function(){var b=this;b.disabled=true;Promise.resolve(onOk()).then(function(){b.disabled=false},function(e){b.disabled=false;$('#merr').textContent=(e&&e.code)?em(e):(e&&e.message)||''})};
  $('#mbox').onkeydown=function(e){if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();$('#mok').click()}};
}
function showCred(title,name,user,pw){
  modal('<h2>'+title+'</h2><p class="note">Give these details to the person. The password is shown only now, so copy it before closing.</p><div class="cred">'+(name?'Name: '+esc(name)+'<br>':'')+'Username: '+esc(user)+'<br>Password: '+esc(pw)+'<br>Sign in at: '+esc(location.origin)+'/</div><div class="mbtns"><button class="btn ghost" id="cpy">Copy</button><button class="btn" data-m="cancel">Done</button></div>');
  $('#cpy').onclick=function(){var t=(name?'Name: '+name+'\n':'')+'Username: '+user+'\nPassword: '+pw+'\nSign in at: '+location.origin+'/';(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('Copied')},function(){toast('Select the text and copy it',true)})}
}
function genpw(){var a='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789',o='',r=new Uint32Array(12);crypto.getRandomValues(r);for(var i=0;i<12;i++)o+=a[r[i]%a.length];return o}
function addBranch(){mform('Add a branch','<label for="bn">Branch name</label><input class="inp" id="bn" placeholder="e.g. Kality Customs Branch"><label for="bu">Username</label><input class="inp" id="bu" autocapitalize="none" placeholder="e.g. kality"><label for="bp">Password</label><input class="inp" id="bp" value="'+genpw()+'"><span class="note">Auto-generated. You can type your own (8 or more characters).</span>','Create branch',function(){
  var name=$('#bn').value.trim(),u=$('#bu').value.trim(),p=$('#bp').value;return guard(API('POST','/api/admin/branches',{name:name,username:u,password:p})).then(function(r){toast('Branch created');showCred('Branch created',r.name,r.username,r.password);go('branches')})})}
function addStaff(){mform('Add an administrator','<label for="an">Full name</label><input class="inp" id="an"><label for="au">Username</label><input class="inp" id="au" autocapitalize="none"><label for="ap">Temporary password</label><input class="inp" id="ap" value="'+genpw()+'"><span class="note">They must change it at first sign-in.</span>','Create administrator',function(){
  return guard(API('POST','/api/admin/users',{name:$('#an').value.trim(),username:$('#au').value.trim(),password:$('#ap').value})).then(function(r){showCred('Administrator created',r.name,r.username,r.password);go('staff')})})}
function addPost(){var bo='<option value="">All / Commission</option>'+(CACHE.branches||[]).map(function(b){return '<option value="'+b.id+'">'+esc(b.name)+'</option>'}).join('');
  mform('New post','<label for="pk">Type</label><select class="inp" id="pk"><option value="news">News</option><option value="tender">Tender</option></select><label for="pt">Title</label><input class="inp" id="pt"><label for="pb">Text</label><textarea class="inp" id="pb"></textarea><label for="po">Branch (tenders)</label><select class="inp" id="po">'+bo+'</select><label for="pr">Reference (tenders)</label><input class="inp" id="pr"><label for="pc">Closing date (tenders)</label><input class="inp" type="date" id="pc">','Publish',function(){
  var c=$('#pc').value;return guard(API('POST','/api/admin/posts',{kind:$('#pk').value,title:$('#pt').value.trim(),body:$('#pb').value.trim(),orgId:$('#po').value||null,ref:$('#pr').value.trim(),closesAt:c?new Date(c+'T23:59:00').getTime():null})).then(function(){closeModal();toast('Published');go('posts')})})}
function changePw(force){mform(force?'Choose a new password':'Change password',(force?'<p class="note">This account uses a temporary password. Set your own now.</p>':'')+'<label for="cp1">Current password</label><input class="inp" id="cp1" type="password" autocomplete="current-password"><label for="cp2">New password (8 or more characters)</label><input class="inp" id="cp2" type="password" autocomplete="new-password">','Save',function(){
  return guard(API('POST','/api/password',{current:$('#cp1').value,next:$('#cp2').value})).then(function(){closeModal();toast('Password changed')},function(e){if(e.code==='bad_login'||e.code==='forbidden')throw {code:'bad_login'};throw e})});
  if(force)$('#modal').setAttribute('data-lock','1');else $('#modal').removeAttribute('data-lock')}

document.addEventListener('click',function(e){
  var t=e.target;
  if(t.closest('[data-m="cancel"]')){closeModal();return}
  var b=t.closest('[data-ba]');if(b){var id=Number(b.getAttribute('data-id')),a=b.getAttribute('data-ba'),br=CACHE.branches.filter(function(x){return x.id===id})[0];
    if(a==='suspend'||a==='activate')guard(API('PATCH','/api/admin/branches/'+id,{status:a==='suspend'?'suspended':'active'})).then(function(){toast(a==='suspend'?'Branch suspended; its lots are hidden':'Branch activated');go('branches')});
    else if(a==='rename')mform('Rename branch','<label for="rn">Branch name</label><input class="inp" id="rn" value="'+esc(br.name)+'">','Save',function(){return guard(API('PATCH','/api/admin/branches/'+id,{name:$('#rn').value.trim()})).then(function(){closeModal();go('branches')})});
    else if(a==='reset')mform('Reset password for '+esc(br.name),'<label for="rp">New password</label><input class="inp" id="rp" value="'+genpw()+'"><span class="note">The branch is signed out everywhere.</span>','Reset',function(){return guard(API('PATCH','/api/admin/branches/'+id,{resetPassword:true,password:$('#rp').value})).then(function(r){showCred('Password reset',br.name,br.username,r.password)})});
    else if(a==='del')mform('Delete '+esc(br.name)+'?','<p>This removes the branch login permanently. A branch that has lots cannot be deleted; suspend it instead.</p>','Delete',function(){return guard(API('DELETE','/api/admin/branches/'+id)).then(function(){closeModal();toast('Branch deleted');go('branches')})},'danger');return}
  var u=t.closest('[data-ua]');if(u){var uid=Number(u.getAttribute('data-id')),ua=u.getAttribute('data-ua');
    if(ua==='suspend'||ua==='activate')guard(API('PATCH','/api/admin/users/'+uid,{status:ua==='suspend'?'suspended':'active'})).then(function(){toast('Updated');go(TAB)});
    else mform('Reset password','<label for="rp">New password</label><input class="inp" id="rp" value="'+genpw()+'">','Reset',function(){return guard(API('PATCH','/api/admin/users/'+uid,{resetPassword:true,password:$('#rp').value})).then(function(r){showCred('Password reset','','(unchanged username)',r.password)})});return}
  var p=t.closest('[data-pa]');if(p){mform('Delete this post?','<p>It disappears from the public site.</p>','Delete',function(){return guard(API('DELETE','/api/admin/posts/'+p.getAttribute('data-id'))).then(function(){closeModal();go('posts')})},'danger');return}
  var l=t.closest('[data-la]');if(l){var lid=l.getAttribute('data-id'),la=l.getAttribute('data-la');
    if(la==='bids')guard(API('GET','/api/admin/lots/'+encodeURIComponent(lid)+'/bids')).then(function(r){modal('<h2>Bids on '+esc(lid)+'</h2>'+(r.bids.length?'<div class="tw" style="margin-top:10px"><table><thead><tr><th>Bidder</th><th>Phone</th><th class="num">Amount</th><th>Receipt</th><th>Time</th></tr></thead><tbody>'+r.bids.map(function(x){return '<tr><td>'+esc(x.name)+'</td><td>'+esc(x.phone||'')+'</td><td class="num">'+fmt(x.amount)+'</td><td>'+esc(x.ref||'')+'</td><td>'+dt(x.created_at)+'</td></tr>'}).join('')+'</tbody></table></div>':'<p class="note">No bids.</p>')+'<div class="mbtns"><button class="btn" data-m="cancel">Close</button></div>')});
    else if(la==='extend')mform('Extend '+esc(lid),'<label for="eh">Extra hours</label><input class="inp" id="eh" inputmode="numeric" value="24">','Extend',function(){return guard(API('POST','/api/admin/lots/'+encodeURIComponent(lid)+'/extend',{hours:Number($('#eh').value)})).then(function(){closeModal();toast('Extended');go('lots')})});
    else mform('Cancel '+esc(lid)+'?','<label for="cr">Reason (shown in the log)</label><input class="inp" id="cr" placeholder="e.g. Goods released to owner"><p class="note">Bids on this lot are void. This cannot be undone.</p>','Cancel lot',function(){return guard(API('POST','/api/admin/lots/'+encodeURIComponent(lid)+'/cancel',{reason:$('#cr').value.trim()||undefined})).then(function(){closeModal();toast('Lot cancelled');go('lots')})},'danger');return}
  if(t.id==='savesettings'){var body={};['buyerFeePercent','depositPercent','paymentDays','antiSnipeMinutes','payInstructions','brandName','supportPhone','supportEmail','supportAddress'].forEach(function(k){var el=$('#s_'+k);if(el)body[k]=/Percent|Days|Minutes/.test(k)?Number(el.value):el.value});
    guard(API('PUT','/api/admin/settings',body)).then(function(){toast('Settings saved')});return}
});
boot();
})();
