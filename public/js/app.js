(function(){
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

var CFG=window.CHERETA_CONFIG||{};
CFG.brandName=CFG.brandName||'Chereta'; CFG.logo=CFG.logo||''; CFG.depositPercent=5; CFG.buyerFeePercent=0;
CFG.client=CFG.client||{en:'Ethiopian Customs Commission',am:'የኢትዮጵያ ጉምሩክ ኮሚሽን'};

/* ---------- copy ---------- */
var T={
 en:{t_home:'Home',t_browse:'Auctions',t_watch:'Watchlist',t_bids:'My bids',search:'Search lots, lot numbers, branches',all:'All',live:'Live',sealed:'Sealed',
  s_end:'Ending soon',s_low:'Price: low to high',s_high:'Price: high to low',lots:'lots',initial:'Initial price',current:'Current bid',bidders:'bidders',
  lotno:'Lot',closed:'Closed',min_next:'Minimum next bid',min_seal:'Minimum bid',your_bid:'Your bid',place_live:'Place bid',
  place_sealed:'Submit sealed bid',update_sealed:'Update sealed bid',deposit:'Bid security ({dep}%)',dep_note:'Bank-certified cheque or CPO. Returned if you do not win; counted toward the price if you win.',
  sealed_note:'Sealed bid. Nobody sees any amount until the lot closes, then the highest valid bid wins.',history:'Live bids',
  leading:'You are leading',outbid:'You were outbid',submitted:'Sealed bid submitted',ref:'Receipt',watch_t:'Nothing watched yet',watch_d:'Tap the heart on any lot to follow it.',
  bids_t:'No bids yet',bids_d:'Lots you bid on show here with your live status and results.',inspect:'Inspection',inspect_v:'Ask the branch for inspection days',
  type:'Category',office:'Branch',err_live:'Bid at least',err_seal:'Bid at least',done_t:'SEALED',done_c:'Your bid is locked in',close:'Close',
  toast_lead:'You are leading',w_on:'Added to watchlist',w_off:'Removed from watchlist',
  d:'Days',h:'Hours',m:'Min',s:'Sec',my_bid:'Your bid',status_lead:'Leading',status_out:'Outbid',status_sub:'Submitted',none:'No lots match. Try another filter.',o_all:'All branches',
  cat_vehicle:'Vehicles',cat_machinery:'Machinery',cat_electronics:'Electronics',cat_furniture:'Furniture',cat_houses:'Houses',cat_power:'Power',cat_parts:'Parts',cat_goods:'Goods',
  live_n:'{n} live now',soon_n:'{n} closing within 6 hours',see_live:'See live auctions',orgs_t:'Customs branches',orgs_p:'Partner organizations',o_logo:'Change logo',o_logo_rm:'Remove logo',o_logo_ok:'Logo updated',cats_t:'Categories',nt_t:'News & Tenders',n_news:'News',n_tend:'Tenders',nt_none:'Nothing posted yet.',
  see_lots:'See lots',more:'Read more',less:'Show less',tref:'Ref',tclose:'Closes',days_left:'{n} days left',t_closed:'Closed',
  m_home:'Home',m_watch:'My Watchlist',m_about:'About Chereta',m_faq:'FAQ',m_pricing:'Pricing',m_lang:'Language',m_reg:'Register',m_in:'Sign in',m_out:'Sign out',m_terms:'Terms & Conditions',m_tut:'Tutorials',m_priv:'Privacy policy',m_support:'Support',m_account:'My account',m_admin:'Admin console',
  a_reg:'Register',a_in:'Sign in',name:'Full name',phone:'Phone number',username:'Username or phone number',pass:'Password',pass_new:'Choose a password (8 or more characters)',go_in:'Sign in',go_reg:'Create account',
  welcome:'Welcome',signed_out:'Signed out',err_name:'Enter your name.',err_phone:'Enter a valid Ethiopian mobile number, like 912 345 678.',err_pass:'Use at least 8 characters.',err_user:'Enter your username and password.',
  e_bad_login:'Wrong username or password.',e_suspended:'This account is suspended. Contact the Commission.',e_phone_taken:'This phone number already has an account. Sign in instead.',e_too_many:'Too many attempts. Try again in a few minutes.',
  e_closed:'This lot has closed.',e_low_bid:'Your bid is below the minimum.',e_leading:'You are already the highest bidder.',e_bidders_only:'Only bidder accounts can bid.',e_auth_required:'Please sign in first.',e_has_bids:'This lot has bids. Ask the Commission to cancel it.',e_bad_password:'Use at least 8 characters.',e_server:'Something went wrong. Please try again.',e_photo_big:'A photo is too large. Remove it and try a smaller one.',e_bad_photo:'That photo could not be used.',e_forbidden:'You are not allowed to do that.',
  signed_as:'Signed in',guest:'Welcome to Chereta',guest_s:'Sign in to bid and follow lots',
  foot_note:'Auctions of uncleared, seized and abandoned goods.',foot_help:'Help',foot_legal:'Information',
  m_org:'For customs branches',m_portal:'Branch portal',o_cta_t:'Customs branch?',o_cta_d:'Branch accounts are created by the Commission. Sign in with the username and password you were given.',o_note:'Branch accounts are created by the Commission head office. Ask them for your username and password.',
  o_lots:'Lots',o_live:'Live',o_bidders:'Bidders',o_post:'Post a lot',o_mine:'Your lots',o_none_lots:'No lots yet. Post your first lot and every bidder can see it.',o_signout:'Sign out',o_remove:'Remove',o_confirm:'Tap again',o_contact:'Has bids. Ask the Commission.',
  f_title:'Lot title',f_cat:'Category',f_type:'Auction type',f_price:'Initial price (ETB)',f_step:'Minimum raise (ETB)',f_days:'Runs for',f_desc:'Description',f_photos:'Photos (up to 3)',f_add:'Add photo',
  f_publish:'Publish lot',f_days_n:'{n} days',f_err_title:'Enter a lot title.',f_err_price:'Enter an initial price above 0.',f_err_step:'Enter a minimum raise above 0.',f_err_big:'Photos are too large. Remove one.',
  f_posted:'Lot published',f_removed:'Lot removed',back:'Back',brand_sub:'Customs auctions',prepared:'Prepared for',src_uncleared:'Uncleared goods',src_seized:'Seized goods',src_abandoned:'Abandoned goods',f_src:'Goods source',f_ref:'Case or declaration reference',f_duty:'Duty and tax',d_incl:'Included in the winning price',d_buyer:'Paid by the buyer',l_src:'Source',l_ref:'Reference',l_duty:'Duty and tax',
  res_won:'You won',res_lost:'Not won',res_closed:'Closed',res_unsold:'Closed with no bids',res_sold:'Sold for',res_won_t:'You won this lot',res_lost_t:'This lot has closed. Your bid did not win.',res_sold_t:'This lot has closed.',
  pay_due:'Your payment',pay_bid:'Winning bid',pay_fee:'Buyer fee ({fee}%)',pay_total:'Total to pay',pay_by:'Pay by',pay_how:'How to pay',os_awaiting_payment:'Awaiting payment',os_paid:'Paid',os_collected:'Collected',os_defaulted:'Not paid',
  o_orders:'Sales to settle',o_buyer:'Buyer',o_paid:'Mark paid',o_collected:'Mark collected',o_default:'Not paid',o_none_orders:'No sold lots yet.',
  b_noroles:'Branch and administrator accounts cannot bid.',
  ac_cur:'Current password',ac_new:'New password',ac_save:'Change password',ac_done:'Password changed',ac_user:'Username',
  sup_t:'Contact the Commission',sup_none:'Contact details will be shown here by the Commission.',sup_phone:'Phone',sup_email:'Email',sup_addr:'Address'},
 am:{t_home:'መነሻ',t_browse:'ጨረታዎች',t_watch:'ክትትል',t_bids:'ጨረታዬ',search:'ዕጣ፣ የዕጣ ቁጥር ወይም ቅርንጫፍ ፈልግ',all:'ሁሉም',live:'ቀጥታ',sealed:'የታሸገ',
  s_end:'ሊያበቃ የተቃረበ',s_low:'ዋጋ፡ ከዝቅ ወደ ከፍ',s_high:'ዋጋ፡ ከከፍ ወደ ዝቅ',lots:'ዕጣዎች',initial:'መነሻ ዋጋ',current:'የአሁኑ ዋጋ',bidders:'ተጫራቾች',
  lotno:'ዕጣ',closed:'ተዘግቷል',min_next:'ቀጣይ ዝቅተኛ ጨረታ',min_seal:'ዝቅተኛ ጨረታ',your_bid:'ያንተ ጨረታ',place_live:'ጨረታ አስገባ',
  place_sealed:'የታሸገ ጨረታ አስገባ',update_sealed:'የታሸገ ጨረታ አዘምን',deposit:'የጨረታ ማስከበሪያ ({dep}%)',dep_note:'በባንክ የተመሰከረ ቼክ ወይም ሲፒኦ። ካላሸነፉ ይመለሳል፤ ካሸነፉ ከዋጋው ይቀነሳል።',
  sealed_note:'የታሸገ ጨረታ ነው። ዕጣው እስኪዘጋ ድረስ ማንም መጠኑን አያይም፤ ከዚያ ከፍተኛው ትክክለኛ ጨረታ ያሸንፋል።',history:'የቀጥታ ጨረታዎች',
  leading:'እየመራህ ነው',outbid:'ተበልጠሃል',submitted:'የታሸገ ጨረታ ተልኳል',ref:'ደረሰኝ',watch_t:'እስካሁን ምንም አልተከተልክም',watch_d:'ዕጣን ለመከተል የልብ ምልክቱን ንካ።',
  bids_t:'እስካሁን ጨረታ የለም',bids_d:'የጨረታህ ዕጣዎች ከነሁኔታቸው እና ውጤታቸው እዚህ ይታያሉ።',inspect:'ምርመራ',inspect_v:'የምርመራ ቀናትን ከቅርንጫፉ ጠይቅ',
  type:'ምድብ',office:'ቅርንጫፍ',err_live:'ቢያንስ',err_seal:'ቢያንስ',done_t:'ታሽጓል',done_c:'ጨረታህ ተቆልፏል',close:'ዝጋ',
  toast_lead:'እየመራህ ነው',w_on:'ወደ ክትትል ታክሏል',w_off:'ከክትትል ተወግዷል',
  d:'ቀን',h:'ሰዓት',m:'ደቂቃ',s:'ሰከንድ',my_bid:'ያንተ ጨረታ',status_lead:'እየመራህ',status_out:'ተበልጠሃል',status_sub:'ተልኳል',none:'የሚመሳሰል ዕጣ የለም። ሌላ ማጣሪያ ሞክር።',o_all:'ሁሉም ቅርንጫፎች',
  cat_vehicle:'ተሽከርካሪ',cat_machinery:'ማሽነሪ',cat_electronics:'ኤሌክትሮኒክስ',cat_furniture:'የቤት ዕቃ',cat_houses:'ቤቶች',cat_power:'ኃይል',cat_parts:'መለዋወጫ',cat_goods:'ዕቃዎች',
  live_n:'{n} አሁን ቀጥታ',soon_n:'{n} በ6 ሰዓት ውስጥ ይዘጋሉ',see_live:'ቀጥታ ጨረታዎችን ተመልከት',orgs_t:'የጉምሩክ ቅርንጫፎች',orgs_p:'አጋር ድርጅቶች',o_logo:'አርማ ቀይር',o_logo_rm:'አርማ አስወግድ',o_logo_ok:'አርማው ተዘምኗል',cats_t:'ምድቦች',nt_t:'ዜና እና ማስታወቂያ',n_news:'ዜና',n_tend:'ማስታወቂያ',nt_none:'እስካሁን የተለጠፈ የለም።',
  see_lots:'ዕጣዎችን ተመልከት',more:'ተጨማሪ አንብብ',less:'አሳንስ',tref:'ማጣቀሻ',tclose:'የሚዘጋው',days_left:'{n} ቀን ቀርቷል',t_closed:'ተዘግቷል',
  m_home:'መነሻ',m_watch:'የእኔ ክትትል',m_about:'ስለ ጨረታ',m_faq:'ተደጋጋሚ ጥያቄዎች',m_pricing:'ዋጋ',m_lang:'ቋንቋ',m_reg:'ተመዝገብ',m_in:'ግባ',m_out:'ውጣ',m_terms:'ውሎች እና ሁኔታዎች',m_tut:'መማሪያ',m_priv:'የግላዊነት ፖሊሲ',m_support:'ድጋፍ',m_account:'የእኔ መለያ',m_admin:'የአስተዳዳሪ ገጽ',
  a_reg:'ተመዝገብ',a_in:'ግባ',name:'ሙሉ ስም',phone:'ስልክ ቁጥር',username:'የተጠቃሚ ስም ወይም ስልክ ቁጥር',pass:'የይለፍ ቃል',pass_new:'የይለፍ ቃል ምረጥ (8 ወይም ከዚያ በላይ ፊደላት)',go_in:'ግባ',go_reg:'መለያ ክፈት',
  welcome:'እንኳን ደህና መጣህ',signed_out:'ወጥተሃል',err_name:'ስምህን አስገባ።',err_phone:'ትክክለኛ የኢትዮጵያ ሞባይል ቁጥር አስገባ፣ ለምሳሌ 912 345 678።',err_pass:'ቢያንስ 8 ፊደላት ተጠቀም።',err_user:'የተጠቃሚ ስምህን እና የይለፍ ቃልህን አስገባ።',
  e_bad_login:'የተጠቃሚ ስም ወይም የይለፍ ቃል ትክክል አይደለም።',e_suspended:'ይህ መለያ ታግዷል። ኮሚሽኑን አግኝ።',e_phone_taken:'ይህ ስልክ ቁጥር መለያ አለው። በምትኩ ግባ።',e_too_many:'ብዙ ሙከራዎች ተደርገዋል። ከጥቂት ደቂቃ በኋላ ሞክር።',
  e_closed:'ይህ ዕጣ ተዘግቷል።',e_low_bid:'ጨረታህ ከዝቅተኛው በታች ነው።',e_leading:'አስቀድሞ ከፍተኛው ተጫራች አንተ ነህ።',e_bidders_only:'መጫረት የሚችሉት የተጫራች መለያዎች ብቻ ናቸው።',e_auth_required:'መጀመሪያ ግባ።',e_has_bids:'ይህ ዕጣ ጨረታ አለው። ኮሚሽኑ እንዲሰርዘው ጠይቅ።',e_bad_password:'ቢያንስ 8 ፊደላት ተጠቀም።',e_server:'የሆነ ችግር ተፈጥሯል። እንደገና ሞክር።',e_photo_big:'አንድ ፎቶ በጣም ትልቅ ነው። አስወግደህ ትንሽ ሞክር።',e_bad_photo:'ያ ፎቶ ጥቅም ላይ አይውልም።',e_forbidden:'ይህን ማድረግ አይፈቀድም።',
  signed_as:'ገብተሃል',guest:'እንኳን ወደ ጨረታ መጣህ',guest_s:'ለመጫረት እና ዕጣ ለመከተል ግባ',
  foot_note:'ያልተጣሩ፣ የተያዙ እና የተተዉ ዕቃዎች ጨረታ።',foot_help:'እርዳታ',foot_legal:'መረጃ',
  m_org:'ለጉምሩክ ቅርንጫፎች',m_portal:'የቅርንጫፍ ገጽ',o_cta_t:'የጉምሩክ ቅርንጫፍ ነህ?',o_cta_d:'የቅርንጫፍ መለያዎችን ኮሚሽኑ ይፈጥራል። በተሰጠህ የተጠቃሚ ስም እና የይለፍ ቃል ግባ።',o_note:'የቅርንጫፍ መለያዎችን የኮሚሽኑ ዋና መሥሪያ ቤት ይፈጥራል። የተጠቃሚ ስምህን እና የይለፍ ቃልህን ከእነሱ ጠይቅ።',
  o_lots:'ዕጣዎች',o_live:'ቀጥታ',o_bidders:'ተጫራቾች',o_post:'ዕጣ ለጥፍ',o_mine:'ዕጣዎችህ',o_none_lots:'እስካሁን ዕጣ የለም። የመጀመሪያ ዕጣህን ለጥፍ፤ ሁሉም ተጫራች ያየዋል።',o_signout:'ውጣ',o_remove:'አስወግድ',o_confirm:'እንደገና ንካ',o_contact:'ጨረታ አለው። ኮሚሽኑን ጠይቅ።',
  f_title:'የዕጣ ርዕስ',f_cat:'ምድብ',f_type:'የጨረታ ዓይነት',f_price:'መነሻ ዋጋ (ብር)',f_step:'ዝቅተኛ ጭማሪ (ብር)',f_days:'የሚቆይበት',f_desc:'መግለጫ',f_photos:'ፎቶዎች (እስከ 3)',f_add:'ፎቶ ጨምር',
  f_publish:'ዕጣውን አትም',f_days_n:'{n} ቀን',f_err_title:'የዕጣ ርዕስ አስገባ።',f_err_price:'ከ0 በላይ መነሻ ዋጋ አስገባ።',f_err_step:'ከ0 በላይ ዝቅተኛ ጭማሪ አስገባ።',f_err_big:'ፎቶዎቹ በጣም ትላልቅ ናቸው። አንዱን አስወግድ።',
  f_posted:'ዕጣው ታትሟል',f_removed:'ዕጣው ተወግዷል',back:'ተመለስ',brand_sub:'የጉምሩክ ጨረታ',prepared:'የተዘጋጀው ለ',src_uncleared:'ያልተነሱ ዕቃዎች',src_seized:'የተወረሱ ዕቃዎች',src_abandoned:'የተተዉ ዕቃዎች',f_src:'የዕቃው ምንጭ',f_ref:'የጉዳይ ወይም የዲክላራሲዮን ቁጥር',f_duty:'ቀረጥ እና ታክስ',d_incl:'በአሸናፊው ዋጋ ውስጥ ተካቷል',d_buyer:'በገዢው ይከፈላል',l_src:'ምንጭ',l_ref:'ማጣቀሻ',l_duty:'ቀረጥ እና ታክስ',
  res_won:'አሸንፈሃል',res_lost:'አላሸነፍክም',res_closed:'ተዘግቷል',res_unsold:'ያለ ጨረታ ተዘግቷል',res_sold:'የተሸጠበት ዋጋ',res_won_t:'ይህን ዕጣ አሸንፈሃል',res_lost_t:'ይህ ዕጣ ተዘግቷል። ጨረታህ አላሸነፈም።',res_sold_t:'ይህ ዕጣ ተዘግቷል።',
  pay_due:'ክፍያህ',pay_bid:'አሸናፊ ጨረታ',pay_fee:'የገዢ ክፍያ ({fee}%)',pay_total:'የሚከፈል ጠቅላላ',pay_by:'የመክፈያ ቀን',pay_how:'እንዴት እንደሚከፈል',os_awaiting_payment:'ክፍያ የሚጠበቅ',os_paid:'ተከፍሏል',os_collected:'ተረክቧል',os_defaulted:'አልተከፈለም',
  o_orders:'የሚጣሩ ሽያጮች',o_buyer:'ገዢ',o_paid:'ተከፍሏል በል',o_collected:'ተረክቧል በል',o_default:'አልተከፈለም',o_none_orders:'እስካሁን የተሸጠ ዕጣ የለም።',
  b_noroles:'የቅርንጫፍ እና የአስተዳዳሪ መለያዎች መጫረት አይችሉም።',
  ac_cur:'የአሁኑ የይለፍ ቃል',ac_new:'አዲስ የይለፍ ቃል',ac_save:'የይለፍ ቃል ቀይር',ac_done:'የይለፍ ቃል ተቀይሯል',ac_user:'የተጠቃሚ ስም',
  sup_t:'ኮሚሽኑን አግኝ',sup_none:'የመገናኛ መረጃ ኮሚሽኑ ሲያክል እዚህ ይታያል።',sup_phone:'ስልክ',sup_email:'ኢሜይል',sup_addr:'አድራሻ'}
};
var UN={en:{d:'d',h:'h',m:'m',s:'s'},am:{d:'ቀ',h:'ሰ',m:'ደ',s:'ሰከ'}};
var ORG={}, ORGS=[];
var CAT={parts:{h:200,icon:'i-gear'},power:{h:45,icon:'i-power'},vehicle:{h:12,icon:'i-car'},electronics:{h:250,icon:'i-laptop'},goods:{h:160,icon:'i-box'},battery:{h:30,icon:'i-battery'},grid:{h:145,icon:'i-bolt'},furniture:{h:300,icon:'i-sofa'},machinery:{h:215,icon:'i-factory'},houses:{h:95,icon:'i-home'}};
var GROUP={battery:'power',grid:'power'};
var CATS=['vehicle','machinery','electronics','furniture','power','parts','goods'];
var SRCS=['uncleared','seized','abandoned'], DUTIES=['incl','buyer'];
function grp(l){return GROUP[l.cat]||l.cat}
var H=3600000, M=60000, DAY=86400000, LOTS=[];
function byId(id){return LOTS.filter(function(l){return l.id===id})[0]}
function orgName(l){var o=ORG[l.org]; return o?o[S.lang]:''}
function logoURL(id,v){return '/api/logo/'+encodeURIComponent(id)+'?v='+v}
function orgTag(l){var o=ORG[l.org]; if(!o)return ''; return (o.logo?'<img class="olgs" alt="" src="'+logoURL(l.org,o.logo)+'">':'')+o[S.lang]}

/* ---------- state ---------- */
var S={lang:'en',tab:'home',mode:'all',org:'all',cat:'all',sort:'end',q:'',watch:{},bids:{},open:null,nt:'news',openNews:{},
  me:null,settings:{depositPercent:5,buyerFeePercent:0,docFee:400,payInstructions:'',paymentDays:3,extendDays:7,pickupDays:15,complaintDays:3,noLicenceMax:100000,specialMax:300000,minBidders:2},posts:[],off:0,loaded:false,
  pf:{mode:'sealed',photos:[],busy:false},panelFn:null,after:null,authNote:'',auth:{mode:'in',busy:false,name:'',phone:'',user:''},poked:{}};
try{var sv=localStorage.getItem('chereta-lang'); if(sv==='am'||sv==='en')S.lang=sv; S.watch=JSON.parse(localStorage.getItem('chereta-watch')||'{}')||{}}catch(e){}
var TABS=['home','browse','watch','bids'];
function nowMs(){return Date.now()+S.off}
function tr(k){var v=T[S.lang][k]; if(v===undefined)v=T.en[k]; if(v===undefined)v=k; return v.replace('{dep}',CFG.depositPercent).replace('{fee}',CFG.buyerFeePercent)}
function fmt(n){return Number(n).toLocaleString('en-US',{maximumFractionDigits:2})}
function parts(ms){ms=Math.max(0,ms);var s=Math.floor(ms/1000);return{d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60}}
function pad(n){return n<10?'0'+n:''+n}
function short(ms){if(ms<=0)return tr('closed');var p=parts(ms),u=UN[S.lang];return p.d?(p.d+u.d+' '+p.h+u.h+' '+pad(p.m)+u.m):(p.h+u.h+' '+pad(p.m)+u.m+' '+pad(p.s)+u.s)}
function ic(n,c){return '<svg class="ic'+(c?' '+c:'')+'"><use href="#'+n+'"/></svg>'}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function dfmt(ts){return new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
function hueOf(s){var h=0; s=String(s); for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360; return h}
function monoOf(n){var p=String(n).trim().split(/\s+/); return (((p[0]||'?')[0])+(p[1]?p[1][0]:((p[0]||'')[1]||''))).toUpperCase()}
function role(){return S.me?S.me.role:null}

/* ---------- server ---------- */
function API(method,url,body){
  return fetch(url,{method:method,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Requested-With':'chereta'},body:body?JSON.stringify(body):undefined}).then(function(r){
    return r.json().catch(function(){return {}}).then(function(j){if(!r.ok){var e=new Error(j.error||'server'); e.code=j.error||'server'; e.data=j; throw e} return j})})}
function errMsg(e){
  var c=e&&e.code||'server', k='e_'+c, m=T[S.lang][k]||T.en[k]||tr('e_server');
  if(c==='low_bid'&&e.data&&e.data.min)m+=' '+fmt(e.data.min)+' ETB';
  if(c==='notice_short'&&e.data)m+=' '+e.data.min;
  if(c==='special_limit'&&e.data)m+=' '+fmt(e.data.max)+' ETB';
  return m}
function toLot(d){
  var photos=[]; for(var i=0;i<(d.photos||0);i++)photos.push('/api/photo/'+encodeURIComponent(d.id)+'/'+i);
  return {id:d.id,org:String(d.orgId),cat:CAT[d.cat]?d.cat:'goods',mode:d.mode==='live'?'live':'sealed',price:Number(d.price)||0,initial:Number(d.initial)||0,step:Number(d.step)||0,
    bidders:Number(d.bidders)||0,end:Number(d.end)||0,src:SRCS.indexOf(d.src)>=0?d.src:'',ref:esc(d.ref||''),duty:DUTIES.indexOf(d.duty)>=0?d.duty:'',t:{en:esc(d.title),am:esc(d.title)},d:{en:esc(d.desc||''),am:esc(d.desc||'')},
    photos:photos,hist:(d.hist||[]).map(function(h){return {who:esc(h.who),amt:Number(h.amt)||0,mine:!!h.mine}}),leader:d.leader||'other',
    status:d.status||'open',finalPrice:d.finalPrice||0,youWon:!!d.youWon,myBid:d.myBid||null,special:!!d.special,repeat:!!d.repeat,view:esc(d.view||''),security:Number(d.security)||0,tie:!!d.tie,note:esc(d.note||'')}}
function load(){return API('GET','/api/state').then(apply).catch(function(){})}
function apply(st){
  var prev={}; LOTS.forEach(function(l){prev[l.id]=l});
  S.off=(st.now||Date.now())-Date.now(); S.settings=st.settings; S.posts=st.posts||[]; var oldSig=S.entSig; S.me=st.me; S.entChanged=oldSig!==undefined&&oldSig!==entSig(); 
  CFG.depositPercent=st.settings.depositPercent; CFG.buyerFeePercent=st.settings.buyerFeePercent; CFG.brandName=st.settings.brandName||CFG.brandName; applyBrand();
  ORG={}; ORGS=[]; (st.orgs||[]).forEach(function(o){var id=String(o.id), nm=esc(o.name); ORG[id]={en:nm,am:nm,h:hueOf(id),m:monoOf(o.name),kind:o.kind==='organization'?'organization':'branch',logo:o.logo||0,bank:o.bank||'',account:o.account||'',holder:o.holder||'',cpo:o.cpo||'',address:o.address||'',phone:o.phone||'',view:o.view||''}; ORGS.push(id)});
  CFG.siteLogo=st.settings.logo||0;
  LOTS=(st.lots||[]).map(toLot); S.bids={}; LOTS.forEach(function(l){if(l.myBid)S.bids[l.id]={amt:l.myBid.amt,ref:l.myBid.ref}});
  S.entSig=entSig(); var again=S.loaded; S.loaded=true; if(again&&Date.now()-(S.viewAt||0)>2500)view.classList.add('calm');
  var o=S.open&&byId(S.open), po=S.open&&prev[S.open];
  if(S.open){
    if(!o)closeSheet();
    else if(po&&(po.status!==o.status||S.entChanged)){var y=sheet.scrollTop; sheet.innerHTML=sheetHTML(o); sheet.scrollTop=y; tickSheet(true); updStatus(o)}
    else{if(po&&po.price!==o.price)paintPrice(o,po.price,o.price); var h=$('#hist'); if(h)h.innerHTML=histHTML(o); updStatus(o)}
  }else if(S.panelFn&&sheet.classList.contains('open')&&S.panelFn!==authHTML&&S.panelFn!==pfHTML&&S.panelFn!==accountHTML&&S.panelFn!==entryHTML&&S.panelFn!==profHTML&&S.panelFn!==cmpHTML&&S.panelFn!==repHTML){var y2=sheet.scrollTop; sheet.innerHTML=S.panelFn(); sheet.scrollTop=y2}
  if(S.tab==='home')buildHome(); else if(S.tab==='browse'){if($('#count'))renderList()} else renderList();
  updateHeader(); drawerBuild(); counts();
}
var loadT=null; function loadSoon(){clearTimeout(loadT); loadT=setTimeout(load,200)}
function connect(){
  if(!window.EventSource)return setInterval(load,10000);
  var es=new EventSource('/api/events'); es.onmessage=loadSoon; es.onopen=loadSoon;
  setInterval(load,30000); document.addEventListener('visibilitychange',function(){if(!document.hidden)load()});
}

/* ---------- cards ---------- */
function isOpen(l){return l.status==='open'&&l.end>nowMs()}
function statusOf(l){var b=S.bids[l.id]; if(!b)return null;
  if(l.status==='sold')return l.youWon?{c:'good',k:'res_won'}:{c:'bad',k:'res_lost'};
  if(l.status!=='open')return {c:'bad',k:'res_closed'};
  if(l.mode==='live')return l.leader==='you'?{c:'good',k:'status_lead'}:{c:'bad',k:'status_out'};
  return {c:'good',k:'status_sub'}}
function card(l,i,showBid){
  var c=CAT[l.cat], left=l.end-nowMs(), hot=left<H&&isOpen(l), w=!!S.watch[l.id], st=statusOf(l);
  var pill=l.mode==='live'?'<span class="pill live">'+tr('live').toUpperCase()+'</span>':'<span class="pill sealed">'+ic('i-lock')+tr('sealed').toUpperCase()+'</span>';
  var mine=(showBid&&st)?'<div class="mybid"><span>'+tr('my_bid')+' <b>'+fmt(S.bids[l.id].amt)+' ETB</b></span><span class="pill '+st.c+'">'+tr(st.k)+'</span></div>':'';
  var closed=l.status!=='open'||left<=0;
  return '<article class="card" style="--i:'+i+'" data-open="'+l.id+'" tabindex="0">'+
   '<div class="tile'+(l.photos.length?' ph':'')+'" style="--h:'+c.h+'">'+(l.photos.length?'<img alt="" loading="lazy" src="'+l.photos[0]+'">':ic(c.icon))+'</div>'+
   '<div class="info"><div class="org">'+orgTag(l)+'</div><h3>'+l.t[S.lang]+'</h3>'+
   '<div class="meta">'+pill+(l.src?'<span class="src">'+tr('src_'+l.src)+'</span>':'')+'<span>'+l.bidders+' '+tr('bidders')+'</span><span>'+l.id+'</span></div></div>'+
   '<button class="heart" data-heart="'+l.id+'" aria-pressed="'+w+'" aria-label="Watch">'+ic('i-heart')+'</button>'+
   '<div class="foot"><div class="price"><small>'+(l.status==='sold'?tr('res_sold'):l.mode==='live'?tr('current'):tr('initial'))+'</small><b data-price="'+l.id+'">'+fmt(l.status==='sold'?l.finalPrice:l.price)+'</b><i>ETB</i></div>'+
   '<div class="time'+(hot?' hot':'')+'" '+(closed?'':'data-end="'+l.end+'"')+'>'+ic('i-clock')+'<span>'+(closed?tr('closed'):short(left))+'</span></div></div>'+mine+'</article>'}

/* ---------- views ---------- */
var view=$('#view');
function filtered(){
  var q=S.q.trim().toLowerCase();
  var a=LOTS.filter(function(l){
    if(!isOpen(l))return false;
    if(S.mode!=='all'&&l.mode!==S.mode)return false;
    if(S.org!=='all'&&l.org!==S.org)return false;
    if(S.cat!=='all'&&grp(l)!==S.cat)return false;
    if(q){var hay=(l.t.en+' '+l.id+' '+orgName(l)+' '+l.ref).toLowerCase(); if(hay.indexOf(q)<0)return false}
    return true});
  a.sort(function(x,y){return S.sort==='low'?x.price-y.price:S.sort==='high'?y.price-x.price:x.end-y.end});
  return a}
function buildHome(){
  var n=nowMs(), open=LOTS.filter(isOpen), liveN=open.filter(function(l){return l.mode==='live'}).length, soon=open.filter(function(l){return l.end-n<6*H}).length;
  function orgCards(kind){return ORGS.filter(function(o){return ORG[o].kind===kind}).map(function(o,i){var c=open.filter(function(l){return l.org===o}).length, g=ORG[o];
    return '<button class="oc" style="--i:'+i+';--h:'+g.h+'" data-orgfilter="'+o+'"><div class="t2">'+(g.logo?'<img class="lgimg" alt="" src="'+logoURL(o,g.logo)+'">':'<span class="mono">'+g.m+'</span>')+'<span class="cnt">'+c+'</span></div><div class="nm">'+g[S.lang]+'</div><div class="hn">'+tr('see_lots')+ic('i-arrow')+'</div></button>'}).join('')}
  var nB=ORGS.filter(function(o){return ORG[o].kind==='branch'}).length, nP=ORGS.length-nB;
  var cats=CATS.map(function(g,i){var c=open.filter(function(l){return grp(l)===g}).length, k=CAT[g];
    return '<button class="cc" style="--i:'+i+'" data-catfilter="'+g+'"><span class="tile" style="--h:'+k.h+'">'+ic(k.icon)+'</span>'+tr('cat_'+g)+'<small>'+c+'</small></button>'}).join('');
  var r=role(), cta=r==='branch'?['m_portal','']:r==='admin'?['m_admin','']:[ 'o_cta_t','o_cta_d'];
  view.innerHTML=
   '<section class="banner"><div><small>'+tr('t_browse')+'</small><b>'+tr('live_n').replace('{n}',liveN)+'</b><p>'+tr('soon_n').replace('{n}',soon)+'</p><button class="btn-s" data-golive>'+tr('see_live')+'</button></div><div class="orb"><i></i><i></i><i></i>'+ic('i-hammer')+'</div></section>'+
   
   (nB?'<div class="sec"><h2>'+tr('orgs_t')+'</h2><span>'+nB+'</span></div><div class="orgs">'+orgCards('branch')+'</div>':'')+(nP?'<div class="sec"><h2>'+tr('orgs_p')+'</h2><span>'+nP+'</span></div><div class="orgs">'+orgCards('organization')+'</div>':'')+
   '<div class="sec"><h2>'+tr('cats_t')+'</h2></div><div class="cats">'+cats+'</div>'+
   '<div class="sec"><h2>'+tr('nt_t')+'</h2></div>'+
   '<div class="seg-ctl two" id="ntseg"><i style="transform:translateX('+(S.nt==='news'?0:100)+'%)"></i><button data-nt="news" aria-pressed="'+(S.nt==='news')+'">'+tr('n_news')+'</button><button data-nt="tenders" aria-pressed="'+(S.nt==='tenders')+'">'+tr('n_tend')+'</button></div>'+
   '<div class="nlist" id="nlist"></div>';
  renderNT();
}
function renderNT(){
  var el=$('#nlist'); if(!el)return;
  var kind=S.nt==='news'?'news':'tender', src=S.posts.filter(function(p){return p.kind===kind});
  if(!src.length){el.innerHTML='<div class="empty" style="grid-column:1/-1">'+ic(kind==='news'?'i-news':'i-doc')+'<p>'+tr('nt_none')+'</p></div>'; return}
  el.innerHTML=src.map(function(x,i){
    var key=S.nt+x.id, open=!!S.openNews[key], meta, tags='';
    if(kind==='news')meta='<time>'+dfmt(x.created_at)+'</time>';
    else{var og=x.org_id&&ORG[x.org_id]?ORG[x.org_id][S.lang]+' · ':''; meta='<time>'+og+(x.ref?tr('tref')+' '+esc(x.ref):'')+'</time>';
      if(x.closes_at){var dl=Math.ceil((x.closes_at-nowMs())/DAY); tags='<div class="tags"><span class="pill sealed">'+tr('tclose')+' '+dfmt(x.closes_at)+'</span><span class="pill '+(dl<=5?'bad':'good')+'">'+(dl>0?tr('days_left').replace('{n}',dl):tr('t_closed'))+'</span></div>'}}
    return '<article class="ni'+(open?' open':'')+'" style="--i:'+i+'"><div class="hd"><span class="tl">'+ic(kind==='news'?'i-news':'i-doc')+'</span><div style="min-width:0"><h4>'+esc(x.title)+'</h4>'+meta+'</div></div><p>'+esc(x.body)+'</p>'+tags+'<button class="more" data-more="'+key+'">'+(open?tr('less'):tr('more'))+'</button></article>'}).join('');
}
function buildBrowse(){
  var modes=['all','live','sealed'], mi=modes.indexOf(S.mode);
  var chips=(S.cat!=='all'?'<button class="chip" data-catclear aria-pressed="true">'+tr('cat_'+S.cat)+ic('i-close')+'</button>':'')+
    '<button class="chip" data-org="all" aria-pressed="'+(S.org==='all')+'">'+tr('o_all')+'</button>'+ORGS.map(function(o){return '<button class="chip" data-org="'+o+'" aria-pressed="'+(S.org===o)+'">'+ORG[o][S.lang]+'</button>'}).join('');
  view.innerHTML=
   '<label class="search">'+ic('i-search')+'<input id="q" type="search" autocomplete="off" placeholder="'+tr('search')+'" value="'+esc(S.q)+'"></label>'+
   '<div class="row"><div class="seg-ctl" id="modes"><i style="transform:translateX('+(mi*100)+'%)"></i>'+modes.map(function(m){return '<button data-mode="'+m+'" aria-pressed="'+(S.mode===m)+'">'+tr(m)+'</button>'}).join('')+'</div>'+
   '<select class="sort" id="sort" aria-label="Sort"><option value="end">'+tr('s_end')+'</option><option value="low">'+tr('s_low')+'</option><option value="high">'+tr('s_high')+'</option></select></div>'+
   '<div class="chips" id="orgs">'+chips+'</div>'+(S.org!=='all'&&ORG[S.org]?'<div class="bkcard">'+branchBox(ORG[S.org])+'</div>':'')+'<div class="count" id="count"></div><div class="list" id="list"></div>';
  $('#sort').value=S.sort;
  renderList();
}
function renderList(){
  var list=$('#list'); if(!list)return;
  if(S.tab==='browse'){
    var a=filtered();
    $('#count').textContent=a.length+' '+tr('lots');
    list.innerHTML=a.length?a.map(function(l,i){return card(l,i,false)}).join(''):'<div class="empty">'+ic('i-search')+'<p>'+tr('none')+'</p></div>';
  }else if(S.tab==='watch'){
    var w=LOTS.filter(function(l){return S.watch[l.id]});
    list.innerHTML=w.length?w.map(function(l,i){return card(l,i,true)}).join(''):'<div class="empty">'+ic('i-heart')+'<h4>'+tr('watch_t')+'</h4><p>'+tr('watch_d')+'</p></div>';
  }else if(S.tab==='bids'){
    var b=LOTS.filter(function(l){return S.bids[l.id]});
    list.innerHTML=b.length?b.map(function(l,i){return card(l,i,true)}).join(''):'<div class="empty">'+ic('i-hammer')+'<h4>'+tr('bids_t')+'</h4><p>'+tr('bids_d')+'</p></div>';
  }
}
function renderView(anim){
  S.viewAt=Date.now(); view.className='view'; void view.offsetWidth; if(anim)view.className='view enter';
  if(S.tab==='home')buildHome(); else if(S.tab==='browse')buildBrowse(); else {view.innerHTML='<div class="list" id="list" style="margin-top:6px"></div>'; renderList()}
  counts();
}
function goTab(t){S.tab=t; labels(); renderView(true); window.scrollTo({top:0,behavior:'smooth'})}
function counts(){
  try{localStorage.setItem('chereta-watch',JSON.stringify(S.watch))}catch(e){}
  var w=Object.keys(S.watch).length, b=Object.keys(S.bids).length;
  [['d-watch',w],['d-bids',b]].forEach(function(p){var e=$('#'+p[0]); if(!e)return; e.textContent=p[1]; e.classList.toggle('on',p[1]>0)});
}
function initials(){var u=S.me; if(!u)return ''; var p=(u.name||u.username).trim().split(/\s+/); return (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase()}
function updateHeader(){var b=$('#signin'); if(S.me){b.className='signin in'; b.textContent=initials(); b.setAttribute('aria-label',tr('signed_as'))}else{b.className='signin'; b.textContent=tr('m_in'); b.removeAttribute('aria-label')}}
function labels(){
  $$('[data-t]').forEach(function(e){e.textContent=tr(e.getAttribute('data-t'))});
  document.documentElement.lang=S.lang==='am'?'am':'en';
  $$('#dnav [data-tab]').forEach(function(b){b.setAttribute('aria-current',b.getAttribute('data-tab')===S.tab?'page':'false')});
  var lt=$('#langtop'); if(lt){$('i',lt).style.transform='translateX('+(S.lang==='en'?0:100)+'%)'; $$('button',lt).forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-l')===S.lang)})}
  var fc=$('#fclient'); if(fc)fc.textContent=CFG.client[S.lang]; var fy=$('#fyear'); if(fy)fy.textContent='© '+new Date().getFullYear()+' '+CFG.brandName;
  var dn=$('#dn-org'); if(dn)dn.textContent=tr(role()==='branch'?'m_portal':role()==='admin'?'m_admin':'m_org');
  updateHeader(); drawerBuild();
}
function applyBrand(){
  var b=$('.brand'); if(!b)return;
  var src=CFG.siteLogo?logoURL('site',CFG.siteLogo):CFG.logo, cur=$('img',b);
  if(src&&!cur){var im=new Image(); im.alt=''; im.src=src; im.style.cssText='width:38px;height:38px;object-fit:contain;flex:none;border-radius:8px'; var sv=$('svg',b); if(sv)b.replaceChild(im,sv)}
  else if(src&&cur&&cur.getAttribute('src')!==src)cur.src=src;
  var nm=$('b',b); if(nm)nm.textContent=CFG.brandName; document.title=CFG.brandName+' | '+tr('brand_sub');
}

/* ---------- toast / roll ---------- */
var tt; function toast(msg,bad){var t=$('#toast'); t.className='toast show'+(bad?' bad':''); t.innerHTML=ic(bad?'i-close':'i-check')+'<span>'+msg+'</span>'; clearTimeout(tt); tt=setTimeout(function(){t.classList.remove('show')},2800)}
function roll(el,from,to){var t0=performance.now(),dur=700; el.classList.add('bump');
  (function f(t){var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3); el.textContent=fmt(Math.round(from+(to-from)*e)); if(k<1)requestAnimationFrame(f); else setTimeout(function(){el.classList.remove('bump')},250)})(t0)}

/* ---------- drawer (mobile menu and account menu) ---------- */
var drawer=$('#drawer'), dscrim=$('#dscrim');
function drawerBuild(){
  var r=role();
  var items=[['home','i-home','t_home'],['browse','i-grid','t_browse'],['watch','i-heart','t_watch'],['bids','i-hammer','t_bids'],['about','i-info','m_about'],['faq','i-help','m_faq'],['pricing','i-tag','m_pricing'],['support','i-chat','m_support'],['lang'],
    r==='admin'?['admin','i-chart','m_admin']:null, r==='branch'?['org','i-building','m_portal']:null, !r?['org','i-building','m_org']:null,
    r?['account','i-user','m_account']:['register','i-user','m_reg'], r?['signout','i-login','m_out']:['signin','i-login','m_in'],['terms','i-doc','m_terms'],['tutorials','i-play','m_tut'],['privacy','i-shield','m_priv']].filter(Boolean);
  var head=S.me?('<b>'+esc(S.me.name||S.me.username)+'</b><small>'+tr('signed_as')+'</small>'):('<b>'+tr('guest')+'</b><small>'+tr('guest_s')+'</small>');
  drawer.innerHTML='<div class="dhead"><div style="min-width:0">'+head+'</div><button data-act="closemenu" aria-label="'+tr('close')+'">'+ic('i-close')+'</button></div><div class="dlist">'+
   items.map(function(it,i){
     if(it[0]==='lang')return '<div class="langrow" style="--i:'+i+'">'+ic('i-globe')+'<span>'+tr('m_lang')+'</span><div class="seg-ctl two"><i style="transform:translateX('+(S.lang==='en'?0:100)+'%)"></i><button data-l="en" aria-pressed="'+(S.lang==='en')+'">EN</button><button data-l="am" aria-pressed="'+(S.lang==='am')+'">አማ</button></div></div>';
     var cur=TABS.indexOf(it[0])>=0&&S.tab===it[0];
     return '<button class="di'+(cur?' cur':'')+'" style="--i:'+i+'" data-nav="'+it[0]+'">'+ic(it[1])+'<span>'+tr(it[2])+'</span></button>'}).join('')+'</div>';
}
function openDrawer(){drawerBuild(); drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); dscrim.classList.add('show'); document.body.style.overflow='hidden'}
function closeDrawer(){drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); dscrim.classList.remove('show'); if(!sheet.classList.contains('open'))document.body.style.overflow=''}

/* ---------- lot sheet ---------- */
var sheet=$('#sheet'), scrim=$('#scrim');
function minBid(l){return l.mode==='live'?(l.bidders===0?l.price:l.price+l.step):Math.ceil(l.initial)}
function histHTML(l,freshFirst){return l.hist.slice(0,6).map(function(h,i){return '<li class="'+(h.mine?'me':'')+(freshFirst&&i===0?' fresh':'')+'"><span>'+(h.mine?(S.lang==='am'?'አንተ':'You'):h.who)+'</span><b>'+fmt(h.amt)+' ETB</b></li>'}).join('')}
function heroHTML(l,c){
  var lot='<span class="lotno">'+tr('lotno')+' '+l.id+'</span>';
  if(l.photos.length)return '<div class="heroph"><div class="gal">'+l.photos.map(function(p){return '<img alt="" src="'+p+'">'}).join('')+'</div>'+lot+(l.photos.length>1?'<div class="gal-d">'+l.photos.map(function(p,i){return '<i class="'+(i?'':'on')+'"></i>'}).join('')+'</div>':'')+'</div>';
  return '<div class="tile hero" style="--h:'+c.h+'">'+ic(c.icon)+lot+'</div>'}
function orderFor(id){return ((S.me&&S.me.orders)||[]).filter(function(o){return o.lotId===id})[0]}
function entSig(){return ((S.me&&S.me.entries)||[]).map(function(e){return e.lotId+e.status}).join()+((S.me&&S.me.banUntil)||'')}
function myEntry(id){return ((S.me&&S.me.entries)||[]).filter(function(e){return e.lotId===id})[0]}
function reqs(l){var low=l.special&&l.initial<=S.settings.noLicenceMax; return {doc:!l.special,sec:l.security,tin:!low,lic:!low&&l.cat!=='vehicle'}}
function bankRows(o){return [['bk_bank',o.bank],['bk_acct',o.account],['bk_holder',o.holder],['bk_cpo',o.cpo],['bk_addr',o.address],['bk_phone',o.phone],['bk_view',o.view]].filter(function(r){return r[1]})}
function branchBox(o,viewOverride){
  var r=bankRows(o||{}); if(viewOverride)r=r.filter(function(x){return x[0]!=='bk_view'}).concat([['bk_view',viewOverride]]);
  return '<h3 class="h-title">'+tr('bk_t')+'</h3>'+(r.length?'<ul class="rows">'+r.map(function(x){return '<li><span>'+tr(x[0])+'</span><b>'+esc(x[1])+'</b></li>'}).join('')+'</ul>':'<p class="note2">'+tr('bk_none')+'</p>')}
function invoiceHTML(o,l){
  var org=l?ORG[l.org]:null, pct=o.amount?Math.round(o.fee*1000/o.amount)/10:0, h='<h3 class="h-title">'+tr('pay_due')+'</h3><ul class="rows"><li><span>'+tr('pay_bid')+'</span><b>'+fmt(o.amount)+' ETB</b></li>'+(o.fee?'<li><span>'+tr('pay_fee').replace('{fee}',pct)+'</span><b>'+fmt(o.fee)+' ETB</b></li>':'')+
   (o.deposit?'<li><span>'+tr('pay_sec')+'</span><b>- '+fmt(o.deposit)+' ETB</b></li>':'')+'<li><span>'+tr('pay_bal')+'</span><b>'+fmt(o.balance)+' ETB</b></li>'+(o.dueAt&&o.status==='awaiting_payment'?'<li><span>'+tr('pay_by')+'</span><b>'+dfmt(o.dueAt)+'</b></li>':'')+
   (o.status==='paid'&&o.pickupBy?'<li><span>'+tr('pay_pick')+'</span><b>'+dfmt(o.pickupBy)+'</b></li>':'')+(o.rent?'<li><span>'+tr('pay_rent')+'</span><b>'+fmt(o.rent)+' ETB</b></li>':'')+'<li><span>'+tr('o_orders')+'</span><b>'+tr('os_'+o.status)+'</b></li></ul>';
  if(o.note)h+='<p class="note2">'+esc(o.note)+'</p>';
  if(o.status==='awaiting_approval')h+='<p class="note2">'+tr('pay_await')+'</p>';
  if(o.status==='awaiting_payment'){
    if(S.settings.payInstructions)h+='<p class="note2"><b>'+tr('pay_how')+'</b><br>'+esc(S.settings.payInstructions)+'</p>';
    if(org)h+=branchBox(org);
    if(!o.extended&&S.settings.extendDays>0)h+='<button class="btn-s" data-act="extend" data-id="'+o.id+'" style="margin-top:10px">'+tr('pay_ext').replace('{n}',S.settings.extendDays)+'</button>';
  }
  return h}
function bidReady(l){if(!S.me||role()!=='bidder')return false; if(S.me.banUntil)return false; var e=myEntry(l.id); return !!(e&&e.status==='approved')}
function howBlock(l){
  var r=reqs(l), org=ORG[l.org]||{}, rows='';
  if(r.doc)rows+='<li><span>'+tr('rq_doc')+'</span><b>'+tr('rq_doc_v').replace('{n}',fmt(S.settings.docFee))+'</b></li><li><span>'+tr('rq_sec').replace('{p}',CFG.depositPercent)+'</span><b>'+tr('rq_sec_v').replace('{n}',fmt(r.sec))+'</b></li>';
  else rows+='<li><span>'+tr('sp_t')+'</span><b>'+tr('rq_none')+'</b></li>';
  if(r.tin)rows+='<li><span>'+tr('rq_tin')+'</span><b>'+tr('rq_req')+'</b></li>'; if(r.lic)rows+='<li><span>'+tr('rq_lic')+'</span><b>'+tr('rq_req')+'</b></li>';
  return '<h3 class="h-title">'+tr('how_t')+'</h3><ul class="rows">'+rows+'</ul>'+(r.doc?branchBox(org,l.view):'')+(l.tie?'<div class="sealed-note">'+ic('i-lock')+'<span>'+tr('tie_note')+'</span></div>':'')}
function entryBox(l){
  var e=myEntry(l.id), h='<div class="bidbox">';
  if(S.me&&S.me.banUntil)return h+'<div class="st bad">'+ic('i-close')+'<span>'+tr('en_banned').replace('{d}',dfmt(S.me.banUntil))+'</span></div></div>';
  if(S.me&&role()!=='bidder')return '<div class="sealed-note">'+ic('i-shield')+'<span>'+tr('b_noroles')+'</span></div>';
  if(e&&e.status==='pending')return h+'<div class="st"><span>'+tr('en_pend')+'</span></div></div>';
  if(e&&e.status==='rejected')h+='<div class="st bad">'+ic('i-close')+'<span>'+tr('en_rej')+esc(e.note||'')+'</span></div>';
  if(l.tie&&!e)return '';
  return h+'<button class="btn" data-act="entryopen" data-id="'+l.id+'">'+ic('i-shield')+'<span>'+tr(e?'en_again':'en_btn')+'</span></button></div>'}
function complaintBlock(l){
  var mine=((S.me&&S.me.complaints)||[]).filter(function(c){return c.lotId===l.id}), h='';
  mine.forEach(function(c){h+='<p class="note2"><b>'+tr('cm_t')+'</b><br>'+esc(c.body)+(c.reply?'<br><b>'+tr('cm_re')+'</b> '+esc(c.reply):'')+'</p>'});
  return h+'<button class="btn-s" data-act="cmpopen" data-id="'+l.id+'" style="margin-top:10px">'+tr('cm_btn')+'</button>'}
function sheetHTML(l){
  var c=CAT[l.cat], live=l.mode==='live', b=S.bids[l.id], open=isOpen(l);
  var facts='<ul class="facts"><li><span>'+tr('office')+'</span><b>'+orgName(l)+'</b></li><li><span>'+tr('type')+'</span><b>'+tr('cat_'+grp(l))+'</b></li>'+(l.src?'<li><span>'+tr('l_src')+'</span><b>'+tr('src_'+l.src)+'</b></li>':'')+(l.ref?'<li><span>'+tr('l_ref')+'</span><b>'+l.ref+'</b></li>':'')+(l.duty?'<li><span>'+tr('l_duty')+'</span><b>'+tr('d_'+l.duty)+'</b></li>':'')+'<li><span>'+tr('inspect')+'</span><b>'+(l.view||(ORG[l.org]&&ORG[l.org].view)||tr('inspect_v'))+'</b></li><li><span>'+tr('bidders')+'</span><b data-bidders="'+l.id+'">'+l.bidders+'</b></li></ul>';
  var segs=['d','h','m','s'].map(function(k){return '<div class="seg"><b data-seg="'+k+'">00</b><span>'+tr(k)+'</span></div>'}).join('');
  var how=open?howBlock(l):'';
  var hist=live?'<h3 class="h-title">'+tr('history')+'</h3><ul class="hist" id="hist">'+histHTML(l)+'</ul>':(open?'<div class="sealed-note">'+ic('i-lock')+'<span>'+tr('sealed_note')+'</span></div>':'');
  var tail;
  if(!open){
    var o=orderFor(l.id), res;
    if(l.status==='sold'&&l.youWon)res='<div class="st good">'+ic('i-check')+'<span>'+tr('res_won_t')+'</span></div>'+(o?invoiceHTML(o,l):'');
    else if(l.status==='sold')res='<div class="st '+(b?'bad':'good')+'">'+ic(b?'i-close':'i-check')+'<span>'+tr(b?'res_lost_t':'res_sold_t')+'</span></div>';
    else res='<div class="st bad">'+ic('i-close')+'<span>'+tr(l.status==='unsold'?'res_unsold':'res_closed')+'</span></div>'+(l.note?'<p class="note2">'+l.note+'</p>':'');
    if(b&&S.me&&role()==='bidder')res+=complaintBlock(l);
    tail=res;
  }else if(S.me&&role()!=='bidder'){
    tail='<div class="sealed-note">'+ic('i-shield')+'<span>'+tr('b_noroles')+'</span></div>';
  }else if(!bidReady(l)){
    tail=entryBox(l);
  }else{
    var chips=live?[1,2,5].map(function(n){return '<button class="chip" data-add="'+n+'">+'+fmt(l.step*n)+'</button>'}).join(''):[0,5,10,25].map(function(p){return '<button class="chip" data-pct="'+p+'">'+(p?'+'+p+'%':tr('initial'))+'</button>'}).join('');
    var init=live?minBid(l):(b?b.amt:'');
    var btn=live?tr('place_live'):(b?tr('update_sealed'):tr('place_sealed'));
    tail='<div class="bidbox"><div class="st" id="st" hidden></div>'+
     '<label for="amt">'+tr('your_bid')+'</label><div class="amt" id="amtbox"><input id="amt" inputmode="numeric" autocomplete="off" value="'+(init?fmt(init):'')+'"><span>ETB</span></div>'+
     '<div class="hint" id="hint">'+tr(live?'min_next':'min_seal')+': <b data-min>'+fmt(minBid(l))+'</b> ETB</div><div class="qs">'+chips+'</div>'+
     (l.security?'<div class="dep"><span>'+tr('deposit')+'<br><small>'+tr('dep_note')+'</small></span><b>'+fmt(l.security)+' ETB</b></div>':'')+
     '<button class="btn" data-act="submit" id="go">'+ic('i-shield')+'<span>'+btn+'</span></button></div>';
  }
  return '<div class="grab" id="grab"><i></i></div>'+
   '<button class="x" data-act="close" aria-label="'+tr('close')+'">'+ic('i-close')+'</button>'+
   heroHTML(l,c)+
   '<h2>'+l.t[S.lang]+'</h2><div class="org">'+orgTag(l)+' · '+(live?'<span class="pill live">'+tr('live').toUpperCase()+'</span>':'<span class="pill sealed">'+ic('i-lock')+tr('sealed').toUpperCase()+'</span>')+'</div>'+
   (open?'<div class="segs" id="segs">'+segs+'</div>':'')+
   '<div class="pricebox"><div class="price"><small>'+(l.status==='sold'?tr('res_sold'):live?tr('current'):tr('initial'))+'</small><b data-price="'+l.id+'">'+fmt(l.status==='sold'?l.finalPrice:l.price)+'</b><i>ETB</i></div></div>'+
   (l.d[S.lang]?'<p class="desc">'+l.d[S.lang]+'</p>':'')+facts+how+hist+tail+(open?'':branchBox(ORG[l.org]));
}
function updStatus(l){var st=$('#st'); if(!st||S.open!==l.id)return; var b=S.bids[l.id];
  if(!b){st.hidden=true;return}
  var s=statusOf(l); st.hidden=false; st.className='st '+s.c;
  st.innerHTML=ic(s.c==='good'?'i-check':'i-close')+'<span>'+(l.mode==='live'?(l.leader==='you'?tr('leading'):tr('outbid')):tr('submitted')+' · '+tr('ref')+' '+esc(b.ref))+' · '+fmt(b.amt)+' ETB</span>'}
function showSheet(){sheet.classList.add('open'); sheet.setAttribute('aria-hidden','false'); scrim.classList.add('show'); document.body.style.overflow='hidden'}
function openSheet(id){
  var l=byId(id); if(!l)return; S.open=id; S.panelFn=null; sheet.innerHTML=sheetHTML(l); sheet.scrollTop=0; showSheet();
  tickSheet(true); updStatus(l); setTimeout(function(){var x=$('.x',sheet); if(x)x.focus({preventScroll:true})},50);
}
function closeSheet(){S.open=null; S.panelFn=null; sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true'); scrim.classList.remove('show'); if(!drawer.classList.contains('open'))document.body.style.overflow=''}
function tickSheet(first){
  var l=byId(S.open); if(!l)return; var p=parts(l.end-nowMs()), segs=$('#segs'); if(!segs)return;
  segs.classList.toggle('hot',l.end-nowMs()<H);
  ['d','h','m','s'].forEach(function(k){var e=$('[data-seg="'+k+'"]',segs), v=pad(p[k]); if(e.textContent!==v){e.textContent=v; if(!first){e.classList.remove('tick'); void e.offsetWidth; e.classList.add('tick')}}});
}
function setAmt(n){var i=$('#amt'); if(!i)return; i.value=n?fmt(n):''; hint(false)}
function amtVal(){return Number(($('#amt').value||'').replace(/[^\d]/g,''))||0}
function hint(err,msg){var h=$('#hint'),l=byId(S.open); if(!h||!l)return; h.className='hint'+(err?' err':''); h.innerHTML=err?msg:tr(l.mode==='live'?'min_next':'min_seal')+': <b data-min>'+fmt(minBid(l))+'</b> ETB'}
function bad(sel){var b=$(sel||'#amtbox'); if(!b)return; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake')}
function submit(){
  var l=byId(S.open); if(!l)return; var n=amtVal(), min=minBid(l);
  if(!isOpen(l)){toast(tr('closed'),true);return}
  if(!S.me){S.after=l.id; S.authNote=tr('e_auth_required'); closeSheet(); setTimeout(function(){openAuth('in')},380); return}
  if(role()!=='bidder'){toast(tr('b_noroles'),true);return}
  if(!bidReady(l)){entryOpen(l.id); return}
  if(n<min){bad(); hint(true,tr(l.mode==='live'?'err_live':'err_seal')+' '+fmt(min)+' ETB'); return}
  var btn=$('#go'); btn.classList.add('busy');
  API('POST','/api/lots/'+encodeURIComponent(l.id)+'/bid',{amount:n}).then(function(r){
    btn.classList.remove('busy');
    if(l.mode==='live'){toast(tr('toast_lead')+' · '+fmt(n)+' ETB'); load().then(function(){var x=byId(l.id); if(x&&S.open===x.id)setAmt(minBid(x))})}
    else{showStamp(r.ref,n); load(); setTimeout(function(){closeSheet()},1900)}
  },function(e){btn.classList.remove('busy'); bad(); hint(true,errMsg(e)); if(e.code==='closed'||e.code==='low_bid')load()});
}
function paintPrice(l,from,to){$$('[data-price="'+l.id+'"]').forEach(function(e){roll(e,from,to)}); $$('[data-bidders="'+l.id+'"]').forEach(function(e){e.textContent=l.bidders});
  var m=$('[data-min]'); if(m&&S.open===l.id)m.textContent=fmt(minBid(l))}
function showStamp(ref,n){
  var w=$('#stampwrap'); $('#st-a').textContent=tr('done_t'); $('#st-b').textContent=ref;
  $('#st-cap').innerHTML=tr('done_c')+'<small>'+fmt(n)+' ETB</small>';
  w.classList.remove('show'); void w.offsetWidth; w.classList.add('show'); setTimeout(function(){w.classList.remove('show')},1800)}

/* ---------- panels: info, support, account ---------- */
function shell(title,inner){return '<div class="grab" id="grab"><i></i></div><button class="x" data-act="close" aria-label="'+tr('close')+'">'+ic('i-close')+'</button><h2 class="ptitle">'+title+'</h2>'+inner}
function showPanel(fn){S.open=null; S.panelFn=fn; sheet.innerHTML=fn(); sheet.scrollTop=0; showSheet()}
var INFO={
 about:{t:'m_about',h:function(){return S.lang==='am'
   ?'<div class="prose"><p>ጨረታ የ'+CFG.client.am+' ቅርንጫፎች ያልተነሱ፣ የተወረሱ እና የተተዉ ዕቃዎችን በድር ጣቢያ የሚሸጡበት መድረክ ነው። የተመዘገቡ ተጫራቾች በቀጥታ ወይም በታሸገ ጨረታ ይወዳደራሉ።</p><ul><li>'+ic('i-shield')+'የተመዘገቡ ተጫራቾች ብቻ</li><li>'+ic('i-clock')+'ግልጽ የሰዓት ቆጠራ እና የጨረታ ታሪክ</li><li>'+ic('i-check')+'አሸናፊው ክፍያውን ለቅርንጫፉ ይከፍላል</li><li>'+ic('i-doc')+'እያንዳንዱ ዕጣ የጉዳይ ማጣሪያ ቁጥር እና የቀረጥ ሁኔታ ይዟል</li></ul></div>'
   :'<div class="prose"><p>Chereta lets branches of the '+CFG.client.en+' sell uncleared, seized and abandoned goods online. Registered bidders compete live or with sealed bids.</p><ul><li>'+ic('i-shield')+'Registered bidders only</li><li>'+ic('i-clock')+'Clear countdowns and bid history</li><li>'+ic('i-check')+'Winners pay the branch that listed the lot</li><li>'+ic('i-doc')+'Every lot shows its case reference and duty status</li></ul></div>'}},
 faq:{t:'m_faq',h:function(){var q=S.lang==='am'
   ?[['እንዴት እጫረታለሁ?','ተመዝገቡ፣ TIN (እና ከተሽከርካሪ በስተቀር የንግድ ፈቃድ) ያስገቡ። ዕጣ ከፍተው የሰነድ ክፍያ ይክፈሉ፣ ለማስከበሪያ በባንክ የተመሰከረ ቼክ ወይም ሲፒኦ ያሰሩ፣ ዝርዝሩን ያስገቡ እና ቅርንጫፉ እስኪያጸድቅ ይጠብቁ። ከዚያ ይጫረቱ።'],['የታሸገ ጨረታ ምንድን ነው?','ማንም የማያየው አንድ መጠን ታስገባለህ። ዕጣው ሲዘጋ ከፍተኛው ትክክለኛ ጨረታ ያሸንፋል።'],['ካሸነፍኩ ምን አደርጋለሁ?','ዕጣው ሲዘጋ ክፍያህ እና የመክፈያ መመሪያው በዕጣው ገጽ ላይ ይታያል። በተሰጠው ቀን ውስጥ ለቅርንጫፉ ክፈል።'],['ዕቃውን አስቀድሜ ማየት እችላለሁ?','አዎ። ከመጫረትህ በፊት የምርመራ ቀናትን ከቅርንጫፉ ጠይቅ።']]
   :[['How do I place a bid?','Register and add your TIN (and trade licence, except for vehicles). Open a lot, pay the document fee and get a bank-certified cheque or CPO for the bid security, enter the details, and wait for the branch to approve. Then bid.'],['What is a sealed bid?','You submit one amount that nobody can see. When the lot closes, the highest valid bid wins.'],['What happens if I win?','When the lot closes, your payment amount and instructions appear on the lot page. Pay the branch before the date shown.'],['Can I see the item first?','Yes. Ask the branch for its inspection days before you bid.']];
   return '<div class="prose">'+q.map(function(x,i){return '<details'+(i===0?' open':'')+'><summary>'+x[0]+'</summary><p>'+x[1]+'</p></details>'}).join('')+'</div>'}},
 pricing:{t:'m_pricing',h:function(){var r=S.lang==='am'?[['ምዝገባ','ነጻ'],['የጨረታ ሰነድ',S.settings.docFee+' ብር ለአንድ ዕጣ፣ አይመለስም'],['የጨረታ ማስከበሪያ',CFG.depositPercent+'% ከመነሻ ዋጋ፣ ካላሸነፉ ተመላሽ']]:[['Registration','Free'],['Tender document',S.settings.docFee+' ETB per lot, not refundable'],['Bid security',CFG.depositPercent+'% of the starting price, returned if you do not win']].concat(CFG.buyerFeePercent?[['Buyer fee',CFG.buyerFeePercent+'% of the winning bid']]:[]);
   return '<div class="prose"><ul class="rows">'+r.map(function(x){return '<li><span>'+x[0]+'</span><b>'+x[1]+'</b></li>'}).join('')+'</ul></div>'}},
 terms:{t:'m_terms',h:function(){var r=S.lang==='am'?['ጨረታ የሚያስገድድ ቃል ነው።','አሸናፊዎች በቅርንጫፍ ሥራ አስኪያጅ ከጸደቁ በኋላ በ'+S.settings.paymentDays+' የሥራ ቀናት ውስጥ ይከፍላሉ (አንድ ጊዜ የ'+S.settings.extendDays+' ቀን ማራዘሚያ ይቻላል)።','ዕቃው ከክፍያ በኋላ በ'+S.settings.pickupDays+' የሥራ ቀናት ውስጥ መነሳት አለበት።','ያልተከፈለ አሸናፊ ጨረታ ማስከበሪያውን ያስወርሳል፤ በአንድ በጀት ዓመት ሁለት ጊዜ ከተደገመ ለአንድ ዓመት በሁሉም ቅርንጫፍ ይታገዳሉ።','ቅሬታ ዕጣው ከተዘጋ በኋላ በ'+S.settings.complaintDays+' የሥራ ቀናት ውስጥ ይቀበላል።','ዕቃዎች እንደሚታዩት ይሸጣሉ።']:['A bid is a binding offer.','Winners must be approved by the branch manager, then pay within '+S.settings.paymentDays+' working days (one extension of '+S.settings.extendDays+' is possible).','Goods must be collected within '+S.settings.pickupDays+' working days of payment.','An unpaid winning bid forfeits the bid security, and two such failures in a budget year ban you from all branches for one year.','Complaints are accepted within '+S.settings.complaintDays+' working days after the lot closes.','Lots are sold as seen.'];
   return '<div class="prose"><ul>'+r.map(function(x){return '<li>'+ic('i-check')+x+'</li>'}).join('')+'</ul></div>'}},
 privacy:{t:'m_priv',h:function(){var r=S.lang==='am'?['ለማረጋገጥ ስምህን እና ስልክ ቁጥርህን እናስቀምጣለን።','ዕጣ ከመዘጋቱ በፊት ጨረታህን ለሌሎች አናጋራም።','መለያህ እንዲሰረዝ መጠየቅ ትችላለህ።']:['We keep your name and phone number to identify you.','We never show your bid to others before a lot closes.','You can ask us to delete your account.'];
   return '<div class="prose"><ul>'+r.map(function(x){return '<li>'+ic('i-shield')+x+'</li>'}).join('')+'</ul></div>'}},
 tutorials:{t:'m_tut',h:function(){var r=S.lang==='am'?['በስልክ ቁጥርህ ተመዝገብ','ዕጣ ምረጥ እና ምርመራ ጠይቅ','በቀጥታ ተጫረት ወይም ጨረታህን አሽግ','አሸንፈህ ለቅርንጫፉ ክፈል እና ዕቃህን ተረከብ']:['Register with your phone number','Pick a lot and ask the branch for an inspection','Bid live or seal your bid','Win, pay the branch and collect your lot'];
   return '<div class="prose"><ol>'+r.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol></div>'}}
};
function openInfo(k){var d=INFO[k]; showPanel(function(){return shell(tr(d.t),d.h())})}
function supportHTML(){
  var s=S.settings, rows=[['sup_phone',s.supportPhone],['sup_email',s.supportEmail],['sup_addr',s.supportAddress]].filter(function(r){return r[1]});
  return shell(tr('m_support'),rows.length?'<h3 class="h-title" style="margin-top:0">'+tr('sup_t')+'</h3><ul class="rows">'+rows.map(function(r){return '<li><span>'+tr(r[0])+'</span><b>'+esc(r[1])+'</b></li>'}).join('')+'</ul>':'<div class="empty">'+ic('i-chat')+'<p>'+tr('sup_none')+'</p></div>')}

/* ---------- account ---------- */
function authHTML(){
  var a=S.auth, note=S.authNote?'<div class="st good" style="margin-bottom:6px">'+ic('i-lock')+'<span>'+esc(S.authNote)+'</span></div>':'', body;
  var tabs='<div class="seg-ctl two"><i style="transform:translateX('+(a.mode==='reg'?0:100)+'%)"></i><button data-authmode="reg" aria-pressed="'+(a.mode==='reg')+'">'+tr('a_reg')+'</button><button data-authmode="in" aria-pressed="'+(a.mode==='in')+'">'+tr('a_in')+'</button></div>';
  if(a.mode==='reg'){
    body=note+tabs+'<div class="field"><label for="authName">'+tr('name')+'</label><input class="inp" id="authName" autocomplete="name" maxlength="60" value="'+esc(a.name)+'"></div>'+
     '<div class="field"><label for="authPhone">'+tr('phone')+'</label><div class="phone" id="phonebox"><span>+251</span><input id="authPhone" inputmode="tel" autocomplete="tel-national" placeholder="9XX XXX XXX" value="'+esc(a.phone)+'"></div></div>'+
     '<div class="field"><label for="authPass">'+tr('pass_new')+'</label><input class="inp" id="authPass" type="password" autocomplete="new-password" maxlength="100"></div>'+
     '<div class="hint" id="autherr"></div><button class="btn" data-act="authgo">'+ic('i-shield')+'<span>'+tr('go_reg')+'</span></button>';
  }else{
    body=note+tabs+'<div class="field"><label for="authUser">'+tr('username')+'</label><input class="inp" id="authUser" autocomplete="username" autocapitalize="none" maxlength="60" value="'+esc(a.user)+'"></div>'+
     '<div class="field"><label for="authPass">'+tr('pass')+'</label><input class="inp" id="authPass" type="password" autocomplete="current-password" maxlength="100"></div>'+
     '<div class="hint" id="autherr"></div><button class="btn" data-act="authgo">'+ic('i-shield')+'<span>'+tr('go_in')+'</span></button>'+(S.authNote?'':'<p class="note2">'+tr('o_note')+'</p>');
  }
  return shell(a.mode==='reg'?tr('a_reg'):tr('a_in'),body);
}
function openAuth(mode){S.auth={mode:mode,busy:false,name:'',phone:'',user:''}; showPanel(authHTML)}
function authErr(msg,sel){var e=$('#autherr'); if(e){e.className='hint err'; e.textContent=msg} bad(sel)}
function doAuth(){
  var a=S.auth; if(a.busy)return; var pass=$('#authPass').value||'', p;
  if(a.mode==='reg'){
    var nm=($('#authName').value||'').trim(); a.name=nm; a.phone=$('#authPhone').value;
    if(nm.length<2){authErr(tr('err_name'),'#authName');return}
    var d=(a.phone||'').replace(/\D/g,''); if(d.indexOf('251')===0)d=d.slice(3); if(d.charAt(0)==='0')d=d.slice(1);
    if(!/^[79]\d{8}$/.test(d)){authErr(tr('err_phone'),'#phonebox');return}
    if(pass.length<8){authErr(tr('err_pass'),'#authPass');return}
    p=API('POST','/api/register',{name:nm,phone:d,password:pass});
  }else{
    var u=($('#authUser').value||'').trim(); a.user=u;
    if(!u||!pass){authErr(tr('err_user'),'#authUser');return}
    p=API('POST','/api/login',{identifier:u,password:pass});
  }
  a.busy=true;
  p.then(function(r){return load().then(function(){return r})}).then(function(r){
    a.busy=false; var id=S.after; S.after=null; S.authNote='';
    closeSheet(); toast(tr('welcome')+', '+esc((r.user.name||'').split(' ')[0]));
    if(role()==='branch')setTimeout(openPortal,450); else if(id)setTimeout(function(){openSheet(id)},480);
  },function(e){a.busy=false; authErr(errMsg(e),'#authPass')});
}
function logout(){API('POST','/api/logout').catch(function(){}).then(function(){S.me=null; S.bids={}; closeSheet(); toast(tr('signed_out')); load()})}
function accountHTML(){
  var m=S.me, bd=role()==='bidder', ens=(m.entries||[]);
  var prof=bd?'<h3 class="h-title">'+tr('ac_prof')+'</h3><div class="field" style="margin-top:0"><label for="acTin">'+tr('en_tin')+'</label><input class="inp" id="acTin" inputmode="numeric" maxlength="10" value="'+esc(m.tin||'')+'"></div>'+
    '<div class="field"><label for="acLic">'+tr('en_lic')+'</label><input class="inp" id="acLic" maxlength="40" value="'+esc(m.license||'')+'"></div><div class="hint" id="proferr"></div><button class="btn-s" data-act="profsave" style="margin-bottom:14px">'+tr('pr_save')+'</button>'+
    (m.banUntil?'<div class="st bad">'+ic('i-close')+'<span>'+tr('en_banned').replace('{d}',dfmt(m.banUntil))+'</span></div>':''):'';
  var list=bd&&ens.length?'<h3 class="h-title">'+tr('ent_t')+'</h3><ul class="rows">'+ens.map(function(e){return '<li><span>'+esc(e.title)+'<br><small>'+e.lotId+'</small></span><b>'+tr('es_'+e.status)+(e.amount?' · '+fmt(e.amount):'')+'</b></li>'}).join('')+'</ul>':'';
  return shell(tr('m_account'),'<ul class="rows"><li><span>'+tr('name')+'</span><b>'+esc(m.name)+'</b></li><li><span>'+tr('ac_user')+'</span><b>'+esc(m.username)+'</b></li></ul>'+prof+list+
   '<h3 class="h-title">'+tr('ac_pw')+'</h3><div class="field" style="margin-top:0"><label for="acCur">'+tr('ac_cur')+'</label><input class="inp" id="acCur" type="password" autocomplete="current-password"></div>'+
   '<div class="field"><label for="acNew">'+tr('ac_new')+'</label><input class="inp" id="acNew" type="password" autocomplete="new-password"></div>'+
   '<div class="hint" id="acerr"></div><button class="btn" data-act="acsave">'+ic('i-check')+'<span>'+tr('ac_save')+'</span></button>');
}
function profSave(){
  var e=$('#proferr'), t=($('#acTin').value||'').trim(); if(t&&!/^\d{10}$/.test(t)){e.className='hint err'; e.textContent=tr('e_bad_tin'); bad('#acTin'); return}
  API('PATCH','/api/profile',{tin:t,license:($('#acLic').value||'').trim()}).then(function(){toast(tr('pr_ok')); return load()},function(x){e.className='hint err'; e.textContent=errMsg(x)});
}
/* entry to a lot: document fee receipt and bid security */
function entryOpen(id){
  if(!S.me){S.after=id; S.authNote=tr('e_auth_required'); closeSheet(); setTimeout(function(){openAuth('in')},380); return}
  S.entryLot=id; closeSheet(); setTimeout(function(){showPanel(entryHTML)},380)}
function entryHTML(){
  var l=byId(S.entryLot); if(!l)return shell(tr('en_t'),''); var r=reqs(l), m=S.me||{}, org=ORG[l.org]||{}, h='<p class="note2" style="margin:0 0 12px"><b>'+l.t[S.lang]+'</b> · '+l.id+'</p>';
  if(r.doc)h+='<p class="note2" style="margin:0 0 12px">'+tr('en_d').replace('{n}',fmt(S.settings.docFee)).replace('{s}',fmt(r.sec)).replace('{p}',CFG.depositPercent)+'</p>'+branchBox(org,l.view);
  var f='';
  if(r.tin&&!/^\d{10}$/.test(m.tin||''))f+='<div class="field"><label for="enTin">'+tr('en_tin')+'</label><input class="inp" id="enTin" inputmode="numeric" maxlength="10"></div>';
  if(r.lic&&!m.license)f+='<div class="field"><label for="enLic">'+tr('en_lic')+'</label><input class="inp" id="enLic" maxlength="40"></div>';
  if(r.doc)f+='<div class="field"><label for="enDoc">'+tr('en_doc')+'</label><input class="inp" id="enDoc" maxlength="40" autocomplete="off"></div><div class="two2"><div class="field"><label for="enCpo">'+tr('en_cpo')+'</label><input class="inp" id="enCpo" maxlength="40" autocomplete="off"></div><div class="field"><label for="enBank">'+tr('en_bank')+'</label><input class="inp" id="enBank" maxlength="60" autocomplete="off"></div></div>'+
    '<label class="chk"><input type="checkbox" id="enAtt"> <span>'+tr('en_att')+'</span></label>';
  return shell(tr('en_t'),h+f+'<div class="hint" id="enerr"></div><button class="btn" data-act="entrysend">'+ic('i-check')+'<span>'+tr('en_send')+'</span></button>')}
function entrySend(){
  var l=byId(S.entryLot), r=reqs(l), e=$('#enerr'), m=S.me, prof={};
  function er(msg,sel){e.className='hint err'; e.textContent=msg; bad(sel)}
  var t=$('#enTin'); if(t){var tv=(t.value||'').trim(); if(!/^\d{10}$/.test(tv)){er(tr('e_bad_tin'),'#enTin');return} prof.tin=tv}
  var li=$('#enLic'); if(li){var lv=(li.value||'').trim(); if(lv.length<3){er(tr('e_need_license'),'#enLic');return} prof.license=lv}
  var body={}; if(r.doc){body={docRef:($('#enDoc').value||'').trim(),cpoNo:($('#enCpo').value||'').trim(),cpoBank:($('#enBank').value||'').trim(),attest:$('#enAtt').checked};
    if(body.docRef.length<4){er(tr('e_bad_reference'),'#enDoc');return} if(body.cpoNo.length<3||body.cpoBank.length<2){er(tr('e_bad_cpo'),'#enCpo');return} if(!body.attest){er(tr('e_attest_required'),'#enAtt');return}}
  var pre=Object.keys(prof).length?API('PATCH','/api/profile',prof):Promise.resolve();
  pre.then(function(){return API('POST','/api/lots/'+encodeURIComponent(l.id)+'/entry',body)}).then(function(res){toast(res.status==='approved'?tr('en_ok'):tr('en_sent')); return load()}).then(function(){setTimeout(function(){openSheet(l.id)},300)},function(x){er(errMsg(x),'.btn')});
}
/* complaint */
function cmpHTML(){var l=byId(S.cmpLot); return shell(tr('cm_t'),'<p class="note2" style="margin:0 0 12px">'+tr('cm_d').replace('{n}',S.settings.complaintDays)+'</p><div class="field"><label for="cmBody">'+(l?l.t[S.lang]:'')+'</label><textarea class="inp ta" id="cmBody" maxlength="1000"></textarea></div><div class="hint" id="cmerr"></div><button class="btn" data-act="cmpsend">'+ic('i-check')+'<span>'+tr('cm_send')+'</span></button>')}
function cmpSend(){var e=$('#cmerr'); API('POST','/api/lots/'+encodeURIComponent(S.cmpLot)+'/complaint',{body:($('#cmBody').value||'').trim()}).then(function(){toast(tr('cm_sent')); return load()}).then(function(){var id=S.cmpLot; setTimeout(function(){openSheet(id)},300)},function(x){e.className='hint err'; e.textContent=errMsg(x)})}
function repHTML(){var c=((S.me&&S.me.complaints)||[]).filter(function(x){return x.id===S.repId})[0]; return shell(tr('cm_t'),'<p class="note2" style="margin:0 0 12px"><b>'+esc(c?c.by:'')+'</b> · '+esc(c?c.title:'')+'<br>'+esc(c?c.body:'')+'</p><div class="field"><label for="rpBody">'+tr('o_reply')+'</label><textarea class="inp ta" id="rpBody" maxlength="1000"></textarea></div><div class="hint" id="rperr"></div><button class="btn" data-act="repsend">'+ic('i-check')+'<span>'+tr('cm_send')+'</span></button>')}
function repSend(){var e=$('#rperr'); API('POST','/api/complaints/'+S.repId+'/reply',{reply:($('#rpBody').value||'').trim()}).then(function(){toast(tr('pr_ok')); return load()}).then(function(){showPanel(portalHTML)},function(x){e.className='hint err'; e.textContent=errMsg(x)})}
/* branch bank and office details */
function profHTML(){var o=ORG[String(S.me.id)]||{}; function f(id,k,v,w){return '<div class="field"'+(w?' style="margin-top:0"':'')+'><label for="'+id+'">'+tr(k)+'</label><input class="inp" id="'+id+'" maxlength="160" value="'+esc(v||'')+'"></div>'}
  return shell(tr('pr_t'),'<p class="note2" style="margin:0 0 12px">'+tr('pr_d')+'</p>'+f('prBank','bk_bank',o.bank,1)+f('prAcct','bk_acct',o.account)+f('prHold','bk_holder',o.holder)+f('prCpo','bk_cpo',o.cpo)+f('prAddr','bk_addr',o.address)+f('prPhone','bk_phone',o.phone)+f('prView','bk_view',o.view)+'<div class="hint" id="prerr"></div><button class="btn" data-act="prsave">'+ic('i-check')+'<span>'+tr('pr_save')+'</span></button><button class="link" data-act="oback">'+tr('back')+'</button>')}
function prSave(){var e=$('#prerr'); API('PATCH','/api/profile',{bank:$('#prBank').value,account:$('#prAcct').value,holder:$('#prHold').value,cpo:$('#prCpo').value,address:$('#prAddr').value,phone:$('#prPhone').value,view:$('#prView').value}).then(function(){toast(tr('pr_ok')); return load()}).then(function(){showPanel(portalHTML)},function(x){e.className='hint err'; e.textContent=errMsg(x)})}
function acSave(){
  var cur=$('#acCur').value, nw=$('#acNew').value, e=$('#acerr');
  if(nw.length<8){e.className='hint err'; e.textContent=tr('err_pass'); bad('#acNew'); return}
  API('POST','/api/password',{current:cur,next:nw}).then(function(){closeSheet(); toast(tr('ac_done'))},function(x){e.className='hint err'; e.textContent=errMsg(x); bad('#acCur')});
}

/* ---------- branch portal ---------- */
function openOrg(){
  if(role()==='branch')openPortal(); else if(role()==='admin')location.href='/admin.html';
  else{S.authNote=''; S.auth={mode:'in',busy:false,name:'',phone:'',user:''}; showPanel(authHTML)}
}
function ownLots(){return LOTS.filter(function(l){return S.me&&l.org===String(S.me.id)})}
function openPortal(){if(role()==='branch')showPanel(portalHTML)}
function lotRow(l,i){var c=CAT[l.cat], pill=l.mode==='live'?'<span class="pill live">'+tr('live').toUpperCase()+'</span>':'<span class="pill sealed">'+ic('i-lock')+tr('sealed').toUpperCase()+'</span>';
  var act=isOpen(l)?(l.bidders===0?'<button class="rm" data-rmlot="'+l.id+'">'+tr('o_remove')+'</button>':'<small style="max-width:96px;text-align:right">'+tr('o_contact')+'</small>'):'<span class="pill '+(l.status==='sold'?'good':'bad')+'">'+tr(l.status==='sold'?'res_sold':'closed')+'</span>';
  return '<div class="ml" style="--i:'+i+'" data-open="'+l.id+'"><div class="tile'+(l.photos.length?' ph':'')+'" style="--h:'+c.h+'">'+(l.photos.length?'<img alt="" src="'+l.photos[0]+'">':ic(c.icon))+'</div><div style="min-width:0"><h4>'+l.t[S.lang]+'</h4><small>'+l.id+' · '+fmt(l.status==='sold'?l.finalPrice:l.price)+' ETB · '+l.bidders+' '+tr('bidders')+'</small>'+pill+'</div>'+act+'</div>'}
function orderRow(o,i){
  var b='';
  if(o.status==='awaiting_approval')b='<button class="okb" data-ord="approve" data-id="'+o.id+'">'+tr('o_win_ok')+'</button><button class="rm" data-ord="reject" data-id="'+o.id+'">'+tr('o_win_no')+'</button>';
  else if(o.status==='awaiting_payment')b='<button class="okb" data-ord="paid" data-id="'+o.id+'">'+tr('o_paid')+'</button><button class="rm" data-ord="defaulted" data-id="'+o.id+'">'+tr('o_default')+'</button>';
  else if(o.status==='paid')b='<button class="okb" data-ord="collected" data-id="'+o.id+'">'+tr('o_collected')+'</button><button class="rm" data-ord="unclaimed" data-id="'+o.id+'">'+tr('o_unclaimed')+'</button>';
  var bad=o.status==='awaiting_payment'||o.status==='defaulted'||o.status==='cancelled'||o.status==='unclaimed'||o.status==='awaiting_approval';
  return '<div class="ml ap" style="--i:'+i+';--h:'+hueOf(o.lotId)+'"><span class="mono">'+esc(monoOf(o.buyer||'?'))+'</span><div style="min-width:0"><h4>'+esc(o.title)+'</h4><small>'+tr('o_buyer')+': '+esc(o.buyer||'')+' · +251 '+esc(o.buyerPhone||'')+'<br>'+tr('pay_bal')+': '+fmt(o.balance)+' ETB'+(o.dueAt&&o.status==='awaiting_payment'?' · '+dfmt(o.dueAt):'')+(o.pickupBy&&o.status==='paid'?' · '+tr('pay_pick')+' '+dfmt(o.pickupBy):'')+'</small><span class="pill '+(bad?'bad':'good')+'">'+tr('os_'+o.status)+'</span></div><div class="apb">'+b+'</div></div>'}
function entRow(e,i){
  var b=e.status==='pending'?'<button class="okb" data-ent="approve" data-id="'+e.id+'">'+tr('o_approve')+'</button><button class="rm" data-ent="reject" data-id="'+e.id+'">'+tr('o_reject')+'</button>':'<button class="okb" data-ent="refund" data-id="'+e.id+'">'+tr('o_refunded')+'</button>';
  return '<div class="ml ap" style="--i:'+i+';--h:'+hueOf(e.lotId)+'"><span class="mono">'+esc(monoOf(e.bidder||'?'))+'</span><div style="min-width:0"><h4>'+esc(e.title)+' · '+e.lotId+'</h4><small>'+esc(e.bidder||'')+' · +251 '+esc(e.phone||'')+'<br>TIN '+esc(e.tin||'-')+(e.license?' · '+esc(e.license):'')+(e.status==='pending'?'<br>'+tr('en_doc')+': '+esc(e.docRef||'-')+'<br>'+tr('en_cpo')+': '+esc(e.cpoNo||'-')+' · '+esc(e.cpoBank||'')+'<br>'+tr('rq_sec').replace('{p}',CFG.depositPercent)+': '+fmt(e.amount)+' ETB':'<br>'+tr('o_refund_amt')+': '+fmt(e.amount)+' ETB · '+tr('en_cpo')+' '+esc(e.cpoNo||'')+' '+esc(e.cpoBank||''))+'</small></div><div class="apb">'+b+'</div></div>'}
function cmpRow(c,i){return '<div class="ml ap" style="--i:'+i+';--h:'+hueOf(c.lotId)+'"><span class="mono">'+esc(monoOf(c.by||'?'))+'</span><div style="min-width:0"><h4>'+esc(c.title)+'</h4><small>'+esc(c.by||'')+': '+esc(c.body)+(c.reply?'<br><b>'+tr('cm_re')+'</b> '+esc(c.reply):'')+'</small></div><div class="apb">'+(c.reply?'':'<button class="okb" data-act="repopen" data-id="'+c.id+'">'+tr('o_reply')+'</button>')+'</div></div>'}
function portalHTML(){
  var n=nowMs(), mine=ownLots(), liveN=mine.filter(function(l){return l.mode==='live'&&isOpen(l)}).length, bd=mine.filter(isOpen).reduce(function(s,l){return s+l.bidders},0), ords=S.me.orders||[];
  var list=mine.length?'<div class="mine">'+mine.map(lotRow).join('')+'</div>':'<div class="empty">'+ic('i-box')+'<p>'+tr('o_none_lots')+'</p></div>';
  var ol=ords.length?'<h3 class="h-title">'+tr('o_orders')+'</h3><div class="mine">'+ords.map(orderRow).join('')+'</div>':'';
  var ens=S.me.entries||[], pend=ens.filter(function(e){return e.status==='pending'}), refd=ens.filter(function(e){return e.status==='refund_due'}), cms=S.me.complaints||[];
  var queue=(pend.length?'<h3 class="h-title">'+tr('o_ent')+' ('+pend.length+')</h3><div class="mine">'+pend.map(entRow).join('')+'</div>':'')+(refd.length?'<h3 class="h-title">'+tr('o_ref')+' ('+refd.length+')</h3><div class="mine">'+refd.map(entRow).join('')+'</div>':'')+(cms.length?'<h3 class="h-title">'+tr('o_cmp')+'</h3><div class="mine">'+cms.map(cmpRow).join('')+'</div>':'');
  var myo=ORG[String(S.me.id)]||{logo:0,m:monoOf(S.me.name)};
  var lrow='<div class="lrow">'+(myo.logo?'<img class="lgimg big" alt="" src="'+logoURL(S.me.id,myo.logo)+'">':'<span class="mono">'+esc(myo.m)+'</span>')+'<div class="lbtns"><label class="btn-s" for="lgFile">'+tr('o_logo')+'</label>'+(myo.logo?'<button class="link" data-act="lgrm">'+tr('o_logo_rm')+'</button>':'')+'<input type="file" id="lgFile" accept="image/*" hidden></div></div>';
  return shell(esc(S.me.name),lrow+'<div class="stats"><div class="stat"><b>'+mine.filter(isOpen).length+'</b><span>'+tr('o_lots')+'</span></div><div class="stat"><b>'+liveN+'</b><span>'+tr('o_live')+'</span></div><div class="stat"><b>'+bd+'</b><span>'+tr('o_bidders')+'</span></div></div>'+
    '<button class="btn" data-act="opost">'+ic('i-plus')+'<span>'+tr('o_post')+'</span></button><button class="btn-s" data-act="popen" style="margin:10px 0">'+tr('pr_t')+(myo.bank?'':' !')+'</button>'+queue+ol+'<h3 class="h-title">'+tr('o_mine')+'</h3>'+list+
    '<button class="link" data-act="osignout">'+tr('o_signout')+'</button>');
}
function rmLot(btn){
  if(!btn.classList.contains('arm')){btn.classList.add('arm'); btn.textContent=tr('o_confirm'); setTimeout(function(){if(btn.isConnected){btn.classList.remove('arm'); btn.textContent=tr('o_remove')}},3000); return}
  API('DELETE','/api/lots/'+encodeURIComponent(btn.getAttribute('data-rmlot'))).then(function(){toast(tr('f_removed')); load()},function(e){toast(errMsg(e),true)});
}
function ordStatus(b){
  var st=b.getAttribute('data-ord'), id=b.getAttribute('data-id');
  var p=(st==='approve'||st==='reject')?API('POST','/api/orders/'+id+'/approve',{decision:st}):API('POST','/api/orders/'+id+'/status',{status:st});
  p.then(function(){load()},function(e){toast(errMsg(e),true)})}
function entAct(b){
  var a=b.getAttribute('data-ent'), id=b.getAttribute('data-id');
  var p=a==='refund'?API('POST','/api/entries/'+id+'/refund',{ref:'returned'}):API('POST','/api/entries/'+id+'/decide',{decision:a});
  p.then(function(){load()},function(e){toast(errMsg(e),true)})}

/* post a lot */
function openPost(){S.pf={mode:'sealed',photos:[],busy:false}; showPanel(pfHTML)}
function pfPhotosHTML(){
  var p=S.pf.photos;
  return p.map(function(d,i){return '<div class="ph"><img alt="" src="'+d+'"><button data-rmphoto="'+i+'" aria-label="'+tr('o_remove')+'">'+ic('i-close')+'</button></div>'}).join('')+
   (p.length<3?'<label class="addph" for="pfFile">'+ic('i-image')+'<span>'+tr('f_add')+'</span></label>':'')+'<input type="file" id="pfFile" accept="image/*" multiple hidden>';
}
function pfPhotosRender(){var e=$('#pfPhotos'); if(e)e.innerHTML=pfPhotosHTML()}
function pfHTML(){
  var live=S.pf.mode==='live';
  var cats=CATS.map(function(g){return '<option value="'+g+'">'+tr('cat_'+g)+'</option>'}).join('');
  var days=[1,3,5,7,10,14,30].map(function(n){return '<option value="'+n+'"'+(n===7?' selected':'')+'>'+tr('f_days_n').replace('{n}',n)+'</option>'}).join('');
  return shell(tr('o_post'),
   '<div class="field" style="margin-top:0"><label for="pfTitle">'+tr('f_title')+'</label><input class="inp" id="pfTitle" maxlength="120" autocomplete="off"></div>'+
   '<div class="two2"><div class="field"><label for="pfCat">'+tr('f_cat')+'</label><select class="inp" id="pfCat">'+cats+'</select></div><div class="field"><label for="pfDays">'+tr('f_days')+'</label><select class="inp" id="pfDays">'+days+'</select></div></div>'+
   '<div class="two2"><div class="field"><label for="pfSrc">'+tr('f_src')+'</label><select class="inp" id="pfSrc">'+SRCS.map(function(g){return '<option value="'+g+'">'+tr('src_'+g)+'</option>'}).join('')+'</select></div><div class="field"><label for="pfDuty">'+tr('f_duty')+'</label><select class="inp" id="pfDuty">'+DUTIES.map(function(g){return '<option value="'+g+'">'+tr('d_'+g)+'</option>'}).join('')+'</select></div></div>'+
   '<div class="field"><label for="pfRef">'+tr('f_ref')+'</label><input class="inp" id="pfRef" maxlength="60" autocomplete="off"></div>'+
   '<div class="field"><label for="pfView">'+tr('f_view')+'</label><input class="inp" id="pfView" maxlength="200" autocomplete="off"></div>'+
   '<label class="chk"><input type="checkbox" id="pfSpecial"> <span>'+tr('f_special').replace('{n}',fmt(S.settings.specialMax))+'</span></label><label class="chk"><input type="checkbox" id="pfRepeat"> <span>'+tr('f_repeat').replace('{n}',S.settings.noticeRepeat||5)+'</span></label>'+
   '<div class="field"><label>'+tr('f_type')+'</label><div class="seg-ctl two" id="pfmodes"><i style="transform:translateX('+(live?100:0)+'%)"></i><button data-pfmode="sealed" aria-pressed="'+!live+'">'+tr('sealed')+'</button><button data-pfmode="live" aria-pressed="'+live+'">'+tr('live')+'</button></div></div>'+
   '<div class="two2"><div class="field"><label for="pfPrice">'+tr('f_price')+'</label><input class="inp" id="pfPrice" inputmode="numeric" autocomplete="off"></div><div class="field" id="pfStepWrap"'+(live?'':' hidden')+'><label for="pfStep">'+tr('f_step')+'</label><input class="inp" id="pfStep" inputmode="numeric" autocomplete="off"></div></div>'+
   '<div class="field"><label for="pfDesc">'+tr('f_desc')+'</label><textarea class="inp ta" id="pfDesc" maxlength="1000"></textarea></div>'+
   '<div class="field"><label>'+tr('f_photos')+'</label><div class="phs" id="pfPhotos">'+pfPhotosHTML()+'</div></div>'+
   '<div class="hint" id="pferr"></div><button class="btn" data-act="pfsubmit" id="pfgo">'+ic('i-check')+'<span>'+tr('f_publish')+'</span></button><button class="link" data-act="oback">'+tr('back')+'</button>');
}
function shrink(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file), im=new Image();
  im.onload=function(){var k=Math.min(1,900/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.max(1,Math.round(im.width*k)); c.height=Math.max(1,Math.round(im.height*k));
    c.getContext('2d').drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg',.7))};
  im.onerror=function(){URL.revokeObjectURL(u); rej()}; im.src=u})}
function shrinkLogo(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file), im=new Image();
  im.onload=function(){var k=Math.min(1,320/Math.max(im.width,im.height)), c=document.createElement('canvas'); c.width=Math.max(1,Math.round(im.width*k)); c.height=Math.max(1,Math.round(im.height*k));
    c.getContext('2d').drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u); var d=c.toDataURL('image/png'); if(d.length>250000)d=c.toDataURL('image/webp',.85); res(d)};
  im.onerror=function(){URL.revokeObjectURL(u); rej()}; im.src=u})}
function pfErr(msg,sel){var e=$('#pferr'); if(e){e.className='hint err'; e.textContent=msg} bad(sel)}
function pfSubmit(){
  if(S.pf.busy||role()!=='branch')return;
  var title=($('#pfTitle').value||'').trim(), live=S.pf.mode==='live';
  var price=Number(($('#pfPrice').value||'').replace(/[^\d]/g,''))||0, step=Number(($('#pfStep').value||'').replace(/[^\d]/g,''))||0;
  if(title.length<3){pfErr(tr('f_err_title'),'#pfTitle'); return}
  if(price<1){pfErr(tr('f_err_price'),'#pfPrice'); return}
  if(live&&step<1){pfErr(tr('f_err_step'),'#pfStep'); return}
  S.pf.busy=true; var btn=$('#pfgo'); btn.classList.add('busy');
  API('POST','/api/lots',{title:title,cat:$('#pfCat').value,src:$('#pfSrc').value,duty:$('#pfDuty').value,ref:($('#pfRef').value||'').trim(),mode:live?'live':'sealed',price:price,step:live?step:0,days:Number($('#pfDays').value)||7,desc:($('#pfDesc').value||'').trim(),view:($('#pfView').value||'').trim(),special:$('#pfSpecial').checked,repeat:$('#pfRepeat').checked,photos:S.pf.photos}).then(function(){
    S.pf.busy=false; return load()}).then(function(){toast(tr('f_posted')); showPanel(portalHTML)},
  function(e){S.pf.busy=false; var b=$('#pfgo'); if(b)b.classList.remove('busy'); pfErr(errMsg(e),'#pfgo')});
}

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  var t=e.target;
  var lang=t.closest('[data-l]'); if(lang){S.lang=lang.getAttribute('data-l'); try{localStorage.setItem('chereta-lang',S.lang)}catch(x){} labels(); renderView(false);
    if(S.open){var y=sheet.scrollTop; sheet.innerHTML=sheetHTML(byId(S.open)); sheet.scrollTop=y; tickSheet(true); updStatus(byId(S.open))} else if(S.panelFn&&sheet.classList.contains('open')&&S.panelFn!==pfHTML&&S.panelFn!==accountHTML&&S.panelFn!==authHTML&&S.panelFn!==entryHTML&&S.panelFn!==profHTML&&S.panelFn!==cmpHTML&&S.panelFn!==repHTML){sheet.innerHTML=S.panelFn()} return}
  var tab=t.closest('#dnav [data-tab]'); if(tab){var nt=tab.getAttribute('data-tab'); if(nt!==S.tab)goTab(nt); return}
  var heart=t.closest('[data-heart]'); if(heart){e.stopPropagation(); var id=heart.getAttribute('data-heart'); var on=!S.watch[id]; if(on)S.watch[id]=1; else delete S.watch[id];
    heart.setAttribute('aria-pressed',on); heart.classList.remove('pop'); void heart.offsetWidth; heart.classList.add('pop'); toast(on?tr('w_on'):tr('w_off')); counts(); if(S.tab==='watch')setTimeout(renderList,350); return}
  var of=t.closest('[data-orgfilter]'); if(of){S.org=of.getAttribute('data-orgfilter'); S.cat='all'; S.mode='all'; S.q=''; goTab('browse'); return}
  var cf=t.closest('[data-catfilter]'); if(cf){S.cat=cf.getAttribute('data-catfilter'); S.org='all'; S.mode='all'; S.q=''; goTab('browse'); return}
  if(t.closest('[data-golive]')){S.mode='live'; S.org='all'; S.cat='all'; S.q=''; goTab('browse'); return}
  if(t.closest('[data-catclear]')){S.cat='all'; buildBrowse(); return}
  var ntb=t.closest('[data-nt]'); if(ntb){S.nt=ntb.getAttribute('data-nt'); $$('#ntseg button').forEach(function(b){b.setAttribute('aria-pressed',b===ntb)}); $('#ntseg i').style.transform='translateX('+(S.nt==='news'?0:100)+'%)'; renderNT(); return}
  var more=t.closest('[data-more]'); if(more){var k=more.getAttribute('data-more'); S.openNews[k]=!S.openNews[k]; var p=more.parentNode; p.classList.toggle('open',!!S.openNews[k]); more.textContent=S.openNews[k]?tr('less'):tr('more'); return}
  var mode=t.closest('[data-mode]'); if(mode){S.mode=mode.getAttribute('data-mode'); var ms=['all','live','sealed']; $$('#modes button').forEach(function(b){b.setAttribute('aria-pressed',b===mode)}); $('#modes i').style.transform='translateX('+(ms.indexOf(S.mode)*100)+'%)'; renderList(); return}
  var org=t.closest('[data-org]'); if(org){S.org=org.getAttribute('data-org'); buildBrowse(); return}
  var add=t.closest('[data-add]'); if(add){var l=byId(S.open); setAmt((l.bidders===0?l.price:l.price)+l.step*Number(add.getAttribute('data-add'))); return}
  var pct=t.closest('[data-pct]'); if(pct){var l2=byId(S.open); setAmt(Math.ceil(l2.initial*(1+Number(pct.getAttribute('data-pct'))/100))); return}
  var am=t.closest('[data-authmode]'); if(am){S.auth.mode=am.getAttribute('data-authmode'); sheet.innerHTML=authHTML(); return}
  var pfm=t.closest('[data-pfmode]'); if(pfm){S.pf.mode=pfm.getAttribute('data-pfmode'); $$('#pfmodes button').forEach(function(b){b.setAttribute('aria-pressed',b===pfm)}); $('#pfmodes i').style.transform='translateX('+(S.pf.mode==='live'?100:0)+'%)'; $('#pfStepWrap').hidden=S.pf.mode!=='live'; return}
  var rp=t.closest('[data-rmphoto]'); if(rp){S.pf.photos.splice(Number(rp.getAttribute('data-rmphoto')),1); pfPhotosRender(); return}
  var rl=t.closest('[data-rmlot]'); if(rl){e.stopPropagation(); rmLot(rl); return}
  var od=t.closest('[data-ord]'); if(od){ordStatus(od); return}
  var en=t.closest('[data-ent]'); if(en){entAct(en); return}
  if(t.closest('[data-orgcta]')){openOrg(); return}
  var nav=t.closest('[data-nav]'); if(nav){var n=nav.getAttribute('data-nav'); closeDrawer();
    if(TABS.indexOf(n)>=0){if(S.tab!==n)goTab(n)}
    else if(n==='register'){setTimeout(function(){S.authNote=''; openAuth('reg')},300)}
    else if(n==='signin'){setTimeout(function(){S.authNote=''; openAuth('in')},300)}
    else if(n==='signout'){logout()}
    else if(n==='org'){setTimeout(openOrg,300)}
    else if(n==='admin'){location.href='/admin.html'}
    else if(n==='account'){setTimeout(function(){showPanel(accountHTML)},300)}
    else if(n==='support'){setTimeout(function(){showPanel(supportHTML)},300)}
    else if(n==='tutorials'){setTimeout(tourStart,350)}
    else setTimeout(function(){openInfo(n)},300); return}
  var act=t.closest('[data-act]'); if(act){var a=act.getAttribute('data-act');
    if(a==='close')closeSheet(); else if(a==='submit')submit(); else if(a==='menu')openDrawer(); else if(a==='closemenu')closeDrawer();
    else if(a==='signin'){if(S.me)openDrawer(); else{S.authNote=''; openAuth('in')}}
    else if(a==='authgo')doAuth(); else if(a==='acsave')acSave(); else if(a==='profsave')profSave(); else if(a==='entryopen')entryOpen(act.getAttribute('data-id')); else if(a==='entrysend')entrySend();
    else if(a==='cmpopen'){S.cmpLot=act.getAttribute('data-id'); closeSheet(); setTimeout(function(){showPanel(cmpHTML)},380)} else if(a==='cmpsend')cmpSend();
    else if(a==='repopen'){S.repId=Number(act.getAttribute('data-id')); showPanel(repHTML)} else if(a==='repsend')repSend();
    else if(a==='prsave')prSave(); else if(a==='popen')showPanel(profHTML);
    else if(a==='extend')API('POST','/api/orders/'+act.getAttribute('data-id')+'/extend').then(function(){toast(tr('pay_ext_ok')); return load()}).then(function(){if(S.open)openSheet(S.open)},function(x){toast(errMsg(x),true)});
    else if(a==='opost')openPost(); else if(a==='oback')openPortal(); else if(a==='pfsubmit')pfSubmit();
    else if(a==='osignout')logout();
    else if(a==='lgrm')API('DELETE','/api/logo').then(function(){toast(tr('o_logo_ok'));return load()}).then(function(){if(S.panelFn===portalHTML)showPanel(portalHTML)},function(e){toast(errMsg(e),true)});
    return}
  if(t===scrim){closeSheet(); return}
  if(t===dscrim){closeDrawer(); return}
  var cd=t.closest('[data-open]'); if(cd){openSheet(cd.getAttribute('data-open'))}
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){if(drawer.classList.contains('open'))closeDrawer(); else if(sheet.classList.contains('open'))closeSheet()}
  if(e.key==='Enter'){var tg=e.target;
    if(tg.matches&&tg.matches('.card'))openSheet(tg.getAttribute('data-open'));
    else if(tg.id==='amt')submit();
    else if(tg.id==='authName'||tg.id==='authPhone'||tg.id==='authUser'||tg.id==='authPass')doAuth();
    else if(tg.id==='acCur'||tg.id==='acNew')acSave()}
});
document.addEventListener('input',function(e){
  var el=e.target;
  if(el.id==='q'){S.q=el.value; renderList()}
  if(el.id==='amt'){var n=Number(el.value.replace(/[^\d]/g,''))||0; el.value=n?fmt(n):''; hint(false)}
  if(el.id==='pfPrice'||el.id==='pfStep'){var n2=Number(el.value.replace(/[^\d]/g,''))||0; el.value=n2?fmt(n2):''}
  if(el.id==='authPhone'){var d=el.value.replace(/\D/g,''); if(d.charAt(0)==='0')d=d.slice(1); d=d.slice(0,9); el.value=d.replace(/(\d{3})(?=\d)/g,'$1 ')}
});
document.addEventListener('change',function(e){
  if(e.target.id==='sort'){S.sort=e.target.value; renderList()}
  if(e.target.id==='lgFile'){var f=e.target.files&&e.target.files[0]; e.target.value=''; if(f)shrinkLogo(f).then(function(d){return API('PUT','/api/logo',{data:d})}).then(function(){toast(tr('o_logo_ok'));return load()}).then(function(){if(S.panelFn===portalHTML)showPanel(portalHTML)},function(x){toast(x&&x.code?errMsg(x):tr('e_bad_photo'),true)})}
  if(e.target.id==='pfFile'){
    var fs=Array.prototype.slice.call(e.target.files||[]).slice(0,3-S.pf.photos.length); e.target.value='';
    fs.reduce(function(p,f){return p.then(function(){return shrink(f).then(function(d){S.pf.photos.push(d); pfPhotosRender()}).catch(function(){})})},Promise.resolve());
  }
});
sheet.addEventListener('scroll',function(e){var g=e.target; if(!g.classList||!g.classList.contains('gal'))return; var i=Math.round(g.scrollLeft/g.clientWidth); $$('.gal-d i',g.parentNode).forEach(function(d,k){d.classList.toggle('on',k===i)})},true);

