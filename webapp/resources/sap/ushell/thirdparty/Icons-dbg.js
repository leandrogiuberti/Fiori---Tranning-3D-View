sap.ui.define(['exports'], (function (exports) { 'use strict';

	const o$c=(t,n=document.body,r)=>{let e=document.querySelector(t);return e||(e=r?r():document.createElement(t),n.insertBefore(e,n.firstChild))};

	const u$b=()=>{const t=document.createElement("meta");return t.setAttribute("name","ui5-shared-resources"),t.setAttribute("content",""),t},l$d=()=>typeof document>"u"?null:o$c('meta[name="ui5-shared-resources"]',document.head,u$b),m$9=(t,o)=>{const r=t.split(".");let e=l$d();if(!e)return o;for(let n=0;n<r.length;n++){const s=r[n],c=n===r.length-1;Object.prototype.hasOwnProperty.call(e,s)||(e[s]=c?o:{}),e=e[s];}return e};

	const e$a=new Map,s$h=(t,r)=>{e$a.set(t,r);},n$e=t=>e$a.get(t);

	var c$d={},e$9=c$d.hasOwnProperty,a$b=c$d.toString,o$b=e$9.toString,l$c=o$b.call(Object),i$f=function(r){var t,n;return !r||a$b.call(r)!=="[object Object]"?false:(t=Object.getPrototypeOf(r),t?(n=e$9.call(t,"constructor")&&t.constructor,typeof n=="function"&&o$b.call(n)===l$c):true)};

	var c$c=Object.create(null),u$a=function(p,m,A,d){var n,t,e,a,o,i,r=arguments[2]||{},f=3,l=arguments.length,s=arguments[0]||false,y=arguments[1]?void 0:c$c;for(typeof r!="object"&&typeof r!="function"&&(r={});f<l;f++)if((o=arguments[f])!=null)for(a in o)n=r[a],e=o[a],!(a==="__proto__"||r===e)&&(s&&e&&(i$f(e)||(t=Array.isArray(e)))?(t?(t=false,i=n&&Array.isArray(n)?n:[]):i=n&&i$f(n)?n:{},r[a]=u$a(s,arguments[1],i,e)):e!==y&&(r[a]=e));return r};

	const e$8=function(n,t){return u$a(true,false,...arguments)};

	const _$1={themes:{default:"sap_horizon",all:["sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_horizon","sap_horizon_dark","sap_horizon_hcb","sap_horizon_hcw"]},languages:{default:"en"},locales:{default:"en",all:["ar","ar_EG","ar_SA","bg","ca","cnr","cs","da","de","de_AT","de_CH","el","el_CY","en","en_AU","en_GB","en_HK","en_IE","en_IN","en_NZ","en_PG","en_SG","en_ZA","es","es_AR","es_BO","es_CL","es_CO","es_MX","es_PE","es_UY","es_VE","et","fa","fi","fr","fr_BE","fr_CA","fr_CH","fr_LU","he","hi","hr","hu","id","it","it_CH","ja","kk","ko","lt","lv","ms","mk","nb","nl","nl_BE","pl","pt","pt_PT","ro","ru","ru_UA","sk","sl","sr","sr_Latn","sv","th","tr","uk","vi","zh_CN","zh_HK","zh_SG","zh_TW"]}},e$7=_$1.themes.default,s$g=_$1.themes.all,a$a=_$1.languages.default,r$e=_$1.locales.default,l$b=_$1.locales.all;

	const o$a=typeof document>"u",n$d={search(){return o$a?"":window.location.search}},i$e=()=>o$a?"":window.location.hostname,c$b=()=>o$a?"":window.location.port,a$9=()=>o$a?"":window.location.protocol,s$f=()=>o$a?"":window.location.href,u$9=()=>n$d.search();

	const s$e=e=>{const t=document.querySelector(`META[name="${e}"]`);return t&&t.getAttribute("content")},o$9=e=>{const t=s$e("sap-allowed-theme-origins")??s$e("sap-allowedThemeOrigins");return t?t.split(",").some(n=>n==="*"||e===n.trim()):false},a$8=(e,t)=>{const n=new URL(e).pathname;return new URL(n,t).toString()},g$9=e=>{let t;try{if(e.startsWith(".")||e.startsWith("/"))t=new URL(e,s$f()).toString();else {const n=new URL(e),r=n.origin;r&&o$9(r)?t=n.toString():t=a$8(n.toString(),s$f());}return t.endsWith("/")||(t=`${t}/`),`${t}UI5/`}catch{}};

	var u$8=(l=>(l.Full="full",l.Basic="basic",l.Minimal="minimal",l.None="none",l))(u$8||{});

	let i$d = class i{constructor(){this._eventRegistry=new Map;}attachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!Array.isArray(e)){n.set(t,[r]);return}e.includes(r)||e.push(r);}detachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!e)return;const s=e.indexOf(r);s!==-1&&e.splice(s,1),e.length===0&&n.delete(t);}fireEvent(t,r){const e=this._eventRegistry.get(t);return e?e.map(s=>s.call(this,r)):[]}fireEventAsync(t,r){return Promise.all(this.fireEvent(t,r))}isHandlerAttached(t,r){const e=this._eventRegistry.get(t);return e?e.includes(r):false}hasListeners(t){return !!this._eventRegistry.get(t)}};

	const e$6=new i$d,t$h="configurationReset",i$c=n=>{e$6.attachEvent(t$h,n);};

	let p$4=false,t$g={animationMode:u$8.Full,theme:e$7,themeRoot:void 0,rtl:void 0,language:void 0,timezone:void 0,calendarType:void 0,secondaryCalendarType:void 0,noConflict:false,formatSettings:{},fetchDefaultLanguage:false,defaultFontLoading:true,enableDefaultTooltips:true};const C$2=()=>(o$8(),t$g.animationMode),T$2=()=>(o$8(),t$g.theme),S$2=()=>{if(o$8(),t$g.themeRoot!==void 0){if(!g$9(t$g.themeRoot)){console.warn(`The ${t$g.themeRoot} is not valid. Check the allowed origins as suggested in the "setThemeRoot" description.`);return}return t$g.themeRoot}},L$2=()=>(o$8(),t$g.language),R$2=()=>(o$8(),t$g.fetchDefaultLanguage),F$1=()=>(o$8(),t$g.noConflict),U$2=()=>(o$8(),t$g.defaultFontLoading),b$3=()=>(o$8(),t$g.enableDefaultTooltips),D$1=()=>(o$8(),t$g.calendarType),M$1=()=>(o$8(),t$g.formatSettings),i$b=new Map;i$b.set("true",true),i$b.set("false",false);const w$6=()=>{const n=document.querySelector("[data-ui5-config]")||document.querySelector("[data-id='sap-ui-config']");let e;if(n){try{e=JSON.parse(n.innerHTML);}catch{console.warn("Incorrect data-sap-ui-config format. Please use JSON");}e&&(t$g=e$8(t$g,e));}},z=()=>{const n=new URLSearchParams(u$9());n.forEach((e,r)=>{const a=r.split("sap-").length;a===0||a===r.split("sap-ui-").length||g$8(r,e,"sap");}),n.forEach((e,r)=>{r.startsWith("sap-ui")&&g$8(r,e,"sap-ui");});},E$1=n=>{const e=n.split("@")[1];return g$9(e)},P$5=(n,e)=>n==="theme"&&e.includes("@")?e.split("@")[0]:e,g$8=(n,e,r)=>{const a=e.toLowerCase(),s=n.split(`${r}-`)[1];i$b.has(e)&&(e=i$b.get(a)),s==="theme"?(t$g.theme=P$5(s,e),e&&e.includes("@")&&(t$g.themeRoot=E$1(e))):t$g[s]=e;},j=()=>{const n=n$e("OpenUI5Support");if(!n||!n.isOpenUI5Detected())return;const e=n.getConfigurationSettingsObject();t$g=e$8(t$g,e);},o$8=()=>{typeof document>"u"||p$4||(l$a(),p$4=true);},l$a=n=>{w$6(),z(),j();};

	let l$9 = class l{constructor(){this.list=[],this.lookup=new Set;}add(t){this.lookup.has(t)||(this.list.push(t),this.lookup.add(t));}remove(t){this.lookup.has(t)&&(this.list=this.list.filter(e=>e!==t),this.lookup.delete(t));}shift(){const t=this.list.shift();if(t)return this.lookup.delete(t),t}isEmpty(){return this.list.length===0}isAdded(t){return this.lookup.has(t)}process(t){let e;const s=new Map;for(e=this.shift();e;){const i=s.get(e)||0;if(i>10)throw new Error("Web component processed too many times this task, max allowed is: 10");t(e),s.set(e,i+1),e=this.shift();}}};

	const e$5={version:"2.14.0-rc.7",major:2,minor:14,patch:0,suffix:"-rc.7",isNext:false,buildTime:1759224139};

	let s$d,t$f={include:[/^ui5-/],exclude:[]};const o$7=new Map,l$8=e=>{if(!e.match(/^[a-zA-Z0-9_-]+$/))throw new Error("Only alphanumeric characters and dashes allowed for the scoping suffix");R$1()&&console.warn("Setting the scoping suffix must be done before importing any components. For proper usage, read the scoping section: https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/06-scoping.md."),s$d=e;},c$a=()=>s$d,p$3=e=>{if(!e||!e.include)throw new Error('"rules" must be an object with at least an "include" property');if(!Array.isArray(e.include)||e.include.some(n=>!(n instanceof RegExp)))throw new Error('"rules.include" must be an array of regular expressions');if(e.exclude&&(!Array.isArray(e.exclude)||e.exclude.some(n=>!(n instanceof RegExp))))throw new Error('"rules.exclude" must be an array of regular expressions');e.exclude=e.exclude||[],t$f=e,o$7.clear();},m$8=()=>t$f,i$a=e=>{if(!o$7.has(e)){const n=t$f.include.some(r=>e.match(r))&&!t$f.exclude.some(r=>e.match(r));o$7.set(e,n);}return o$7.get(e)},g$7=e=>{if(i$a(e))return c$a()},d$8=e=>{const n=`v${e$5.version.replaceAll(".","-")}`,r=/(--_?ui5)([^,:)\s]+)/g;return e.replaceAll(r,`$1-${n}$2`)};

	let i$9,s$c="";const u$7=new Map,r$d=m$9("Runtimes",[]),x=()=>{if(i$9===void 0){i$9=r$d.length;const e=e$5;r$d.push({...e,get scopingSuffix(){return c$a()},get registeredTags(){return T$1()},get scopingRules(){return m$8()},alias:s$c,description:`Runtime ${i$9} - ver ${e.version}${""}`});}},I$1=()=>i$9,b$2=(e,m)=>{const o=`${e},${m}`;if(u$7.has(o))return u$7.get(o);const t=r$d[e],n=r$d[m];if(!t||!n)throw new Error("Invalid runtime index supplied");if(t.isNext||n.isNext)return t.buildTime-n.buildTime;const c=t.major-n.major;if(c)return c;const a=t.minor-n.minor;if(a)return a;const f=t.patch-n.patch;if(f)return f;const l=new Intl.Collator(void 0,{numeric:true,sensitivity:"base"}).compare(t.suffix,n.suffix);return u$7.set(o,l),l},$$2=()=>r$d;

	const g$6=m$9("Tags",new Map),d$7=new Set;let s$b=new Map,c$9;const m$7=-1,h$6=e=>{d$7.add(e),g$6.set(e,I$1());},w$5=e=>d$7.has(e),R$1=()=>d$7.size>0,T$1=()=>[...d$7.values()],$$1=e=>{let n=g$6.get(e);n===void 0&&(n=m$7),s$b.has(n)||s$b.set(n,new Set),s$b.get(n).add(e),c$9||(c$9=setTimeout(()=>{y$4(),s$b=new Map,c$9=void 0;},1e3));},y$4=()=>{const e=$$2(),n=I$1(),l=e[n];let t="Multiple UI5 Web Components instances detected.";e.length>1&&(t=`${t}
Loading order (versions before 1.1.0 not listed): ${e.map(i=>`
${i.description}`).join("")}`),[...s$b.keys()].forEach(i=>{let o,r;i===m$7?(o=1,r={description:"Older unknown runtime"}):(o=b$2(n,i),r=e[i]);let a;o>0?a="an older":o<0?a="a newer":a="the same",t=`${t}

"${l.description}" failed to define ${s$b.get(i).size} tag(s) as they were defined by a runtime of ${a} version "${r.description}": ${[...s$b.get(i)].sort().join(", ")}.`,o>0?t=`${t}
WARNING! If your code uses features of the above web components, unavailable in ${r.description}, it might not work as expected!`:t=`${t}
Since the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;}),t=`${t}

To prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/06-scoping.md.`,console.warn(t);};

	const t$e=new Set,n$c=e=>{t$e.add(e);},r$c=e=>t$e.has(e);

	const s$a=new Set,d$6=new i$d,n$b=new l$9;let t$d,a$7,m$6,i$8;const l$7=async e=>{n$b.add(e),await P$4();},c$8=e=>{d$6.fireEvent("beforeComponentRender",e),s$a.add(e),e._render();},h$5=e=>{n$b.remove(e),s$a.delete(e);},P$4=async()=>{i$8||(i$8=new Promise(e=>{window.requestAnimationFrame(()=>{n$b.process(c$8),i$8=null,e(),m$6||(m$6=setTimeout(()=>{m$6=void 0,n$b.isEmpty()&&U$1();},200));});})),await i$8;},y$3=()=>t$d||(t$d=new Promise(e=>{a$7=e,window.requestAnimationFrame(()=>{n$b.isEmpty()&&(t$d=void 0,e());});}),t$d),I=()=>{const e=T$1().map(r=>customElements.whenDefined(r));return Promise.all(e)},f$7=async()=>{await I(),await y$3();},U$1=()=>{n$b.isEmpty()&&a$7&&(a$7(),a$7=void 0,t$d=void 0);},C$1=async e=>{s$a.forEach(r=>{const o=r.constructor,u=o.getMetadata().getTag(),w=r$c(o),p=o.getMetadata().isLanguageAware(),E=o.getMetadata().isThemeAware();(!e||e.tag===u||e.rtlAware&&w||e.languageAware&&p||e.themeAware&&E)&&l$7(r);}),await f$7();};

	const g$5=typeof document>"u",i$7=(e,t)=>t?`${e}|${t}`:e,l$6=e=>e===void 0?true:b$2(I$1(),parseInt(e))===1,c$7=(e,t,r="",s)=>{const d=I$1(),n=new CSSStyleSheet;n.replaceSync(e),n._ui5StyleId=i$7(t,r),s&&(n._ui5RuntimeIndex=d,n._ui5Theme=s),document.adoptedStyleSheets=[...document.adoptedStyleSheets,n];},y$2=(e,t,r="",s)=>{const d=I$1(),n=document.adoptedStyleSheets.find(o=>o._ui5StyleId===i$7(t,r));if(n)if(!s)n.replaceSync(e||"");else {const o=n._ui5RuntimeIndex;(n._ui5Theme!==s||l$6(o))&&(n.replaceSync(e||""),n._ui5RuntimeIndex=String(d),n._ui5Theme=s);}},S$1=(e,t="")=>g$5?true:!!document.adoptedStyleSheets.find(r=>r._ui5StyleId===i$7(e,t)),f$6=(e,t="")=>{document.adoptedStyleSheets=document.adoptedStyleSheets.filter(r=>r._ui5StyleId!==i$7(e,t));},R=(e,t,r="",s)=>{S$1(t,r)?y$2(e,t,r,s):c$7(e,t,r,s);},m$5=(e,t)=>e===void 0?t:t===void 0?e:`${e} ${t}`;

	const t$c=new i$d,r$b="themeRegistered",n$a=e=>{t$c.attachEvent(r$b,e);},s$9=e=>t$c.fireEvent(r$b,e);

	const l$5=new Map,h$4=new Map,u$6=new Map,T=new Set,i$6=new Set,p$2=(e,r,t)=>{h$4.set(`${e}/${r}`,t),T.add(e),i$6.add(r),s$9(r);},m$4=async(e,r,t)=>{const g=`${e}_${r}_${t||""}`,s=l$5.get(g);if(s!==void 0)return s;if(!i$6.has(r)){const $=[...i$6.values()].join(", ");return console.warn(`You have requested a non-registered theme ${r} - falling back to ${e$7}. Registered themes are: ${$}`),a$6(e,e$7)}const[n,d]=await Promise.all([a$6(e,r),t?a$6(e,t,true):void 0]),o=m$5(n,d);return o&&l$5.set(g,o),o},a$6=async(e,r,t=false)=>{const s=(t?u$6:h$4).get(`${e}/${r}`);if(!s){t||console.error(`Theme [${r}] not registered for package [${e}]`);return}let n;try{n=await s(r);}catch(d){console.error(e,d.message);return}return n},w$4=()=>T,P$3=e=>i$6.has(e);

	const r$a=new Set,s$8=()=>{let e=document.querySelector(".sapThemeMetaData-Base-baseLib")||document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");if(e)return getComputedStyle(e).backgroundImage;e=document.createElement("span"),e.style.display="none",e.classList.add("sapThemeMetaData-Base-baseLib"),document.body.appendChild(e);let t=getComputedStyle(e).backgroundImage;return t==="none"&&(e.classList.add("sapThemeMetaData-UI5-sap-ui-core"),t=getComputedStyle(e).backgroundImage),document.body.removeChild(e),t},o$6=e=>{const t=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(e);if(t&&t.length>=2){let a=t[1];if(a=a.replace(/\\"/g,'"'),a.charAt(0)!=="{"&&a.charAt(a.length-1)!=="}")try{a=decodeURIComponent(a);}catch{r$a.has("decode")||(console.warn("Malformed theme metadata string, unable to decodeURIComponent"),r$a.add("decode"));return}try{return JSON.parse(a)}catch{r$a.has("parse")||(console.warn("Malformed theme metadata string, unable to parse JSON"),r$a.add("parse"));}}},d$5=e=>{let t,a;try{const n=e.Path.split(".");t=n.length===4?n[2]:getComputedStyle(document.body).getPropertyValue("--sapSapThemeId"),a=e.Extends[0];}catch{r$a.has("object")||(console.warn("Malformed theme metadata Object",e),r$a.add("object"));return}return {themeName:t,baseThemeName:a}},m$3=()=>{const e=s$8();if(!e||e==="none")return;const t=o$6(e);if(t)return d$5(t)};

	const t$b=new i$d,d$4="themeLoaded",o$5=e=>{t$b.attachEvent(d$4,e);},n$9=e=>{t$b.detachEvent(d$4,e);},r$9=e=>t$b.fireEvent(d$4,e);

	const d$3=(r,n)=>{const e=document.createElement("link");return e.type="text/css",e.rel="stylesheet",n&&Object.entries(n).forEach(t=>e.setAttribute(...t)),e.href=r,document.head.appendChild(e),new Promise(t=>{e.addEventListener("load",t),e.addEventListener("error",t);})};

	let t$a;i$c(()=>{t$a=void 0;});const n$8=()=>(t$a===void 0&&(t$a=S$2()),t$a),u$5=e=>`${n$8()}Base/baseLib/${e}/css_variables.css`,i$5=async e=>{const o=document.querySelector(`[sap-ui-webcomponents-theme="${e}"]`);o&&document.head.removeChild(o),await d$3(u$5(e),{"sap-ui-webcomponents-theme":e});};

	let _lib="ui5",_package="webcomponents-theming";const s$7="@"+_lib+"/"+_package,S=()=>w$4().has(s$7),P$2=async e=>{if(!S())return;const t=await m$4(s$7,e);t&&R(t,"data-ui5-theme-properties",s$7,e);},E=()=>{f$6("data-ui5-theme-properties",s$7);},U=async(e,t)=>{const o=[...w$4()].map(async a=>{if(a===s$7)return;const i=await m$4(a,e,t);i&&R(i,`data-ui5-component-properties-${I$1()}`,a);});return Promise.all(o)},k=async e=>{const t=m$3();if(t)return t;const r=n$e("OpenUI5Support");if(r&&r.isOpenUI5Detected()){if(r.cssVariablesLoaded())return {themeName:r.getConfigurationSettingsObject()?.theme,baseThemeName:""}}else if(n$8())return await i$5(e),m$3()},w$3=async e=>{const t=await k(e);!t||e!==t.themeName?await P$2(e):E();const r=P$3(e)?e:t&&t.baseThemeName;await U(r||e$7,t&&t.themeName===e?e:void 0),r$9(e);};

	const d$2=()=>new Promise(e=>{document.body?e():document.addEventListener("DOMContentLoaded",()=>{e();});});

	var n$7 = `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Regular.woff2) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Regular-full.woff2) format("woff2")}
