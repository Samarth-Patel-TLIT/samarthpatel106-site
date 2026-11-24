(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- rack units ---------- */
var UNITS=[
 {tag:'AZURE',name:'Microsoft Azure',sub:'VMs · networking · storage',text:'Build and configure servers in Azure, including VM provisioning, networking and storage. Certified Azure Administrator Associate (AZ-104).'},
 {tag:'IDENTITY',name:'Active Directory · Entra ID',sub:'users · groups · access',text:'Manage Active Directory users, groups, service accounts and VPN access, and handle Microsoft Entra ID provisioning and access controls. Integrated Five9, Salesforce, NinjaOne and other applications with single sign-on.'},
 {tag:'WINDOWS',name:'Windows Server',sub:'roles · certificates · lifecycle',text:'Administer Windows Server roles and features, services, certificates, OS upgrades and lifecycle work on aging servers.'},
 {tag:'ENDPOINT',name:'Intune · NinjaOne · WSUS',sub:'enrollment · patching',text:'Set up Intune for device enrollment, configuration and compliance policies, deployed NinjaOne RMM, and run monthly Windows patching with WSUS and PDQ.'},
 {tag:'VSPHERE',name:'VMware ESXi · vCenter',sub:'production cluster',text:'Administer the production ESXi cluster and vCenter Server Appliance. Upgraded ESXi 7.0.3 to 8.x and vCenter 7.x to 8.x, host by host, with pre-checks and post-change validation.'},
 {tag:'LINUX',name:'Red Hat Enterprise Linux',sub:'RHEL 7 → 8',text:'Led the RHEL 7 to RHEL 8 migration at Wolters Kluwer. Before that, supported 15,000+ Unix/Linux servers at Verizon in 24x7 production.'},
 {tag:'AUTOMATION',name:'Ansible · Bash · PowerShell',sub:'playbooks · builds',text:'Write and maintain Ansible playbooks for patching, package management, user and sudo configuration and service checks; standardize builds with Red Hat Ansible Automation Platform.'},
 {tag:'AI · BUILD',name:'Python · Docker · AI agents',sub:'personal projects',text:'On my own time I build and run production tooling: a domain security scanner (Next.js, PostgreSQL, Git-driven deploys), Docker services behind Caddy, a Python service under systemd, and AI agents on the Anthropic and OpenAI APIs.'},
 {tag:'SECURITY',name:'Defender · CrowdStrike · Rapid7',sub:'agents · remediation · audit',text:'Deploy and maintain Defender for Endpoint, CrowdStrike Falcon and Rapid7, remediate findings such as exposed credentials, and produce HITRUST and SOC control evidence.'},
 {tag:'STORAGE',name:'Dell PowerStore',sub:'migration · datastores',text:'Migrated production workloads to a new Dell PowerStore array with no production disruption, coordinating windows with application and server owners.'},
 {tag:'BACKUP',name:'Veeam · N-able Cove · Tape',sub:'backup · restore',text:'Veeam and tape backup for production systems at Wolters Kluwer, alongside VMware snapshots, and N-able Cove Data Protection at OCLC.'},
 {tag:'HARDWARE',name:'Bare metal · Data center',sub:'rack · RAID · PXE',text:'Rack and stack servers, replace failed components, run cabling and handle vendor RMAs. Earlier: RAID, out-of-band management and PXE-based OS builds.'}
];
var selected=4, pick=function(){};
// Show the real hostname in the "check the headers" command once the page is on its own domain.
if(/^https?:$/.test(location.protocol)&&location.hostname&&!/claude|usercontent|localhost/.test(location.hostname)){$('host').textContent=location.hostname}
var unitsEl=$('units');
UNITS.forEach(function(u,i){
  var b=document.createElement('button');b.type='button';b.textContent=u.tag;b.id='unit-'+i;
  b.addEventListener('click',function(){select(i,true)});unitsEl.appendChild(b);
});
function select(i,fromUser){
  selected=i;var u=UNITS[i];
  $('d-tag').textContent='U'+String(42-i*2).padStart(2,'0')+' · '+u.tag;
  $('d-name').textContent=u.name;$('d-text').textContent=u.text;
  Array.prototype.forEach.call(unitsEl.children,function(b,j){b.setAttribute('aria-pressed',j===i?'true':'false')});
  pick(i,fromUser);
}
select(selected,false);

/* ---------- role lens: #infra, #sysadmin or #cloud in the link opens that view ---------- */
var LENS={
 infra:{unit:4,html:'<b>Systems and infrastructure engineer</b> with 8 years running and modernizing enterprise Windows, Linux, VMware and Azure in HITRUST and SOC audited environments: platform upgrades, storage and OS migrations, and the automation that keeps builds consistent. I also build my own tooling in Python, Docker and n8n, including AI agents.'},
 sysadmin:{unit:2,html:'<b>Systems administrator</b> with 8 years keeping Windows Server, Active Directory, Linux and VMware healthy day to day: monthly patching, backups, identity and access, endpoint management, monitoring and Level 2/3 support in HITRUST and SOC audited environments. I script the repetitive parts and use AI tools to work faster.'},
 cloud:{unit:0,html:'<b>Azure-certified (AZ-104) engineer</b> with 8 years of hybrid infrastructure: Azure VM provisioning, networking and storage, Entra ID, single sign-on for SaaS apps like Salesforce and Five9, Intune and Defender, backed by deep on-prem experience with VMware, Windows Server and Red Hat Linux. On my own time I ship containerized services, Git-driven deployments and AI agents.'}
};
var lensBtns=document.querySelectorAll('[data-lens]');
function setLens(k,fromUser){
  var L=LENS[k];if(!L)return;
  $('lede').innerHTML=L.html;
  Array.prototype.forEach.call(lensBtns,function(b){b.setAttribute('aria-pressed',b.getAttribute('data-lens')===k?'true':'false')});
  select(L.unit,false);
  if(fromUser){try{history.replaceState(null,'','#'+k)}catch(e){}}
}
Array.prototype.forEach.call(lensBtns,function(b){b.addEventListener('click',function(){setLens(b.getAttribute('data-lens'),true)})});
setLens(LENS[(location.hash||'').slice(1)]?location.hash.slice(1):'infra',false);

/* ---------- 3D rack: three.js loads after the page, so text and buttons come first ---------- */
function initRack(){
  var canvas=$('rack'),stage=$('stage');
  if(!window.THREE){stage.hidden=true;return}
  $('hint').textContent=(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches)?'drag to rotate · tap a unit to pull it out':'drag to rotate · click a unit to pull it out';
  var T=window.THREE,renderer;
  try{renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,alpha:true})}catch(e){stage.hidden=true;return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=T.sRGBEncoding;
  var scene=new T.Scene();
  var cam=new T.PerspectiveCamera(30,1,0.1,100);
  scene.add(new T.AmbientLight(0xffffff,0.75));
  var key=new T.DirectionalLight(0xffffff,0.9);key.position.set(4,6,8);scene.add(key);
  var warm=new T.PointLight(0x4f8dff,0.7,14);warm.position.set(-3,-1,5);scene.add(warm);

  var W=2.7,D=1.7,UH=0.42,GAP=0.055,N=UNITS.length,H=N*UH+(N-1)*GAP;
  var rack=new T.Group();scene.add(rack);
  var frameMat=new T.MeshStandardMaterial({color:0x56627a,metalness:0.6,roughness:0.45});
  var darkMat=new T.MeshStandardMaterial({color:0x1a2130,metalness:0.5,roughness:0.6});
  function box(w,h,d,m,x,y,z){var b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);rack.add(b);return b}
  var px=W/2+0.09;
  [[-px,D/2],[px,D/2],[-px,-D/2],[px,-D/2]].forEach(function(p){box(0.1,H+0.34,0.1,frameMat,p[0],0,p[1])});
  box(W+0.28,0.09,D+0.1,frameMat,0,H/2+0.13,0);
  box(W+0.28,0.09,D+0.1,frameMat,0,-H/2-0.13,0);
  box(W+0.1,H+0.1,0.04,darkMat,0,0,-D/2);
  scene.fog=new T.Fog(0x060a13,13,30);
  var floor=new T.GridHelper(48,48,0x2f7bff,0x1a2b4d);floor.position.y=-H/2-0.2;floor.material.transparent=true;floor.material.opacity=0.5;scene.add(floor);
  var sideMat=new T.MeshBasicMaterial({color:0x0b1322}),dotGeo=new T.BoxGeometry(0.09,0.06,0.02);
  [-1,1].forEach(function(sx){
    var g=new T.Group();g.add(new T.Mesh(new T.BoxGeometry(W+0.3,H+0.4,D),sideMat));
    for(var k=0;k<UNITS.length;k++){
      var dot=new T.Mesh(dotGeo,new T.MeshBasicMaterial({color:k%3?0x1f8a52:0x2f6fd6}));
      dot.position.set(W/2-0.25,H/2-UH/2-k*(UH+GAP),D/2+0.02);g.add(dot);
    }
    g.position.set(sx*(W+1.0),0,-1.8);rack.add(g);
  });

  /* U-number strip on the left post */
  (function(){
    var c=document.createElement('canvas');c.width=48;c.height=1024;var g=c.getContext('2d');
    g.fillStyle='#56627a';g.fillRect(0,0,48,1024);g.fillStyle='#e8eef9';g.font='600 17px monospace';g.textAlign='center';
    for(var i=0;i<21;i++){var y=18+i*(1024-24)/21;g.fillText(String(42-i*2),24,y+12);g.fillRect(38,y+22,10,2)}
    var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;
    var s=new T.Mesh(new T.PlaneGeometry(0.1,H+0.34),new T.MeshBasicMaterial({map:t}));
    s.position.set(-px,0,D/2+0.051);rack.add(s);
  })();

  function face(u,on){
    var c=document.createElement('canvas');c.width=1024;c.height=160;var g=c.getContext('2d');
    var gr=g.createLinearGradient(0,0,0,160);gr.addColorStop(0,on?'#2b3447':'#232b3b');gr.addColorStop(1,on?'#1c2434':'#161c28');
    g.fillStyle=gr;g.fillRect(0,0,1024,160);
    g.fillStyle=on?'#5b9bff':'#3a455b';g.fillRect(0,0,26,160);g.fillRect(998,0,26,160);
    g.strokeStyle=on?'#5b9bff':'#39445a';g.lineWidth=on?6:3;g.strokeRect(1.5,1.5,1021,157);
    g.fillStyle=on?'#5b9bff':'#8fa0bd';g.font='600 26px "JetBrains Mono",monospace';g.fillText(u.tag,52,52);
    g.fillStyle='#eef3fb';g.font='600 40px "JetBrains Mono",monospace';
    var name=u.name;while(g.measureText(name).width>640&&name.length>6){name=name.slice(0,-2)}
    if(name!==u.name)name+='…';g.fillText(name,52,108);
    g.fillStyle='#0d121b';
    for(var r=0;r<3;r++)for(var k=0;k<5;k++){g.fillRect(730+k*46,30+r*36,38,26)}
    g.fillStyle='#39445a';for(r=0;r<3;r++)for(k=0;k<5;k++){g.fillRect(734+k*46,50+r*36,10,3)}
    var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
  }
  var bodyMat=new T.MeshStandardMaterial({color:0x222a39,metalness:0.55,roughness:0.5});
  var meshes=[],leds=[],mats=[];
  var ledGeo=new T.BoxGeometry(0.045,0.045,0.02);
  UNITS.forEach(function(u,i){
    var fm=new T.MeshBasicMaterial({map:face(u,false)});mats.push(fm);
    var m=new T.Mesh(new T.BoxGeometry(W,UH,D),[bodyMat,bodyMat,bodyMat,bodyMat,fm,bodyMat]);
    m.position.y=H/2-UH/2-i*(UH+GAP);m.userData.i=i;rack.add(m);meshes.push(m);
    [0,1].forEach(function(k){
      var l=new T.Mesh(ledGeo,new T.MeshBasicMaterial({color:k?0x4f8dff:0x4ade80}));
      l.position.set(W/2-0.2-k*0.09,UH/2-0.09,D/2+0.011);m.add(l);leds.push({m:l,p:i*1.7+k*2.3,amber:!!k});
    });
  });
  function paint(){UNITS.forEach(function(u,i){var old=mats[i].map;mats[i].map=face(u,i===selected);mats[i].needsUpdate=true;if(old)old.dispose()})}
  paint();
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(paint)}

  var rotY=-0.5,rotYT=-0.5,touched=false,hover=-1,visible=true;
  rack.rotation.x=0.07;rack.rotation.y=rotY;
  pick=function(i,fromUser){if(fromUser){touched=true;$('hint').hidden=true}paint()};

  function size(){
    var w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false);cam.aspect=w/h;
    var t=Math.tan(cam.fov*Math.PI/360),d=Math.max((H+1.1)/2/t,(4.6/2)/(t*cam.aspect));
    cam.position.set(0,0.25,d+1.2);cam.lookAt(0,0,0.3);cam.updateProjectionMatrix();
  }
  size();
  if(window.ResizeObserver){new ResizeObserver(size).observe(stage)}else{window.addEventListener('resize',size)}
  if(window.IntersectionObserver){new IntersectionObserver(function(e){visible=e[0].isIntersecting}).observe(stage)}

  var ray=new T.Raycaster(),ptr=new T.Vector2(),down=null,dragging=false;
  function hit(ev){
    var r=canvas.getBoundingClientRect();
    ptr.set((ev.clientX-r.left)/r.width*2-1,-(ev.clientY-r.top)/r.height*2+1);
    ray.setFromCamera(ptr,cam);var h=ray.intersectObjects(meshes,false);
    return h.length?h[0].object.userData.i:-1;
  }
  canvas.addEventListener('pointerdown',function(ev){down={x:ev.clientX,y:ev.clientY,r:rotYT};dragging=false});
  canvas.addEventListener('pointermove',function(ev){
    if(down){
      var dx=ev.clientX-down.x;
      if(!dragging&&Math.abs(dx)>5){dragging=true;touched=true;$('hint').hidden=true;canvas.classList.add('drag');try{canvas.setPointerCapture(ev.pointerId)}catch(e){}}
      if(dragging){rotYT=Math.max(-1.15,Math.min(1.15,down.r+dx*0.008))}
    }else{hover=hit(ev);canvas.classList.toggle('hot',hover>=0)}
  });
  function up(ev){
    if(down&&!dragging){var i=hit(ev);if(i>=0)select(i,true)}
    down=null;dragging=false;canvas.classList.remove('drag');
  }
  canvas.addEventListener('pointerup',up);
  canvas.addEventListener('pointercancel',function(){down=null;dragging=false;canvas.classList.remove('drag')});
  canvas.addEventListener('pointerleave',function(){hover=-1;canvas.classList.remove('hot')});

  var t0=performance.now();
  function frame(now){
    requestAnimationFrame(frame);if(!visible)return;
    var t=(now-t0)/1000;
    if(!touched&&!reduce){rotYT=-0.5+Math.sin(t*0.45)*0.14}
    rotY+=(rotYT-rotY)*(reduce?1:0.12);rack.rotation.y=rotY;
    meshes.forEach(function(m,i){
      var z=i===selected?0.95:(i===hover?0.16:0);
      m.position.z+=(z-m.position.z)*(reduce?1:0.14);
    });
    if(!reduce){leds.forEach(function(l){
      var s=l.amber?(Math.sin(t*3.1+l.p)>0.55?1:0.25):(Math.sin(t*9+l.p)*Math.sin(t*2.3+l.p)>-0.2?1:0.35);
      l.m.material.color.setHex(l.amber?0x4f8dff:0x4ade80).multiplyScalar(s);
    })}
    renderer.render(scene,cam);
  }
  requestAnimationFrame(frame);
}
(function(){
  function go(){
    var s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload=initRack;s.onerror=function(){$('stage').hidden=true};
    document.head.appendChild(s);
  }
  if(document.readyState==='complete')go();else window.addEventListener('load',go);
})();