/* drag the sheet down to close (phones) */
(function(){var y0=null,dy=0;
  sheet.addEventListener('pointerdown',function(e){if(!e.target.closest('#grab'))return; y0=e.clientY; dy=0; sheet.style.transition='none'; e.target.setPointerCapture&&e.target.setPointerCapture(e.pointerId)});
  sheet.addEventListener('pointermove',function(e){if(y0===null)return; dy=Math.max(0,e.clientY-y0); sheet.style.transform='translateY('+dy+'px)'});
  function end(){if(y0===null)return; y0=null; sheet.style.transition=''; sheet.style.transform=''; if(dy>110)closeSheet(); dy=0}
  sheet.addEventListener('pointerup',end); sheet.addEventListener('pointercancel',end);
})();

/* ---------- clock ---------- */
setInterval(function(){
  var n=nowMs();
  $$('[data-end]').forEach(function(el){var ms=Number(el.getAttribute('data-end'))-n; el.querySelector('span').textContent=short(ms); el.classList.toggle('hot',ms>0&&ms<H)});
  tickSheet(false);
  LOTS.forEach(function(l){if(l.status==='open'&&l.end<=n&&!S.poked[l.id]){S.poked[l.id]=1; setTimeout(load,2500); setTimeout(load,12000)}});
},1000);

