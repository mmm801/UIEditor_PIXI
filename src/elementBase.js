
function elmCreate(obj){
	var res = null;
	switch(obj.type){
		case "shape":
			res = new ShapeElement();
			res.setJson(obj);

			break;
		case "ui":
			res = new UIElement();
			res.setJson(obj);


			break;
		case "pic":
			res = new PicElement(obj.resName);
			res.setJson(obj);

			break;
		case "text":
			res = new TextElement();
			res.setJson(obj);
			break;
		case "slice9":

			res = new Slice9Element(obj.resName);
			res.setJson(obj);

			break;
	}

	return res;
}

function elmFactory(obj) {

	var res = elmCreate(obj);
	res.id = obj.id;
	return res;
}

var PosTypeX_Left = 0;
var PosTypeX_Right = 1;

var PosTypeY_Up = 0;
var PosTypeY_Bottom = 1;

var PosType_Percentage = 2;



var PosTypeXList = ["左","右","百分比"];
var PosTypeYList = ["上","下","百分比"];

function BaseElement(){
	this.view = new PIXI.Container();



	this.content = null;

	this.errorNo = 0;
	this.rootId=0;
	this.childrenNum=0;

	UIProject.getInstance().maxElmNum++;
	this.id=UIProject.getInstance().maxElmNum;

	this.width=0;
	this.height=0;


	this.posX = 0;
	this.posY = 0;

	this.PosTypeX = 0;
	this.PosTypeY = 0;

	this.scaleX = 1;
	this.scaleY = 1;
	this.instName="instName";
	this.rotation = 0;
	this.anchorX = 0;
	this.anchorY = 0;
	this.order=0;
	this.alpha = 1;
	this.visible = 1;

	this.frameSetList = {};


	/////




	var self = this;

	this.deleteFrameSet = function(frame,actionIndex){
		for(var key in this.frameSetList[actionIndex]){
			if(this.frameSetList[actionIndex][key].frame == frame){
				this.frameSetList[actionIndex].splice(key,1);
				break;
			}
		}
		this.frameSetList[actionIndex].sort(function(a,b){
			if(b.frame>a.frame){
				return -1;
			}
			return 1;
		});
	};
	this.removeAction = function(actionIndex){
		this.frameSetList[actionIndex] = null;
		delete this.frameSetList[actionIndex];
	}
	this.addFrameSet = function(frameSet,actionIndex){
		if(this.frameSetList.hasOwnProperty(actionIndex)==false){
			this.frameSetList[actionIndex]=[];
		}
		this.frameSetList[actionIndex].push(frameSet);
		this.frameSetList[actionIndex].sort(function(a,b){
			if(b.frame>a.frame){
				return -1;
			}
			return 1;
		});

	}
	this.getFrameSet = function(frame,actionIndex) {
		if(this.frameSetList.hasOwnProperty(actionIndex)==false){
			return null;
		}

		var list = this.frameSetList[actionIndex];
		for(var key in list){
			if(list[key].frame == frame){
				return list[key];
			}
		}
		return null;
	}
	this.getPrevKeyFrame = function(frame,actionIndex){

		if(this.frameSetList.hasOwnProperty(actionIndex)==false){
			return null;
		}

		var frameSet = null;
		var list = this.frameSetList[actionIndex];

		for(var key in list){
			frameSet = list[key];
			if(frameSet.frame >= frame ){
				if(key>0) {
					return list[key - 1];
				}else{
					return null;
				}
			}
		}
		return frameSet;
	};

	this.getNextKeyFrame = function(frame,actionIndex){
		if(this.frameSetList.hasOwnProperty(actionIndex)==false){
			return null;
		}
		var list = this.frameSetList[actionIndex];
		for(var key in list){
			if(list[key].frame >= frame){
				return list[key];
			}
		}
		return null;
	};

	this.layerClick = function(){
		Director.getInstance().postMsg("layerClick",self);
	}

	this.layer = new Layer(self);

	this.updateLayer = function(){
		this.layer.updateView(this);
		if(this.view.visible==false){
			this.layer.hiddenButton.setTitle("显示");
		}else{
			this.layer.hiddenButton.setTitle("隐藏");
		}
		if(this.view.interactive==false){
			this.layer.lockButton.setTitle("解锁");
		}else{
			this.layer.lockButton.setTitle("上锁");
		}
	};

	this.getCheckFrameObj = function(frame,actionIndex){
		if(frame==0){
			return null;
		}

		var currentFrame = this.getFrameSet(frame,actionIndex);
		if(currentFrame!==null){

			return currentFrame.getObject(this);
		}

		var obj = {};

		var nextFrame = this.getNextKeyFrame(frame,actionIndex);
		var prevFrame = this.getPrevKeyFrame(frame,actionIndex);
		if(nextFrame==null || nextFrame.b_continue==0){
			if(prevFrame==null){
				return null;
			}else{
				return prevFrame.getObject(this);
			}
		}else{
			var obj2 = nextFrame.getObject(this);
			var obj1 = null
			if(prevFrame == null){
				obj1 = {};
				obj1.height = this.height;
				obj1.width = this.width;
				obj1.scaleX = this.scaleX;
				obj1.scaleY = this.scaleY;
				obj1.rotation = this.rotation;
				obj1.b_continue = this.b_continue;


				if(UIProject.getInstance().currentUI){
					var posX = UIProject.getInstance().currentUI.getViewXValue(this.posX,this.PosTypeX);
					var posY = UIProject.getInstance().currentUI.getViewYValue(this.posY,this.PosTypeY);
				}else{
					var posX = UIManager.getInstance().currentFile.getViewXValue(this.posX,this.PosTypeX);
					var posY = UIManager.getInstance().currentFile.getViewYValue(this.posY,this.PosTypeY);
				}

				obj1.posX = posX;
				obj1.posY = posY;
				obj1.alpha = this.alpha;
				obj1.visible = this.visible;
				obj1.frame = 0;
			}else{
				obj1 = prevFrame.getObject(this);
			}
			var frame1 = obj2.frame - obj1.frame;

			obj.height = parseFloat((obj1.height+(frame - obj1.frame)*(obj2.height - obj1.height)/frame1).toFixed(2));
			obj.width = parseFloat((obj1.width+(frame - obj1.frame)*(obj2.width - obj1.width)/frame1).toFixed(2));
			obj.scaleX = parseFloat((obj1.scaleX+(frame - obj1.frame)*(obj2.scaleX - obj1.scaleX)/frame1).toFixed(2));
			obj.scaleY = parseFloat((obj1.scaleY+(frame - obj1.frame)*(obj2.scaleY - obj1.scaleY)/frame1).toFixed(2));
			obj.rotation =parseFloat((obj1.rotation+(frame - obj1.frame)*(obj2.rotation - obj1.rotation)/frame1).toFixed(2));


			obj.posX = parseFloat((obj1.posX+(frame - obj1.frame)*(obj2.posX - obj1.posX)/frame1).toFixed(2));
			obj.posY = parseFloat((obj1.posY+(frame - obj1.frame)*(obj2.posY - obj1.posY)/frame1).toFixed(2));

			obj.alpha = parseFloat((obj1.alpha+(frame - obj1.frame)*(obj2.alpha - obj1.alpha)/frame1).toFixed(2));
			obj.visible = obj1.visible;
			obj.frame = -1;

			return obj;
		}


	}
	this.checkFrame = function(frame,actionIndex){

		var obj = this.getCheckFrameObj(frame,actionIndex);

		this.updateView(obj);
	};


	this.destroy =function(){
		this.removeFromParent();

	};
	
	this.removeFromParent = function(){
		if(this.view.parent){
			this.view.parent.removeChild(this.view);
		}
		this.layer.removeFromParent();
	};
	
	var elmId = this.id;
	var self = this;

	this.moveComplete = function(){

		Director.getInstance().postMsg("moveComplete",self);
	};
	this.updateMove = function(frame){
		var frameSet = this.getFrameSet(frame,UIProject.getInstance().currentUI.actionIndex);
		if(frameSet==null){

			this.posX =  UIProject.getInstance().currentUI.getPosXValue(this.view.x,this.PosTypeX);
			this.posY =  UIProject.getInstance().currentUI.getPosYValue(this.view.y,this.PosTypeY);

		}else{

			var posX = UIProject.getInstance().currentUI.getViewXValue(this.posX,this.PosTypeX);
			var posY = UIProject.getInstance().currentUI.getViewYValue(this.posY,this.PosTypeY);

			frameSet.posX = this.view.x-posX;
			frameSet.posY = this.view.y-posY;
		}
		Director.getInstance().postMsg("elementUpdate",self);
	}
	DragManager.getInstance().addDragObj(this.view,this.moveComplete);

	this.textureJson=null;
	this.textureName=null;

	this.display=null;
	

	this.updatePosition = function(obj){

		var xx = 0;
		var yy = 0;


		if(obj==null) {
			xx = this.posX;
			yy = this.posY;

			if(UIProject.getInstance().currentUI){
				this.view.x = UIProject.getInstance().currentUI.getViewXValue(xx, this.PosTypeX);
				this.view.y = UIProject.getInstance().currentUI.getViewYValue(yy, this.PosTypeY);
			}else{

				this.view.x = UIManager.getInstance().currentFile.getViewXValue(xx, this.PosTypeX);
				this.view.y = UIManager.getInstance().currentFile.getViewYValue(yy, this.PosTypeY);
			}

		}else{
			this.view.x = obj.posX;
			this.view.y = obj.posY;
		}




	}
	this.baseUpdateView = function(obj){




		if(obj==null) {

			this.content.scale = new PIXI.Point(this.scaleX, this.scaleY);
			this.content.rotation = Math.PI * this.rotation / 180;
			this.updatePosition();
			this.content.alpha = this.alpha;
			this.content.visible = this.visible;


			this.content.rotation = this.rotation*Math.PI/180;

		}else{
			//this.content.pivot=new PIXI.Point(this.anchorX*this.content.width/obj.scaleX, this.anchorY*this.content.height/obj.scaleY);
			this.content.scale = new PIXI.Point(obj.scaleX, obj.scaleY);
			this.content.rotation = Math.PI * obj.rotation / 180;
			this.updatePosition(obj);
			this.content.alpha = obj.alpha;
			this.content.visible = obj.visible;

		}

		//this.content.anchor=new PIXI.Point(this.anchorX, this.anchorY);

	};
	this.baseChangeElm = function(obj){

		if(obj.id=="visible"){
			var value = document.getElementById("visible").checked;

			this.visible = value;
			//this.content.visible = this.visible;

		}else {
			var oldValue = this[obj.id];

			switch(obj.id){

				case "posX":
				case "posY":
					this[obj.id] = obj.value;
					this[obj.id] = parseInt(this[obj.id]);
					break;
				case "instName":
					this[obj.id] = obj.value;
					break;
				case "width":
					this[obj.id] = obj.value;
					this.content.width = this.width;
					this.scaleX = this.content.scale.x;
					break;
				case "height":
					this[obj.id] = obj.value;
					this.content.height = this.height;
					this.scaleY = this.content.scale.y;

					break;
				case "scaleX":
					this[obj.id] = obj.value;
					this[obj.id] = parseFloat(this[obj.id]);

					this.content.scale=new PIXI.Point(this.scaleX, this.scaleY);

					this.width = this.content.width;

					break;
				case "scaleY":
					this[obj.id] = obj.value;
					this[obj.id] = parseFloat(this[obj.id]);
					this.content.scale=new PIXI.Point(this.scaleX, this.scaleY);

					this.height = this.content.height;

					break;
				case "alpha":
					this[obj.id] = obj.value;
					this[obj.id] = parseFloat(this[obj.id]);
					break;

				case "anchorX":
					this[obj.id] = obj.value;
					this[obj.id] = parseFloat(this[obj.id]);
					this.content.pivot=new PIXI.Point(this.anchorX*this.content.width/this.scaleX, this.anchorY*this.content.height/this.scaleY);
					break;
				case "anchorY":
					this[obj.id] = obj.value;
					this[obj.id] = parseFloat(this[obj.id]);
					this.content.pivot=new PIXI.Point(this.anchorX*this.content.width/this.scaleX, this.anchorY*this.content.height/this.scaleY);
					break;
				case "rotation":
					this[obj.id] = obj.value;
					this[obj.id] = parseFloat(this[obj.id]);
					break;
				case "PosTypeX":
					this[obj.id] = obj.value;
					var posX = UIProject.getInstance().currentUI.getViewXValue(this.posX,oldValue);
					this[obj.id] = parseInt(this[obj.id]);

					this.posX = UIProject.getInstance().currentUI.getPosXValue(posX,this.PosTypeX);

					break;
				case "PosTypeY":
					this[obj.id] = obj.value;
					var posY = UIProject.getInstance().currentUI.getViewYValue(this.posY,oldValue);

					this[obj.id] = parseInt(this[obj.id]);


					this.posY = UIProject.getInstance().currentUI.getPosYValue(posY,this.PosTypeY);
					break;

			}


		}



		this.updateLayer();
	};
	this.getBasePropertiesDiv = function(){
	
		var res="<table border='1'>";
		res+="<tr><td style='width:50%'>id:"+this.id+"</td><td><button onClick=UIProject.getInstance().currentEditor.delElm("+this.id+");>删除</button></td></tr>";
		//res+="<tr><td colspan='2'>rootId:<input type='text' id='rootId' value='"+this.rootId+"' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";
		res+="<tr><td colspan='2'>实例名:<input type='text' id='instName' value='"+this.instName+"' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";
		res+="<tr><td>宽:<input type='text' id='width' value='"+this.width+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td>";
		res+="<td>高:<input type='text' id='height' value='"+this.height+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";


		if(this.visible==true) {

			res += "<tr><td>显示:<input type='checkbox' id='visible'  checked onchange='UIProject.getInstance().currentEditor.changeElm(this," + this.id + ");'/></td>";
		}else{
			res += "<tr><td>显示:<input type='checkbox' id='visible'  onchange='UIProject.getInstance().currentEditor.changeElm(this," + this.id + ");'/></td>";
		}
		res+="<td>alpha:<input type='text' id='alpha' value='"+this.alpha+"' style='width:30px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";

		res+="<tr><td>X:<input type='text' id='posX' value='"+this.posX+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td>";
		res+="<td>Y:<input type='text' id='posY' value='"+this.posY+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";


		res+="<tr><td>位置类型<select id='PosTypeX' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/>";
		for(var key in PosTypeXList){
			if(key != this.PosTypeX) {
				res += "<option value=" + key + ">" + PosTypeXList[key] + "</option>";
			}else{
				res += "<option value=" + key + " selected>" + PosTypeXList[key] + "</option>";
			}
		}
		res+="</td>";
		res+="<td>位置类型<select id='PosTypeY' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/>";
		for(var key in PosTypeYList){
			if(key != this.PosTypeY) {
				res += "<option value=" + key + ">" + PosTypeYList[key] + "</option>";
			}else{
				res += "<option value=" + key + " selected>" + PosTypeYList[key] + "</option>";
			}
		}
		res+="</td></tr>";


		res+="<tr><td>scaleX:<input type='text' id='scaleX' value='"+this.scaleX+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td>";
		res+="<td>scaleY:<input type='text' id='scaleY' value='"+this.scaleY+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";

		res+="<tr><td>anchorX:<input type='text' id='anchorX' value='"+this.anchorX+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td>";

		res+="<td>anchorY:<input type='text' id='anchorY' value='"+this.anchorY+"' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";
		res+="<tr><td colspan='2'>旋转:<input type='text' id='rotation' value='"+this.rotation+"' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeElm(this,"+this.id+");'/></td></tr>";
		res+="</table>";
		
		return res;
	};
	this.getBaseJsonObj = function (){
		var obj = {};
		
		obj.id = this.id;
		obj.type = this.type;
		obj.posX = this.posX;
		obj.posY = this.posY;
		obj.scaleX = this.scaleX;
		obj.scaleY = this.scaleY;
		obj.width = this.width;
		obj.height = this.height;
		obj.instName = this.instName;
		obj.order = this.order;
		obj.rootId = this.rootId;
		obj.anchorX = this.anchorX;
		obj.anchorY = this.anchorY;
		obj.frameSetList = [];
		obj.rotation = this.rotation;
		for(var key in this.frameSetList){
			obj.frameSetList[key]=[];
			for(var key1 in this.frameSetList[key]){
				obj.frameSetList[key].push(this.frameSetList[key][key1].getJson())
			}
		}
		obj.PosTypeX =  this.PosTypeX;
		obj.PosTypeY =  this.PosTypeY;

		return obj;
	};
	this.setBaseJson =function(json){

		this.posX = parseInt(json.posX);
		this.posY = parseInt(json.posY);

		if(json.scaleX!==null){
			this.scaleX = parseFloat(json.scaleX);
		}
		if(json.scaleY!==null){

			this.scaleY = parseFloat(json.scaleY);
		}
		if(json.PosTypeX){
			this.PosTypeX = parseInt(json.PosTypeX);
		}

		if(json.PosTypeY){
			this.PosTypeY = parseInt(json.PosTypeY);
		}

		this.width = parseInt(json.width);
		this.height = parseInt(json.height);
		this.instName = json.instName;
		if(json.order!==null){
			this.order = parseInt(json.order);
		}
		if(json.rootId!==null){
			
			this.rootId = json.rootId;
		}

		if(json.anchorX!==null){
			this.anchorX = parseFloat(json.anchorX);
		}
		if(json.anchorY!==null){

			this.anchorY = parseFloat(json.anchorY);
		}

		this.rotation = parseInt(json.rotation);




		this.frameSetList = {};
		for(var key in json.frameSetList){
			this.frameSetList[key]=[];
			for(var key1 in json.frameSetList[key]) {
				var frameObj = JSON.parse(json.frameSetList[key][key1])
				var frameSet = new FrameSet(frameObj.frame);
				frameSet.setJson(frameObj);
				this.frameSetList[key].push(frameSet);
			}
		}

		this.updatePosition();
	};
	this.getPropertiesDiv = function(){
		alert("!!");
	};
	this.changeElm = function(){
		alert("!!");
	};
	
}