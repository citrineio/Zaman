'use strict';
(() => {
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const seed=[
{id:'dune',title:'Dune Runner',collection:'16-bit collection',art:'dune.svg',description:'Cross the quiet dunes. Follow the last signal home.',playable:true},
{id:'orbital',title:'Orbital',collection:'Arcade collection',art:'orbital.svg',description:'A little ship. An enormous sky.'},
{id:'garden',title:'The Last Garden',collection:'Handheld collection',art:'garden.svg',description:'Find a green path through a forgotten world.'},
{id:'circuit',title:'Neon Circuit',collection:'16-bit collection',art:'circuit.svg',description:'Chase the lights beyond the sleeping city.'},
{id:'ember',title:'Ember Trail',collection:'Native games',art:'ember.svg',description:'A sample native-game entry for the Dukkan installation workflow.'},
{id:'current',title:'Quiet Current',collection:'Arcade collection',art:'current.svg',description:'Drift toward the coast.'}
];
const fresh=()=>({favorites:['dune'],volume:65,muted:false,output:'HDMI / TV',wifi:true,bluetooth:true,dnd:false,compact:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,artwork:true,installed:[],imported:false,scraped:false,resolution:'1920 × 1080 · 60 Hz'});
let saved=fresh();try{const x=JSON.parse(localStorage.getItem('zaman-preview-v1'));if(x&&typeof x==='object'&&!Array.isArray(x)){for(const k of ['wifi','bluetooth','dnd','compact','reduced','artwork','muted','imported','scraped'])if(typeof x[k]==='boolean')saved[k]=x[k];if(Array.isArray(x.favorites))saved.favorites=x.favorites.filter(v=>typeof v==='string'&&v.length<30);if(Array.isArray(x.installed))saved.installed=x.installed.filter(v=>v==='ember');if(Number.isFinite(x.volume))saved.volume=Math.max(0,Math.min(100,x.volume));if(['HDMI / TV','Headphones'].includes(x.output))saved.output=x.output;}}
catch{/* Private browsing or invalid state: use a fresh preview. */}
const state={...saved,page:'Home',selected:'dune',query:'',collection:'all',sort:'title',menu:false,tab:'Home',sub:'home',locations:{Home:'home',Notifications:'notifications',Settings:'settings'},playing:false,transfer:'idle',receive:0,scrape:'idle',lookup:0,storeProgress:0,installing:false,notifications:[],tasks:{play:false,transfer:false,artwork:false},tour:!sessionStorageSafe('zaman-tour-seen'),previewResolution:null};
function sessionStorageSafe(k,v){try{if(v!==undefined)sessionStorage.setItem(k,v);return sessionStorage.getItem(k);}catch{return null;}}
function persist(){try{const o={};for(const k of Object.keys(fresh()))o[k]=state[k];localStorage.setItem('zaman-preview-v1',JSON.stringify(o));}catch{/* Preview remains usable without storage. */}}
function games(){const a=seed.filter(g=>g.id!=='ember'||state.installed.includes('ember'));if(state.imported)a.push({id:'pocket',title:'Pocket Voyage',collection:'Handheld collection',art:state.scraped?'current.svg':null,description:'A fictional game added through the sample transfer workflow.'});return a;}
const getGame=id=>games().find(g=>g.id===id)||seed[0];
function art(g){return g.art&&state.artwork?`<img src="assets/demo/${esc(g.art)}" alt="${esc(g.title)} sample artwork">`:'<span class="missing-art">ARTWORK PENDING</span>';}
function action(label,name,cls='secondary',extra=''){return `<button class="${cls}" data-action="${name}" ${extra}>${label}</button>`;}
function row(icon,title,detail,name,extra=''){return `<button class="menu-row" data-action="${name}" ${extra}><span class="row-icon" aria-hidden="true">${icon}</span><span><strong>${title}</strong><small>${detail}</small></span><span class="row-chevron" aria-hidden="true">›</span></button>`;}
function notify(message){state.notifications.unshift({id:Date.now()+Math.random(),message});state.notifications=state.notifications.slice(0,20);if(!state.dnd){$('#toast').textContent='✓  '+message;$('#toast').hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#toast').hidden=true,4200);}if(state.menu&&state.sub==='notifications')renderMenu(false);}
function card(g){return `<button class="game-card" data-action="select-game" data-game="${g.id}" aria-label="${esc(g.title)} — view game">${art(g)}${state.favorites.includes(g.id)?'<span class="favorite-star" aria-label="Favorite">★</span>':''}<strong>${esc(g.title)}</strong><small>${esc(g.collection.toUpperCase())}</small></button>`;}
function heroMarkup(g){return `<section class="hero-game">${g.art&&state.artwork?`<img class="hero-art" src="assets/demo/${g.art}" alt="">`:''}<div class="hero-info"><span class="eyebrow">BACK TO YOUR GAMES</span><h1>${esc(g.title)}</h1><span class="eyebrow">${esc(g.collection)}</span><p>${esc(g.description)}</p>${action(g.playable?'Play game':'View game','home-play','primary')}${action('Game details','details')}</div></section>`;}
function renderLibrary(focusId){
 document.body.classList.toggle('reduced',state.reduced);
 $('#library-nav').innerHTML=['Home','Library','Favorites','Preferences'].map(p=>`<button data-action="page" data-page="${p}" ${p===state.page?'aria-current="page"':''}>${p}</button>`).join('');
 const g=getGame(state.selected);let content='';
 if(state.page==='Home')content=`${heroMarkup(g)}<div class="shelf-header"><h2>Recently played</h2><span>SAMPLE LIBRARY</span></div><div class="games-grid">${games().slice(0,4).map(card).join('')}</div>`;
 else if(state.page==='Preferences')content=`<section class="preference-list"><h1>Library preferences</h1><p>Preview preferences are stored only in this browser.</p><label>Reduce navigation motion<input type="checkbox" data-setting="reduced" ${state.reduced?'checked':''}></label><label>Compact game grid<input type="checkbox" data-setting="compact" ${state.compact?'checked':''}></label><label>Show game artwork<input type="checkbox" data-setting="artwork" ${state.artwork?'checked':''}></label><p class="sim-label">These are library preferences. Expanded system appearance controls remain a roadmap item.</p></section>`;
 else {
 const list=games().filter(g=>(state.page!=='Favorites'||state.favorites.includes(g.id))&&(state.collection==='all'||g.collection===state.collection)&&g.title.toLowerCase().includes(state.query.toLowerCase())).sort((a,b)=>state.sort==='title'?a.title.localeCompare(b.title):b.title.localeCompare(a.title));
 content=`<div class="toolbar"><h1>${state.page}</h1><label>Search <input id="search" type="search" maxlength="80" value="${esc(state.query)}" placeholder="Search games…" aria-label="Search games"></label><select id="collection" aria-label="Filter collection"><option value="all">All collections</option>${[...new Set(games().map(g=>g.collection))].map(c=>`<option ${c===state.collection?'selected':''}>${esc(c)}</option>`).join('')}</select><select id="sort" aria-label="Sort games"><option value="title">Title A–Z</option><option value="reverse" ${state.sort==='reverse'?'selected':''}>Title Z–A</option></select></div><div class="games-grid" ${state.compact?'style="--columns:5"':''}>${list.map(card).join('')}</div>${list.length?'':'<p class="empty-state">No games here yet. Try another search or favorite a game from its details.</p>'}`;
 }
 $('#library-content').innerHTML=content;
 if(focusId)document.querySelector(focusId)?.focus({preventScroll:true});
}
function openMenu(sub,tab){
 if(!state.menu){openMenu.origin=document.activeElement;state.menu=true;$('#menu-backdrop').hidden=false;$('#system-menu').hidden=false;$('#library-shell').inert=true;$('#game-shell').inert=true;$('#system-button').setAttribute('aria-expanded','true');keys.clear();}
 if(tab)state.tab=tab;if(sub){state.sub=sub;menuTrails[state.tab]=sub===menuRoots[state.tab]?[]:[menuRoots[state.tab]];}else state.sub=state.locations[state.tab];state.locations[state.tab]=state.sub;
 renderMenu();
}
function closeMenu(){state.menu=false;$('#system-menu').hidden=true;$('#menu-backdrop').hidden=true;$('#library-shell').inert=false;$('#game-shell').inert=false;$('#system-button').setAttribute('aria-expanded','false');keys.clear();renderLibrary();if(openMenu.origin?.isConnected)openMenu.origin.focus({preventScroll:true});else $('#system-button').focus({preventScroll:true});}
const menuFocus = new Map();
const menuTrails = {Home: [], Notifications: [], Settings: []};
const menuRoots = {Home: 'home', Notifications: 'notifications', Settings: 'settings'};
function focusKey(el) {
 if (!el) return '';
 return el.id || [el.dataset.action, el.dataset.sub, el.dataset.tab, el.dataset.game, el.dataset.id, el.dataset.setting].filter(Boolean).join(':');
}
function focusMenuControl(el) {
 if (!el) return;
 el.focus({preventScroll:true});
 el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
}
function menuGo(sub, remember=true) {
 if (sub !== state.sub && remember) menuTrails[state.tab].push(state.sub);
 state.sub=sub; state.locations[state.tab]=sub; renderMenu();
}
function switchTab(tab,content=true){state.tab=tab;state.sub=state.locations[tab];renderMenu(content);if(!content)focusMenuControl($('#menu-tabs').querySelector(`[data-tab="${tab}"]`));}
function back(){
 if (!state.menu) return;
 if (state.sub==='display-confirm') { revertDisplay(); return; }
 const parent=menuTrails[state.tab].pop();
 if (parent) { menuGo(parent,false); return; }
 if (state.sub!==menuRoots[state.tab]) { menuGo(menuRoots[state.tab],false); return; }
 closeMenu();
}

function renderMenu(focus=true){
 const focused=document.activeElement;
 const previousKey=focusKey(focused);
 const focusScope=state.tab+'/'+state.sub;
 $('#menu-context').textContent=state.playing?'In game · Dune Runner':'Library · Browser simulation';
 $('#menu-tabs').innerHTML=['Home','Notifications','Settings'].map(t=>`<button data-action="menu-tab" data-tab="${t}" ${state.tab===t?'aria-current="page"':''}>${t}</button>`).join('');
 let body='';const sub=state.sub;
 if(!['home','settings','notifications'].includes(sub))body+='<button class="menu-back" data-action="back">← Back</button>';
 if(sub==='home')body+=row('↩',state.playing?'Resume':'Return to library',state.playing?'Return to your game':'Continue browsing your games','close-menu')+row('◷','Activity',state.installing?'Dukkan installation in progress':'Dukkan transactions and results','sub','data-sub="activity"')+row('⇣','Transfer Games',state.imported?'Sample game imported':'Receive games and review pending imports','sub','data-sub="transfer"')+row('▧','Artwork & Game Info','Find covers, screenshots and descriptions','sub','data-sub="artwork"')+row('♫','Audio','Volume and audio output','sub','data-sub="audio"')+row('⏻','Power','Device power options','sub','data-sub="power"')+(state.playing?row('×','Exit Game','Close the current game','sub','data-sub="exit"'):row('▦','Storefronts','Dukkan and Steam','sub','data-sub="store"'));
 if(sub==='settings')body+=row('♫','Audio','Volume and audio output','sub','data-sub="audio"')+row('♧','Notifications','Do Not Disturb and notice preferences','sub','data-sub="notification-settings"')+row('⊞','Controllers','Connected controllers and active input profiles','sub','data-sub="controllers"')+row('⌁','Network','Connections and saved networks','sub','data-sub="network"')+row('ᛒ','Bluetooth','Pair and manage your devices','sub','data-sub="bluetooth"')+row('▱','Display','Resolution and refresh rate','sub','data-sub="display"')+row('◐','Appearance','Coming later · see development roadmap','appearance');
 if(sub==='audio')body+=`<h3>Audio</h3><p class="sim-label">Simulated audio settings</p><div class="setting-box"><label for="volume">Volume <output id="volume-value">${state.muted?'Muted':state.volume+'%'}</output></label><input id="volume" type="range" min="0" max="100" value="${state.volume}" aria-label="Volume">${action(state.muted?'Unmute':'Mute','mute')}<label for="audio-output">Playback output</label><select id="audio-output"><option ${state.output==='HDMI / TV'?'selected':''}>HDMI / TV</option><option ${state.output==='Headphones'?'selected':''}>Headphones</option></select></div><p>Adjusting this preview does not change your computer’s audio.</p>`;
 if(sub==='transfer')body+=transferBody();
 if(sub==='artwork')body+=scrapeBody();
 if(sub==='store')body+=`<h3>Storefronts</h3><p class="sim-label">Sample catalog · no downloads</p><div class="setting-box"><h3>Dukkan</h3><p>Discover curated native games.</p><img src="assets/demo/ember.svg" alt="Ember Trail sample artwork" style="width:100%;border-radius:8px"><b>Ember Trail</b><p>Fictional sample title for the install workflow.</p>${state.installing?`<progress value="${state.storeProgress}" max="100" aria-label="Installation progress"></progress><p>${state.storeProgress}% · Installing in the background</p>`:action(state.installed.includes('ember')?'Remove sample game':'Install sample game',state.installed.includes('ember')?'remove-game':'install-game','primary')}</div><div class="setting-box"><h3>Steam</h3><p>The real prototype integrates installed Steam games. Steam itself does not run inside this browser demo.</p>${action('Preview integration details','steam')}</div>`;
 if(sub==='activity')body+=`<h3>Activity</h3><p>Accepted jobs continue after closing the store or menu.</p>${state.installing?`<div class="setting-box"><b>Ember Trail</b><progress value="${state.storeProgress}" max="100" aria-label="Background installation"></progress><p>${state.storeProgress}% · Installing</p></div>`:state.installed.includes('ember')?'<div class="setting-box"><b>Ember Trail · Complete</b><p>Installed and published to the sample library.</p></div>':'<div class="setting-box"><p>No active jobs. Try installing the sample game in Dukkan.</p></div>'}${action('Open Dukkan','sub','secondary','data-sub="store"')}`;
 if(sub==='controllers')body+=`<h3>Controllers</h3><p class="sim-label">Illustrative device status</p><div class="device"><span>⊞</span><div><b>Sample normalized controller</b><small>Connected · Player 1 · simulated profile</small></div></div><p>This device card is sample data. Keyboard and touch controls work immediately. A browser-compatible connected gamepad can also navigate the preview after a button press.</p>${action('Controls & shortcuts','help')}`;
 if(sub==='network')body+=`<h3>Network</h3><p class="sim-label">Simulated network settings</p><div class="setting-box"><label>Wi-Fi<input type="checkbox" data-setting="wifi" ${state.wifi?'checked':''}></label><p>${state.wifi?'Connected to Zaman-Lab · sample network':'Wi-Fi disabled in preview'}</p>${state.wifi?action('Scan for networks','scan'):''}</div><p>No real network connections are changed.</p>`;
 if(sub==='bluetooth')body+=`<h3>Bluetooth</h3><p class="sim-label">Simulated Bluetooth settings</p><div class="setting-box"><label>Bluetooth<input type="checkbox" data-setting="bluetooth" ${state.bluetooth?'checked':''}></label><p>${state.bluetooth?'Sample controller · Connected':'Bluetooth disabled in preview'}</p>${state.bluetooth?action('Pair sample device','pair'):''}</div><p>This demonstration does not request Bluetooth access.</p>`;
 if(sub==='notification-settings')body+=`<h3>Notifications</h3><div class="setting-box"><label>Do Not Disturb<input type="checkbox" data-setting="dnd" ${state.dnd?'checked':''}></label><p>Routine toasts are hidden while history and background work remain available.</p></div>${action('Send test notification','test-notice')}`;
 if(sub==='notifications')body+=`<h3>Notifications</h3>${state.notifications.length?state.notifications.map(n=>row('✓',esc(n.message),'Preview event · dismiss individually','dismiss-notice',`data-id="${n.id}"`)).join('')+action('Clear finished history','clear-notices'):'<div class="setting-box"><p>No notifications yet. Transfer a sample game or change the audio output.</p></div>'}<p>Clearing history leaves pending transfers and installations intact.</p>`;
 if(sub==='display')body+=`<h3>Display</h3><p class="sim-label">Simulated mode selection</p><div class="setting-box"><label for="display-mode">Current: ${esc(state.resolution)}</label><select id="display-mode"><option>1920 × 1080 · 60 Hz</option><option>2560 × 1440 · 60 Hz</option><option>1280 × 720 · 60 Hz</option></select>${action('Preview mode','preview-display','primary')}</div><p>Your browser resolution will not change. This demonstrates the OS confirmation and automatic revert flow.</p>`;
 if(sub==='display-confirm')body+=`<h3>Keep this display mode?</h3><p>${esc(state.previewResolution)}</p><p id="display-countdown">Reverting automatically in 10 seconds.</p>${action('Keep mode','keep-display','primary')}${action('Revert','revert-display')}`;
 if(sub==='power')body+=row('⏻','Shutdown','Show confirmation','sub','data-sub="shutdown"')+row('↻','Reboot','Show confirmation','sub','data-sub="reboot"')+`<button class="menu-row" disabled><span class="row-icon">☾</span><span><strong>Sleep</strong><small>Coming soon</small></span></button>`;
 if(['exit','shutdown','reboot'].includes(sub))body+=`<h3>${sub==='exit'?'Exit this game?':sub==='shutdown'?'Shut down Zaman?':'Restart Zaman?'}</h3><p>${sub==='exit'?'The sample game session will end.':'This is a preview: your computer will stay on.'}</p>${action('Cancel','back','primary')}${action(sub==='exit'?'Exit Game':'Confirm preview action',sub==='exit'?'exit-game':'fake-power')}`;
 $('#menu-content').innerHTML=body;
 const controls=[...$('#menu-content').querySelectorAll('button:not(:disabled),input,select,a[href]')];
 const token=focus ? menuFocus.get(focusScope) : previousKey;
 const target=(focus?controls:visibleControls($('#system-menu'))).find(el=>focusKey(el)===token);
 if (focus) focusMenuControl(target || controls.find(el=>!el.classList.contains('menu-back')) || controls[0]);
 else if (target) focusMenuControl(target);

}
function transferBody(){let s=`<h3>Transfer Games</h3><p class="sim-label">Sample transfer · no files uploaded</p>`;
 if(state.transfer==='idle')return s+`<div class="setting-box"><b>Zaman is ready to receive</b><p>On the actual OS, send files using a stock LocalSend client. Here, use the sample below.</p><p>Pocket Voyage.gba · 8 MB · From sample phone</p>${action('Send sample game','receive','primary')}</div>`;
 if(state.transfer==='receiving')return s+`<div class="setting-box"><b>Pocket Voyage.gba</b><progress value="${state.receive}" max="100" aria-label="Receiving progress"></progress><p>${state.receive}% · Receiving in background</p>${action('Cancel receiving','cancel-transfer')}</div><p>You can close this menu. Reception will continue.</p>`;
 if(state.transfer==='destination')return s+`<div class="setting-box"><b>Received · Choose destination</b><p>The sample waits for you to confirm its collection.</p><label for="destination">Destination</label><select id="destination"><option>Handheld collection</option></select><label style="margin-top:12px">Look up recommended artwork<input id="auto-artwork" type="checkbox" checked></label>${action('Import game','import-game','primary')}</div>`;
 return s+`<div class="setting-box"><b>✓ Pocket Voyage · Imported</b><p>Handheld collection · Your sample library is updated after closing the menu.</p>${action('Open Artwork & Game Info','sub','secondary','data-sub="artwork"')}</div>`;
}
function scrapeBody(){let s='<h3>Artwork & Game Info</h3><p class="sim-label">Sample lookup · no external service contacted</p>';
 if(!state.imported)return s+`<div class="setting-box"><p>Import the sample game first, then add its cover and information.</p>${action('Open Transfer Games','sub','primary','data-sub="transfer"')}</div>`;
 if(state.scrape==='running')return s+`<div class="setting-box"><b>Finding Pocket Voyage</b><progress value="${state.lookup}" max="100" aria-label="Artwork lookup progress"></progress><p>${state.lookup}% · Retrieving artwork and details</p></div><p>You can return to the library while the sample lookup finishes.</p>`;
 return s+`<div class="setting-box"><label for="scrape-collection">Collection</label><select id="scrape-collection"><option>All collections</option><option>Handheld collection</option></select><p>${state.scraped?'✓ Cover and information ready. Close the menu to see the result.':'Pocket Voyage · Artwork missing'}</p>${state.scraped?'<img src="assets/demo/current.svg" alt="Retrieved sample artwork" style="width:100%;border-radius:8px">':''}${action(state.scraped?'Run recommended lookup again':'Recommended lookup','scrape','primary')}<p>Your game and saves stay untouched.</p></div>`;
}
let receiveTimer,scrapeTimer,installTimer,displayTimer;
function receive(){if(state.transfer!=='idle')return;state.transfer='receiving';state.receive=0;renderMenu();receiveTimer=setInterval(()=>{state.receive=Math.min(100,state.receive+10);if(state.receive===100){clearInterval(receiveTimer);state.transfer='destination';notify('Sample game received · choose its destination');}if(state.menu&&state.sub==='transfer')renderMenu(false);},320);}
function scrape(){if(!state.imported||state.scrape==='running')return;state.scrape='running';state.lookup=0;renderMenu();scrapeTimer=setInterval(()=>{state.lookup=Math.min(100,state.lookup+10);if(state.lookup===100){clearInterval(scrapeTimer);state.scrape='complete';state.scraped=true;state.tasks.artwork=true;persist();notify('Artwork & game info ready · Pocket Voyage');if(!state.menu)renderLibrary();}if(state.menu&&state.sub==='artwork')renderMenu(false);},300);}
function install(){if(state.installing)return;state.installing=true;state.storeProgress=0;renderMenu();installTimer=setInterval(()=>{state.storeProgress=Math.min(100,state.storeProgress+10);if(state.storeProgress===100){clearInterval(installTimer);state.installing=false;state.installed=['ember'];persist();notify('Ember Trail installed · added to Native games');if(!state.menu)renderLibrary();}if(state.menu&&['store','activity'].includes(state.sub))renderMenu(false);},400);}
function revertDisplay(){clearInterval(displayTimer);state.previewResolution=null;if(menuTrails[state.tab].at(-1)==='display')menuTrails[state.tab].pop();menuGo('display',false);}
function modal(html){$('#modal').innerHTML=html;$('#modal').showModal();}
function details(id){const g=getGame(id);state.selected=g.id;modal(`<h2 id="modal-title">${esc(g.title)}</h2>${g.art?`<img class="detail-art" src="assets/demo/${g.art}" alt="${esc(g.title)} sample art">`:''}<p>${esc(g.description)}</p><p class="sim-label">Fictional sample title · ${g.playable?'playable browser mini-game':'library illustration'}</p>${action(g.playable?'Play game':'Play Dune Runner sample','play','primary')}${action(state.favorites.includes(g.id)?'★ Remove favorite':'☆ Add favorite','favorite','secondary',`data-game="${g.id}"`)}${action('Back','close-modal')}`);}
function help(){modal(`<h2 id="modal-title">Take the controls.</h2><p>Explore freely, or try these three short tasks. System actions and titles are illustrative; Dune Runner is an original playable browser mini-game.</p><div class="controls-table"><div><kbd>Arrows</kbd> Navigate / move</div><div><kbd>Enter</kbd> Select</div><div><kbd>M</kbd> Open / close system menu</div><div><kbd>Esc</kbd> Back / open menu in game</div><div><kbd>Q / E</kbd> Previous / next tab</div><div><kbd>Space</kbd> Jump in game</div></div><ol class="tour-tasks"><li class="${state.tasks.play?'done':''}">Play Dune Runner and open the menu.</li><li class="${state.tasks.transfer?'done':''}">Transfer and import Pocket Voyage.</li><li class="${state.tasks.artwork?'done':''}">Retrieve its artwork, then find it in Library.</li></ol><p>Mouse and touch work throughout. For a connected standard gamepad: D-pad to move, south button to select/jump, east button to go back, shoulders for tabs and Start to toggle the menu.</p>${action('Start exploring','close-modal','primary')}${action('Try a sample transfer','tour-transfer')}`);sessionStorageSafe('zaman-tour-seen','1');}
function doAction(a,el){switch(a){
 case 'page':state.page=el.dataset.page;renderLibrary(`[data-page="${state.page}"]`);break;
 case 'select-game':state.selected=el.dataset.game;if(state.page==='Home')renderLibrary(`[data-game="${state.selected}"]`);else details(state.selected);break;
 case 'details':details(state.selected);break;
 case 'home-play':getGame(state.selected).playable?play():details(state.selected);break;
 case 'play':play();break;
 case 'favorite':{const id=el.dataset.game;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];persist();$('#modal').close();renderLibrary();notify('Favorites updated');break;}
 case 'toggle-menu':state.menu?closeMenu():openMenu();break;
 case 'close-menu':closeMenu();break;
 case 'sub':menuGo(el.dataset.sub);break;
 case 'menu-tab':switchTab(el.dataset.tab);break;
 case 'back':back();break;
 case 'mute':state.muted=!state.muted;persist();renderMenu();break;
 case 'receive':receive();break;
 case 'cancel-transfer':clearInterval(receiveTimer);state.transfer='idle';state.receive=0;renderMenu();notify('Sample reception cancelled');break;
 case 'import-game':{if(state.transfer!=='destination')break;const auto=$('#auto-artwork')?.checked;state.imported=true;state.transfer='complete';state.tasks.transfer=true;persist();notify('Pocket Voyage imported · close menu to refresh');renderMenu();if(auto)scrape();break;}
 case 'scrape':scrape();break;
 case 'install-game':install();break;
 case 'remove-game':state.installed=[];persist();renderMenu();notify('Sample game removed');break;
 case 'scan':notify('Found sample network: Zaman-Lab');break;
 case 'pair':notify('Sample controller paired');break;
 case 'appearance':notify('Appearance settings are planned · see roadmap');break;
 case 'test-notice':notify('Test notification · your game is ready');break;
 case 'dismiss-notice':state.notifications=state.notifications.filter(n=>String(n.id)!==el.dataset.id);renderMenu();break;
 case 'clear-notices':state.notifications=[];renderMenu();break;
 case 'preview-display':{state.previewResolution=$('#display-mode').value;menuGo('display-confirm');let seconds=10;clearInterval(displayTimer);displayTimer=setInterval(()=>{seconds--;if(!seconds)return revertDisplay();if($('#display-countdown'))$('#display-countdown').textContent=`Reverting automatically in ${seconds} seconds.`;},1000);break;}
 case 'keep-display':clearInterval(displayTimer);state.resolution=state.previewResolution;revertDisplay();notify('Preview display mode confirmed');break;
 case 'revert-display':revertDisplay();break;
 case 'exit-game':state.playing=false;state.sub='home';state.locations.Home='home';menuTrails.Home=[];state.tab='Home';closeMenu();$('#game-shell').hidden=true;$('#library-shell').hidden=false;state.selected='dune';renderLibrary();notify('Returned to library');break;
 case 'fake-power':notify('Preview action complete · your computer is unchanged');closeMenu();break;
 case 'steam':modal('<h2 id="modal-title">Steam integration</h2><p>The Q6A prototype exports installed Steam games to Pegasus and manages launch/return while keeping Steam alive. Compatibility is game- and platform-specific.</p><p>This browser preview does not run Steam or emulate a PC.</p><a href="development.html">Read the feature status →</a>'+action('Back','close-modal'));break;
 case 'help':help();break;
 case 'tour-transfer':$('#modal').close();openMenu('transfer','Home');break;
 case 'close-modal':$('#modal').close();if(state.menu)renderMenu();else if(!state.playing)$('#library-content button')?.focus({preventScroll:true});break;
 case 'reset':modal('<h2 id="modal-title">Reset this preview?</h2><p>This clears sample library changes, settings and progress in this browser. No real games or files are affected.</p>'+action('Keep exploring','close-modal','primary')+action('Reset preview','confirm-reset'));break;
 case 'confirm-reset':try{localStorage.removeItem('zaman-preview-v1');sessionStorage.removeItem('zaman-tour-seen');}catch{}location.href=location.pathname;break;
}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)doAction(b.dataset.action,b);});
document.addEventListener('input',e=>{
 if(e.target.id==='search'){const caret=e.target.selectionStart;state.query=e.target.value;renderLibrary('#search');$('#search').setSelectionRange?.(caret,caret);}
 if(e.target.id==='volume'){state.volume=Number(e.target.value);state.muted=false;$('#volume-value').textContent=state.volume+'%';persist();}
});
document.addEventListener('change',e=>{
 const setting=e.target.dataset.setting;if(setting&&Object.hasOwn(fresh(),setting)){state[setting]=e.target.checked;persist();document.body.classList.toggle('reduced',state.reduced);if(state.menu)renderMenu(false);else renderLibrary();}
 if(e.target.id==='collection'){state.collection=e.target.value;renderLibrary('#collection');}
 if(e.target.id==='sort'){state.sort=e.target.value;renderLibrary('#sort');}
 if(e.target.id==='audio-output'){state.output=e.target.value;persist();notify('Audio output changed · '+state.output);}
});
$('#menu-backdrop').addEventListener('click',closeMenu);$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))$('#modal').close();});
// One navigation model for keyboard and gamepad. Menu content is a vertical list;
// tabs are horizontal; range/select controls reserve Left/Right for their value.
function visibleControls(root) {
 return [...root.querySelectorAll('button:not(:disabled),a[href],input,select')]
  .filter(el=>el.getClientRects().length && !el.closest('[hidden]'));
}
function adjustValue(el,delta) {
 if (el?.type==='range') {
  el.value=String(Math.max(Number(el.min),Math.min(Number(el.max),Number(el.value)+delta*Number(el.step||2))));
  el.dispatchEvent(new Event('input',{bubbles:true})); return true;
 }
 if (el?.tagName==='SELECT') {
  el.selectedIndex=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+delta));
  el.dispatchEvent(new Event('change',{bubbles:true})); return true;
 }
 return false;
}
function moveFocus(dx,dy) {
 const active=document.activeElement;
 if (state.menu && !$('#modal').open) {
  if (dx && adjustValue(active,dx)) return;
  if (active.closest('#menu-tabs')) {
   if(dx){const tabs=['Home','Notifications','Settings'];switchTab(tabs[(tabs.indexOf(state.tab)+dx+3)%3],false);}
   else if(dy>0){const all=visibleControls($('#menu-content'));focusMenuControl(all.find(el=>focusKey(el)===menuFocus.get(state.tab+'/'+state.sub)) || all.find(el=>!el.classList.contains('menu-back')) || all[0]);}
   return;
  }
  const rows=visibleControls($('#menu-content'));
  const at=rows.indexOf(active);
  if(dy){
   if(at<0){focusMenuControl(rows[0]);return;}
   if(at===0&&dy<0){focusMenuControl($('#menu-tabs [aria-current=page]'));return;}
   focusMenuControl(rows[Math.max(0,Math.min(rows.length-1,at+dy))]);return;
  }
  if(dx<0){back();return;}
  if(dx>0&&active.matches('.menu-row[data-action=sub]'))active.click();
  return;
 }
 const root=$('#modal').open?$('#modal'):$('#library-shell');
 const nodes=visibleControls(root);
 if(!nodes.includes(active)){nodes[0]?.focus();return;}
 const r=active.getBoundingClientRect();
 const ax=r.x+r.width/2, ay=r.y+r.height/2;
 const candidates=nodes.filter(n=>n!==active).map(n=>{
  const q=n.getBoundingClientRect();
  const x=q.x+q.width/2-ax, y=q.y+q.height/2-ay;
  const forward=dx?x*dx:y*dy;
  const overlap=dx?Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top):Math.min(r.right,q.right)-Math.max(r.left,q.left);
  return {n,forward,overlap,side:dx?Math.abs(y):Math.abs(x)};
 }).filter(n=>n.forward>4);
 const aligned=candidates.filter(n=>n.overlap>4);
 (aligned.length?aligned:candidates).sort((a,b)=>a.forward+a.side*.3-b.forward-b.side*.3)[0]?.n.focus();
}
document.addEventListener('pointermove',()=>document.body.classList.remove('keyboard-nav'));
document.addEventListener('pointerover',e=>{const el=e.target.closest('.game-card,.menu-row:not(:disabled)');if(el&&!document.body.classList.contains('keyboard-nav'))el.focus({preventScroll:true});});
document.addEventListener('focusin',e=>{
 const card=e.target.closest('.game-card');
 if(card&&state.page==='Home'&&state.selected!==card.dataset.game){state.selected=card.dataset.game;const hero=$('.hero-game');if(hero)hero.outerHTML=heroMarkup(getGame(state.selected));}
 if(state.menu&&e.target.closest('#menu-content'))menuFocus.set(state.tab+'/'+state.sub,focusKey(e.target));
});
const keys=new Set();
document.addEventListener('keydown',e=>{
 document.body.classList.add('keyboard-nav');
 const typing=e.target.matches('textarea,input:not([type=range]):not([type=checkbox])');if(typing&&e.key!=='Escape')return;
 if(e.key==='Escape'){e.preventDefault();keys.clear();if($('#modal').open)return $('#modal').close();if(state.menu)return back();if(state.playing)return openMenu();state.page='Home';renderLibrary();return;}
 if(e.key.toLowerCase()==='m'&&!e.repeat&&!$('#modal').open){e.preventDefault();state.menu?closeMenu():openMenu();if(state.playing)state.tasks.play=true;return;}
 if(state.menu&&e.key==='Enter'&&(e.target.type==='checkbox'||e.target.tagName==='SELECT')){e.preventDefault();if(e.target.type==='checkbox')e.target.click();else adjustValue(e.target,1);return;}
 if(state.menu&&e.key==='Tab'){const n=[...$('#system-menu').querySelectorAll('button:not(:disabled),input,select,a[href]')].filter(n=>n.getClientRects().length);if(!n.length)return;const first=n[0],last=n[n.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}
 if(state.playing&&!state.menu&&!$('#modal').open){if(['ArrowLeft','ArrowRight',' ','ArrowUp'].includes(e.key)){e.preventDefault();keys.add(e.key);if((e.key===' '||e.key==='ArrowUp')&&!e.repeat)jump();}return;}
 if(['q','e'].includes(e.key.toLowerCase())&&!$('#modal').open&&!e.repeat){e.preventDefault();const tabs=state.menu?['Home','Notifications','Settings']:['Home','Library','Favorites','Preferences'];const at=tabs.indexOf(state.menu?state.tab:state.page);const next=tabs[(at+(e.key.toLowerCase()==='e'?1:tabs.length-1))%tabs.length];if(state.menu)switchTab(next);else{state.page=next;renderLibrary(`[data-page="${next}"]`);}return;}
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){if(!state.menu&&(e.target.type==='range'||e.target.tagName==='SELECT'))return;e.preventDefault();moveFocus(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0,e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0);}
});
document.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>{keys.clear();if(state.playing&&!state.menu)openMenu();});document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden&&state.playing&&!state.menu)openMenu();});
// Original canvas platformer, no ROM, emulator or external game runtime.
const canvas=$('#game'),ctx=canvas.getContext('2d');const player={x:50,y:510,vy:0,onGround:false},platforms=[{x:0,y:620,w:570},{x:650,y:620,w:520},{x:1240,y:620,w:500},{x:1810,y:620,w:500},{x:2380,y:620,w:620},{x:260,y:505,w:150},{x:490,y:415,w:140},{x:790,y:510,w:180},{x:1110,y:425,w:140},{x:1440,y:505,w:160},{x:1730,y:420,w:150},{x:2010,y:510,w:170},{x:2470,y:490,w:170}];
let coins=[],collected=0,won=false,camera=0,lastFrame=0;
function resetGame(){player.x=50;player.y=510;player.vy=0;player.onGround=false;collected=0;won=false;camera=0;coins=[{x:320,y:460},{x:550,y:370},{x:860,y:465},{x:1170,y:380},{x:1500,y:460},{x:1800,y:375},{x:2080,y:465},{x:2530,y:445}].map(c=>({...c,taken:false}));$('#game-status').textContent='Collect the lights. Reach the flag.';}
function play(){if($('#modal').open)$('#modal').close();if(state.menu)closeMenu();state.playing=true;state.selected='dune';resetGame();$('#library-shell').hidden=true;$('#game-shell').hidden=false;$('#system-button').focus({preventScroll:true});keys.clear();}
function jump(){if(player.onGround&&!won){player.vy=-760;player.onGround=false;}}
function update(dt){if(won)return;let dx=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0);player.x=Math.max(0,Math.min(2940,player.x+dx*310*dt));const before=player.y+38;player.vy+=1900*dt;player.y+=player.vy*dt;player.onGround=false;for(const p of platforms){if(player.vy>=0&&before<=p.y+8&&player.y+38>=p.y&&player.x+28>p.x&&player.x<p.x+p.w){player.y=p.y-38;player.vy=0;player.onGround=true;break;}}if(player.y>800){player.x=50;player.y=510;player.vy=0;}for(const c of coins)if(!c.taken&&Math.hypot(c.x-player.x-14,c.y-player.y-15)<35){c.taken=true;collected++;$('#game-status').textContent=`${collected} / ${coins.length} lights collected`;}if(player.x>2830){won=true;$('#game-status').textContent=`Home at last · ${collected}/${coins.length} lights · Open menu to return`;notify('Dune Runner complete · thanks for playing');}camera=Math.max(0,Math.min(1720,player.x-400));}
function draw(t){const w=1280,h=720;ctx.fillStyle='#111e2d';ctx.fillRect(0,0,w,h);ctx.fillStyle='#d8b070';ctx.beginPath();ctx.arc(1050-camera*.04,170,80,0,Math.PI*2);ctx.fill();for(let layer=0;layer<3;layer++){ctx.fillStyle=['#263241','#3d3b3c','#65503d'][layer];ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w;x+=20){const y=420+layer*65+Math.sin((x+camera*(.1+layer*.13))/220+layer)*50;ctx.lineTo(x,y);}ctx.lineTo(w,h);ctx.fill();}ctx.save();ctx.translate(-camera,0);for(const p of platforms){ctx.fillStyle='#9a7049';ctx.fillRect(p.x,p.y,p.w,100);ctx.fillStyle='#dfb67e';ctx.fillRect(p.x,p.y,p.w,7);}for(const c of coins)if(!c.taken){ctx.fillStyle='#f1d39e';ctx.shadowColor='#eac28d';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(c.x,c.y+Math.sin(t/300+c.x)*4,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}ctx.fillStyle='#eac28d';ctx.fillRect(2860,455,4,165);ctx.beginPath();ctx.moveTo(2864,455);ctx.lineTo(2925,480);ctx.lineTo(2864,502);ctx.fill();const x=player.x,y=player.y;ctx.fillStyle='#f0e5d6';ctx.beginPath();ctx.ellipse(x+14,y+23,14,16,-.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+20,y+8,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#080c13';ctx.beginPath();ctx.arc(x+24,y+6,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d8a263';ctx.beginPath();ctx.moveTo(x+29,y+9);ctx.lineTo(x+37,y+12);ctx.lineTo(x+29,y+15);ctx.fill();ctx.fillStyle='#8b725c';ctx.fillRect(x+5,y+37,3,5);ctx.fillRect(x+20,y+37,3,5);ctx.restore();ctx.font='16px Plex,monospace';ctx.fillStyle='#f0e5d6';ctx.fillText('DUNE RUNNER · BROWSER MINI-GAME',30,40);ctx.font='14px Plex,monospace';ctx.fillStyle='#eac28d';ctx.fillText(`${collected} / ${coins.length} lights`,30,68);if(state.menu){ctx.fillStyle='#080c1360';ctx.fillRect(0,0,w,h);}if(won){ctx.fillStyle='#101b29e8';ctx.fillRect(340,250,600,150);ctx.textAlign='center';ctx.fillStyle='#f0e5d6';ctx.font='38px system-ui';ctx.fillText('Home at last.',640,310);ctx.font='16px system-ui';ctx.fillText('Open the Zaman menu to return to your library.',640,355);ctx.textAlign='left';}}
function frame(t){const dt=Math.min((t-lastFrame)/1000||0,.035);lastFrame=t;if(state.playing){if(!state.menu&&!document.hidden&&!$('#modal').open)update(dt);draw(t);}pollGamepad(t);requestAnimationFrame(frame);}requestAnimationFrame(frame);
$$('[data-control]').forEach(b=>{const control=b.dataset.control;const down=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(control==='jump')jump();else keys.add(control==='left'?'ArrowLeft':'ArrowRight');};const up=()=>{keys.delete(control==='left'?'ArrowLeft':'ArrowRight');};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);});
let padHeld={},padLast=0;
function pollGamepad(t){let pads;try{pads=navigator.getGamepads?.();}catch{return;}const p=pads&&[...pads].find(p=>p&&p.mapping==='standard');if(!p){padHeld={};return;}const active={left:p.buttons[14]?.pressed||p.axes[0]<-.55,right:p.buttons[15]?.pressed||p.axes[0]>.55,up:p.buttons[12]?.pressed||p.axes[1]<-.55,down:p.buttons[13]?.pressed||p.axes[1]>.55,accept:p.buttons[0]?.pressed,back:p.buttons[1]?.pressed,menu:p.buttons[9]?.pressed,prev:p.buttons[4]?.pressed,next:p.buttons[5]?.pressed};const newPress=k=>active[k]&&!padHeld[k];if(state.playing&&!state.menu&&!$('#modal').open){if(active.left)keys.add('ArrowLeft');else keys.delete('ArrowLeft');if(active.right)keys.add('ArrowRight');else keys.delete('ArrowRight');if(newPress('accept'))jump();}else if(t-padLast>180){if(active.left||active.right||active.up||active.down)document.body.classList.add('keyboard-nav');if(active.left)moveFocus(-1,0);if(active.right)moveFocus(1,0);if(active.up)moveFocus(0,-1);if(active.down)moveFocus(0,1);if(active.left||active.right||active.up||active.down)padLast=t;}
 if(newPress('menu')&&!$('#modal').open){state.menu?closeMenu():openMenu();if(state.playing)state.tasks.play=true;}
 if(newPress('accept')&&(!state.playing||state.menu||$('#modal').open)){const el=document.activeElement;if(el?.tagName==='SELECT')adjustValue(el,1);else el?.click();}
 if(newPress('back')){if($('#modal').open)$('#modal').close();else if(state.menu)back();else if(state.playing)openMenu();}
 if((newPress('prev')||newPress('next'))&&!$('#modal').open&&(!state.playing||state.menu)){const tabs=state.menu?['Home','Notifications','Settings']:['Home','Library','Favorites','Preferences'];const at=tabs.indexOf(state.menu?state.tab:state.page),next=tabs[(at+(newPress('next')?1:tabs.length-1))%tabs.length];if(state.menu)switchTab(next);else{state.page=next;renderLibrary();}}
 padHeld=active;}
function clock(){$('#clock').textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}clock();setInterval(clock,60000);
renderLibrary();const scene=new URLSearchParams(location.search).get('scene');if(scene==='game')play();else if(scene==='library'){state.page='Library';renderLibrary();}else if(['transfer','artwork','audio','store','notifications','controllers','power','settings'].includes(scene)){openMenu(scene,['settings','controllers'].includes(scene)?'Settings':scene==='notifications'?'Notifications':'Home');}else if(state.tour)help();
})();