/* ---------- guided tour (Tutorials) ---------- */
Object.assign(T.en,{bk_t:'Branch bank and office',bk_bank:'Bank',bk_acct:'Account number',bk_holder:'Account name',bk_cpo:'CPO payable to',bk_addr:'Office address',bk_phone:'Office phone',bk_view:'Viewing days and hours',bk_none:'This branch has not published its bank details yet.',
 how_t:'How to bid on this lot',rq_doc:'Tender document fee',rq_doc_v:'{n} ETB, not refundable',rq_sec:'Bid security ({p}%)',rq_sec_v:'{n} ETB by bank-certified cheque or CPO',rq_tin:'Taxpayer number (TIN)',rq_lic:'Valid trade licence',rq_req:'Required',rq_none:'No bid security or document fee',sp_t:'Special sale',
 en_t:'Register for this lot',en_btn:'Register to bid on this lot',en_again:'Register again',en_d:'Pay the {n} ETB document fee into the branch bank account below and keep the receipt. Get a bank-certified cheque or CPO for the bid security ({p}% = {s} ETB) payable as shown. Then enter the details here. The branch checks them before you can bid.',en_doc:'Document fee receipt number',en_cpo:'CPO or cheque number',en_bank:'Issuing bank',en_att:'I confirm these details are true and I accept the auction rules.',en_tin:'Your TIN (10 digits)',en_lic:'Trade licence number',en_send:'Send for checking',en_pend:'Waiting for the branch to check your payment.',en_ok:'Approved. You can bid.',en_rej:'Not approved: ',en_sent:'Sent to the branch',en_banned:'You cannot bid until {d}: two winning bids were not paid in one budget year.',
 ent_t:'Your lot registrations',es_pending:'Waiting',es_approved:'Approved',es_rejected:'Rejected',es_applied:'Used for purchase',es_refund_due:'Refund due',es_refunded:'Refunded',es_forfeited:'Forfeited',
 e_entry_required:'Register for this lot first.',e_need_tin:'Add your 10-digit TIN first.',e_need_license:'Add your trade licence number first.',e_banned:'You are banned from bidding.',e_bad_cpo:'Enter the CPO or cheque number and the bank.',e_attest_required:'Tick the confirmation box.',e_entry_exists:'You already registered for this lot.',e_not_in_tie:'Only tied bidders can rebid.',e_notice_short:'Minimum notice (working days):',e_special_limit:'Special sale limit:',e_bad_tin:'TIN must be 10 digits.',e_complaint_late:'The complaint period has ended.',e_bad_state:'That is not possible now.',e_reference_used:'This receipt number was already used.',e_bad_reference:'Enter the document fee receipt number.',
 os_awaiting_approval:'Waiting for manager approval',os_cancelled:'Cancelled',os_unclaimed:'Not collected',pay_sec:'Bid security already paid',pay_bal:'Balance to pay',pay_ext:'Ask for {n} more working days',pay_ext_ok:'Payment time extended',pay_pick:'Collect goods by',pay_rent:'Storage rent so far',pay_await:'The branch manager must approve the winner first. The payment deadline will appear here.',
 cm_t:'Complaint',cm_btn:'Submit a complaint',cm_d:'You can complain within {n} working days after the lot closes. The branch replies here.',cm_send:'Send',cm_sent:'Complaint sent',cm_re:'Reply:',tie_note:'Equal highest sealed bids. Only the tied bidders may raise their bid until the lot closes again.',
 pr_t:'Bank and office details',pr_d:'Bidders see these on every lot of this branch. Add the bank account for the document fee and sale payment, and the name the CPO must be payable to.',pr_save:'Save',pr_ok:'Saved',o_ent:'Bid registrations to check',o_ref:'Security to return',o_approve:'Approve',o_reject:'Reject',o_refunded:'Returned',o_refund_amt:'Security',o_win_ok:'Approve winner',o_win_no:'Do not approve',o_unclaimed:'Not collected',o_cmp:'Complaints',o_reply:'Reply',
 f_special:'Special sale (up to {n} ETB, no bid security)',f_repeat:'Repeat sale (notice of {n} working days)',f_view:'Viewing days and hours (optional)',ac_prof:'Tax details',ac_pw:'Password'});
