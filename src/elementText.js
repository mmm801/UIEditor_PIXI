/////////////////////////////////
function TextElement(){
	
	BaseElement.call(this);
	this.text = "新文本";
	this.type = "text";
	this.size = 24;
	this.color = "ff0000";
	this.instName = this.type;
	/*
	var style = {
    	font : 'bold italic '+this.size+'px Arial',
	    fill : '#F7EDCA',
	    stroke : '#4a1850',
	    strokeThickness : 5,
	    dropShadow : true,
	    dropShadowColor : '#000000',
	    dropShadowAngle : Math.PI / 6,
	    dropShadowDistance : 6,
	    wordWrap : true,
	    wordWrapWidth : 440
	};
	*/
	var self = this;
	var style = {
		fontSize:self.size,
		fill:"#"+self.color
	};
	this.content = new PIXI.Text((this.text+""),style);
	this.width = this.content.width;
	this.height = this.content.height;


	this.updateView = function(obj){


		this.content.text = this.text;
		var style = this.content.style;

		style.fontSize = this.size;
		style.fill="#"+this.color;
		this.content.style=style;

		this.baseUpdateView(obj);
	};
	this.updateView();
	this.view.addChild(this.content);
	
	this.getJson = function(){
		var obj = this.getBaseJsonObj();
		obj.text=this.text;
		obj.size = this.size;
		obj.color = this.color;
		return JSON.stringify(obj);
	};
	this.setJson = function(json){
		this.setBaseJson(json);
		
		this.text = json.text;
		if(json.color) {
			this.color = json.color;
		}
		if(json.size){
			this.size = json.size;
		}
		this.updateView();
		this.content.pivot=new PIXI.Point(this.anchorX*this.content.width/this.scaleX, this.anchorY*this.content.height/this.scaleY);

	};
	
	this.getPropertiesHtml = function(){
		
		var res=this.getBasePropertiesDiv();
		res+="<table border='1'>";
		res+="<tr><td colspan='2'>文字:<input id='text' type='text' value='"+this.text+"' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";
		res+="<tr><td colspan='2'>大小:<input id='size' type='text' value='"+this.size+"' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";
		res+="<tr><td colspan='2'>颜色:<input id='color' type='text' value='"+this.color+"' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";
		res+="</table>";

		//
		document.getElementById("elmProperty").innerHTML = res;
		var picker = new jscolor(document.getElementById("color"),{onFineChange:'UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'})
	};
	this.changeElm = function(obj){
		this.baseChangeElm(obj);

		switch(obj.id){
			case "size":
				this.size = parseInt(obj.value);
				var style = this.content.style;
				style.fontSize = this.size;
				this.content.style=style;

				this.content.scale.x=this.scaleX;
				this.content.scale.y=this.scaleY;
				this.width = this.content.width;
				this.height = this.content.height;
				break;
			case "color":
				this.color = obj.value
				break;
			case "text":
				this.text = obj.value;
				this.content.text = this.text;
				this.content.scale.x=this.scaleX;
				this.content.scale.y=this.scaleY;
				this.width = this.content.width;
				this.height = this.content.height;
				break;
		}

		this.updateView();
		Director.getInstance().postMsg("elementUpdate",this);
	}
}
/////////