



function Director(){
	var observerPool = {};


	this.addObserver = function(target,msgName,func){
		var obj = {};
		obj.target = target;
		obj.func = func;
		var arr=[];
		if(observerPool.hasOwnProperty(msgName)){
			arr = observerPool[msgName];
		}else{
			observerPool[msgName]=arr;
		}
		for(var key in arr){
			if (arr[key].target==target && arr[key].func==func){
				return;
			}
		}
		arr.push(obj);
	};
	this.postMsg = function(msgName){
		
		if(observerPool.hasOwnProperty(msgName)){
			var arr = observerPool[msgName];
			var len = arr.length;
			var obj=null;
			var i;
			var len1 = arguments.length;
			var param = [];
			for(i=1;i<len1;i++){
				param.push(arguments[i]);
			}
			for(i = len-1;i>=0;i--){
				obj = arr[i];
				var func = obj.func;
				if(param.length>0){
					
					func.apply(obj.target,param);
				}else{
					func.apply(obj.target);
				}
			}
		}
	};

	this.removeObserver = function(msgName){
		if(observerPool.hasOwnProperty(msgName)){
			var arr = observerPool[msgName];
			var len = arr.length;
			var obj=null;
			for(var i = len-1;i>=0;i--){
				obj = arr[i];
				if(obj.target == target){
					arr.splice(i,1);
					obj.taret=null;
					obj.fun=null;
					obj=null;
				}
			}
		}
	};

	this.changeScene = function(app,targetName){
		var frame = 0;
		var fade = false;
		var target = UIManager.getInstance().uiPool[targetName];
		target.content.alpha = 0;
		UIManager.getInstance().currentFile = UIManager.getInstance().filePool[targetName];
		doRun();
		function doRun(){
			if(frame==20){
				return ;
			}
			if(frame<20){
				frame++;
				if(frame==10){
					app.stage.alpha=1;
					app.stage = target.content;
					fade = true;
				}
				requestAnimationFrame(doRun);
			}

			if(fade===false){
				app.stage.alpha-=0.1;
			}else{
				target.content.alpha+=0.1;
				if(frame==20){
					target.content.alpha = 1;

					target.onEnter();
				}
			}

		}
	};
}

Director.instance = null;

Director.getInstance = function(){
	if(Director.instance===null){
		Director.instance = new Director();
	}
	return Director.instance;
}