@font-face{font-family:"72-Bold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2) format("woff2"),local("72-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2) format("woff2"),local("72-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Boldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold-full.woff2) format("woff2")}
@font-face{font-family:"72-Semibold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold.woff2) format("woff2"),local("72-Semibold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:600;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold.woff2) format("woff2"),local("72-Semibold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Semiboldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:600;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold-full.woff2) format("woff2")}
@font-face{font-family:"72-SemiboldDuplex";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-SemiboldDuplex.woff2) format("woff2"),local("72-SemiboldDuplex");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-SemiboldDuplexfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-SemiboldDuplex-full.woff2) format("woff2")}
@font-face{font-family:"72-Light";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light.woff2) format("woff2"),local("72-Light");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:300;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light.woff2) format("woff2"),local("72-Light");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Lightfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:300;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light-full.woff2) format("woff2")}
@font-face{font-family:"72Black";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black.woff2) format("woff2"),local("72Black");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+160-161,U+178,U+17D-17E,U+192,U+237,U+2C6-2C7,U+2DC,U+3BC,U+1E0E,U+2013-2014,U+2018-2019,U+201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:900;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black.woff2) format("woff2"),local("72Black");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+160-161,U+178,U+17D-17E,U+192,U+237,U+2C6-2C7,U+2DC,U+3BC,U+1E0E,U+2013-2014,U+2018-2019,U+201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Blackfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:900;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black-full.woff2) format("woff2")}
@font-face{font-family:"72-BoldItalic";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic.woff2) format("woff2"),local("72-BoldItalic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:italic;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic.woff2) format("woff2"),local("72-BoldItalic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:italic;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic-full.woff2) format("woff2")}
@font-face{font-family:"72-Condensed";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed.woff2) format("woff2"),local("72-Condensed");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:400;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed.woff2) format("woff2"),local("72-Condensed");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:400;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed-full.woff2) format("woff2");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-CondensedBold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold.woff2) format("woff2"),local("72-CondensedBold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:700;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold.woff2) format("woff2"),local("72-CondensedBold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:normal;font-weight:700;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold-full.woff2) format("woff2")}
@font-face{font-family:"72-Italic";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2) format("woff2"),local("72-Italic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:italic;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2) format("woff2"),local("72-Italic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:italic;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic-full.woff2) format("woff2")}
@font-face{font-family:"72Mono";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Regular.woff2) format("woff2"),local("72Mono");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Monofull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Regular-full.woff2) format("woff2")}
@font-face{font-family:"72Mono-Bold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Bold.woff2) format("woff2"),local("72Mono-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Mono-Boldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Bold-full.woff2) format("woff2")}`;

	let o$4;i$c(()=>{o$4=void 0;});const a$5=()=>(o$4===void 0&&(o$4=U$2()),o$4);

	const a$4=()=>{const t=n$e("OpenUI5Support");(!t||!t.isOpenUI5Detected())&&f$5();},f$5=()=>{const t=document.querySelector("head>style[data-ui5-font-face]");!a$5()||t||S$1("data-ui5-font-face")||c$7(n$7,"data-ui5-font-face");};

	var a$3 = ":root{--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5_content_density:compact}";

	const e$4=()=>{S$1("data-ui5-system-css-vars")||c$7(a$3,"data-ui5-system-css-vars");};

	var t$9 = "html:not(:has(.ui5-content-native-scrollbars)){scrollbar-color:var(--sapScrollBar_FaceColor) var(--sapScrollBar_TrackColor)}";

	const s$6=()=>{S$1("data-ui5-scrollbar-styles")||c$7(t$9,"data-ui5-scrollbar-styles");};

	const t$8=typeof document>"u",e$3={get userAgent(){return t$8?"":navigator.userAgent},get touch(){return t$8?false:"ontouchstart"in window||navigator.maxTouchPoints>0},get chrome(){return t$8?false:/(Chrome|CriOS)/.test(e$3.userAgent)},get firefox(){return t$8?false:/Firefox/.test(e$3.userAgent)},get safari(){return t$8?false:!e$3.chrome&&/(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(e$3.userAgent)},get webkit(){return t$8?false:/webkit/.test(e$3.userAgent)},get windows(){return t$8?false:navigator.platform.indexOf("Win")!==-1},get macOS(){return t$8?false:!!navigator.userAgent.match(/Macintosh|Mac OS X/i)},get iOS(){return t$8?false:!!navigator.platform.match(/iPhone|iPad|iPod/)||!!(e$3.userAgent.match(/Mac/)&&"ontouchend"in document)},get android(){return t$8?false:!e$3.windows&&/Android/.test(e$3.userAgent)},get androidPhone(){return t$8?false:e$3.android&&/(?=android)(?=.*mobile)/i.test(e$3.userAgent)},get ipad(){return t$8?false:/ipad/i.test(e$3.userAgent)||/Macintosh/i.test(e$3.userAgent)&&"ontouchend"in document},_isPhone(){return u$4(),e$3.touch&&!r$8}};let o$3,i$4,r$8;const s$5=()=>{if(t$8||!e$3.windows)return  false;if(o$3===void 0){const n=e$3.userAgent.match(/Windows NT (\d+).(\d)/);o$3=n?parseFloat(n[1]):0;}return o$3>=8},c$6=()=>{if(t$8||!e$3.webkit)return  false;if(i$4===void 0){const n=e$3.userAgent.match(/(webkit)[ /]([\w.]+)/);i$4=n?parseFloat(n[1]):0;}return i$4>=537.1},u$4=()=>{if(t$8)return  false;if(r$8===void 0){if(e$3.ipad){r$8=true;return}if(e$3.touch){if(s$5()){r$8=true;return}if(e$3.chrome&&e$3.android){r$8=!/Mobile Safari\/[.0-9]+/.test(e$3.userAgent);return}let n=window.devicePixelRatio?window.devicePixelRatio:1;e$3.android&&c$6()&&(n=1),r$8=Math.min(window.screen.width/n,window.screen.height/n)>=600;return}r$8=e$3.userAgent.indexOf("Touch")!==-1||e$3.android&&!e$3.androidPhone;}},l$4=()=>e$3.touch,h$3=()=>e$3.safari,g$4=()=>e$3.chrome,b=()=>e$3.firefox,a$2=()=>(u$4(),(e$3.touch||s$5())&&r$8),d$1=()=>e$3._isPhone(),f$4=()=>t$8?false:!a$2()&&!d$1()||s$5(),m$2=()=>a$2()&&f$4(),w$2=()=>e$3.iOS,A$2=()=>e$3.macOS,P$1=()=>e$3.android||e$3.androidPhone;

	let t$7=false;const i$3=()=>{h$3()&&w$2()&&!t$7&&(document.body.addEventListener("touchstart",()=>{}),t$7=true);};

	let o$2=false,r$7;const p$1=new i$d,h$2=()=>o$2,P=t=>{if(!o$2){p$1.attachEvent("boot",t);return}t();},b$1=async()=>{if(r$7!==void 0)return r$7;const t=async n=>{if(x(),typeof document>"u"){n();return}n$a(F);const e=n$e("OpenUI5Support"),f=e?e.isOpenUI5Detected():false,s=n$e("F6Navigation");e&&await e.init(),s&&!f&&s.init(),await d$2(),await w$3(r$6()),e&&e.attachListeners(),a$4(),e$4(),s$6(),i$3(),n(),o$2=true,p$1.fireEvent("boot");};return r$7=new Promise(t),r$7},F=t=>{o$2&&t===r$6()&&w$3(r$6());};

	let t$6;i$c(()=>{t$6=void 0;});const r$6=()=>(t$6===void 0&&(t$6=T$2()),t$6),u$3=async e=>{t$6!==e&&(t$6=e,h$2()&&(await w$3(t$6),await C$1({themeAware:true})));},g$3=()=>e$7,n$6=()=>{const e=r$6();return l$3(e)?!e.startsWith("sap_horizon"):!m$3()?.baseThemeName?.startsWith("sap_horizon")},l$3=e=>s$g.includes(e);

	const t$5=typeof document>"u",o$1=()=>{if(t$5)return a$a;const a=navigator.languages,n=()=>navigator.language;return a&&a[0]||n()||a$a};

	const e$2=new i$d,n$5="languageChange",t$4=a=>{e$2.attachEvent(n$5,a);},r$5=a=>{e$2.detachEvent(n$5,a);},o=a=>e$2.fireEventAsync(n$5,a);

	let e$1,t$3;i$c(()=>{e$1=void 0,t$3=void 0;});let a$1=false;const s$4=()=>a$1,l$2=()=>(e$1===void 0&&(e$1=L$2()),e$1),L$1=async n=>{e$1!==n&&(a$1=true,e$1=n,await o(n),a$1=false,h$2()&&await C$1({languageAware:true}));},c$5=()=>a$a,m$1=n=>{t$3=n;},h$1=()=>(t$3===void 0&&(t$3=R$2()),t$3);

	const n$4=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;let r$4 = class r{constructor(s){const t=n$4.exec(s.replace(/_/g,"-"));if(t===null)throw new Error(`The given language ${s} does not adhere to BCP-47.`);this.sLocaleId=s,this.sLanguage=t[1]||a$a,this.sScript=t[2]||"",this.sRegion=t[3]||"",this.sVariant=t[4]&&t[4].slice(1)||null,this.sExtension=t[5]&&t[5].slice(1)||null,this.sPrivateUse=t[6]||null,this.sLanguage&&(this.sLanguage=this.sLanguage.toLowerCase()),this.sScript&&(this.sScript=this.sScript.toLowerCase().replace(/^[a-z]/,i=>i.toUpperCase())),this.sRegion&&(this.sRegion=this.sRegion.toUpperCase());}getLanguage(){return this.sLanguage}getScript(){return this.sScript}getRegion(){return this.sRegion}getVariant(){return this.sVariant}getVariantSubtags(){return this.sVariant?this.sVariant.split("-"):[]}getExtension(){return this.sExtension}getExtensionSubtags(){return this.sExtension?this.sExtension.slice(2).split("-"):[]}getPrivateUse(){return this.sPrivateUse}getPrivateUseSubtags(){return this.sPrivateUse?this.sPrivateUse.slice(2).split("-"):[]}hasPrivateUseSubtag(s){return this.getPrivateUseSubtags().indexOf(s)>=0}toString(){const s=[this.sLanguage];return this.sScript&&s.push(this.sScript),this.sRegion&&s.push(this.sRegion),this.sVariant&&s.push(this.sVariant),this.sExtension&&s.push(this.sExtension),this.sPrivateUse&&s.push(this.sPrivateUse),s.join("-")}};

	const r$3=new Map,n$3=t=>(r$3.has(t)||r$3.set(t,new r$4(t)),r$3.get(t)),c$4=t=>{try{if(t&&typeof t=="string")return n$3(t)}catch{}return new r$4(r$e)},s$3=t=>{const e=l$2();return e?n$3(e):c$4(o$1())};

	const _=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i,c$3=/(?:^|-)(saptrc|sappsd)(?:-|$)/i,f$3={he:"iw",yi:"ji",nb:"no",sr:"sh"},p=i=>{let e;if(!i)return r$e;if(typeof i=="string"&&(e=_.exec(i.replace(/_/g,"-")))){let t=e[1].toLowerCase(),n=e[3]?e[3].toUpperCase():void 0;const s=e[2]?e[2].toLowerCase():void 0,r=e[4]?e[4].slice(1):void 0,o=e[6];return t=f$3[t]||t,o&&(e=c$3.exec(o))||r&&(e=c$3.exec(r))?`en_US_${e[1].toLowerCase()}`:(t==="zh"&&!n&&(s==="hans"?n="CN":s==="hant"&&(n="TW")),t+(n?"_"+n+(r?"_"+r.replace("-","_"):""):""))}return r$e};

	const r$2={zh_HK:"zh_TW",in:"id"},n$2=t=>{if(!t)return r$e;if(r$2[t])return r$2[t];const L=t.lastIndexOf("_");return L>=0?t.slice(0,L):t!==r$e?r$e:""};

	const d=new Set,m=new Set,g$2=new Map,l$1=new Map,u$2=new Map,$=(n,t,e)=>{const r=`${n}/${t}`;u$2.set(r,e);},f$2=(n,t)=>{g$2.set(n,t);},A$1=n=>g$2.get(n),h=(n,t)=>{const e=`${n}/${t}`;return u$2.has(e)},B=(n,t)=>{const e=`${n}/${t}`,r=u$2.get(e);return r&&!l$1.get(e)&&l$1.set(e,r(t)),l$1.get(e)},M=n=>{d.has(n)||(console.warn(`[${n}]: Message bundle assets are not configured. Falling back to English texts.`,` Add \`import "${n}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`),d.add(n));},L=(n,t)=>t!==a$a&&!h(n,t),w$1=async n=>{const t=s$3().getLanguage(),e=s$3().getRegion(),r=s$3().getVariant();let s=t+(e?`-${e}`:"")+(r?`-${r}`:"");if(L(n,s))for(s=p(s);L(n,s);)s=n$2(s);const I=h$1();if(s===a$a&&!I){f$2(n,null);return}if(!h(n,s)){M(n);return}try{const o=await B(n,s);f$2(n,o);}catch(o){const a=o;m.has(a.message)||(m.add(a.message),console.error(a.message));}};t$4(n=>{const t=[...g$2.keys()];return Promise.all(t.map(w$1))});

	const t$2=new Map,e=(n,o)=>{t$2.set(n,o);},c$2=n=>t$2.get(n);

	var t$1=(o=>(o.SAPIconsV4="SAP-icons-v4",o.SAPIconsV5="SAP-icons-v5",o.SAPIconsTNTV2="tnt-v2",o.SAPIconsTNTV3="tnt-v3",o.SAPBSIconsV1="business-suite-v1",o.SAPBSIconsV2="business-suite-v2",o))(t$1||{});const s$2=new Map;s$2.set("SAP-icons",{legacy:"SAP-icons-v4",sap_horizon:"SAP-icons-v5"}),s$2.set("tnt",{legacy:"tnt-v2",sap_horizon:"tnt-v3"}),s$2.set("business-suite",{legacy:"business-suite-v1",sap_horizon:"business-suite-v2"});const c$1=(n,e)=>{if(s$2.has(n)){s$2.set(n,{...e,...s$2.get(n)});return}s$2.set(n,e);},r$1=n=>{const e=n$6()?"legacy":"sap_horizon";return s$2.has(n)?s$2.get(n)[e]:n};

	var t=(s=>(s["SAP-icons"]="SAP-icons-v4",s.horizon="SAP-icons-v5",s["SAP-icons-TNT"]="tnt",s.BusinessSuiteInAppSymbols="business-suite",s))(t||{});const n$1=e=>t[e]?t[e]:e;

	const i$2=o=>{const t=c$2(r$6());return !o&&t?n$1(t):o?r$1(o):r$1("SAP-icons")};

	const g$1=/('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g,i$1=(n,t)=>(t=t||[],n.replace(g$1,(p,s,e,r,o)=>{if(s)return "'";if(e)return e.replace(/''/g,"'");if(r){const a=typeof r=="string"?parseInt(r):r;return String(t[a])}throw new Error(`[i18n]: pattern syntax error at pos ${o}`)}));

	const r=new Map;let s$1;let u$1 = class u{constructor(e){this.packageName=e;}getText(e,...i){if(typeof e=="string"&&(e={key:e,defaultText:e}),!e||!e.key)return "";const t=A$1(this.packageName);t&&!t[e.key]&&console.warn(`Key ${e.key} not found in the i18n bundle, the default text will be used`);const l=t&&t[e.key]?t[e.key]:e.defaultText||e.key;return i$1(l,i)}};const a=n=>{if(r.has(n))return r.get(n);const e=new u$1(n);return r.set(n,e),e},f$1=async n=>s$1?s$1(n):(await w$1(n),a(n)),y$1=n=>{s$1=n;};

	const w="legacy",s=new Map,c=m$9("SVGIcons.registry",new Map),i=m$9("SVGIcons.promises",new Map),l="ICON_NOT_FOUND",C=(e,t)=>{s.set(e,t);},N=async e=>{if(!i.has(e)){if(!s.has(e))throw new Error(`No loader registered for the ${e} icons collection. Probably you forgot to import the "AllIcons.js" module for the respective package.`);const t=s.get(e);i.set(e,t(e));}return i.get(e)},f=e=>{Object.keys(e.data).forEach(t=>{const a=e.data[t];y(t,{pathData:a.path||a.paths,ltr:a.ltr,accData:a.acc,collection:e.collection,packageName:e.packageName});});},y=(e,t)=>{const a=`${t.collection}/${e}`,o={collection:t.collection,packageName:t.packageName,pathData:t.pathData,viewBox:t.viewBox,ltr:t.ltr,accData:t.accData,customTemplate:t.customTemplate};c.set(a,o);},u=e=>{e.startsWith("sap-icon://")&&(e=e.replace("sap-icon://",""));let t;return [e,t]=e.split("/").reverse(),e=e.replace("icon-",""),t&&(t=n$1(t)),{name:e,collection:t}},D=e=>{const{name:t,collection:a}=u(e);return g(a,t)},n=async e=>{const{name:t,collection:a}=u(e);let o=l;try{o=await N(i$2(a));}catch(r){console.error(r.message);}if(o===l)return o;const p=g(a,t);return p||(Array.isArray(o)?o.forEach(r=>{f(r),c$1(a,{[r.themeFamily||w]:r.collection});}):f(o),g(a,t))},g=(e,t)=>{const a=`${i$2(e)}/${t}`;return c.get(a)},A=async e=>{if(!e)return;let t=D(e);if(t||(t=await n(e)),t&&t!==l&&t.accData)return t.packageName?(await f$1(t.packageName)).getText(t.accData):t.accData?.defaultText||""};

	exports.$ = $;
	exports.$$1 = $$1;
	exports.A = A;
	exports.A$1 = A$2;
	exports.C = C;
	exports.C$1 = C$2;
	exports.C$2 = C$1;
	exports.D = D;
	exports.D$1 = D$1;
	exports.F = F$1;
	exports.L = L$1;
	exports.M = M$1;
	exports.P = P;
	exports.P$1 = P$1;
	exports.S = S$1;
	exports.a = a$9;
	exports.a$1 = a$2;
	exports.b = b$3;
	exports.b$1 = b$1;
	exports.b$2 = b;
	exports.c = c$b;
	exports.c$1 = c$7;
	exports.c$2 = c$8;
	exports.c$3 = c$a;
	exports.c$4 = c$2;
	exports.c$5 = c$5;
	exports.d = d$1;
	exports.d$1 = d$8;
	exports.e = e$8;
	exports.e$1 = e;
	exports.f = f$4;
	exports.f$1 = f$7;
	exports.f$2 = f$1;
	exports.g = g$4;
	exports.g$1 = g$7;
	exports.g$2 = g$3;
	exports.h = h$3;
	exports.h$1 = h$5;
	exports.h$2 = h$6;
	exports.h$3 = h$1;
	exports.i = i$e;
	exports.i$1 = i$c;
	exports.i$2 = i$d;
	exports.i$3 = i$a;
	exports.i$4 = i$2;
	exports.l = l$b;
	exports.l$1 = l$7;
	exports.l$2 = l$4;
	exports.l$3 = l$2;
	exports.l$4 = l$8;
	exports.m = m$9;
	exports.m$1 = m$8;
	exports.m$2 = m$2;
	exports.m$3 = m$1;
	exports.n = n;
	exports.n$1 = n$e;
	exports.n$2 = n$c;
	exports.n$3 = n$9;
	exports.o = o$c;
	exports.o$1 = o$5;
	exports.p = p$2;
	exports.p$1 = p$3;
	exports.r = r$6;
	exports.r$1 = r$e;
	exports.r$2 = r$5;
	exports.s = s$h;
	exports.s$1 = s$3;
	exports.s$2 = s$4;
	exports.t = t$4;
	exports.t$1 = t$1;
	exports.u = u$8;
	exports.u$1 = u$3;
	exports.u$2 = u$1;
	exports.w = w$2;
	exports.w$1 = w$5;
	exports.y = y;
	exports.y$1 = y$1;

}));
