
function PicElement(resName){
	
	BaseElement.call(this);


	this.type = "pic";
	this.instName = this.type;
	this.content = new PIXI.Sprite();

	if(resName==undefined) {
		this.resName = UIProject.getInstance().defaultResKey;
	}else{
		this.resName = resName;
	}


	var self = this;

	if(this.resName!==null) {
		if (UIProject.getInstance().loaderRes) {
			this.content.texture = UIProject.getInstance().loaderRes[this.resName].texture;
		} else {
			this.content.texture = UIManager.getInstance().loaderRes[this.resName].texture;
		}
		this.width = this.content.width;
		this.height = this.content.height;
	}else{
		alert("请先加载res资源");
		this.errorNo = 1;
		return ;
	}

	this.updateView = function(obj){

		if(obj==null) {

			if (UIProject.getInstance().loaderRes) {
				this.content.texture = UIProject.getInstance().loaderRes[this.resName].texture;
			} else {
				this.content.texture = UIManager.getInstance().loaderRes[this.resName].texture;
			}
		}else{

			if(obj.hasOwnProperty("resName") && obj["resName"]!==null){
				if (UIProject.getInstance().loaderRes) {
					this.content.texture = UIProject.getInstance().loaderRes[obj.resName].texture;
				} else {
					this.content.texture = UIManager.getInstance().loaderRes[obj.resName].texture;
				}
			}else{
				if (UIProject.getInstance().loaderRes) {
					this.content.texture = UIProject.getInstance().loaderRes[this.resName].texture;
				} else {
					this.content.texture = UIManager.getInstance().loaderRes[this.resName].texture;
				}
			}
		}
		this.baseUpdateView(obj);
	};

	this.view.addChild(this.content);
	
	this.getJson = function(){
		var obj = this.getBaseJsonObj();
		obj.resName=this.resName;
		
		return JSON.stringify(obj);
	};
	this.setJson = function(json){
		this.setBaseJson(json);
		
		this.resName = json.resName;

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
		res+="</table>";

		document.getElementById("elmProperty").innerHTML = res;

	};
	this.changeElm = function(obj){

		this.baseChangeElm(obj);
		if(obj.id == "resName"){
			this.resName = obj.value
			this.content.texture = UIProject.getInstance().loaderRes[this.resName].texture;
			this.content.scale.x=this.scaleX;
			this.content.scale.y=this.scaleY;
			this.width = this.content.width;
			this.height = this.content.height;
		}

		Director.getInstance().postMsg("elementUpdate",this);
	}
}