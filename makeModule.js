;(function(){
 window.makeModule=(function(){
            'use strict';
            var addTo=function(obj1,obj2){
                for(var p in obj2){
                    if(obj2.hasOwnProperty(p)){
                        obj1[p]=obj2[p];
                    }
                }
                return obj1;
            };
            var toArray=function(args){
                if(args){
                    return Array.prototype.slice.apply(args);
                }else{
                    return [];
                }
                
            };
            var aliasFunction = function(getFunction){
                return function(){
                    return getFunction().apply(null,arguments);
                };
            };
            var nothingBeforeExtend=(function(){
                var functionBody=function(f){
                    return new RegExp("^function\\s*?\\([^)]*?\\)\\s*?{([\\w\\W]*)}$","g").exec(f.toString())[1];
                };
                var addBlockToBody=function(body){
                    var where=body.indexOf("this.extend");
                    if(where>-1){
                        return "if(false){"+body.substring(0,where)+"}"+body.substr(where);
                    }else{
                        return "";
                    }
                    
                };
                return function(f){
                    var body=functionBody(f);
                    
                        return new Function("",addBlockToBody(functionBody(f)));
                    
                };
            })();
            var makeRealConstructorOf=function(c){
                var g=function(){
                    var obj=c.apply(null,arguments);
                    for(var p in obj){
                        if(obj.hasOwnProperty(p)){
                            this[p]=obj[p];
                        }
                    }
                };
                var f=function(){
                    if(!(this instanceof f)){
                        return new f(arguments);
                    }
                    g.apply(this,arguments[0]);
                };
                return f;
            };
            var prependArguments=function(args, f){
                return function(){
                    return f.apply(null, args.concat(toArray(arguments)));
                };
            };
            var wrap=function(constructor){
            
                var followConstructorByPath=function(cons,args){
                    var base, extension;
                    var self=this;
                    var extensionName = this.path.length?this.path[0]:null;
                    cons.apply({
                        override:function(baseF, newF){
                            return function(){
                                return newF.apply(baseF, arguments);
                            };
                        },
                        expose:function(b){base=b;},
                        extend:function(name,e){
                            if(name===extensionName){
                                extension = followConstructorByPath.apply({path:self.path.slice(1,self.path.length)},[e,toArray(args).slice(cons.length)]);
                            }
                        }
                    },toArray(args).slice(0,cons.length));
                    return addTo(base,extension);
                };
                var pathFollower=function(path){
                    return function(){
                        return followConstructorByPath.apply({path:path||[]},[constructor,arguments]);
                    };
                };
                var addPathFollowers=function(baseFunction, currentPath, fromConstructor, argumentList){
                    baseFunction = makeRealConstructorOf(baseFunction);
                    nothingBeforeExtend(fromConstructor).apply({
                        expose:function(){},
                        extend:function(name, e, previousArgs){
                            var newPath=currentPath.concat([name]);
                            var newArgumentList=(argumentList||[]).concat(previousArgs||[]);
                            baseFunction[name] = addPathFollowers(
                                prependArguments(newArgumentList, pathFollower(newPath)),
                                newPath,
                                e,
                                newArgumentList
                                );
                        }
                    });
                    return baseFunction;
                };
            
                return addPathFollowers(pathFollower([]), [], constructor);
            

            };
            return function(constructor){
                var currentWrap;
                var f = makeRealConstructorOf(aliasFunction(function(){return currentWrap;}));
                var useConstructor = function(c){
                    currentWrap = wrap(c);
                    for(var e in currentWrap){
                        if(currentWrap.hasOwnProperty(e)){
                            f[e] = currentWrap[e];
                        }
                    }
                };
                useConstructor(constructor);
                f.extend = function(name, newConstructor){

                };
                return f;
            };
        })();
})();
