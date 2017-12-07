!function(){var t={};!function(){var n,e,r,o,i,a,u,s,c;n=function(t,n){if(t&&1==arguments.length)throw"when making a sender with a reducer, please supply an initial value";var e=[],r=function(){var r=arguments,o=e.map(function(t){return t.apply(null,r)});if(t)return o.reduce(t,n)};return r.add=function(t){return e.push(t),r},r.remove=function(t){var n;-1!=(n=e.indexOf(t))&&e.splice(n,1)},r},e=function(t){var e=null,r=n(),o=n(),i=n(function(t,n){return t&&n},!0),a=n(),u=!1,s=t.getBoundingClientRect(),c=s.width,f=s.height;t.setAttribute("width",c),t.setAttribute("height",f),t.setAttribute("style","width:"+c+"px;height:"+f+"px;");var d=t.getContext("2d"),l=function(n,e){var r=t.getBoundingClientRect();return{x:n-r.left,y:e-r.top}},h=function(){var n=function(n,e){var r=new CustomEvent("positiondragstart",{detail:{x:n,y:e}});t.dispatchEvent(r)},e=function(n,e){var r=new CustomEvent("positiondragmove",{detail:{toX:n,toY:e}});t.dispatchEvent(r)},r=function(){var n=new CustomEvent("positiondragend");t.dispatchEvent(n)},o=function(n){var e=new CustomEvent("startzoom",{detail:{r:n}});t.dispatchEvent(e)},i=function(){var n=new CustomEvent("endzoom");t.dispatchEvent(n)},a=function(n){var e=new CustomEvent("changezoom",{detail:{r:n}});t.dispatchEvent(e)};return{make:function(t,u,s){n(t,u);var c,f={x:t,y:u,id:s},d=function(){return Math.sqrt(Math.pow(f.x-c.x,2)+Math.pow(f.y-c.y,2))};return{moveTo:function(t,n,r){void 0==r||r==f.id?(e(t,n),void 0!=r&&r==f.id&&(f.x=t,f.y=n)):c&&r==c.id&&(c.x=t,c.y=n,a(d()))},end:function(t){void 0==t||t==f.id?r():c&&t==c.id&&(i(),c=null)},add:function(t,n,e){e==f.id||c||(c={x:t,y:n,id:e},o(d()))}}}}}(),v=function(t,n){for(var e=0;e<t.length;e++)n(t.item(e))},m=function(){t.width=c,r()};return t.addEventListener("click",function(t){if(u)return u=!1,t.stopPropagation(),!1;var n=l(t.clientX,t.clientY);o(n.x,n.y,t.shiftKey)}),t.addEventListener("touchstart",function(t){v(t.changedTouches,function(t){var n=l(t.clientX,t.clientY);e?e.add(n.x,n.y,t.identifier):e=h.make(n.x,n.y,t.identifier)})}),t.addEventListener("touchend",function(t){e&&(v(t.changedTouches,function(t){e.end(t.identifier)}),0==t.touches.length&&(e=null))}),t.addEventListener("touchmove",function(t){return v(t.changedTouches,function(t){var n=l(t.clientX,t.clientY);e.moveTo(n.x,n.y,t.identifier)}),u=!0,t.preventDefault(),!1}),t.addEventListener("mousedown",function(t){t.preventDefault();var n=l(t.clientX,t.clientY);e=h.make(n.x,n.y)}),t.addEventListener("mousemove",function(t){if(e&&(0!=t.movementX||0!=t.movementY)){var n=l(t.clientX,t.clientY);e.moveTo(n.x,n.y),u=!0}return!0}),t.addEventListener("mouseup",function(){e&&(e.end(),e=null)}),t.addEventListener("contextmenu",function(t){e&&(e.end(),e=null);var n=l(t.clientX,t.clientY);return i(n.x,n.y,function(){t.preventDefault()})}),t.addEventListener("wheel",function(t){var n=l(t.clientX,t.clientY);return a(n.x,n.y,t.deltaY),t.preventDefault(),!1}),{w:c,h:f,context:d,onDraw:function(t){r.add(t)},drawAll:m,onClick:function(t){o.add(t)},onContextMenu:function(t){i.add(t)},onWheel:function(t){a.add(t)},addEventListener:function(n,e){"click"==n?o=e:t.addEventListener(n,e)},toDataURL:function(){return t.toDataURL.apply(t,arguments)}}},r=function(){var t,n,e,r=function(t,n,e,r,o,i){this.a=t,this.b=n,this.c=e,this.d=r,this.e=o,this.f=i};return Object.defineProperty(r.prototype,"size",{get:function(){return Math.sqrt(Math.abs(this.a*this.d-this.b*this.c))}}),r.prototype.before=function(t){var n=this.a*t.a+this.b*t.c,e=this.a*t.b+this.b*t.d,o=this.c*t.a+this.d*t.c,i=this.c*t.b+this.d*t.d,a=this.e*t.a+this.f*t.c+t.e,u=this.e*t.b+this.f*t.d+t.f;return new r(n,e,o,i,a,u)},r.prototype.apply=function(t,n){return{x:this.a*t+this.c*n+this.e,y:this.b*t+this.d*n+this.f}},r.prototype.translate=function(t,e){return n(t,e).before(this)},r.prototype.scale=function(t,n){return e(t,n).before(this)},r.prototype.add=function(t){return t.before(this)},r.prototype.inverse=function(){var t=this.a*this.d-this.b*this.c;if(0==t)throw"error calculating inverse: zero determinant";var n=this.d/t,e=-this.b/t,o=-this.c/t,i=this.a/t,a=(this.c*this.f-this.d*this.e)/t,u=(this.b*this.e-this.a*this.f)/t;return new r(n,e,o,i,a,u)},t=function(t){var n=Math.sin(t),e=Math.cos(t);return new r(e,n,-n,e,0,0)},e=function(t,n){return new r(t,0,0,n,0,0)},n=function(t,n){return new r(1,0,0,1,t,n)},r.rotation=t,r.translation=n,r.scale=e,r}(),o=function(t){var n=function(t,n){this.specs=t,this.currentContextTransform=n};return n.prototype.getTransformableContext=function(){var n=this.currentContextTransform;return{transform:function(e,r,o,i,a,u){n.addToCurrentTransform(new t(e,r,o,i,a,u))},rotate:function(e){n.addToCurrentTransform(t.rotation(e))},scale:function(e,r){n.addToCurrentTransform(t.scale(e,r))},translate:function(e,r){n.addToCurrentTransform(t.translation(e,r))}}},n.prototype.makeIterable=function(){if("function"==typeof Symbol){var t=Symbol.iterator,n={},e=this.makeIterator();return n[t]=function(){return e},n}},n.prototype.makeIterator=function(){var t=this.currentContextTransform.getTransformedViewBox(),n=this.specs.initialIndex||0;"function"==typeof n&&(n=n(t));var e=n,r=this.specs.includeIndex||function(){return!1},o=this.specs.transform||function(){},i=!0,a=0,u=!1,s=(this.specs.plusLimitPoint,this.specs.minLimitPoint,!r(1/0,t)),c=!r(-1/0,t),f=this.getTransformableContext(),d=this.currentContextTransform,l=function(){if(a++,r(e,t)&&(a<100||i&&s||!i&&c)){var h={value:e,done:!1};return u&&d.restoreTransform(),d.saveTransform(),o(e,f),u=!0,i?e++:e--,h}return i?(i=!1,e=n-1,a=0,l()):(d.restoreTransform(),{done:!0})};return{next:l}},n.prototype.each=function(t){for(var n=this.currentContextTransform.getTransformedViewBox(),e=this.specs.minIndex(n),r=this.specs.maxIndex(n),o=e;o<=r;o++)this.currentContextTransform.saveTransform(),this.specs.transform(o,this.transformableContext),t(),this.currentContextTransform.restoreTransform()},n}(r),i=function(t,n){return function(e,r){var o=function(t,n,e,o){var i=r.getTransformedViewBox(),a=i.x-i.width,u=i.x+2*i.width,s=i.y-i.height,c=i.y+2*i.height;return t==1/0&&(t=u),t==-1/0&&(t=a),n==1/0&&(t=c),n==-1/0&&(n=s),e===1/0&&(e=u-t),e==-1/0&&(e=a-t),o===1/0&&(o=c-n),o==-1/0&&(o=s-n),{x:t,y:n,width:e,height:o}},i=function(){},a={};for(var u in e)!function(t){"function"!=typeof e[t]?a[t]={get:function(){return e[t]},set:function(n){e[t]=n}}:a[t]={value:function(){return e[t].apply(e,arguments)}}}(u);return a.getRelativeSize={value:function(t){return t/r.getCurrentScale()}},a.save={value:function(){e.save(),r.saveTransform()}},a.restore={value:function(){e.restore(),r.restoreTransform()}},a.setTransform={value:function(n,e,o,i,a,u){r.setCurrentTransform(new t(n,e,o,i,a,u))}},a.rotate={value:function(n){r.addToCurrentTransform(t.rotation(n))}},a.transform={value:function(n,e,o,i,a,u){r.addToCurrentTransform(new t(n,e,o,i,a,u))}},a.transformMultiple={value:function(t){return new n(t,r).makeIterable()}},a.scale={value:function(n,e){r.addToCurrentTransform(t.scale(n,e))}},a.translate={value:function(n,e){r.addToCurrentTransform(t.translation(n,e))}},a.rect={value:function(t,n,r,i){var a=o(t,n,r,i);e.rect(a.x,a.y,a.width,a.height)}},a.fillRect={value:function(t,n,r,i){var a=o(t,n,r,i);e.fillRect(a.x,a.y,a.width,a.height)}},a.strokeRect={value:function(t,n,r,i){var a=o(t,n,r,i);e.strokeRect(a.x,a.y,a.width,a.height)}},i.prototype=Object.create({},a),new i}}(r,o),a=function(){var t=function(t,n,e,r){this.x=t,this.y=n,this.width=e,this.height=r};return t.prototype.expand=function(n){return new t(this.x-n,this.y-n,this.width+2*n,this.height+2*n)},t}(),u=function(t,n){return function(e,r,o){var i,a,u,s,c=new t(1,0,0,1,0,0),f=new t(1,0,0,1,0,0),d=[],l=function(){u=c.inverse(),i=c.add(f),a=i.inverse(),s=b()},h=function(t,n,e){var r=u.apply(n,e);c=c.translate(r.x,r.y).scale(t,t).translate(-r.x,-r.y),l()},v=function(n,e){var r,o,i,a=function(t,a){i=c,r=t,o=a,n=t,e=a};a(n,e);var u,s,f=function(){c=t.translation(r-n,o-e).add(i),l()},d=function(){c=t.translation(r-n,o-e).add(i),l(),h(s/u,r,o)};return{drag:function(t,n){r=t,o=n,void 0==s?f():d()},startZoom:function(t){u=t,s=t},changeZoom:function(t){s=t,d()},endZoom:function(){u=void 0,s=void 0,a(r,o)}}},m=function(t,n){return u.apply(t,n)},p=function(t){return c.apply(t.x,t.y)},y=function(){f=new t(1,0,0,1,0,0),l(),d=[]},x=function(){d.push(f)},T=function(){d.length&&(f=d.pop(),l(),w())},w=function(){var t=i;e.setTransform(t.a,t.b,t.c,t.d,t.e,t.f)},g=function(){var t=f;e.setTransform(t.a,t.b,t.c,t.d,t.e,t.f)},C=function(t){f=t,l(),w()},E=function(t){f=f.add(t),l(),w()},b=function(){var t=a,e=t.apply(0,0),i=t.apply(0,o),u=t.apply(r,o),s=t.apply(r,0),c=Math.min(e.x,i.x,u.x,s.x),f=Math.max(e.x,i.x,u.x,s.x),d=Math.min(e.y,i.y,u.y,s.y),l=Math.max(e.y,i.y,u.y,s.y);return new n(c,d,f-c,l-d)},L=function(){return i.size};return l(),{zoom:h,getCurrentScale:L,makeDrag:v,screenPositionToPoint:m,positionToMousePosition:p,removeTransform:y,saveTransform:x,restoreTransform:T,setTransform:w,resetTransform:g,setCurrentTransform:C,addToCurrentTransform:E,getTransformedViewBox:function(){return s}}}}(r,a),s=function(){return function(t,n,e){var r,o,i,a=!1,u=function(){o=e.apply(null,i),n(o,r)?setTimeout(u,10):a=!1};return function(){i=Array.prototype.slice.apply(arguments),r=t.apply(null,i),a||(a=!0,u())}}}(),c=function(t,n,e,r,o){var i=function(t){var i=t.w,a=t.h,u=t.context,s=r(u,i,a),c=n(),f=n(),d=n(),l=n(function(t,n){return t&&n},!0),h=n(function(t,n){return t&&n},!0),v=null,m=function(t,n){v=s.makeDrag(t,n)},p=function(t,n){v&&v.drag(t,n)},y=function(){v=null},x=function(t){v&&v.startZoom(t)},T=function(t){v&&v.changeZoom(t)},w=function(){v&&v.endZoom()},g=e(u,s);t.onClick(function(t,n,e){var r=s.screenPositionToPoint(t,n);r.shiftKey=e,f(r)}),t.addEventListener("positiondragmove",function(n){p(n.detail.toX,n.detail.toY),t.drawAll()}),t.addEventListener("positiondragend",function(){y(),d(),t.drawAll()}),t.addEventListener("positiondragstart",function(t){var n=s.screenPositionToPoint(t.detail.x,t.detail.y);h(n.x,n.y)&&m(t.detail.x,t.detail.y)}),t.addEventListener("startzoom",function(t){x(t.detail.r)}),t.addEventListener("changezoom",function(n){T(n.detail.r),t.drawAll()}),t.addEventListener("endzoom",function(t){w()}),t.onDraw(function(){s.removeTransform(),s.setTransform(),c(g),s.resetTransform()}),t.onContextMenu(function(t,n,e){var r=s.screenPositionToPoint(t,n);return l(t,n,r.x,r.y,e)}),t.onWheel(o(function(t,n,e){var r=Math.pow(2,-e/100);return s.getCurrentScale()*r},function(t,n){return t<.9*n||t>1.1*n},function(n,e,r){return r>0&&(s.zoom(.9,n,e),t.drawAll()),r<0&&(s.zoom(1.1,n,e),t.drawAll()),s.getCurrentScale()}));var C=function(t,n,e,r){var o=s.positionToMousePosition({x:t,y:n}),i=s.positionToMousePosition({x:e,y:r});return Math.sqrt(Math.pow(o.x-i.x,2)+Math.pow(o.y-i.y,2))<15};return{onDragMove:function(n){t.addEventListener("positiondragmove",function(t){var e=s.screenPositionToPoint(t.detail.toX,t.detail.toY);n(e.x,e.y)})},zoom:s.zoom,drawAll:function(){t.drawAll()},onDraw:function(n){c.add(n),t.drawAll()},onClick:function(t){f.add(t)},onContextMenu:function(t){l.add(t)},onDragStart:function(t){h.add(t)},onDragEnd:function(t){d.add(t)},areClose:C,toDataURL:function(){return t.toDataURL.apply(null,arguments)}}};return function(n){return i(t(n))}}(e,n,i,u,s),function(n){t.infiniteCanvas=n}(c)}(),"function"==typeof define?define("infiniteCanvas",[],function(){return t.infiniteCanvas}):window.infiniteCanvas=t.infiniteCanvas}();