function UILoader(){

	this.elmObj = {};
	this.elmPool = {};

	this.clsPool = {};

	this.content = new PIXI.Container();

	this.animate = {};
	this.uiFile = null;

	var self = this;


	this.loadJson = function(uiFile){
		
		while(self.content.children.length>0){
			self.content.removeChildAt(0);
		}

		this.uiFile = uiFile;

		var jsonObj = uiFile.elmJsonMap;
		var waitPool = {};

		var arr = [];
		var key ;
		for(key in jsonObj){
			arr.push(JSON.parse(jsonObj[key]));
		}
		arr.sort(function (a, b) {
			return a.order- b.order;
		});

		var len = arr.length;
		var hasAnimateObject = {};
		
		for(key in uiFile.actionList){
			hasAnimateObject[key]=false;
		}
		for(var i=0;i<len;i++){
			var elm = elmFactory(arr[i]);
			self.elmObj[elm.instName]= elm;
			self.elmPool[elm.id] = elm;



			if(elm.type=="ui"){
				if(UIManager.getInstance().uiKeyPool[elm.uiId].bindClassName!=="") {
					self.clsPool[elm.instName] = eval("new " + UIManager.getInstance().uiKeyPool[elm.uiId].bindClassName + "(elm.loader)");
				}
				var uiAnimate = elm.loader.getAnimate("default");
				if(uiAnimate!==null){
					uiAnimate.play(-1);
				}
				uiAnimate = elm.loader.getAnimate("default_once");
				if(uiAnimate!==null){
					uiAnimate.play(1);
				}
			}

			elm.content.x  = elm.view.x;
			elm.content.y = elm.view.y;


			for(key in uiFile.actionList){

				if(elm.frameSetList.hasOwnProperty(key) && elm.frameSetList[key].length>0 && hasAnimateObject[key]===false){
					hasAnimateObject[key] = true;
				}
			}
			if(elm.rootId===0){
				self.content.addChild(elm.content);
			}else{
				if(self.elmPool[elm.rootId]==null){
					if(waitPool[elm.rootId]==null){
						waitPool[elm.rootId] = [];
					}
					waitPool[elm.rootId] .push(elm);

				}else{
					
					self.elmPool[elm.rootId].content.addChild(elm.content);
				}
			}

			if(waitPool[elm.id]){
				var len1 = waitPool[elm.id].length;
				for(var j=0;j<len1;j++){
					
					self.elmPool[elm.id].content.addChild(waitPool[elm.id][j].content);
				}
			}
		}
		for(key in hasAnimateObject){
			if(hasAnimateObject[key]===true) {
				var uiAnimate1 = new UIAnimate(uiFile,key,self.content);
				this.animate[uiFile.actionList[key].actionName] = uiAnimate1;
				for(var key1 in self.elmObj){
					var obj = uiAnimate1.addElmObj(self.elmObj[key1]);
					for(var ii=0;ii<uiAnimate1.maxFrame;ii++){
						var animateObj = self.elmObj[key1].getCheckFrameObj(ii,key);

						obj.frameList.push(animateObj);

					}
				}
			}
		}

		return self.content;
	};
	this.getAnimate = function(name){
		if(this.animate.hasOwnProperty(name)){
			return this.animate[name];
		}
		return null;
	};
	this.getElmByName = function (elmName){
		
		

		var obj = null;
		if(this.elmObj[elmName].type == "ui"){
			if(this.clsPool.hasOwnProperty(elmName)){
				return this.clsPool[elmName];
			}else{
				obj = this.elmObj[elmName].content;
			}
		}else{
			obj = this.elmObj[elmName].content;
		}
		return obj;
	};
	this.getBtnByName = function (elmName){
		
		var obj = this.elmObj[elmName].content;
		obj.interactive=true;
		obj.buttonMode=true;
		return obj;
	};
}



var UIAnimate_State_Stop = 0;
var UIAnimate_State_Runing = 1;

function UIAnimate(ui,key,view){
	this.state = UIAnimate_State_Stop;
	var self = this;
	var frame = 0;
	this.intervalFrame = 0;
	this.maxFrame = ui.actionList[key].actionTime;

	this.completeFun = null;
	this.userData = null;

	this.autoRemove = false;
	this.elmList = [];

	this.defaultInterval = parseInt(ui.actionList[key].interval);
	this.interval = 0;
	this.loopNum = 0;
	this.maxLoopNum = 0;

	this.addElmObj = function(elm){
		var obj = {};
		obj.elm = elm;
		obj.frameList = [];
		this.elmList.push(obj);
		return obj;
	};
	this.setFrameSet = function(frame){
		this.state = UIAnimate_State_Stop;
		for(var key in self.elmList){
			var frameSet = self.elmList[key].frameList[frame];
			if(frameSet===null){
				continue;
			}
			self.elmList[key].elm.updateView(frameSet);
			self.elmList[key].elm.content.x = self.elmList[key].elm.view.x;
			self.elmList[key].elm.content.y = self.elmList[key].elm.view.y;
		}
	};
	this.stop = function(){

		this.setFrameSet(0);
	};
	this.play = function(loop,interval){
		if(this.state == UIAnimate_State_Runing){
			return ;
		}
		this.state = UIAnimate_State_Runing;
		this.maxLoopNum = loop;
		this.loopNum=1;
		frame = 0;
		if(interval===undefined || interval===0){
			this.interval = this.defaultInterval;
		}else{
			this.interval = interval;
		}
		self.intervalFrame=0;
		self.doRun();
		this.run();
	};
	this.doRun = function(){
		if(self.state == UIAnimate_State_Stop){
			return ;
		}
		if(frame<self.maxFrame) {
			requestAnimationFrame(self.run);

			for(var key in self.elmList){
				var frameSet = self.elmList[key].frameList[frame];

				if(frameSet===null){
					continue;
				}

				self.elmList[key].elm.updateView(frameSet);

				self.elmList[key].elm.content.x = self.elmList[key].elm.view.x;
				self.elmList[key].elm.content.y = self.elmList[key].elm.view.y;
			}
			frame++;
			if(frame == self.maxFrame) {
				if (self.maxLoopNum == -1) {
					frame = 0;
				} else {
					if (self.loopNum < self.maxLoopNum) {
						frame = 0;
						self.loopNum++;
					}
				}
			}
		}else{
			self.state = UIAnimate_State_Stop;

			if(self.completeFun!==null){
				self.completeFun(self.userData);
			}
			if(self.autoRemove===true){
				if(view.parent) {
					view.parent.removeChild(view);
				}
			}
		}
	};
	this.run = function(){

		if(self.intervalFrame<self.interval){
			self.intervalFrame++;

			requestAnimationFrame(self.run);
			return ;
		}

		self.intervalFrame = 0;
		self.doRun();

	};

}