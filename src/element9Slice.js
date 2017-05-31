
function Slice9Element(resName){
	
	BaseElement.call(this);


	this.type = "slice9";
	this.instName = this.type;

	if(resName==undefined) {
		this.resName = UIProject.getInstance().defaultResKey;
	}else{
		this.resName = resName;
	}

	this.leftWidth = 10;
	this.topHeight = 10;
	this.rightWidth = 10;
	this.bottomHeight = 10;

	this.percentWidth = 0;
	this.percentHeight = 0;



	var self = this;

	var texture = null;

		if(this.resName!==null) {
			if (UIProject.getInstance().loaderRes) {
				texture = UIProject.getInstance().loaderRes[this.resName].texture;
			} else {
				texture = UIManager.getInstance().loaderRes[this.resName].texture;
			}

			this.content = new PIXI.mesh.NineSlicePlane(texture,this.leftWidth,this.topHeight,this.rightWidth,this.bottomHeight);

			this.width = this.content.width;
			this.height = this.content.height;
		}else{
			alert("请先加载res资源");
			this.errorNo = 1;
			return ;
		}



	this.view.addChild(this.content);

	
	this.getJson = function(){
		var obj = this.getBaseJsonObj();
		obj.resName=this.resName;

		obj.percentWidth = this.percentWidth;
		obj.percentHeight = this.percentHeight;

		obj.leftWidth = this.leftWidth;
		obj.topHeight = this.topHeight;
		obj.rightWidth = this.rightWidth;
		obj.bottomHeight = this.bottomHeight;



		return JSON.stringify(obj);
	};
	this.setJson = function(json){
		this.setBaseJson(json);
		var texture = null;
		this.resName = json.resName;


		this.percentWidth = json.percentWidth;
		this.percentWidth = json.percentWidth;


		this.leftWidth = json.leftWidth;
		this.topHeight = json.topHeight;
		this.rightWidth = json.rightWidth;
		this.bottomHeight = json.bottomHeight;

		this.updateView();
		this.content.pivot=new PIXI.Point(this.anchorX*this.content.width/this.scaleX, this.anchorY*this.content.height/this.scaleY);
	};
	
	this.getPropertiesHtml = function(){
		
		var res=this.getBasePropertiesDiv();

		res+="<table border='1'>";
		res+="<tr><td>图片:</td><td>";

		res+="<select id='resName' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'>";
		for(var key in UIProject.getInstance().resMap){
			if(key == this.resName){
				res+="<option value='"+key+"' selected>"+key+"</option>";
			}else{
				res+="<option value='"+key+"'>"+key+"</option>";
			}
		}
		res+="</select>";
		res+="</td></tr>";
		res+="<tr><td>左:<input type='text' id='leftWidth' value='"+this.leftWidth+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td><td>上:<input type='text' id='topHeight' value='"+this.topHeight+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";

		res+="<tr><td>右:<input type='text' id='rightWidth' value='"+this.rightWidth+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td><td>下:<input type='text' id='bottomHeight' value='"+this.bottomHeight+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";

		res+="<tr><td>百分比宽:</td><td><input type='text' id='percentWidth' value='"+this.percentWidth+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";
		res+="<tr><td>百分比高:</td><td><input type='text' id='percentHeight' value='"+this.percentHeight+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";



		res+="</table>";

		document.getElementById("elmProperty").innerHTML = res;

	};
	this.changeElm = function(obj){



		this.baseChangeElm(obj);


		if(obj.id == "percentWidth"){
			this[obj.id] = parseInt(obj.value);
			if(this[obj.id]>100){
				this[obj.id] = 100;
			}
			if(this[obj.id]<0){
				this[obj.id] = 0;
			}
			this.scaleX = 1;
			/*
			if(UIProject.getInstance().currentUI){
				this.content.width = UIProject.getInstance().currentUI.width*this[obj.id]/100;
			}else{
				this.content.width = UIManager.getInstance().currentFile.width*this[obj.id]/100;
			}
			*/
		}

		if(obj.id == "percentHeight"){
			this.scaleY = 1;
			this[obj.id] = parseInt(obj.value);
			if(this[obj.id]>100){
				this[obj.id] = 100;
			}
			if(this[obj.id]<0){
				this[obj.id] = 0;
			}
			/*
			if(UIProject.getInstance().currentUI){
				this.content.height = UIProject.getInstance().currentUI.height*this[obj.id]/100;
			}else{
				this.content.height = UIManager.getInstance().currentFile.height*this[obj.id]/100;
			}
			*/
		}



		if (obj.id === "leftWidth" || obj.id === "topHeight" || obj.id === "rightWidth" || obj.id === "bottomWidth") {

			this[obj.id] = parseInt(obj.value);

			this.content.parent.removeChild(this.content);

			this.content = new PIXI.mesh.NineSlicePlane(UIProject.getInstance().loaderRes[this.resName].texture,this.leftWidth,this.topHeight,this.rightWidth,this.bottomHeight);

			this.view.addChild(this.content);

			this.content.scale.x=this.scaleX;
			this.content.scale.y=this.scaleY;
			this.width = this.content.width;
			this.height = this.content.height;

		}

		if(obj.id == "resName"){

			this.resName = obj.value;


			this.content.parent.removeChild(this.content);

			this.content = new PIXI.mesh.NineSlicePlane(UIProject.getInstance().loaderRes[this.resName].texture,this.leftWidth,this.topHeight,this.rightWidth,this.bottomHeight);

			this.view.addChild(this.content);

			this.content.scale.x=this.scaleX;
			this.content.scale.y=this.scaleY;
			this.width = this.content.width;
			this.height = this.content.height;

		}

		Director.getInstance().postMsg("elementUpdate",this);
	};
	this.updateView = function(obj){

		var texture = null;

			if (UIProject.getInstance().loaderRes) {
				texture = UIProject.getInstance().loaderRes[this.resName].texture;
			} else {
				texture = UIManager.getInstance().loaderRes[this.resName].texture;
			}

		if(this.content.parent) {
			this.content.parent.removeChild(this.content);
		}

		this.content = new PIXI.mesh.NineSlicePlane(texture,this.leftWidth,this.topHeight,this.rightWidth,this.bottomHeight);

		this.view.addChild(this.content);

		this.content.scale.x = this.scaleX;
		this.content.scale.y = this.scaleY;

		this.content.width = this.width;
		this.content.height = this.height;




		if(UIProject.getInstance().currentUI){
			if(this.percentWidth>0) {
				this.content.width = UIProject.getInstance().currentUI.width * this.percentWidth / 100;
			}
			if(this.percentHeight>0){
				this.content.height = UIProject.getInstance().currentUI.height*this.percentHeight/100;
			}

		}else{
			if(this.percentWidth>0) {
				this.content.width = UIManager.getInstance().currentFile.width * this.percentWidth / 100;
			}
			if(this.percentHeight>0) {
				this.content.height = UIManager.getInstance().currentFile.height * this.percentHeight / 100;
			}
		}
		this.baseUpdateView(obj);
	};
}