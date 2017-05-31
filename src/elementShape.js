/////////////////////////////////
function ShapeElement(){
	
	BaseElement.call(this);
	this.color = "FF3300";
	this.type="shape";
	this.width=60;
	this.height=30;
	this.instName = this.type;
	
	this.content = new PIXI.Graphics();
	this.view.addChild(this.content);

	this.updateView = function(obj){
		this.content.clear();
		this.content.beginFill(parseInt("0x"+this.color));
		this.content.drawRect(0, 0, 60,30);

		this.content.endFill();

		this.baseUpdateView(obj);
		
	};
	this.updateView();

	this.getPropertiesHtml = function(){
		
		var res=this.getBasePropertiesDiv();
		res+="<table border='1'>";
		
		res+="<tr><td>颜色:</td><td><input id='color' type='text' value='"+this.color+"' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";

		res+="</table>";


		document.getElementById("elmProperty").innerHTML = res;
		var picker = new jscolor(document.getElementById("color"),{onFineChange:'UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'})
	};
	this.changeElm = function(obj){
		switch (obj.id){
			case "color":

				this.color = obj.value;
				break;
		}
		this.baseChangeElm(obj);
		this.updateView();
		Director.getInstance().postMsg("elementUpdate",this);
	};
	this.getJson = function(){
		var obj = this.getBaseJsonObj();

		obj.color=this.color;
		
		return JSON.stringify(obj);
	};
	this.setJson = function(json){
		this.setBaseJson(json);
		this.color = json.color;
		this.updateView();
		this.content.pivot=new PIXI.Point(this.anchorX*this.content.width/this.scaleX, this.anchorY*this.content.height/this.scaleY);

	}
}