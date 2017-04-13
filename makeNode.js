(function(window,document,eval){
	var maak=function(tagName){
		var node=document.createElement(tagName);
		node.html=function(s){
			node.innerHTML=s;
			return node;
		};
		return node;
	};
	var getBaseNode=(function(){
		if(document.createElement('template').content){
			return function(html){
				return maak('template').html(html).content.childNodes[0];;
			};
		}else{
			return function(html){
				return maak('div').html(html).childNodes[0];
			};
		}
	})();
	var regesc=function(s){return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');};
	var getAllNodes = (function(){
		var createNodeIterator = (function(){
			var nodeIterator = function(node){
				var nextNode;
				var childIndex = -1;
				var currentChildNodeIterator = null;
				var children = node.childNodes;
				var getNextNode = function(){
					if(childIndex < children.length){
						currentChildNodeIterator = currentChildNodeIterator || nodeIterator(children[childIndex]);
						if(nextNode = currentChildNodeIterator.nextNode()){
							return nextNode;
						}else{
							childIndex++;
							currentChildNodeIterator = null;
							return getNextNode();
						}
					}else{
						return null;
					}
				};
				var nextNode = function(){
					if(childIndex == -1){
						childIndex++;
						return node;
					}else{
						return getNextNode();
					}
				};
				return {
					nextNode:nextNode
				};
			};
			return function(node){
				var currentNode;
				var iterator = nodeIterator(node);
				var nextNode = function(){
					while((currentNode = iterator.nextNode()) && currentNode.nodeType != 1){

					}
					return currentNode;
				};
				return {
					nextNode:nextNode
				};
			};
		})();
		return function(node){
			var res0,nodeIterator;
			var r=[];
			if(document.createNodeIterator){
				nodeIterator=document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT, null, false);
			}else{
				nodeIterator=createNodeIterator(node);
			}
			
			while(res0=nodeIterator.nextNode()){
				r.push(res0);
			}
			return r;
		};
	})();
	
	var assemble=function(assemblable, getToReturn){
		var n=assemblable[0];
		var gen=assemblable[1];
		var p;
		var obj={};
		var newOne;
		for(var i=0;i<n;i++){
			newOne=gen.apply(obj, [i, getToReturn]);
			for(p in newOne){
				if(obj.hasOwnProperty(p)){
					obj[p].push(newOne[p]);
				}else{
					obj[p]=[newOne[p]];
				}
			}
		}
		return obj;
	};
	var isAssemblable=function(thing){
		return thing&&thing.length==2&&thing[0]&&!isNaN(thing[0]);
	};
	var makeAppendable=function(thing){
		var type=typeof thing;
		if(type==='string'){
			return document.createTextNode(thing);
		}else if(type==='number'){
			return document.createTextNode(thing.toString());
		}else{
			return thing;
		}
	};
	var groupNodesById=function(arr){
		var group,n,arr2=[];
		var nArr=[];
		for(var i=0;i<arr.length;i++){
			n=arr[i].n;
			if(nArr.indexOf(n)==-1){
				nArr.push(n);
				group=[arr[i]];
				for(var j=0;j<arr.length;j++){
					if(i!=j&&arr[j].n==n){
						group.push(arr[j]);
					}
				}
				if(group.length==1){
					arr2.push(group[0]);
				}else{
					arr2.push({n:group[0].n,node:group.map(function(o){return o.node;})});
				}
			}
		}
		return arr2;
	};

	var getOffspringIdentifiers=function(node){
		var rgx;
		var extract=function(text){
			var match,result=[];
			rgx=new RegExp("\\$\\(([^\\s()\\-.]+)\\)","g");
			while(match=rgx.exec(text)){
				result.push(match[1]);
			}
			if(result.length==0){return null;}
			return result;
		};
		if(node.childNodes.length==1&&node.childNodes[0].nodeName==='#text'&&(result=node.innerText||node.textContent)){
			return extract(result);
		}else if(result=node.getAttribute('offspring')){
			node.removeAttribute('offspring');
			return extract(result);
		}
		return null;
	};

	var expandCssRuleContent=(function(){
		var propertiesToExpand={
			"transform":["-ms-","-webkit-"],
			"transition-property":["-webkit-"],
			"transition-duration":["-webkit-"]
		};
		var valueBeginningsToExpand={
			"linear-gradient":["-webkit-","-o-","-moz-"]
		};
		var expandProperty=function(prop,val,toAdd){
			return toAdd.map(function(a){return [a+prop,val]});
		};
		var expandPropertyValue=function(prop,val,toAdd){
			return toAdd.map(function(a){return [prop,a+val]});
		};
		var mustExpandProperty=function(prop){
			return propertiesToExpand[prop];
		};
		var mustExpandValue=function(val){
			for(b in valueBeginningsToExpand){
				if(valueBeginningsToExpand.hasOwnProperty(b)&&val.match(new RegExp("^"+regesc(b)))){
					return valueBeginningsToExpand[b];
				}
			}
		};
		var parts=function(ruleContent){
			if(!ruleContent.match(/;$/)){ruleContent+=';'}
			var all,prop,val,m,p=[],rgx=/([^;:{]+?):([^;:]+?);/g,
				expandBy,
				addAll=function(things){things.map(function(pair){p.push(pair);});};
			while(m=rgx.exec(ruleContent)){
				prop=m[1].trim();
				val=m[2].trim();
				if(expandBy=mustExpandProperty(prop)){
					addAll(expandProperty(prop,val,expandBy));
				}else if(expandBy=mustExpandValue(val)){
					addAll(expandPropertyValue(prop,val,expandBy));
				}
				p.push([prop,val]);
			}
			return p;
		};
		return function(ruleContent){
			return parts(ruleContent).map(function(p){return p[0]+":"+p[1];}).join(';')+';';
		};
	})();

	var appendFromThingsToNode=function(node, ids, things){
		var toAppend;
		try{
			node.innerText="";
		}catch(e){}
		try{
			node.textContent="";
		}catch(e){}
		ids.map(function(id){
			if(things.hasOwnProperty(id)){
				toAppend=things[id];
				if(!!toAppend.shift){
					for(var j=0;j<toAppend.length;j++){
						node.appendChild(makeAppendable(toAppend[j]));
					}
				}else{
					node.appendChild(makeAppendable(toAppend));
				}
			}
		});
	};

	var makeOneJQueryObjectIfItIsAnArrayOfJQueryObjects = function(node){
		if(!window.jQuery || (!node.length && node.length !== 0)){
			return node;
		}
		for(var i=0;i<node.length;i++){
			if(!(node[i] instanceof window.jQuery)){
				return node;
			}
		}
		var result = window.jQuery();
		for(var i=0;i<node.length;i++){
			result = result.add(node[i]);
		}
		return result;
	};

	var getNumberedNode=function(node){
		var result,idN,idString,match,wrap=false;
		if(match=new RegExp("^(\\d+)\\$?$","g").exec(idString=node.getAttribute('id'))){
			node.removeAttribute('id');
			wrap = idString.indexOf("$")!=-1;
			result = {n:parseInt(match[1]),node:node};
			if(wrap && jQuery){
				result.node = jQuery(result.node);
			}
			return result;
		}else{
			return null;
		}
	};

	var makeNode=function(html){
		var baseNode=getBaseNode(html);
		if(arguments.length>1){
			var f=arguments[1];
			var nodesToPass=[];
			var numberedNode,toAppend,match,id,style,idN,node,allNodes=getAllNodes(baseNode);
			var toReturn;
			var getToReturn=function(){return toReturn;};
			var offspringId,offspringIds;
			var things;
			if(arguments.length>2){
				things=arguments[2];
				if(isAssemblable(things)){
					things=assemble(things, getToReturn);
				}
			}
			for(var i=0;i<allNodes.length;i++){
				node=allNodes[i];
				numberedNode = getNumberedNode(node);
				style=node.getAttribute('style');
				if(style){node.setAttribute('style',expandCssRuleContent(style));}
				if(numberedNode){
					nodesToPass.push(numberedNode);
				}
				if(things&&(offspringIds=getOffspringIdentifiers(node))){
					appendFromThingsToNode(node, offspringIds, things);
				}
			}
			nodesToPass=groupNodesById(nodesToPass).sort(function(a,b){return a.n-b.n;}).map(function(o){return makeOneJQueryObjectIfItIsAnArrayOfJQueryObjects(o.node);});
			if(f&&'function'===typeof f&&(toReturn=f.apply(things?things:null, nodesToPass))){
				return toReturn;
			}else{
				return baseNode;
			}
		}else{
			return baseNode;
		}
	};

	var convertMakeNodeScript=(function(){
		var HtmlOpenOrSingle="\\s*<[^\\s\\/!=>]+[^>]*?>\\s*";
		var HtmlClose="\\s*</[^\\s>]+>\\s*";
		var HtmlComment="\\s*<!--.*?-->\\s*";
		var HtmlBlockRegex="("+HtmlOpenOrSingle+"|"+HtmlClose+"|"+HtmlComment+"){1,}";
		var QuotedRegEx="\"(\\\\\")?([^\"]*\\\\\")*([^\"]*)?\"|'(\\\\')?([^']*\\\\')*([^']*)?'";
		var dOpen=function(htmlBlock){
			var d=0;
			var match,regex=new RegExp(HtmlOpenOrSingle+"|"+HtmlClose,"g");
			while(match=regex.exec(htmlBlock)){
				if(match[0].match(new RegExp(HtmlOpenOrSingle))){
					if(!match[0].match(/\/>$/g)){
						d+=1;
					}
				}else{
					d-=1;
				}
			}
			return d;
		};
		var concatenateBlocksByType=function(blocks, makeNodeBlock){
			var remove=function(b){
				blocks.splice(blocks.indexOf(b),1);
				makeNodeBlock.splice(makeNodeBlock.indexOf(b),1);
			};
			var pair;
			var findBlockWithSimilarSuccessor=function(){
				for(var i=0;i<makeNodeBlock.length-1;i++){
					if(makeNodeBlock[i].type==makeNodeBlock[i+1].type){
						return [makeNodeBlock[i],makeNodeBlock[i+1]];
					}
				}
			};
			while(pair=findBlockWithSimilarSuccessor()){
				pair[0].string+=pair[1].string;
				remove(pair[1]);
			}
		};
		var quoteHtml=function(htmlBlock){
			var quote=function(s){return "\""+s.replace(/"/g,'\\"')+"\"";};
			if(htmlBlock.match(/[\{\}]/g)){
				var indices=[],level=0;
				var match,rgx=new RegExp("[\{\}]","g");
				while(match=rgx.exec(htmlBlock)){
					if(match[0]==='{'){
						if(level===0){indices.push(match.index);}
						level++;
					}else{
						level--;
						if(level===0){indices.push(match.index);}
					}
				}
				var s="",currentIndex=-1;
				indices.map(function(index,i){
					if(i%2===0){
						s+=quote(htmlBlock.substring(currentIndex+1, index));
					}else{
						s+="+("+htmlBlock.substring(currentIndex+1, index)+")+";
					}
					currentIndex=index;
				});
				s+=quote(htmlBlock.substring(indices[indices.length-1]+1,htmlBlock.length));
				return s;
				//return quote(htmlBlock);
			}else{
				return quote(htmlBlock);
			}
			//return quote(htmlBlock);
		};
		var unquote=function(quoted){
			if(quoted.match(/^'.*'$/g)){
				return quoted.substr(1,quoted.length-2).replace(/\\'/,'\'');
			}else{
				return quoted.substr(1,quoted.length-2).replace(/\\"/,'"');
			}
		};
		var divideByBlockBoundary=function(string, blocks, typeBackground){
			var nextIndex,blocks1=[];
			if(blocks.length>0){
				if(blocks[0].index>0){
					blocks1=[{string:string.substr(0,blocks[0].index),type:typeBackground}];
				}
				blocks.map(function(b,i){
					blocks1.push(b);
					nextIndex=(i<blocks.length-1?blocks[i+1].index:string.length);
					if(nextIndex-b.index-b.string.length>0){
						blocks1.push({string:string.substr(b.index+b.string.length,nextIndex-b.index-b.string.length),type:typeBackground});
					}
				});
			}else{
				blocks1=[{string:string,type:typeBackground}];
			}
			return blocks1;
		};
		return function(script, returnIntermediateResult){
			try{ 
				script=script.replace(/[\n\r]+/g,' ');
				var string,type,match,blocks=[];
				var regex=new RegExp(HtmlBlockRegex+"|"+QuotedRegEx,"g");
				while(match=regex.exec(script)){
					string=match[0];
					type=string.match(new RegExp("^"+HtmlBlockRegex+"$","g"))?"html":"quote";
					if(type==='html'){
						blocks.push({string:string,index:match.index,type:type});
					}
				}
				var blocks1=divideByBlockBoundary(script, blocks, 'script');
				var open=0;
				blocks1.map(function(b){
					if(b.type==='html'){
						b.string=b.string.replace(/>\s*/g,'>').replace(/\s*</g,'<').replace(new RegExp(HtmlComment,"g"),'');
						b.dOpen=dOpen(b.string);
						open+=b.dOpen;
						b.open=open;
					}
				});
				if(open!=0){
					throw new TypeError;
				}
				var makeNodeBlocks=[];
				var currentMakeNodeBlock=[];
				open=0;
				var hasBeenOne=false;
				blocks1.map(function(b){
					if(b.type==='html'){
						open=b.open;
						if(currentMakeNodeBlock.length==0){
							if(open!=0){
								currentMakeNodeBlock=[b];
								hasBeenOne=open==1;
							}else{
								makeNodeBlocks.push([b]);
							}
						}else{
							currentMakeNodeBlock.push(b);
							if(open==0){
								makeNodeBlocks.push(currentMakeNodeBlock);
								currentMakeNodeBlock=[];
							}else{
								if(hasBeenOne){b.type='makeNodeScript'}
								if(open==1){hasBeenOne=true;}
								
							}
						}
					}else{
						if(currentMakeNodeBlock.length!=0){
							currentMakeNodeBlock.push(b);
							if(open>1&&!hasBeenOne){
								b.type='html';
							}else{
								if(open==1){
									if(b.string.match(new RegExp("^"+QuotedRegEx+"$","g"))){
										b.type='html';
										b.string=unquote(b.string);
									}else{
										b.type='makeNodeScript';
									}
								}else{
									b.type='makeNodeScript';
								}
								
							}
						}
					}
				});
				if(returnIntermediateResult){returnIntermediateResult(blocks1)}
				makeNodeBlocks.map(function(makeNodeBlock){
					concatenateBlocksByType(blocks1, makeNodeBlock);
				});
				makeNodeBlocks.map(function(makeNodeBlock){
					if(makeNodeBlock.length==3){
						makeNodeBlock[0].string+=makeNodeBlock[2].string;
						makeNodeBlock[2].string="";
						makeNodeBlock[0].string=quoteHtml(makeNodeBlock[0].string);
						makeNodeBlock[0].string=" makeNode("+makeNodeBlock[0].string+","+convertMakeNodeScript(makeNodeBlock[1].string)+")";
						makeNodeBlock[1].string="";
					}else{
						makeNodeBlock[0].string=" makeNode("+quoteHtml(makeNodeBlock[0].string)+")";
					}
				});
				var result='';
				blocks1.map(function(b){result+=b.string;});
				return result;
			}
			catch(e){
				if(console&&console.error){
					console.error("MakeNode script conversion: some html was not closed properly.");
				}
			}
			

		};
	})();
	
	makeNode.css=expandCssRuleContent;
	makeNode.convert=convertMakeNodeScript;
	window.makeNode=makeNode;
	var onLoadListener = function(){
		var makeNodeScripts=(function(list){
			var s=[];
			for(var i=0;i<list.length;i++){
				if(list[i].getAttribute('type')==="makeNode"){
					s.push(list[i].innerHTML||list[i].innerText);
				}
			}
			return s;
		})(document.querySelectorAll('script'));
		makeNodeScripts.map(function(s){
			if(s){
				eval(convertMakeNodeScript(s));
			}
		});
	};
	if(window.addEventListener){
		window.addEventListener('load', onLoadListener);
	}else{
		window.attachEvent('onload', onLoadListener);
	}
})(window,document,window.eval);