Object.assign(T.am,{bk_t:'የቅርንጫፍ ባንክ እና ቢሮ',bk_bank:'ባንክ',bk_acct:'የሂሳብ ቁጥር',bk_holder:'የሂሳብ ስም',bk_cpo:'ሲፒኦ የሚከፈለው ለ',bk_addr:'የቢሮ አድራሻ',bk_phone:'የቢሮ ስልክ',bk_view:'ዕቃውን የሚታይበት ቀን እና ሰዓት',bk_none:'ይህ ቅርንጫፍ የባንክ መረጃውን እስካሁን አላወጣም።',
 how_t:'በዚህ ዕጣ እንዴት መጫረት ይቻላል',rq_doc:'የጨረታ ሰነድ ክፍያ',rq_doc_v:'{n} ብር፣ አይመለስም',rq_sec:'የጨረታ ማስከበሪያ ({p}%)',rq_sec_v:'{n} ብር በባንክ በተመሰከረ ቼክ ወይም ሲፒኦ',rq_tin:'የግብር ከፋይ ቁጥር (TIN)',rq_lic:'ተፈላጊ የንግድ ፈቃድ',rq_req:'ያስፈልጋል',rq_none:'የጨረታ ማስከበሪያ እና የሰነድ ክፍያ የለም',sp_t:'ልዩ ሽያጭ',
 en_t:'ለዚህ ዕጣ ተመዝገብ',en_btn:'በዚህ ዕጣ ለመጫረት ተመዝገብ',en_again:'እንደገና ተመዝገብ',en_d:'የ{n} ብር የሰነድ ክፍያ ከታች ባለው የቅርንጫፉ የባንክ ሂሳብ ከፍለው ደረሰኙን ያስቀምጡ። ለጨረታ ማስከበሪያ ({p}% = {s} ብር) በባንክ የተመሰከረ ቼክ ወይም ሲፒኦ በተገለጸው ስም ያሰሩ። ከዚያ ዝርዝሩን እዚህ ያስገቡ። ቅርንጫፉ ካረጋገጠ በኋላ መጫረት ይችላሉ።',en_doc:'የሰነድ ክፍያ ደረሰኝ ቁጥር',en_cpo:'የሲፒኦ ወይም ቼክ ቁጥር',en_bank:'ያወጣው ባንክ',en_att:'ዝርዝሮቹ እውነት መሆናቸውን አረጋግጣለሁ፤ የጨረታውን ደንብ እቀበላለሁ።',en_tin:'የእርስዎ TIN (10 አሃዝ)',en_lic:'የንግድ ፈቃድ ቁጥር',en_send:'ለማረጋገጫ ላክ',en_pend:'ቅርንጫፉ ክፍያዎን እስኪያረጋግጥ በመጠበቅ ላይ።',en_ok:'ተፈቅዷል። መጫረት ይችላሉ።',en_rej:'አልተፈቀደም፦ ',en_sent:'ወደ ቅርንጫፉ ተልኳል',en_banned:'እስከ {d} መጫረት አይችሉም፤ በአንድ በጀት ዓመት ሁለት ያሸነፉባቸውን ዕጣዎች አልከፈሉም።',
 ent_t:'የተመዘገቡባቸው ዕጣዎች',es_pending:'በመጠበቅ ላይ',es_approved:'ተፈቅዷል',es_rejected:'ውድቅ ተደርጓል',es_applied:'ለግዢ ውሏል',es_refund_due:'የሚመለስ',es_refunded:'ተመልሷል',es_forfeited:'ተወርሷል',
 e_entry_required:'መጀመሪያ ለዚህ ዕጣ ተመዝገብ።',e_need_tin:'መጀመሪያ 10 አሃዝ TIN ያስገቡ።',e_need_license:'መጀመሪያ የንግድ ፈቃድ ቁጥር ያስገቡ።',e_banned:'ከመጫረት ታግደዋል።',e_bad_cpo:'የሲፒኦ ወይም ቼክ ቁጥሩን እና ባንኩን ያስገቡ።',e_attest_required:'የማረጋገጫ ሳጥኑን ምልክት ያድርጉ።',e_entry_exists:'ለዚህ ዕጣ አስቀድመው ተመዝግበዋል።',e_not_in_tie:'እኩል የሆኑ ተጫራቾች ብቻ እንደገና መጫረት ይችላሉ።',e_notice_short:'ዝቅተኛ የማስታወቂያ ጊዜ (የሥራ ቀናት)፦',e_special_limit:'የልዩ ሽያጭ ወሰን፦',e_bad_tin:'TIN 10 አሃዝ መሆን አለበት።',e_complaint_late:'የቅሬታ ጊዜው አልፏል።',e_bad_state:'አሁን ይህ አይቻልም።',e_reference_used:'ይህ ደረሰኝ ቁጥር ከዚህ በፊት ጥቅም ላይ ውሏል።',e_bad_reference:'የሰነድ ክፍያ ደረሰኝ ቁጥሩን ያስገቡ።',
 os_awaiting_approval:'የሥራ አስኪያጅ ማረጋገጫ በመጠበቅ ላይ',os_cancelled:'ተሰርዟል',os_unclaimed:'አልተረከበም',pay_sec:'አስቀድሞ የተከፈለ ማስከበሪያ',pay_bal:'የሚከፈል ቀሪ',pay_ext:'ተጨማሪ {n} የሥራ ቀናት ጠይቅ',pay_ext_ok:'የክፍያ ጊዜ ተራዝሟል',pay_pick:'ዕቃውን የሚረከቡበት የመጨረሻ ቀን',pay_rent:'እስካሁን የመጋዘን ኪራይ',pay_await:'አሸናፊው በቅርንጫፍ ሥራ አስኪያጅ መጽደቅ አለበት። ከዚያ የክፍያ ቀነ ገደቡ እዚህ ይታያል።',
 cm_t:'ቅሬታ',cm_btn:'ቅሬታ አቅርብ',cm_d:'ዕጣው ከተዘጋ በኋላ በ{n} የሥራ ቀናት ውስጥ ቅሬታ ማቅረብ ይችላሉ። ቅርንጫፉ እዚህ ይመልሳል።',cm_send:'ላክ',cm_sent:'ቅሬታው ተልኳል',cm_re:'መልስ፦',tie_note:'ከፍተኛው የታሸገ ጨረታ እኩል ነው። ዕጣው እንደገና እስኪዘጋ እኩል የሆኑ ተጫራቾች ብቻ ጨረታቸውን መጨመር ይችላሉ።',
 pr_t:'የባንክ እና የቢሮ ዝርዝር',pr_d:'ተጫራቾች ይህን በእያንዳንዱ የቅርንጫፍዎ ዕጣ ላይ ያያሉ። ለሰነድ ክፍያ እና ለሽያጭ ክፍያ የባንክ ሂሳብ፣ እና ሲፒኦ የሚከፈልበትን ስም ያስገቡ።',pr_save:'አስቀምጥ',pr_ok:'ተቀምጧል',o_ent:'የሚረጋገጡ የጨረታ ምዝገባዎች',o_ref:'የሚመለስ ማስከበሪያ',o_approve:'አጽድቅ',o_reject:'ውድቅ አድርግ',o_refunded:'ተመልሷል',o_refund_amt:'ማስከበሪያ',o_win_ok:'አሸናፊውን አጽድቅ',o_win_no:'አታጽድቅ',o_unclaimed:'አልተረከበም',o_cmp:'ቅሬታዎች',o_reply:'መልስ ስጥ',
 f_special:'ልዩ ሽያጭ (እስከ {n} ብር፣ ማስከበሪያ የለም)',f_repeat:'ተደጋጋሚ ሽያጭ ({n} የሥራ ቀናት ማስታወቂያ)',f_view:'ዕቃው የሚታይበት ቀን እና ሰዓት (አማራጭ)',ac_prof:'የግብር መረጃ',ac_pw:'የይለፍ ቃል'});
