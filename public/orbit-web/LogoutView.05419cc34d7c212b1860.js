(this.webpackJsonp=this.webpackJsonp||[]).push([[14],{357:function(e,t,o){"use strict";e.exports=o(358)},358:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n,r=(n=o(10))&&"object"==typeof n&&"default"in n?n.default:n;function a(e){return a.warnAboutHMRDisabled&&(a.warnAboutHMRDisabled=!0,console.error("React-Hot-Loader: misconfiguration detected, using production version in non-production environment."),console.error("React-Hot-Loader: Hot Module Replacement is not enabled.")),r.Children.only(e.children)}a.warnAboutHMRDisabled=!1;var i=function e(){return e.shouldWrapWithAppContainer?function(e){return function(t){return r.createElement(a,null,r.createElement(e,t))}}:function(e){return e}};i.shouldWrapWithAppContainer=!1;t.AppContainer=a,t.hot=i,t.areComponentsEqual=function(e,t){return e===t},t.setConfig=function(){},t.cold=function(e){return e},t.configureComponent=function(){}},478:function(e,t,o){"use strict";o.r(t),function(e){var n,r=o(10),a=o.n(r),i=o(357),u=o(390),c=o(359);function l(){var e=a.a.useContext(c.a).sessionStore;return a.a.useEffect((function(){e.logout()}),[]),a.a.createElement(u.a,{to:"/"})}(n="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.enterModule:void 0)&&n(e),("undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default.signature:function(e){return e})(l,"useContext{{ sessionStore }}\nuseEffect{}");var s,d,f=Object(i.hot)(e)(l);t.default=f,(s="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.default:void 0)&&(s.register(l,"LogoutView","/home/ryan/projects/orbit-web/src/views/LogoutView.js"),s.register(f,"default","/home/ryan/projects/orbit-web/src/views/LogoutView.js")),(d="undefined"!=typeof reactHotLoaderGlobal?reactHotLoaderGlobal.leaveModule:void 0)&&d(e)}.call(this,o(52)(e))}}]);