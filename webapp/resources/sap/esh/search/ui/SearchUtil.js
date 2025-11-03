/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([],function(){"use strict";function t(t){return null}class e{interval;maxRetries;action;timeout=undefined;constructor(t){this.interval=t.interval;this.maxRetries=t.maxRetries;this.action=t.action}doRun(t){const e=this.action();if(e){return}if(t<=1){return}this.timeout=window.setTimeout(()=>{this.timeout=undefined;this.doRun(t-1)},this.interval)}run(){if(this.timeout){return}this.doRun(this.maxRetries)}}class i{compareStates;getState;changed;interval;checkMode=false;state;checkState;constructor(t){this.compareStates=t.compareStates;this.getState=t.getState;this.changed=t.changed;this.interval=t.interval??100}start(){setInterval(this.checkStateChange.bind(this),this.interval)}checkStateChange(){const t=this.getState();if(!this.checkMode){if(!this.state||!this.compareStates(t,this.state)){this.checkMode=true;this.checkState=t}}else{if(this.compareStates(t,this.checkState)){this.changed(t,this.state);this.state=t}this.checkMode=false}}}var s={__esModule:true};s.forwardEllipsis4Whyfound=t;s.PeriodicRetry=e;s.StateWatcher=i;return s});
//# sourceMappingURL=SearchUtil.js.map