Object.assign(T.en,{tour_skip:'Skip tour',tour_next:'Next',tour_back:'Back',tour_done:'Start bidding',tour_step:'Step {n} of {t}',
 tt0:'Welcome to Chereta',td0:'This quick tour shows you how to find a lot and place a bid. It takes about a minute.',
 tt1:'Find your way around',td1:'Use the menu to move between Home, Auctions, your Watchlist and My bids.',
 tt2:'Search the auctions',td2:'Type a lot name, a lot number or a branch to find what you want.',
 tt3:'Live or sealed',td3:'Live: everyone sees the price rise. Sealed: you send one private bid and the highest wins when the lot closes.',
 tt4:'Every lot is a card',td4:'You see the branch, the price and the time left. Tap a card to open the lot.',
 tt5:'Watch a lot',td5:'Tap the heart to follow a lot. It appears in your Watchlist.',
 tt6:'Check the countdown',td6:'The timer shows how long is left. A last-minute live bid adds extra time, so nobody wins by the last second.',
 tt7:'Place your bid',td7:'Type an amount at or above the minimum, or tap a quick button, then press the bid button.',
 tt8:'Sign in to bid',td8:'Register with your name and phone number. Registering is free.',
 tt9:'Switch language',td9:'Use English or Amharic at any time.',
 tt10:'You are ready',td10:'When you win, the branch manager approves, then the lot page shows what to pay and by when. Good luck!'});