/* ---------- job-posting matcher ---------- */
// Each skill: [label, pattern, evidence from the résumé, where it happened].
// Every pattern is word-bounded, so "track record" never reads as "rack" and "dispatch" never as "patch".
var SKILLS=[
 ['Windows Server',/\bwindows server\b|\bwindows (systems|servers|administration)\b/i,'Administer Windows Server roles and features, services, certificates and OS upgrades.','Wolters Kluwer · OCLC'],
 ['Active Directory',/\bactive directory\b|\bgroup polic(y|ies)\b|\bgpos?\b|\bad ds\b/i,'Manage AD users, groups, service accounts and Group Policy.','Wolters Kluwer'],
 ['Entra ID',/\bentra\b|\bazure ad\b|\bazure active directory\b/i,'Handle Microsoft Entra ID provisioning and access controls.','Wolters Kluwer'],
 ['Intune / MDM',/\bintune\b|\bendpoint manager\b|\bmdm\b/i,'Set up Intune enrollment, configuration and compliance policies.','Wolters Kluwer'],
 ['Microsoft 365',/\bmicrosoft 365\b|\boffice 365\b|\bm365\b|\bo365\b/i,'Microsoft 365 administration alongside Entra ID and Intune.','Wolters Kluwer'],
 ['Azure',/\bazure\b(?!\s(ad|active directory|devops)\b)/i,'Build servers in Azure: VM provisioning, networking and storage. AZ-104 certified.','Wolters Kluwer'],
 ['VMware',/\bvmware\b|\bvsphere\b|\besxi\b|\bvcenter\b|\bvirtuali[sz]ation\b/i,'Run the production ESXi cluster and vCenter; upgraded both from 7 to 8.','Wolters Kluwer · Verizon · OCLC'],
 ['Linux / RHEL',/\blinux\b|\brhel\b|\bred hat\b|\bcentos\b/i,'Led a RHEL 7 to 8 migration; supported 15,000+ Unix/Linux servers.','Wolters Kluwer · Verizon'],
 ['Unix',/\bunix\b|\bsolaris\b|\baix\b/i,'Supported Solaris and AIX in 24x7 production.','Verizon · OCLC'],
 ['Ansible',/\bansible\b|\bconfiguration management\b/i,'Playbooks for patching, packages, users, sudo and service checks; Red Hat AAP.','Wolters Kluwer · Verizon'],
 ['PowerShell',/\bpowershell\b/i,'Automate Windows administration with PowerShell.','Wolters Kluwer'],
 ['Bash',/\bbash\b|\bshell script(s|ing)?\b/i,'Bash scripts for patching, configuration and health checks.','Verizon'],
 ['Patch management',/\bpatch(es|ed|ing)?\b|\bwsus\b|\bpdq\b|\bbigfix\b/i,'Monthly Windows patching with WSUS and PDQ; Linux patching with Ansible.','Wolters Kluwer'],
 ['SCCM / MECM',/\bsccm\b|\bmecm\b|\bconfiguration manager\b/i,'Managed SCCM deployments and Windows software updates.','Verizon · OCLC'],
 ['Endpoint security',/\bdefender\b|\bcrowdstrike\b|\bedr\b|\bendpoint (security|protection|detection)\b/i,'Deploy and maintain Defender for Endpoint and CrowdStrike Falcon.','Wolters Kluwer'],
 ['Vulnerability management',/\bvulnerabilit(y|ies)\b|\brapid7\b|\bcves?\b|\b(system|server|os) hardening\b/i,'Assess and remediate Rapid7 findings, including exposed credentials and insecure key storage.','Wolters Kluwer'],
 ['Zero trust access',/\bzscaler\b|\bzpa\b|\bzero[- ]trust\b/i,'Deploying Zscaler Private Access.','Wolters Kluwer'],
 ['Compliance & audit',/\bhitrust\b|\bsoc ?[12]\b|\bsoc (reports?|audits?|controls?)\b|\bhipaa\b|\bphi\b|\bcompliance\b|\baudit(s|ed|ing|ors?)?\b|\bregulated\b/i,'Produce HITRUST and SOC control evidence and access reviews; administer PHI-sensitive systems.','Wolters Kluwer'],
 ['Monitoring',/\bzabbix\b|\bnagios\b|\bsite24x7\b|\b(system|server|infrastructure|availability|performance) monitoring\b|\bmonitoring (tools?|platforms?|systems?)\b/i,'Monitor availability with Zabbix and Site24x7; Nagios XI before that.','Wolters Kluwer · Verizon'],
 ['ITSM / change control',/\bservicenow\b|\bjira\b|\bchange (management|control|requests?)\b|\bitsm\b/i,'Controlled changes with pre-checks and validation; ServiceNow and Jira.','Wolters Kluwer'],
 ['Storage',/\bstorage\b|\bnas\b|\bnfs\b|\bpowerstore\b|\bdatastores?\b|\bsan (zoning|storage|switch(es)?|fabric)\b/i,'SAN and NAS storage; migrated production workloads to a Dell PowerStore array with no disruption.','Wolters Kluwer'],
 ['Data center & hardware',/\bdata ?cent(er|re)s?\b|\brack(ing)? (and|&) stack(ing)?\b|\bracking\b|\bbare[- ]metal\b|\bserver hardware\b|\bphysical servers?\b|\braid\b/i,'Rack and stack, component replacement, cabling, RMAs, RAID and out-of-band management.','Wolters Kluwer · OCLC'],
 ['DNS / DHCP',/\bdns\b|\bdhcp\b/i,'Administered DNS and DHCP services.','OCLC'],
 ['VPN',/\bvpns?\b/i,'Manage VPN access and troubleshoot VPN incidents.','Wolters Kluwer · OCLC'],
 ['Certificates / TLS',/\b(ssl|tls)\b|\bpki\b|\bcertificate (management|renewals?|lifecycle|authority)\b/i,'Manage certificates on Windows Server and vCenter.','Wolters Kluwer'],
 ['Incident response',/\bincident (response|management)\b|\bon[- ]call\b|\broot[- ]cause\b|\bproduction support\b|\b(tier|level) ?(2|3|ii|iii)\b|\bl[23] support\b|\bescalations?\b/i,'Level 2/3 production support; lead incident response through to root-cause fixes.','Wolters Kluwer · Verizon'],
 ['Provisioning',/\bred hat satellite\b|\bkickstart\b|\bpxe\b|\bprovision(ing|ed)?\b|\bserver builds?\b|\bos (deployment|imaging)\b/i,'Provision VMs, Azure servers and RHEL builds with Satellite, Kickstart and PXE.','Wolters Kluwer · Verizon · OCLC'],
 ['RMM',/\bninjaone\b|\bninja ?rmm\b|\brmm\b/i,'Deployed NinjaOne RMM for monitoring, patching and remote management.','Wolters Kluwer'],
 ['Mail systems',/\bzimbra\b|\bpostfix\b|\bmail servers?\b|\bemail (security|gateways?|encryption)\b|\bsecure email\b/i,'Administer a PHI-sensitive Zimbra mail environment with Secure Email Gateway and Zix encryption.','Wolters Kluwer'],
 ['Documentation',/\bdocumentation\b|\brunbooks?\b|\bsops?\b|\b(network|rack) diagrams?\b/i,'Write SOPs, runbooks, and rack and network diagrams.','All roles'],
 ['Degree',/\bbachelor'?s?\b|\bdegree\b|\bcomputer science\b/i,'B.S. Computer Science, Illinois State University, 2018.','Education'],
 ['Microsoft certification',/\baz-?(104|900)\b|\bazure (administrator|certification|certified)\b|\bmicrosoft certifi(ed|cation)\b/i,'AZ-104 Azure Administrator Associate, plus AZ-900 and AI-900.','Microsoft'],
 ['Backup & recovery',/\bveeam\b|\bbackups?\b|\bdisaster recovery\b|\bbusiness continuity\b|\brestor(e|es|ation)\b|\bn-?able\b|\bcohesity\b|\bveritas\b|\btape\b/i,'Veeam and tape backup at Wolters Kluwer; N-able Cove Data Protection at OCLC.','Wolters Kluwer · OCLC'],
 ['Python',/\bpython\b/i,'Write and run Python services and CLIs on Linux, managed with systemd.','Personal projects'],
 ['Git',/\bgit\b|\bgithub\b|\bversion control\b|\bgitops\b/i,'Every personal project lives in Git and GitHub, deployed from the repo.','Personal projects'],
 ['Containers',/\bdocker\b|\bcontaineri[sz](ed|ation)\b|\bcontainers\b/i,'Run Docker services behind Caddy with automatic TLS on an Ubuntu server.','Personal projects'],
 ['CI/CD',/\bci\s*\/\s*cd\b|\bgithub actions\b|\bpipelines?\b|\bcontinuous (integration|delivery|deployment)\b/i,'Git-driven deployments to production for a live web app on Vercel.','Personal projects'],
 ['AI tools',/\bllms?\b|\bai[- ]assisted\b|\bai tools?\b|\bgenerative ai\b|\bopenai\b|\banthropic\b|\bclaude\b|\bcopilot\b|\bai platforms?\b|\bai (to|in|for) operations\b|\bai agents?\b/i,'Build AI agents and automations on the Anthropic and OpenAI APIs, orchestrated in n8n.','Personal projects'],
 ['Web apps / TypeScript',/\btypescript\b|\bnext\.?js\b|\breact\b|\bnode\.?js\b/i,'Built and run a production Next.js and TypeScript web app.','Personal projects'],
 ['PostgreSQL',/\bpostgres(ql)?\b|\bsupabase\b/i,'PostgreSQL (Supabase) backs a production web app.','Personal projects'],
 ['Single sign-on (SSO)',/\bsso\b|\bsingle sign[- ]on\b|\bsaml\b|\boidc\b|\bidentity federation\b|\benterprise app(lication)?s?\b/i,'Integrated Five9, Salesforce, NinjaOne and other applications with single sign-on through Microsoft Entra ID.','Wolters Kluwer'],
 ['Cross-team work',/\bcross[- ]functional\b|\bcollaborat(e|ion|ing)\b|\bstakeholders?\b/i,'Work with application, security, network and operations teams so changes meet functional, security and compliance needs.','Wolters Kluwer']
];
// Things a posting may ask for that are not on the résumé. Shown honestly as gaps.
var GAPS=[
 ['AWS',/\baws\b|\bamazon web services\b|\bec2\b/i],
 ['Google Cloud',/\bgcp\b|\bgoogle cloud\b/i],
 ['Kubernetes',/\bkubernetes\b|\bk8s\b|\bopenshift\b|\baks\b|\beks\b/i],
 ['Terraform',/\bterraform\b/i],
 ['Bicep / ARM templates',/\bbicep\b|\barm templates?\b/i],
 ['Jenkins / Azure DevOps / GitLab',/\bjenkins\b|\bazure devops\b|\bgitlab\b/i],
 ['Hyper-V',/\bhyper-?v\b/i],
 ['Nutanix',/\bnutanix\b/i],
 ['Citrix / VDI',/\bcitrix\b|\bvdi\b|\bavd\b|\bazure virtual desktop\b/i],
 ['SQL Server / DBA',/\bsql server\b|\bdba\b|\bmysql\b|\boracle (database|db)\b/i],
 ['Network engineering',/\bcisco\b|\bpalo alto\b|\bfortinet\b|\bfortigate\b|\bmeraki\b|\bbgp\b|\bospf\b|\bccn[ap]\b|\bfirewalls?\b/i],
 ['DR replication (Zerto / Site Recovery)',/\bzerto\b|\bsite recovery\b|\bsrm\b|\bcommvault\b|\brubrik\b/i],
 ['Splunk / SIEM',/\bsplunk\b|\bsiem\b|\bsentinel\b/i],
 ['Puppet / Chef',/\bpuppet\b|\bchef\b/i],
 ['Exchange',/\bexchange (server|online)\b/i],
 ['Okta',/\bokta\b/i],
 ['macOS / Jamf',/\bjamf\b|\bmac ?os\b/i],
 ['ITIL',/\bitil\b/i],
 ['Security certifications',/\bcissp\b|\bsecurity\+|\bcomptia\b|\bcism\b|\bcysa\b/i],
 ['Red Hat certification',/\brhcsa\b|\brhce\b/i],
 ['Security clearance',/\bclearance\b/i]
];
// Section headings: anything under a "nice to have" heading (or a line saying "preferred") is optional.
var HEAD_NICE=/^\W*(nice[- ]to[- ]haves?|preferred|bonus|pluses|plus|desired|good to have|extra credit)\b/i;
var HEAD_REQ=/^\W*(requirements?|required|must[- ]haves?|minimum|basic|what (we need|you('ll| will) (need|bring|do))|what you bring|qualifications|responsibilities|about (you|the role)|you have)\b/i;
var INLINE_NICE=/\b(preferred|a plus|nice to have|bonus|desired)\b/i;
function sections(text){
  var marks=[],pos=0;
  text.split('\n').forEach(function(line){
    var t=line.trim();
    if(t.length<60){if(HEAD_NICE.test(t))marks.push([pos,true]);else if(HEAD_REQ.test(t))marks.push([pos,false])}
    pos+=line.length+1;
  });
  return function(idx,line){var nice=false;marks.forEach(function(m){if(m[0]<=idx)nice=m[1]});return nice||INLINE_NICE.test(line)};
}
function lineAt(text,idx){var s=text.lastIndexOf('\n',idx-1)+1,e=text.indexOf('\n',idx);if(e<0)e=text.length;return text.slice(s,e)}
function quote(line,match){
  var t=line.replace(/^[\s\-•*·–—\d.)]+/,'').trim();if(t.length<=110)return t;
  var i=Math.max(0,t.toLowerCase().indexOf(match.toLowerCase())-40);
  return (i>0?'…':'')+t.slice(i,i+105).trim()+(i+105<t.length?'…':'');
}
function analyze(text){
  var isNice=sections(text),hits=[],gaps=[];
  SKILLS.forEach(function(s){var m=s[1].exec(text);if(m)hits.push({label:s[0],ev:s[2],where:s[3],q:quote(lineAt(text,m.index),m[0])})});
  // years of experience: the largest "N+ years" on a line that is about experience
  var yre=/\b(\d{1,2})\s*\+?\s*(?:or more\s+|plus\s+)?years?\b/gi,ym,best=null;
  while((ym=yre.exec(text))){
    var n=+ym[1],ln=lineAt(text,ym.index);
    if(n>0&&n<=30&&/experienc|\byears? (in|of|working)\b/i.test(ln)&&(!best||n>best.n))best={n:n,idx:ym.index,s:ym[0],line:ln};
  }
  if(best){
    if(best.n<=8)hits.unshift({label:best.n+'+ years',ev:'8 years in enterprise infrastructure, since November 2018.',where:'OCLC · Verizon · Wolters Kluwer',q:quote(best.line,best.s)});
    else gaps.push({label:best.n+'+ years (has 8)',nice:isNice(best.idx,best.line)});
  }
  GAPS.forEach(function(g){var m=g[1].exec(text);if(m)gaps.push({label:g[0],nice:isNice(m.index,lineAt(text,m.index))})});
  return {hits:hits,gaps:gaps};
}
var SAMPLE='Systems Engineer, Hybrid Infrastructure (sample posting)\n\nWhat you will do\n- Administer Windows Server and Active Directory across our production environment\n- Run and upgrade our VMware vSphere environment\n- Build and manage virtual machines, networking and storage in Azure\n- Own monthly patching (WSUS/SCCM) and vulnerability remediation\n- Automate with PowerShell and Ansible\n- Join the on-call rotation and lead incident response\n\nWhat we need\n- 5+ years of experience in systems or infrastructure engineering\n- Strong Red Hat Enterprise Linux skills\n- Experience in audited environments (SOC 2 or HITRUST)\n- Entra ID and Intune experience\n- Clear documentation and runbooks\n\nNice to have\n- Terraform\n- Kubernetes\n- Azure certification (AZ-104)';
var jd=$('jd'),summary='';
function el(tag,txt,cls){var n=document.createElement(tag);if(txt!=null)n.textContent=txt;if(cls)n.className=cls;return n}
function run(){
  var text=jd.value||'',r=analyze(text),hits=r.hits,gaps=r.gaps;
  var total=hits.length+gaps.length,niceGaps=gaps.filter(function(g){return g.nice}).length;
  var ul=$('hits');ul.textContent='';
  if(!total){
    $('pct').textContent='–';$('bar').style.width='0';$('gaps').hidden=true;summary='';
    $('sum').textContent=text.trim()?'I could not find infrastructure requirements in that text. Try pasting the full posting.':'Paste a job posting on the left and press Check the fit.';
    return;
  }
  var pct=Math.round(hits.length/total*100);
  $('pct').textContent=pct+'%';$('bar').style.width=pct+'%';
  $('sum').textContent='Samarth covers '+hits.length+' of the '+total+' requirements found in this posting.'+
    (!gaps.length?' No gaps found.':niceGaps===gaps.length?' Every gap is listed as nice to have.':niceGaps?' '+niceGaps+' of the '+gaps.length+' gaps are listed as nice to have.':'');
  hits.forEach(function(h){
    var li=el('li'),b=el('span',h.ev);
    b.appendChild(el('em',h.where));
    if(h.q)b.appendChild(el('span','Your posting: “'+h.q+'”','q'));
    li.appendChild(el('strong',h.label));li.appendChild(b);ul.appendChild(li);
  });
  var g=$('gaps');g.textContent='';g.hidden=!gaps.length;
  if(gaps.length){
    g.appendChild(document.createTextNode('Asked for, not on my résumé:'));g.appendChild(el('br'));
    gaps.forEach(function(x){g.appendChild(el('span',x.label+(x.nice?' · nice to have':''),x.nice?'nice':''))});
  }
  summary='Samarth Patel, Systems & Infrastructure Engineer (Chicago, IL)\nCovers '+hits.length+' of '+total+' requirements found in the posting ('+pct+'%).\n\n'+
    hits.map(function(s){return '- '+s.label+': '+s.ev+' ['+s.where+']'}).join('\n')+
    (gaps.length?'\n\nNot on résumé: '+gaps.map(function(x){return x.label+(x.nice?' (nice to have)':'')}).join(', '):'')+
    '\n\nContact: Lnxsam.patel106@gmail.com · 803-386-5624 · linkedin.com/in/samarth-patel106';
}
function copy(text,noteEl,okMsg){
  function done(ok){noteEl.textContent=ok?okMsg:'Copy is blocked here. Select the text and copy it manually.'}
  function legacy(){
    try{var t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();
      var ok=document.execCommand('copy');document.body.removeChild(t);done(ok)}catch(e){done(false)}
  }
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){done(true)},legacy)}else{legacy()}}catch(e){legacy()}
}
jd.value=SAMPLE;run();
$('run').addEventListener('click',function(){$('jdnote').textContent=jd.value===SAMPLE?'Showing a sample posting. Replace it with yours.':'';run()});
$('clear').addEventListener('click',function(){jd.value='';$('jdnote').textContent='';run();jd.focus()});
$('copysum').addEventListener('click',function(){if(summary){copy(summary,$('copynote'),'Summary copied.')}else{$('copynote').textContent='Run a check first.'}});
$('copymail').addEventListener('click',function(){var b=this,n={set textContent(v){b.textContent=v==='ok'?'Copied':'Copy';if(v!=='ok'){var r=document.createRange();r.selectNodeContents($('email'));var s=window.getSelection();s.removeAllRanges();s.addRange(r)}}};copy('Lnxsam.patel106@gmail.com',n,'ok')});
})();

