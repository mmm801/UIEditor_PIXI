PIXI.settings.RENDER_OPTIONS.resolution = window.devicePixelRatio;
PIXI.settings.RENDER_OPTIONS.autoResize = true;

function Editor(){
	

	this.arr = [];				//BaseElement对象

	this.elmJsonMap = null;//
	this.rootId = 0;					//BaseElement Id
	this.waitPool = {};		//当子对象需要的父尚未生成时，先存着

	this.pixiApp = null;
	this.pixiLayout = null;//new Layout();

	this.currentFrameNum=0;
	this.currentElm = null;

	this.stageContent = new PIXI.Graphics();
	this.stageMask = new PIXI.Graphics();


	this.setZoom = function(value){
		this.stageContent.scale = new PIXI.Point(value/100,value/100);
	}
	this.setMask = function(value){
		if(value){
			this.stageContent.mask = this.stageMask;
		}else{
			this.stageContent.mask = null;
		}
	}
	this.updateSceneSize = function(){
		this.stageContent.clear();
		this.stageContent.beginFill(parseInt("0x"+UIProject.getInstance().currentUI.backcolor),1);
		this.stageContent.drawRect(0,0,UIProject.getInstance().currentUI.width,UIProject.getInstance().currentUI.height);
		this.stageContent.endFill();

		this.stageMask.width = UIProject.getInstance().currentUI.width;
		this.stageMask.height = UIProject.getInstance().currentUI.height;

		for(var key in this.arr){
			//this.arr[key].updatePosition();
			this.arr[key].updateView();
		}
	}

	this.initStage = function(divName,width,height){
		this.pixiApp=new PIXI.Application(width,height);
		document.getElementById(divName).appendChild(this.pixiApp.view);

		this.pixiLayout = new Layout(width,height);


		this.stageContent.beginFill(0xffffff,1);
		this.stageContent.drawRect(0,0,600,400);
		this.stageContent.endFill();
		this.stageContent.x = (width-600)/2;
		this.stageContent.y = (500-400)/2;

		DragManager.getInstance().addDragObj(this.stageContent);

		this.stageMask.beginFill(0xff0000,1);
		this.stageMask.drawRect(0,0,10,10);
		this.stageMask.endFill();

		this.stageMask.width = this.stageContent.width;
		this.stageMask.height = this.stageContent.height;
		this.stageMask.visible = false;

		this.pixiApp.stage.addChild(this.stageContent);
		this.stageContent.addChild(this.stageMask);


		this.pixiApp.stage.addChild(this.pixiLayout);

		this.pixiLayout.y = 500;
		this.clear();

	}

	this.clear = function(){
		this.elmJsonMap = null;
		//this.pixiLayout.visible=false;
	}
	this.setJsonMap = function(ui,update){

		this.rootId = 0;
		this.clear();
		this.elmJsonMap = ui.elmJsonMap;

		this.removeAll();

		this.updateSceneSize();

		this.drawElm(false);
		if(update==true) {
			var len = this.arr.length;
			for (var i = len - 1; i >= 0; i--) {
				if (this.arr[i].rootId == this.rootId) {
					this.elementUpdate(this.arr[i]);
					break;
				}
			}
		}
	}
	this.removeAll = function(){
		while(this.arr.length>0){
			var elm = this.arr.pop();
			elm.removeFromParent();
		}
	}
	this.addChild = function(obj,update){
		if(obj.errorNo!=0){
			return ;
		}
		var parent = this.stageContent;
		var parentElm = null;
		if(obj.rootId!=0){
			parentElm = this.getElmById(obj.rootId);
			if(parentElm == null){
				if(this.waitPool[obj.rootId] == null){
					this.waitPool[obj.rootId] = [];
				}
				this.waitPool[obj.rootId].push(obj);
				this.arr.push(obj);
				return ;
			}else{
				parentElm.childrenNum++;
				parent = parentElm.content;
			}
		}

		if(this.waitPool[obj.id] != null){
			var len = this.waitPool[obj.id].length;
			var childElm = null;
			obj.childrenNum+=len;
			for(var i=0;i<len;i++){
				childElm = this.waitPool[obj.id][i];
				obj.content.addChild(childElm.view);
				childElm.order = obj.content.getChildIndex(childElm.view);
			}
		}

		parent.addChild(obj.view);
		obj.order = parent.getChildIndex(obj.view);

		this.arr.push(obj);


		if(obj.rootId == this.rootId) {
			this.pixiLayout.content.addChild(obj.layer);

		}

		if(update){
			Director.getInstance().postMsg("elementUpdate", obj);
		}

	}
	this.loadSceneOver = function(json){

		if(json==null){
			this.elmJsonMap = {};
			this.initStage(this.screenType);
		}else{
			this.elmJsonMap = json;
			this.initStage(this.screenType);
		}
	}
	this.loadElmData = function(sceneUrl){
		
		if(sceneUrl==null){
			Director.getInstance().postMsg("loadSceneOver",null);
		}else{
			$.get("/H5/"+sceneUrl+"?"+Math.random(),function(data){

				var jsonObj = JSON.parse(data);
				Director.getInstance().postMsg("loadSceneOver",jsonObj);
			}).error(function(xhr,errorText,errorType){
				Director.getInstance().postMsg("loadSceneOver",null);
			});
		}
	}
	
	this.drawElm = function(update){
	
		var arr = [];
			
		for(var key in this.elmJsonMap){
			arr.push(JSON.parse(this.elmJsonMap[key]));
		}
		arr.sort(function (a, b) {

　　			return a.order- b.order;
		});
			
		var len = arr.length;
		var elm = null;
		for(var i=0;i<len;i++){
			elm = elmFactory(arr[i]);
			if(update){
				if(i==len-1){
					this.addChild(elm,false);
				}else{
					this.addChild(elm,false);
				}
			}else{
				this.addChild(elm,false);
			}

		}
		this.checkRootLevel();
	}

	this.changeElm = function (obj,id){
		this.updateChild(obj,id);
	}
	this.elementUpdate = function(elm){
	    if(this.elmJsonMap==null){
	        return ;
        }

		this.doChange(elm);

		this.doElementUpdate(elm);
	}
	this.doElementUpdate = function(elm){
		elm.getPropertiesHtml();
		this.updateFrameSetProperty(elm);
		if(this.currentElm!==null){
			this.currentElm.layer.setSelect(false);
		}
		this.currentElm = elm;
		this.currentElm.layer.setSelect(true);
		this.currentElm.checkFrame(UIProject.getInstance().currentEditor.currentFrameNum,UIProject.getInstance().currentUI.actionIndex);
		this.updateLayout();
	}


	this.addPaste = function(jsonStr){
		if(this.elmJsonMap==null){
			return ;
		}
		var obj = JSON.parse(jsonStr);
		var elm = elmCreate(obj);

		elm.rootId = this.rootId;
		//this.doChange(elm);
		this.addChild(elm,true);
	}
	this.addUI = function(){
        if(this.elmJsonMap==null){
            return ;
        }
        var ui = new UIElement();
		//ui.updateView();
        ui.rootId = this.rootId;
        this.addChild(ui,true);


    };
	this.addPic = function(){
		if(this.elmJsonMap==null){
			return ;
		}
		var pic = new PicElement();
		pic.rootId = this.rootId
		this.addChild(pic,true);
	};

	this.addText = function(){
		if(this.elmJsonMap==null){
			return ;
		}

		var txt = new TextElement();
		txt.rootId = this.rootId
		//this.doChange(txt);
		this.addChild(txt,true);
	}


	this.doChange = function(elm){
		var ui = UIProject.getInstance().currentUI;
		var oldData = JSON.stringify(ui);
		this.elmJsonMap[elm.id]=elm.getJson();
		var newData = JSON.stringify(ui);

		EditController.getInstance().addAction({action:"changeFile",oldData:oldData,newData:newData,elmId:elm.id});
	}
	this.addSlice9 = function(){
		if(this.elmJsonMap==null){
			return ;
		}
		var shape = new Slice9Element();
		shape.rootId = this.rootId;
		this.addChild(shape,true);
	}
	this.addShape = function(){
		if(this.elmJsonMap==null){
			return ;
		}

		var shape = new ShapeElement();
		shape.rootId = this.rootId;
		this.addChild(shape,true);
	}

	
	this.delElm = function(id){
		this.removeChildById(id);
		delete this.elmJsonMap[id];
	}

	this.layerClick = function(elm,type){
		switch(type){
			case 1:
				UIProject.getInstance().currentEditor.selectElm(elm.id);
				break;
			case 2:
				UIProject.getInstance().currentEditor.hiddenElm(elm.id);
				break;
			case 3:
				UIProject.getInstance().currentEditor.lockElm(elm.id);
				break;
			case 4:
				UIProject.getInstance().currentEditor.moveElm(elm.id);
				break;
			case 5:
				UIProject.getInstance().currentEditor.enterElm(elm.id);
				break;
		}

	};
	this.moveComplete = function(elm){
		elm.updateMove(this.currentFrameNum);
	}
			
	Director.getInstance().addObserver(this,"elementUpdate",this.elementUpdate);
	Director.getInstance().addObserver(this,"loadSceneOver",this.loadSceneOver);


	Director.getInstance().addObserver(this,"moveComplete",this.moveComplete);
	Director.getInstance().addObserver(this,"layerClick",this.layerClick);

			
	this.getJson = function(){
		return JSON.stringify(this.elmJsonMap);
	};

	this.updateLayout = function(){

		this.arr.sort(function(a,b){return a.order>b.order?-1:1});


		var res="<table>"
		res +="<tr  class='cell'><td><a href='javascript:UIProject.getInstance().currentEditor.enterElm(0);'>root</a></td>";

		var rootId = this.rootId;
		var levelNum = 0;
		var elm = null;
		while(rootId>0){
			levelNum++;
			elm = this.getElmById(rootId);
			rootId = elm.rootId;
			res+="<td><a href ='javascript:UIProject.getInstance().currentEditor.enterElm("+elm.id+");'>"+elm.instName+"</a></td>";
		}
		if(levelNum<4){
			res+="<td colspan='"+(4-levelNum)+"'></td>";
		}
		res+="</tr>";
		res+= "</table>";
		document.getElementById("navigate").innerHTML = res;
		var tmpList = [];
		for(var key in this.arr){
			if(this.arr[key].layer.parent){
				this.arr[key].layer.parent.removeChild(this.arr[key].layer);
			}
			if(this.arr[key].rootId == this.rootId){
				tmpList.push(this.arr[key]);
				this.pixiLayout.content.addChild(this.arr[key].layer);
			}
		}
		this.pixiLayout.updateView(tmpList);

	}

	this.updateChild = function(obj,id){
		var len = this.arr.length;
		for(var i=0;i<len;i++){
			if(this.arr[i].id == id){
				this.arr[i].changeElm(obj);
				break;
			}
		}
	}
	this.selectElm = function (id){
		var len = this.arr.length;
		for(var i=0;i<len;i++){
			if(this.arr[i].id == id){

				Director.getInstance().postMsg("elementUpdate",this.arr[i]);
				break;
			}
		}
	}
	this.hiddenElm = function(id){

		var elm = this.getElmById(id);
		elm.view.visible = !elm.view.visible;
		elm.updateLayer();
	}
	this.lockElm = function(id){

		var elm = this.getElmById(id);
		elm.view.interactive = !elm.view.interactive;
		elm.updateLayer();
	}
	this.enterElm = function(id){

		this.rootId = id;

		this.checkRootLevel();

		var len = this.arr.length;
		for(var i=0;i<len;i++){
			if(this.arr[i].rootId == this.rootId ){
				Director.getInstance().postMsg("elementUpdate",this.arr[i]);
				break;
			}
		}
		this.updateLayout();
	}
	this.checkRootLevel = function(){
		var len = this.arr.length;

		for(var i=0;i<len;i++){
			if(this.arr[i].rootId == this.rootId ){
				this.arr[i].view.interactive=true;
				this.arr[i].view.buttonMode=true;
			}else{
				this.arr[i].view.interactive=false;
				this.arr[i].view.buttonMode=false;
			}
		}
	}
	this.getElmById = function (id){
		var len = this.arr.length;
		for(var i=0;i<len;i++){
			if(this.arr[i].id == id){
				return this.arr[i];
			}
		}
		return null;
	}
	this.moveElm = function(id){
		var len = this.arr.length;
		var targetElm = null;

		targetElm = this.getElmById(id);
		if(targetElm==null){
			return ;
		}
		var index = this.stageContent.getChildIndex(targetElm.view);
		if(index==0){
			return ;
		}
		var swapIndex = index-1;
		var swapElm = null;
		for(var i=0;i<len;i++){
			var tmp = this.stageContent.getChildIndex(this.arr[i].view);
			if(tmp == swapIndex){
				swapElm = this.arr[i];
				break;
			}
		}
		this.stageContent.swapChildren(swapElm.view,targetElm.view);

		swapElm.order = index;
		targetElm.order = index-1;

		this.elmJsonMap[swapElm.id]=swapElm.getJson();
		this.elmJsonMap[targetElm.id]=targetElm.getJson();

		this.updateLayout();
	}
	this.removeChildById = function(id){
		var len = this.arr.length;
		for(var i=0;i<len;i++){
			if(this.arr[i].id == id){
				if(this.arr[i].childrenNum>0){
					alert("请先删除子元素");
				}else{
					this.arr[i].destroy();
					this.arr.splice(i,1);
				}
				break;
			}
		}
		len = this.arr.length;
		for(var i=0;i<len;i++){
			if(this.arr[i].rootId == this.rootId){
				this.arr[i].order = this.arr[i].view.parent.getChildIndex(this.arr[i].view);
				Director.getInstance().postMsg("elementUpdate",this.arr[i]);
			}
		}
		this.updateLayout();
	}
	this.deleteFrameSet = function(frame){
		this.currentElm.deleteFrameSet(frame,UIProject.getInstance().currentUI.actionIndex);
		this.elmJsonMap[this.currentElm.id]=this.currentElm.getJson();
		this.updateFrameSetProperty(this.currentElm);
		this.updateLayout();
		for(var key in this.arr){
			this.arr[key].checkFrame(frame,UIProject.getInstance().currentUI.actionIndex);
		}
	}
	this.addFrameSet = function(frame){
		var frameSet = new FrameSet();
		frameSet.frame = frame;

		var obj = this.currentElm.getCheckFrameObj(frame,UIProject.getInstance().currentUI.actionIndex);
		if(obj!==null) {
			frameSet.width = obj.width;
			frameSet.height = obj.height;
			frameSet.scaleX = obj.scaleX;
			frameSet.scaleY = obj.scaleY;

			var posX = UIProject.getInstance().currentUI.getViewXValue(this.currentElm.posX,this.currentElm.PosTypeX);
			var posY = UIProject.getInstance().currentUI.getViewYValue(this.currentElm.posY,this.currentElm.PosTypeY);

			frameSet.posX = obj.posX-posX;
			frameSet.posY = obj.posY-posY;
			frameSet.rotation = obj.rotation;
			frameSet.alpha = obj.alpha;

			frameSet.visible = obj.visible;

			if (this.currentElm.type == "pic" ) {
				frameSet.resName = obj.resName;
			}
		}else{
			frameSet.width = this.currentElm.width;
			frameSet.height = this.currentElm.height;
			frameSet.scaleX = this.currentElm.scaleX;
			frameSet.scaleY = this.currentElm.scaleY;
			frameSet.posX = 0;
			frameSet.posY = 0;
			frameSet.rotation = this.currentElm.rotation;

			if (this.currentElm.type == "pic" ) {
				frameSet.resName = this.currentElm.resName;
			}
		}

		this.currentElm.addFrameSet(frameSet,UIProject.getInstance().currentUI.actionIndex);
		this.doChange(this.currentElm);
		this.updateFrameSetProperty(this.currentElm);
        this.updateLayout();
	};
	this.changeFrame = function(obj,frameNum){

		var frameSet = this.currentElm.getFrameSet(frameNum,UIProject.getInstance().currentUI.actionIndex);
		frameSet.changeFrame(obj,this.currentElm);

		Director.getInstance().postMsg("elementUpdate",this.currentElm);
	}
	this.updateFrameSetProperty = function(elm){
		var res = "";
		if(this.currentFrameNum==0){

            for(var key in UIProject.getInstance().currentUI.actionList){
				res+="<div><input type='text' size = '10' id='action"+key+"' value='"+UIProject.getInstance().currentUI.actionList[key].actionName+"' onchange='UIProject.getInstance().changeAction("+key+")'/>";
				res+="<input type='text' size ='3' id='time"+key+"' value='"+UIProject.getInstance().currentUI.actionList[key].actionTime+"' onchange='UIProject.getInstance().changeAction("+key+")'/>";
				res+="<input type='text' size ='3' id='interval"+key+"' value='"+UIProject.getInstance().currentUI.actionList[key].interval+"' onchange='UIProject.getInstance().changeAction("+key+")'/>";
                if(key != UIProject.getInstance().currentUI.actionIndex){

                    res+="<button onclick='UIProject.getInstance().selectAction("+key+");'>选择</button>";
					res+="<button onclick='UIProject.getInstance().deleteAction("+key+");'>删除</button>";
					res+="</div>";
                }
            }
            res+="<div><input type='text' id='newAction' value='action"+UIProject.getInstance().currentUI.actionList.length+"' size='10'/>";
            res+="<input type='text' id='newTime' value='30' size='3'/>";
			res+="<input type='text' id='newInterval' value='1' size='3'/>";
            res+="<button onclick='UIProject.getInstance().addNewAction();'>新增</button></div>";
			document.getElementById("frameProperty").innerHTML=res;
			return ;
		}
		var frameSet = elm.getCheckFrameObj(this.currentFrameNum,UIProject.getInstance().currentUI.actionIndex);

		if(frameSet==null){
			res += "<div>FrameSet:"+this.currentFrameNum+"<button onclick='UIProject.getInstance().currentEditor.addFrameSet("+this.currentFrameNum+")'>新建</button></div>";
		}else {
			if(this.currentFrameNum == frameSet.frame) {
				res += "<div>FrameSet:" + frameSet.frame + "<button onclick='UIProject.getInstance().currentEditor.deleteFrameSet(" + this.currentFrameNum + ");'>删除</button></div>";
				res += this.getPropertyContent(frameSet,elm,"");
			}else{
				res += "<div>FrameSet:"+this.currentFrameNum+"<button onclick='UIProject.getInstance().currentEditor.addFrameSet("+this.currentFrameNum+")'>新建</button></div>";

				res += this.getPropertyContent(frameSet,elm,"disabled");
			}
		}
		document.getElementById("frameProperty").innerHTML = res;
	};

	this.getPropertyContent = function(frameSet,elm,disable){


		var posX = UIProject.getInstance().currentUI.getViewXValue(elm.posX,elm.PosTypeX);
		var posY = UIProject.getInstance().currentUI.getViewYValue(elm.posY,elm.PosTypeY);

		frameSet.posX-=posX;
		frameSet.posY-=posY;
		var res = "";
		res += "<table>";
		res += "<tr><td>宽:<input type='text' "+disable+" id='f_width' value='" + frameSet.width + "' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td>";
		res += "<td>高:<input type='text' "+disable+" id='f_height' value='" + frameSet.height + "' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";
		res += "<tr><td>X:<input type='text' "+disable+" id='f_x' value='" + frameSet.posX + "' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td>";
		res += "<td>Y:<input type='text' id='f_y' "+disable+" value='" + frameSet.posY + "' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";
		res += "<tr><td>scaleX:<input type='text' "+disable+" id='f_scaleX' value='" + frameSet.scaleX + "' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td>";
		res += "<td>scaleY:<input type='text' "+disable+" id='f_scaleY' value='" + frameSet.scaleY + "' style='width:50px;' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";
		res += "<tr><td colspan='2'>旋转:<input type='text' "+disable+" id='f_rotation' value='" + frameSet.rotation + "' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";
		res += "<tr><td colspan='2'>透明度:<input type='text' "+disable+" id='f_alpha' value='" + frameSet.alpha + "' style='width:100px;' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";

		if (frameSet.visible) {
			res += "<tr><td colspan='2'>显示:<input type='checkbox' "+disable+" id='f_visible' checked onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";
		} else {
			res += "<tr><td colspan='2'>显示:<input type='checkbox' "+disable+" id='f_visible' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";
		}

		if (elm.type == "pic") {
			res += "<tr><td>图片:</td><td>";

			res += "<select id='f_resName' "+disable+" onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'>";
			for (var key in UIProject.getInstance().resMap) {
				if (key == frameSet.resName) {
					res += "<option value='" + key + "' selected>" + key + "</option>";
				} else {
					res += "<option value='" + key + "'>" + key + "</option>";
				}

			}
			res += "</select>";
		}

		if (frameSet.b_continue) {
			res += "<tr><td colspan='2'>补间:<input type='checkbox' "+disable+" id='f_continue' checked onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";
		} else {
			res += "<tr><td colspan='2'>补间:<input type='checkbox' "+disable+" id='f_continue' onchange='UIProject.getInstance().currentEditor.changeFrame(this," + this.currentFrameNum + ");'/></td></tr>";
		}
		res += "</table>";

		return res;
	}

	this.selectFrame = function(frame){
		this.currentFrameNum = frame;

		for(var key in this.arr){
			if(this.arr[key].rootId == this.rootId) {
				this.arr[key].checkFrame(frame, UIProject.getInstance().currentUI.actionIndex);
			}
		}
		this.updateFrameSetProperty(this.currentElm);
	};
	this.removeAction = function(id){
		for(var key in this.arr){
			if(this.arr[key].rootId == this.rootId) {
				this.arr[key].removeAction(id);
			}
		}
	};
	this.keyPointDrag = function(frame,value){

		var frameSet = this.currentElm.getFrameSet(frame,UIProject.getInstance().currentUI.actionIndex);
		if(frameSet == null){
			return ;
		}

		if(value>0){
			value = Math.floor((value-5)/10);
		}else{
			value = Math.ceil((value-5)/10);
		}

		frameSet.frame = value;

		Director.getInstance().postMsg("elementUpdate",this.currentElm);

	}
	Director.getInstance().addObserver(this,"keyPointDrag",this.keyPointDrag);
	Director.getInstance().addObserver(this,"selectFrame",this.selectFrame);
	Director.getInstance().addObserver(this,"updateSceneSize",this.updateSceneSize);
}