Object.assign(T.am,{tour_skip:'ጉብኝቱን ዝለል',tour_next:'ቀጣይ',tour_back:'ተመለስ',tour_done:'መጫረት ጀምር',tour_step:'ደረጃ {n} ከ {t}',
 tt0:'እንኳን ወደ ጨረታ መጣህ',td0:'ይህ አጭር ጉብኝት ዕጣ እንዴት እንደምታገኝ እና እንደምትጫረት ያሳያል። ወደ አንድ ደቂቃ ይወስዳል።',
 tt1:'በድር ጣቢያው ውስጥ መንቀሳቀስ',td1:'በመነሻ፣ በጨረታዎች፣ በክትትል እና በጨረታዬ መካከል ለመንቀሳቀስ ምናሌውን ተጠቀም።',
 tt2:'ጨረታዎችን ፈልግ',td2:'የምትፈልገውን ለማግኘት የዕጣ ስም፣ የዕጣ ቁጥር ወይም ቅርንጫፍ ጻፍ።',
 tt3:'ቀጥታ ወይም የታሸገ',td3:'ቀጥታ፦ ሁሉም ዋጋው ሲጨምር ያያል። የታሸገ፦ አንድ የግል ጨረታ ታስገባለህ፤ ዕጣው ሲዘጋ ከፍተኛው ያሸንፋል።',
 tt4:'እያንዳንዱ ዕጣ አንድ ካርድ ነው',td4:'ቅርንጫፉን፣ ዋጋውን እና የቀረውን ጊዜ ታያለህ። ዕጣውን ለመክፈት ካርዱን ንካ።',
 tt5:'ዕጣን ተከታተል',td5:'ዕጣን ለመከተል የልብ ምልክቱን ንካ። በክትትልህ ውስጥ ይታያል።',
 tt6:'የሰዓት ቆጠራውን ተመልከት',td6:'ቆጣሪው የቀረውን ጊዜ ያሳያል። በመጨረሻ ደቂቃ የሚገባ የቀጥታ ጨረታ ተጨማሪ ጊዜ ይጨምራል።',
 tt7:'ጨረታህን አስገባ',td7:'ከዝቅተኛው ያላነሰ መጠን ጻፍ ወይም ፈጣን ቁልፍ ንካ፣ ከዚያ የጨረታ ቁልፉን ተጫን።',
 tt8:'ለመጫረት ግባ',td8:'በስምህ እና በስልክ ቁጥርህ ተመዝገብ። ምዝገባ ነጻ ነው።',
 tt9:'ቋንቋ ቀይር',td9:'በማንኛውም ጊዜ እንግሊዝኛ ወይም አማርኛ ተጠቀም።',
 tt10:'ዝግጁ ነህ',td10:'ስታሸንፍ የዕጣው ገጽ ምን እና መቼ እንደምትከፍል ያሳያል። መልካም ዕድል!'});