/* ---------- résumé download ----------
   On the real site the link downloads normally. Inside the claude.ai viewer plain downloads are
   blocked, so the click goes through the viewer's downloads capability, which shows a save prompt. */
(function(){
  var links=document.querySelectorAll('a[href$=".pdf"][download]');
  if(!links.length||!window.claude||typeof window.claude.use!=='function')return;
  var dl=null;
  window.claude.use('downloads').then(function(ns){dl=ns}).catch(function(){});
  Array.prototype.forEach.call(links,function(a){
    a.addEventListener('click',function(ev){
      if(!dl)return;
      ev.preventDefault();
      var name=a.getAttribute('href').split('/').pop();
      fetch(a.href).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.blob()})
        .then(function(b){return dl.save({filename:name,data:b})})
        .catch(function(e){if(e&&e.code==='declined')return;window.open(a.href,'_blank','noopener')});
    });
  });
})();

/* ---- hero motion: word-by-word headline, rotating word, portrait tilt ---- */
(function(){
  var still=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each=function(list,fn){Array.prototype.forEach.call(list,fn)};

  if(still)return;

  // Headline: wrap each word so it can rise in on load. The full sentence stays available to screen readers.
  var h=document.querySelector('.hero h1');
  if(h){
    var n=0,label=h.textContent;
    var wrap=function(node){
      var f=document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function(w){
        if(!w.trim()){f.appendChild(document.createTextNode(w));return}
        var s=document.createElement('span');s.className='w';s.style.animationDelay=(n++*70)+'ms';s.textContent=w;f.appendChild(s);
      });
      node.parentNode.replaceChild(f,node);
    };
    each(Array.prototype.slice.call(h.childNodes),function(node){
      if(node.nodeType===3)wrap(node);
      else if(node.nodeType===1){node.classList.add('wf');node.style.animationDelay=(n++*70)+'ms'}
    });
    h.setAttribute('aria-label',label);
    // The motion layer below swaps these letters for random glyphs for a moment. Glyph widths differ,
    // so pin the box to its resting size while that runs, then let it flow again (rotation, resize).
    var em=h.querySelector('em'),free=null;
    var hold=function(){
      if(!em)return;
      if(!free){
        var multi=em.offsetHeight>parseFloat(getComputedStyle(em).lineHeight)*1.5;
        em.style.width=em.offsetWidth+'px';
        if(multi)em.style.height=em.offsetHeight+'px';
        em.classList.add('lock');if(multi)em.classList.add('multi');
      }
      clearTimeout(free);
      free=setTimeout(function(){em.style.width=em.style.height='';em.classList.remove('lock','multi');free=null},2600);
    };
    hold();h.addEventListener('pointerenter',hold);
  }

  // Rotating word in the greeting.
  var rot=document.getElementById('rot');
  if(rot){
    var words=['VMware','Windows','Linux','Azure'],k=0;
    setInterval(function(){
      rot.classList.add('out');
      setTimeout(function(){k=(k+1)%words.length;rot.textContent=words[k];rot.classList.remove('out')},260);
    },2400);
  }

  // Portrait tilts toward the pointer.
  var p=document.getElementById('portrait');
  if(p){
    p.addEventListener('pointermove',function(e){
      if(e.pointerType&&e.pointerType!=='mouse')return;
      var r=p.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      p.style.transform='perspective(600px) rotateY('+(x*14).toFixed(1)+'deg) rotateX('+(-y*14).toFixed(1)+'deg) scale(1.04)';
    });
    p.addEventListener('pointerleave',function(){p.style.transform=''});
  }
})();

