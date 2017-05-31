PIXI.settings.RENDER_OPTIONS.resolution = window.devicePixelRatio;
PIXI.settings.RENDER_OPTIONS.autoResize = true;


function UIManager(){


	this.uiPool = {};
	this.uiKeyPool = {};
	this.loaderRes = null;


	this.currentFile = null;
	this.filePool = {};

	var self = this;

	this.loadURL = function(url,func,app){



		ajax({
			type:"GET",
			url:url,
			dataType:"json",
			data:{},
			beforeSend:function(){
				//some js code
			},
			success:function(msg){
				getData(msg);
			},
			error:function(){
				console.log("error")
			}
		});




		function getData(obj){

			var loader = new PIXI.loaders.Loader();

			var options = {
				crossOrigin: true
			};

			for(var key in obj.resMap){

				loader.add(key, obj.resMap[key],options);
			}
			function onAssetsLoaded(loader,res){
				self.loaderRes = res;
				var key ;
				for(key in obj.fileMap){
					self.uiKeyPool[obj.fileMap[key].id] = obj.fileMap[key];
					self.uiKeyPool[obj.fileMap[key].fileName] = obj.fileMap[key];
				}
				for(key in obj.fileMap){
					var ui = new UILoader();
					UIManager.getInstance().currentFile = new UIData();
					UIManager.getInstance().currentFile.loadJson(obj.fileMap[key]);

					UIManager.getInstance().filePool[UIManager.getInstance().currentFile.fileName] = UIManager.getInstance().currentFile;

					if(app!==null && UIManager.getInstance().currentFile.autoResize){
						UIManager.getInstance().currentFile.width = app.renderer.width/PIXI.settings.RENDER_OPTIONS.resolution;
						UIManager.getInstance().currentFile.height = app.renderer.height/PIXI.settings.RENDER_OPTIONS.resolution;
					}

					ui.loadJson(obj.fileMap[key]);

					var uiAnimate = ui.getAnimate("default");
					if(uiAnimate!==null){
						uiAnimate.play(-1);
					}
					uiAnimate = ui.getAnimate("default_once");
					if(uiAnimate!==null){
						uiAnimate.play(1);
					}

					if(obj.fileMap[key].bindClassName!=="") {
						self.uiPool[obj.fileMap[key].fileName] = eval("new " + obj.fileMap[key].bindClassName + "(ui)");
					}else{
						self.uiPool[obj.fileMap[key].fileName] = ui;
					}

				}
				func(self.uiPool);
			}

			loader.load(onAssetsLoaded);



		}
	};
	this.createUIByName = function(name){
		var ui = new UILoader();
		ui.loadJson(self.uiKeyPool[name]);

		var uiAnimate = ui.getAnimate("default");
		if(uiAnimate!==null){
			uiAnimate.play(-1);
		}
		uiAnimate = ui.getAnimate("default_once");
		if(uiAnimate!==null){
			uiAnimate.play(1);
		}

		var res = null;
		if(self.uiKeyPool[name].bindClassName!=="") {
			res = eval("new " + self.uiKeyPool[name].bindClassName + "(ui);");
		}else{
			res = ui;
		}
		return res;
	};
}

UIManager.instance = null;

UIManager.getInstance = function(){
	if(UIManager.instance===null){
		UIManager.instance = new UIManager();
	}
	return UIManager.instance;
};

function UIBase(uiFile){
	this.content = uiFile.content;
	this.uiFile = uiFile;
	this.onEnter = function(){


	};
}