var TOUR=null;
function vis(el){if(!el)return false;var r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'}
function tpick(sels){for(var i=0;i<sels.length;i++){var e=$(sels[i]);if(vis(e))return e}return null}
function firstOpen(){return LOTS.filter(isOpen).sort(function(a,b){return a.end-b.end})[0]}
var TSTEPS=[
 {k:0},
 {k:1,sel:['#dnav','.menu'],pre:function(){closeSheet();closeDrawer();if(S.tab!=='home')goTab('home')}},
 {k:2,sel:['.search'],pre:function(){closeSheet();S.mode='all';S.org='all';S.cat='all';S.q='';if(S.tab!=='browse')goTab('browse')}},
 {k:3,sel:['#modes'],pre:function(){}},
 {k:4,sel:['#list .card'],pre:function(){}},
 {k:5,sel:['#list .card .heart'],pre:function(){}},
 {k:6,sel:['#segs','.pricebox'],pre:function(){var l=firstOpen();if(l&&S.open!==l.id)openSheet(l.id)},wait:520},
 {k:7,sel:['.bidbox','#amt'],pre:function(){},wait:50},
 {k:8,sel:['#signin'],pre:function(){closeSheet()},wait:380},
 {k:9,sel:['#langtop','.menu'],pre:function(){}},
 {k:10}
];
function tourStart(){
  if(TOUR)tourEnd(true);
  closeDrawer();closeSheet();
  TOUR={i:-1,dir:1,steps:TSTEPS};
  var o=document.createElement('div');o.id='tour';o.className='tour';o.innerHTML='<div class="tspot" id="tspot"></div><div class="tcard" id="tcard" role="dialog" aria-live="polite"></div>';
  document.body.appendChild(o);document.body.style.overflow='hidden';
  tourGo(1);
}
function tourEnd(silent){var o=$('#tour');if(o)o.parentNode.removeChild(o);TOUR=null;if(!silent){document.body.style.overflow='';closeSheet();try{localStorage.setItem('chereta-tour','1')}catch(e){}}}
function tourGo(dir){
  var t=TOUR;if(!t)return;t.dir=dir;var i=t.i+dir;
  while(i>=0&&i<t.steps.length){var st=t.steps[i];
    if(st.pre)st.pre();
    if(st.sel){
      // step needs a target; skip when no lot exists to point at
      if((st.k===4||st.k===5||st.k===6||st.k===7)&&!firstOpen()){i+=dir;continue}
    }
    break}
  if(i<0)i=0;if(i>=t.steps.length){tourEnd();return}
  t.i=i;var step=t.steps[i];
  setTimeout(function(){if(TOUR===t)tourShow(step)},step.wait||120);
}
function tourShow(step){
  var t=TOUR;if(!t)return;var el=step.sel?tpick(step.sel):null;
  if(el)el.scrollIntoView({block:el.closest('.sheet')?'nearest':'center',inline:'nearest'});
  setTimeout(function(){if(TOUR===t)tourPlace(step,el)},el?160:0);
}
function tourPlace(step,el){
  var t=TOUR;if(!t)return;var n=t.steps.length,k=step.k,c=$('#tcard'),sp=$('#tspot'),last=t.i===n-1;
  c.innerHTML='<div class="tbadge">'+tr('tour_step').replace('{n}',t.i+1).replace('{t}',n)+'</div><h3>'+tr('tt'+k)+'</h3><p>'+tr('td'+k)+'</p>'+
   '<div class="tdots">'+t.steps.map(function(x,j){return '<i class="'+(j===t.i?'on':j<t.i?'done':'')+'"></i>'}).join('')+'</div>'+
   '<div class="tbtns">'+(last?'':'<button class="tskip" data-tour="skip">'+tr('tour_skip')+'</button>')+'<span class="sp"></span>'+(t.i>0?'<button class="tback" data-tour="back">'+tr('tour_back')+'</button>':'')+'<button class="tnext" data-tour="'+(last?'done':'next')+'">'+(last?tr('tour_done'):tr('tour_next'))+'</button></div>';
  var vw=window.innerWidth,vh=window.innerHeight,cw=Math.min(360,vw-24);c.style.width=cw+'px';
  if(!el){sp.classList.add('none');sp.style.cssText='';c.style.left=Math.round((vw-cw)/2)+'px';c.style.top=Math.max(12,Math.round((vh-c.offsetHeight)/2))+'px';c.classList.remove('in');void c.offsetWidth;c.classList.add('in');return}
  sp.classList.remove('none');var r=el.getBoundingClientRect(),pad=8,L=Math.max(4,r.left-pad),T0=Math.max(4,r.top-pad),W=Math.min(vw-8-L,r.width+pad*2),Hh=Math.min(vh-8-T0,r.height+pad*2);
  sp.style.left=L+'px';sp.style.top=T0+'px';sp.style.width=W+'px';sp.style.height=Hh+'px';
  var ch=c.offsetHeight,below=vh-(T0+Hh),y;
  if(below>=ch+16)y=T0+Hh+14;else if(T0>=ch+16)y=T0-ch-14;else y=Math.max(12,vh-ch-12);
  var x=Math.min(Math.max(12,L+W/2-cw/2),vw-cw-12);
  c.style.left=Math.round(x)+'px';c.style.top=Math.round(y)+'px';c.classList.remove('in');void c.offsetWidth;c.classList.add('in');
}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-tour]');if(!b||!TOUR)return;e.stopPropagation();var a=b.getAttribute('data-tour');if(a==='next')tourGo(1);else if(a==='back')tourGo(-1);else tourEnd()},true);
document.addEventListener('keydown',function(e){if(!TOUR)return;if(e.key==='Escape'){e.stopPropagation();tourEnd()}else if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();e.stopPropagation();tourGo(1)}else if(e.key==='ArrowLeft'){e.stopPropagation();tourGo(-1)}},true);
window.addEventListener('resize',function(){if(TOUR&&TOUR.i>=0)tourShow(TOUR.steps[TOUR.i])});

applyBrand(); labels(); renderView(false); load().then(connect);
})();