/* ---------- motion layer ----------
   Effects in the spirit of React Bits, written in plain JS so the page stays dependency-free
   and inside its Content-Security-Policy. Every element is fully readable before any of this
   runs, and all of it switches off under prefers-reduced-motion. */
(function(){
  "use strict";
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var each=function(sel,fn){Array.prototype.forEach.call(document.querySelectorAll(sel),fn)};
  var io=('IntersectionObserver' in window)?IntersectionObserver:null;

  /* 1. Decrypted headline: "while it changes." resolves from terminal glyphs, left to right. */
  var em=document.querySelector('.hero h1 em');
  if(em){
    var target=em.textContent,glyphs='01<>/\\[]{}#$%&*+=?ABCDEFXYZ',timer=null;
    em.setAttribute('aria-label',target);
    var decrypt=function(){
      if(timer)return;
      var frame=0,total=target.length*2+8;
      timer=setInterval(function(){
        frame++;
        var shown=Math.floor((frame/total)*target.length*1.15),out='';
        for(var i=0;i<target.length;i++){
          var c=target[i];
          out+=(i<shown||c===' '||c==='.')?c:glyphs[(Math.random()*glyphs.length)|0];
        }
        em.textContent=out;
        if(shown>=target.length){clearInterval(timer);timer=null;em.textContent=target}
      },38);
    };
    setTimeout(decrypt,350);
    em.closest('h1').addEventListener('pointerenter',decrypt);
  }

  /* 2. Count-up: stat figures roll up from zero the first time they scroll into view. */
  if(io){
    var cio=new io(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting)return;cio.unobserve(en.target);
        var el=en.target,raw=el.getAttribute('data-final'),m=raw.match(/^([\d,]+)(\D*)$/);
        var end=parseInt(m[1].replace(/,/g,''),10),suf=m[2],t0=null,dur=end>100?1500:900;
        if(end===0)return;
        var step=function(t){
          if(t0===null)t0=t;
          var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(2,-10*p),v=Math.round(end*(p===1?1:e));
          el.textContent=v.toLocaleString('en-US')+suf;
          if(p<1)requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },{threshold:.6});
    each('.stats b, .wstats b',function(b){
      var txt=b.textContent.trim();
      if(!/^[\d,]+\D*$/.test(txt))return;           // skips "AZ-104"
      b.setAttribute('data-final',txt);b.setAttribute('aria-label',txt);
      b.style.minWidth=b.offsetWidth+'px';           // no layout jump while digits change
      cio.observe(b);
    });
  }

  /* 3. Spotlight: a soft glow follows the pointer across cards and diagrams. */
  if(window.matchMedia('(hover: hover)').matches){
    each('.projects article, .ways > div, .work figure.fig, .wstats div, .out, .detail',function(card){
      card.classList.add('spot');
      card.addEventListener('pointermove',function(ev){
        var r=card.getBoundingClientRect();
        card.style.setProperty('--mx',(ev.clientX-r.left)+'px');
        card.style.setProperty('--my',(ev.clientY-r.top)+'px');
      });
    });
  }

  /* 4. Reveal on scroll: only content that starts below the fold, so nothing on screen ever blinks. */
  if(io){
    var rio=new io(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');rio.unobserve(en.target)}});
    },{rootMargin:'0px 0px -8% 0px'});
    var vh=window.innerHeight;
    each('.work article, .projects article, .job, .ways > div, .ledger li, .creds, .kit dl',function(el,i){
      if(el.getBoundingClientRect().top<vh)return;
      el.classList.add('rv');
      var sib=Array.prototype.indexOf.call(el.parentNode.children,el);
      el.style.transitionDelay=(sib%4)*70+'ms';
      rio.observe(el);
    });
    // Jumping to a project from the index reveals it immediately.
    window.addEventListener('hashchange',function(){
      var t=document.getElementById(location.hash.slice(1));if(t)t.classList.add('in');
    });
  }

  /* 5. Scroll progress: a thin line under the nav shows how far down the page you are. */
  var nav=document.querySelector('.nav');
  if(nav){
    var bar=document.createElement('i');bar.className='progress';bar.setAttribute('aria-hidden','true');nav.appendChild(bar);
    var ticking=false,upd=function(){
      var d=document.documentElement,max=d.scrollHeight-d.clientHeight;
      bar.style.transform='scaleX('+(max>0?d.scrollTop/max:0)+')';ticking=false;
    };
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd)}},{passive:true});
    upd();
  }
})();
