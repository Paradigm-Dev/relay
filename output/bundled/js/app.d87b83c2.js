(function(t){function a(a){for(var r,s,i=a[0],c=a[1],l=a[2],u=0,d=[];u<i.length;u++)s=i[u],Object.prototype.hasOwnProperty.call(o,s)&&o[s]&&d.push(o[s][0]),o[s]=0;for(r in c)Object.prototype.hasOwnProperty.call(c,r)&&(t[r]=c[r]);p&&p(a);while(d.length)d.shift()();return n.push.apply(n,l||[]),e()}function e(){for(var t,a=0;a<n.length;a++){for(var e=n[a],r=!0,i=1;i<e.length;i++){var c=e[i];0!==o[c]&&(r=!1)}r&&(n.splice(a--,1),t=s(s.s=e[0]))}return t}var r={},o={app:0},n=[];function s(a){if(r[a])return r[a].exports;var e=r[a]={i:a,l:!1,exports:{}};return t[a].call(e.exports,e,e.exports,s),e.l=!0,e.exports}s.m=t,s.c=r,s.d=function(t,a,e){s.o(t,a)||Object.defineProperty(t,a,{enumerable:!0,get:e})},s.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,a){if(1&a&&(t=s(t)),8&a)return t;if(4&a&&"object"===typeof t&&t&&t.__esModule)return t;var e=Object.create(null);if(s.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:t}),2&a&&"string"!=typeof t)for(var r in t)s.d(e,r,function(a){return t[a]}.bind(null,r));return e},s.n=function(t){var a=t&&t.__esModule?function(){return t["default"]}:function(){return t};return s.d(a,"a",a),a},s.o=function(t,a){return Object.prototype.hasOwnProperty.call(t,a)},s.p="app://./";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],c=i.push.bind(i);i.push=a,i=i.slice();for(var l=0;l<i.length;l++)a(i[l]);var p=c;n.push([0,"chunk-vendors"]),e()})({0:function(t,a,e){t.exports=e("56d7")},"034f":function(t,a,e){"use strict";var r=e("8a23"),o=e.n(r);o.a},"34bb":function(t,a){t.exports=require("electron")},3646:function(t,a){t.exports=require("buffer")},"3c93":function(t,a){t.exports=require("crypto")},"56d7":function(t,a,e){"use strict";e.r(a);var r,o=e("2b0e"),n=function(){var t=this,a=t.$createElement,r=t._self._c||a;return r("v-app",[r("v-system-bar",{staticClass:"deep-purple elevation-4",staticStyle:{"-webkit-app-region":"drag"},attrs:{app:"",window:""}},[r("img",{staticStyle:{"margin-right":"4px"},attrs:{src:e("cf05"),height:"18"},on:{click:function(a){return!a.type.indexOf("key")&&t._k(a.keyCode,"left",37,a.key,["Left","ArrowLeft"])?null:"button"in a&&0!==a.button?null:t.reload()}}}),r("span",{staticStyle:{"margin-right":"4px"}},[t._v("Relay Management Conosle")]),r("v-spacer"),r("div",{staticClass:"mr-n2",staticStyle:{"-webkit-app-region":"no-drag"}},[r("v-icon",{directives:[{name:"ripple",rawName:"v-ripple"}],staticClass:"appbar-icon",on:{click:function(a){return t.minimize()}}},[t._v("mdi-minus")]),r("v-icon",{directives:[{name:"ripple",rawName:"v-ripple"}],staticClass:"appbar-icon",on:{click:function(a){t.maximized?t.unmaximize():t.maximize()}}},[t._v("mdi-crop-square")]),r("v-icon",{directives:[{name:"ripple",rawName:"v-ripple"}],staticClass:"appbar-icon",on:{click:function(a){return t.close()}}},[t._v("mdi-close")])],1)],1),r("v-content",[r("v-container",{staticClass:"py-0",attrs:{fluid:""}},[r("v-row",[r("v-col",{staticClass:"py-6 pl-6",attrs:{cols:"12",sm:"3"}},[r("v-row",[r("v-col",{staticClass:"pt-0",attrs:{cols:"12",sm:"12"}},[r("v-card",{staticClass:"fill-height"},[r("v-card-text",[r("p",[t._v("Status:"),r("span",{class:{"ml-12 title font-weight-bold":!0,"red--text":!t.$root.data.status,"green--text":t.$root.data.status}},[t._v(t._s(t.$root.data.status?"Online":"Offline"))])]),r("v-text-field",{attrs:{disabled:t.$root.data.status,label:"Host IP Address"},on:{change:function(a){return t.$saveData()}},model:{value:t.$root.data.ip,callback:function(a){t.$set(t.$root.data,"ip",a)},expression:"$root.data.ip"}}),r("v-text-field",{attrs:{disabled:t.$root.data.status,label:"Host Port"},on:{change:function(a){return t.$saveData()}},model:{value:t.$root.data.port,callback:function(a){t.$set(t.$root.data,"port",a)},expression:"$root.data.port"}}),r("v-text-field",{attrs:{disabled:t.$root.data.status,label:"File Path"},on:{change:function(a){return t.$saveData()}},model:{value:t.$root.data.path,callback:function(a){t.$set(t.$root.data,"path",a)},expression:"$root.data.path"}}),r("v-switch",{staticClass:"mt-0",attrs:{color:"blue lighten-2",label:"Auto Start"},on:{change:function(a){return t.$saveData()},click:function(a){return a.preventDefault(),t.toggleAutoLaunch()}},model:{value:t.$root.data.auto_start,callback:function(a){t.$set(t.$root.data,"auto_start",a)},expression:"$root.data.auto_start"}}),t.$root.data.status?r("p",{staticClass:"mb-1"},[t._v("To edit server settings, stop the server.")]):t._e(),r("v-row",[r("v-col",{staticStyle:{"padding-right":"6px"},attrs:{sm:"4"}},[r("v-btn",{attrs:{text:"",block:"",color:"blue"},on:{click:function(a){return t.openRelayDir()}}},[t._v("Open Path")])],1),r("v-col",{staticStyle:{"padding-right":"6px"},attrs:{sm:"4"}},[r("v-btn",{attrs:{text:"",block:"",color:"indigo lighten-1"},on:{click:function(a){return t.openURL()}}},[t._v("Open URL")])],1),r("v-col",{staticStyle:{"padding-left":"6px"},attrs:{sm:"4"}},[r("v-btn",{attrs:{text:"",block:"",color:"red"},on:{click:function(a){t.history=[]}}},[t._v("Clear")])],1)],1),r("v-btn",{attrs:{block:"",color:t.$root.data.status?"red":"green"},on:{click:function(a){return t.toggleServer()}}},[t._v(t._s(t.$root.data.status?"Stop":"Start"))])],1)],1)],1),r("v-col",{attrs:{cols:"12",sm:"12"}})],1)],1),r("v-col",{staticClass:"py-6 pr-6",attrs:{cols:"12",sm:"9"}},[r("v-card",{staticClass:"fill-height",staticStyle:{"font-family":"'Roboto Mono'",height:"calc( 100vh - 80px )"}},[r("v-card-text",t._l(t.history,(function(a,e){return r("div",{key:e},[r("p",{domProps:{innerHTML:t._s(a)}})])})),0)],1)],1)],1)],1)],1)],1)},s=[],i=e("34bb"),c=e.n(i),l=e("a32b"),p=e.n(l),u=e("9b0f"),d=e.n(u),h=(e("7374"),e("bc3a"),e("b9fc")),f=e.n(h),m=e("6441"),v=e.n(m),g=e("b9b7"),b=e.n(g),y=e("e6d1"),x=e.n(y),$=e("34bb").remote,w=v()(),S={name:"app",data(){return{win:$.getCurrentWindow(),maximized:$.getCurrentWindow().isMaximized(),history:[],files:[]}},methods:{reload(){this.win.reload()},close(){this.win.close()},maximize(){this.win.maximize(),this.maximized=$.getCurrentWindow().isMaximized()},unmaximize(){this.win.unmaximize(),this.maximized=$.getCurrentWindow().isMaximized()},minimize(){this.win.minimize()},openURL(){i["shell"].openItem("http://".concat(this.$root.data.ip,":").concat(this.$root.data.port))},openRelayDir(){i["shell"].openItem(this.$root.data.path)},toggleServer(){!0===this.$root.data.status?(this.$root.data.status=!1,this.stopServer()):(this.$root.data.status=!0,this.startServer())},toggleAutoLaunch(t){this.$root.data.auto_launch=t},consolelog(t){this.history.push(t)},consoleerror(t){this.history.push('<span class="red--text">'.concat(t,"</span>"))},stopServer(){r.close(),this.consolelog("Server stopped!")},startServer(){this.consolelog("Server starting...");var t=this.$root.data.port,a=this.$root.data.ip;w.use(x()()),w.use("/rover",v.a.static(this.$root.data.path+"/rover/dist")),w.use("/",v.a.static("".concat(this.$root.data.path,"/relay"))),w.get("/relay/list/:path",(t,a)=>{var e="".concat(this.$root.data.path,"/relay/").concat(t.params.path);d.a.readdir(e,(e,r)=>{e?this.consoleerror(e):(a.json(r),this.consolelog("RELAY -- List: ".concat(t.params.path)))})}),w.get("/files/:username",(t,a)=>{var e=p.a.join(this.$root.data.path+"/drawer/"+t.params.username);d.a.existsSync(e)?d.a.readdir(e,(e,r)=>{e?this.consoleerror(e):(a.json(r),this.consolelog("DRAWER -- Sent: ".concat(t.params.username,"/file list")))}):(d.a.mkdirSync(e),this.consolelog("DRAWER -- Created: ".concat(t.params.username)))}),w.get("/download/:username/:path",(t,a)=>{a.download(p.a.join(this.$root.data.path+"/drawer/"+t.params.username+"/"+t.params.path)),this.consolelog("DRAWER -- Downloaded: ".concat(t.params.username,"/").concat(t.params.path))}),w.delete("/file/:username/:path",(t,a)=>{d.a.unlink(p.a.join(this.$root.data.path+"/drawer/"+t.params.username+"/"+t.params.path),a=>{if(a)throw a;this.consolelog("DRAWER -- Deleted: ".concat(t.params.username,"/").concat(t.params.path))})}),w.post("/upload/:username",(t,a)=>{var e=new b.a.IncomingForm;e.parse(t),e.on("fileBegin",(a,e)=>{e.path=this.$root.data.path+"/drawer/"+t.params.username+"/"+e.name}),e.on("file",(a,e)=>{this.consolelog("DRAWER -- Uploaded: ".concat(t.params.username,"/").concat(e.name))})}),r=w.listen(this.$root.data.port,this.$root.data.ip),this.consolelog("Server started!"),this.consolelog("Ready! Listening on http://".concat(a,":").concat(t,"."))}},created(){var t=(c.a.app||c.a.remote.app).getPath("userData"),a=p.a.join(t,"relay.json");function e(t){try{return JSON.parse(d.a.readFileSync(t))}catch(a){return this.consolelog("Configuration file not found",a),d.a.writeFileSync(t,JSON.stringify({status:!1,ip:f.a.address(),port:80,auto_start:!0,path:""})),{status:!1,ip:f.a.address(),port:80,auto_start:!0,path:""}}}this.$root.data=e(a),this.$root.data.status=!1,!0===this.$root.data.auto_start&&(this.consolelog("The server is automatically starting..."),this.startServer(),this.$root.data.status=!0)}},_=S,k=(e("034f"),e("2877")),C=e("6544"),R=e.n(C),O=e("7496"),j=e("8336"),D=e("b0af"),z=e("99d9"),q=e("62ad"),P=e("a523"),V=e("a75b"),A=e("132d"),L=e("0fd9"),M=e("2fa4"),W=e("b73d"),T=e("afd9"),E=e("8654"),F=e("269a"),N=e.n(F),I=e("5607"),J=Object(k["a"])(_,n,s,!1,null,null,null),U=J.exports;R()(J,{VApp:O["a"],VBtn:j["a"],VCard:D["a"],VCardText:z["a"],VCol:q["a"],VContainer:P["a"],VContent:V["a"],VIcon:A["a"],VRow:L["a"],VSpacer:M["a"],VSwitch:W["a"],VSystemBar:T["a"],VTextField:E["a"]}),N()(J,{Ripple:I["a"]});var B=e("f309");o["a"].use(B["a"]);var H=new B["a"]({theme:{dark:!0}});o["a"].config.productionTip=!1,o["a"].mixin({methods:{$saveData(){var t=(c.a.app||c.a.remote.app).getPath("userData"),a=p.a.join(t,"relay.json");d.a.writeFileSync(a,JSON.stringify(this.$root.data))}}}),new o["a"]({vuetify:H,render:t=>t(U),data(){return{data:{status:!1,ip:"",port:"",path:"",auto_start:!0}}}}).$mount("#app")},6441:function(t,a){t.exports=require("express")},"8a23":function(t,a,e){},"8cad":function(t,a){t.exports=require("util")},"8e57":function(t,a){t.exports=require("os")},"9ac2":function(t,a){t.exports=require("stream")},"9b0f":function(t,a){t.exports=require("fs")},a32b:function(t,a){t.exports=require("path")},b658:function(t,a){t.exports=require("string_decoder")},cf05:function(t,a,e){t.exports=e.p+"img/logo.68ac9d4e.png"},f319:function(t,a){t.exports=require("querystring")},ff4a:function(t,a){t.exports=require("events")}});
//# sourceMappingURL=app.d87b83c2.js.map