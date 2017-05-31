function UIElement(){
	BaseElement.call(this);

	if(UIProject.getInstance().fileMap!==null) {
		for (var key in UIProject.getInstance().fileMap) {
			if (UIProject.getInstance().fileMap[key] == UIProject.getInstance().currentUI) {
				continue;
			}
			this.uiId = key;
			break;
		}
	}
	this.type = "ui";
	this.instName = this.type;
	this.loader = new UILoader();


	this.updateUI = function(){


		if(UIProject.getInstance().fileMap!==null) {
			this.loader.loadJson(UIProject.getInstance().fileMap[this.uiId]);
		}else{
			this.loader.loadJson(UIManager.getInstance().uiKeyPool[this.uiId]);
		}

		if(this.content && this.content.parent){
			this.content.parent.removeChild(this.content);
		}

		this.content = this.loader.content;
		this.content.scale.x = this.scaleX;
		this.content.scale.y = this.scaleY;
		this.width = this.content.width;
		this.height = this.content.height;

		this.view.addChild(this.content);

	}

	this.updateView = function(obj){

		this.updateUI();
		//this.loader.updateView();
		this.baseUpdateView(obj);
	};



	this.getPropertiesHtml = function(){

		var res=this.getBasePropertiesDiv();
		res+="<table border='1'>";
		
		res+="<tr><td colspan='2'>uiId:<select id='uiId'  onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/>";
		for(var key in UIProject.getInstance().fileMap){
			if (UIProject.getInstance().fileMap[key] == UIProject.getInstance().currentUI) {
				continue;
			}
			if(key == this.uiId){
				res+="<option value='"+key+"' selected>"+UIProject.getInstance().fileMap[key].fileName+"</option>";
			}else{
				res+="<option value='"+key+"'>"+UIProject.getInstance().fileMap[key].fileName+"</option>";
			}

		}
		res+="</td></tr>";
		res+="</table>";
		document.getElementById("elmProperty").innerHTML = res;
	};
	this.getJson = function(){
		var obj = this.getBaseJsonObj();
		obj.uiId=this.uiId;
		return JSON.stringify(obj);
	};
	this.setJson = function(json){
		this.setBaseJson(json);
		this.uiId = json.uiId;
		this.updateView();
		this.content.pivot=new PIXI.Point(this.anchorX*this.content.width/this.scaleX, this.anchorY*this.content.height/this.scaleY);
	};

	this.changeElm = function(obj) {
		this.baseChangeElm(obj);


		if(obj.id == "uiId"){
			this.uiId = obj.value;
			this.updateUI();
		}
		Director.getInstance().postMsg("elementUpdate",this);
	}

}