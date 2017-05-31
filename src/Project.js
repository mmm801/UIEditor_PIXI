
function UIProject(){

    EditController.getInstance();
    
    this.currentEditor = new Editor();
    this.currentUI = null;

    this.fileMap = null;
    this.resMap = {};
    this.loaderRes = null;
    this.defaultResKey = null;
    this.uiFileNum = 0;
    this.maxElmNum = 0;
    var self = this;


    this.loadRes = function(){
        var file=document.getElementById("fileRes").files[0];
        var reader = new FileReader();
        reader.onload = function ( event ) {
            var txt = event.target.result;
            var obj = JSON.parse(txt);
            self.resMap = obj;


            var loader = new PIXI.loaders.Loader();

            for(var key in self.resMap){
                if(self.defaultResKey===null){
                    self.defaultResKey = key;
                }
                loader.add(key, self.resMap[key],{crossOrigin: true});
            }
            function onAssetsLoaded(loader,res){
                self.loaderRes = res;
                self.updateFileList();
            }

            loader.load(onAssetsLoaded);
        };
        reader.readAsText(file);
    };

    this.initWithData = function(url){
        ajax({
            type:"GET",
            url:url,
            dataType:"text",
            data:{},
            beforeSend:function(){
                //some js code
            },
            success:function(msg){
                self.doLoad(msg);

            },
            error:function(){
                console.log("error")
            }
        });
    }

    this.doLoad = function(txt){

        var obj = JSON.parse(txt);
        self.resMap = obj.resMap;
        self.fileMap = {};
        if(obj.maxElmNum){
            self.maxElmNum = parseInt(obj.maxElmNum);
        }
        if(obj.uiFileNum){
            self.uiFileNum = parseInt(obj.uiFileNum);
        }
        var key ;
        for(key in obj.fileMap){
            self.fileMap[key] = new UIFile();
            self.fileMap[key].loadJson(obj.fileMap[key]);
        }
        var loader = new PIXI.loaders.Loader();

        for(key in self.resMap){
            if(self.defaultResKey===null){
                self.defaultResKey = key;
            }
            loader.add(key, self.resMap[key],{crossOrigin: true});
        }
        function onAssetsLoaded(loader,res){
            self.loaderRes = res;
            self.updateFileList();
            for(var key in self.fileMap){
                self.doEnterUIFile(self.fileMap[key],true);
                break;
            }
        }

        if(self.defaultResKey!==null) {
            loader.load(onAssetsLoaded);
        }else{
            self.updateFileList();
            for(var key in self.fileMap){
                self.doEnterUIFile(self.fileMap[key],true);
                break;
            }
        }

    }
    this.load = function(){
        var file=document.getElementById("fileProject").files[0];
        var reader = new FileReader();
        reader.onload = function ( event ) {

            var txt = event.target.result;
            self.doLoad(txt);

        };
        reader.readAsText(file);
    };
    this.save = function(){

        var saveData = {};
        saveData.resMap = this.resMap;
        saveData.fileMap = this.fileMap;
        saveData.maxElmNum = this.maxElmNum;
        saveData.uiFileNum = this.uiFileNum;

        var jsonStr = JSON.stringify(saveData);

        var blob = new Blob([jsonStr], {type: "text/plain;charset=utf-8"});
        blob = new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});


        var aLink = document.createElement('a');
        aLink.target="_blank";
        aLink.href = URL.createObjectURL(blob);
        var evt = new MouseEvent("click");
        aLink.dispatchEvent(evt);
        URL.revokeObjectURL(aLink.href);
        /*
        var winname = window.open('', '_blank', 'top=10000');


        winname.document.open('text/html', 'replace');
        winname.document.write(jsonStr);
        winname.document.close();

        //winname.document.execCommand('saveas','','code.htm');
        //winname.close();
        */
    };

    this.initDiv = function(divName){

        this.divObject = document.getElementById(divName);
        this.updateFileList();
    };

    this.doNewFile = function(ui){
        if(this.fileMap===null){
            this.fileMap = {};
        }
        this.fileMap[ui.id] = ui;
        this.doEnterUIFile(ui);
        this.updateFileList();
    };
    this.newFile = function(){

        var ui = new UIFile();
        this.doNewFile(ui);
        EditController.getInstance().addAction({action:"newFile",data:ui});

    };

    this.doEnterUIFile = function(ui,update){
        this.updateFileProperty(ui);
        this.currentUI = ui;
        this.currentEditor.setJsonMap(ui,update);
        this.currentEditor.pixiLayout.scrollTop();
        this.updateFileList();
    };

    this.enterUIFile = function(id){
        var ui = this.fileMap[id];
        this.doEnterUIFile(ui,true);
    };
    this.doDelUIFile = function(ui){

        ui.destroy();
        this.updateFileProperty(null);
        this.fileMap[ui.id]=null;
        this.currentEditor.clear();

        delete this.fileMap[ui.id];
        this.currentUI=null;
        this.updateFileList();
    };
    this.delUIFile = function(id){
        var ui = this.fileMap[id];
        this.doDelUIFile(ui);
        EditController.getInstance().addAction({action:"delFile",data:ui});
    };
    this.changeFile = function(obj){
        var ui = this.currentUI;
        var oldData = JSON.stringify(ui);
        ui.getChange(obj);
        var newData = JSON.stringify(ui);
        this.updateFileList();
        this.updateFileProperty(ui);

        EditController.getInstance().addAction({action:"changeFile",oldData:oldData,newData:newData});
    };
    this.updateFileList = function(){
        var res = "<div><button onclick='UIProject.getInstance().newFile();'>新增</button></div>";
        res+="<table>";
        for(var key in this.fileMap){
            res+="<tr>";
            res+="<td><a href='javascript:UIProject.getInstance().enterUIFile("+this.fileMap[key].id+");'>"+this.fileMap[key].fileName+"</a></td>";
            if(this.currentUI == this.fileMap[key]) {
                res += "<td><a href='javascript:UIProject.getInstance().delUIFile(" + this.fileMap[key].id + ");'>删除</a></td>";
            }else{
                res+="<td></td>";
            }
            res+="</tr>";
        }
        res+="</table>";
        this.divObject.innerHTML = res;
    };
    this.updateFileProperty = function(uiFile){
        var res = "";
        if(uiFile!==null) {

            res+=uiFile.getHtml();
        }
        document.getElementById("elmProperty").innerHTML = "";
        document.getElementById("frameProperty").innerHTML = "";
        document.getElementById("fileProperty").innerHTML = res;

        if(document.getElementById("backcolor")) {
            new jscolor(document.getElementById("backcolor"));
        }

    };
    this.addNewAction = function(){
        var name = document.getElementById("newAction").value;
        var time = document.getElementById("newTime").value;
        var uiAction = new UIAction();
        uiAction.actionName = name;
        uiAction.actionTime = parseInt(time);

        this.currentUI.actionList.push(uiAction);
        this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);

        EditController.getInstance().addAction({elmId:UIProject.getInstance().currentEditor.currentElm.id,action:"newAction",data:uiAction,ui:this.currentUI.id});
    };
    this.deleteAction = function(key){



        EditController.getInstance().addAction({elmId:UIProject.getInstance().currentEditor.currentElm.id,actionIndex:key,action:"delAction",data:this.currentUI.actionList[key],ui:this.currentUI.id});

        this.currentUI.actionList.splice(key,1);
        this.currentEditor.removeAction(key);

        this.currentUI.actionIndex = 0;
        this.currentEditor.updateLayout();
        this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);

    };
    this.changeAction = function(id) {
        var value = document.getElementById("action" + id).value;
        var time = document.getElementById("time" + id).value;
        var interval = document.getElementById("interval" + id).value;
        var oldData = JSON.stringify(this.currentUI.actionList[id]);

        this.currentUI.actionList[id].actionName = value;
        this.currentUI.actionList[id].actionTime = time;
        this.currentUI.actionList[id].interval = interval;

        var newData = JSON.stringify(this.currentUI.actionList[id]);

        EditController.getInstance().addAction({actionIndex:this.currentUI.actionIndex,elmId:UIProject.getInstance().currentEditor.currentElm.id,action:"changeAction",oldData:oldData,newData:newData,ui:this.currentUI.id});

        this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);
        this.currentEditor.updateLayout();
    };
    this.selectAction = function(id){
        this.currentUI.actionIndex = id;
        this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);
        this.currentEditor.updateLayout();
    };

    this.paste = function(event){
        if(this.currentUI===null){
            return ;
        }
        var clipboardData = event.clipboardData || window.clipboardData;
        var pasteData = event.clipboardData.getData("text/plain");

        this.currentEditor.addPaste(pasteData);
    };
    this.copy = function(event){
        if(this.currentUI===null){
            return ;
        }
        if(this.currentEditor.currentElm===null){
            return ;
        }
        var clipboardData = event.clipboardData || window.clipboardData;
        clipboardData.setData("text/plain",this.currentEditor.currentElm.getJson());
    };
    this.cut = function(event){
        if(this.currentUI===null){
            return ;
        }
        if(this.currentEditor.currentElm===null){
            return ;
        }
        var clipboardData = event.clipboardData || window.clipboardData;
        clipboardData.setData("text/plain",this.currentEditor.currentElm.getJson());

        this.currentEditor.delElm(this.currentEditor.currentElm.id);
    };
    this.undo = function(json){
        var ui;
        var obj;
        var elm;
        switch(json.action){
            case "newFile":
                ui = json.data;
                this.doDelUIFile(ui);

                break;
            case "delFile":
                ui = json.data;
                this.doNewFile(ui);
                break;
                
            case "changeFile":
                obj = JSON.parse(json.oldData);
                ui = this.fileMap[obj.id];
                if(UIProject.getInstance().currentUI===null || obj.id!=UIProject.getInstance().currentUI.id){
                    EditController.getInstance().rollNext();
                }else{
                    ui.loadJson(obj);
                }
                this.doEnterUIFile(ui,false);

                if(json.elmId){
                    elm = UIProject.getInstance().currentEditor.getElmById(json.elmId);
                    UIProject.getInstance().currentEditor.doElementUpdate(elm);
                }


                break;
            case "newAction":

                if(UIProject.getInstance().currentUI===null || json.ui!=UIProject.getInstance().currentUI.id){
                    EditController.getInstance().rollNext();
                }else{
                    this.currentUI.actionList.pop();
                    this.currentUI.actionIndex = 0;
                    this.currentEditor.updateLayout();
                }
                this.doEnterUIFile(this.fileMap[json.ui],false);

                if(json.elmId){
                    elm = UIProject.getInstance().currentEditor.getElmById(json.elmId);
                    UIProject.getInstance().currentEditor.doElementUpdate(elm);

                    this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);
                }

                break;
            case "delAction":
                if(UIProject.getInstance().currentUI===null || json.ui!=UIProject.getInstance().currentUI.id){
                    EditController.getInstance().rollNext();
                }else{
                    this.currentUI.actionList.splice(json.actionIndex,0,json.data);
                }
                this.doEnterUIFile(this.fileMap[json.ui],false);

                if(json.elmId){
                    elm = UIProject.getInstance().currentEditor.getElmById(json.elmId);
                    UIProject.getInstance().currentEditor.doElementUpdate(elm);

                    this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);
                }

                break;
            case "changeAction":
                obj = JSON.parse(json.oldData);
                if(UIProject.getInstance().currentUI===null || json.ui!=UIProject.getInstance().currentUI.id){
                    EditController.getInstance().rollNext();
                }else{
                    var actionIndex = json.actionIndex ;
                    this.currentUI.actionList[actionIndex].actionName = obj.actionName;
                    this.currentUI.actionList[actionIndex].interval = obj.interval;
                    this.currentUI.actionList[actionIndex].actionTime = obj.actionTime;
                }
                this.doEnterUIFile(this.fileMap[json.ui],false);
                if(json.elmId){
                    elm = UIProject.getInstance().currentEditor.getElmById(json.elmId);
                    UIProject.getInstance().currentEditor.doElementUpdate(elm);

                    this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);
                }
                break;
        }
    };
    this.redo = function(json){
        var ui;
        var obj;
        var elm;
        switch(json.action){
            case "newFile":
                ui = json.data;
                this.doNewFile(ui);
                break;
            case "delFile":
                ui = json.data;
                this.doDelUIFile(ui);
                break;
            case "changeFile":
                obj = JSON.parse(json.newData);
                ui = this.fileMap[obj.id];
                if(UIProject.getInstance().currentUI===null || obj.id!=UIProject.getInstance().currentUI.id){
                    EditController.getInstance().rollBack();
                }else{
                    ui.loadJson(obj);
                }

                this.doEnterUIFile(ui,false);

                if(json.elmId){
                    elm = UIProject.getInstance().currentEditor.getElmById(json.elmId);
                    UIProject.getInstance().currentEditor.doElementUpdate(elm);
                }

                break;
            case "newAction":
                if(UIProject.getInstance().currentUI===null || json.ui!=UIProject.getInstance().currentUI.id){
                    EditController.getInstance().rollBack();

                }else{
                    UIProject.getInstance().currentUI.actionList.push(json.data);

                    this.currentEditor.updateLayout();
                }
                this.doEnterUIFile(this.fileMap[json.ui],false);
                if(json.elmId){
                    elm = UIProject.getInstance().currentEditor.getElmById(json.elmId);
                    UIProject.getInstance().currentEditor.doElementUpdate(elm);

                    this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);
                }


                break;
            case "delAction":

                if(UIProject.getInstance().currentUI===null || json.ui!=UIProject.getInstance().currentUI.id){
                    EditController.getInstance().rollBack();

                }else{
                    UIProject.getInstance().currentUI.actionList.splice(json.actionIndex,1);
                    this.currentEditor.updateLayout();
                }
                this.doEnterUIFile(this.fileMap[json.ui],false);
                if(json.elmId){
                    elm = UIProject.getInstance().currentEditor.getElmById(json.elmId);
                    UIProject.getInstance().currentEditor.doElementUpdate(elm);

                    this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);
                }

                break;
            case "changeAction":
                obj = JSON.parse(json.newData);
                if(UIProject.getInstance().currentUI===null || json.ui!=UIProject.getInstance().currentUI.id){
                    EditController.getInstance().rollBack();
                }else{
                    var actionIndex = json.actionIndex ;
                    this.currentUI.actionList[actionIndex].actionName = obj.actionName;
                    this.currentUI.actionList[actionIndex].interval = obj.interval;
                    this.currentUI.actionList[actionIndex].actionTime = obj.actionTime;
                }
                this.doEnterUIFile(this.fileMap[json.ui],false);
                if(json.elmId){
                    elm = UIProject.getInstance().currentEditor.getElmById(json.elmId);
                    UIProject.getInstance().currentEditor.doElementUpdate(elm);

                    this.currentEditor.updateFrameSetProperty(this.currentEditor.currentElm);
                }
                break;
        }

    };
    Director.getInstance().addObserver(this,"fileSave",this.save);
    Director.getInstance().addObserver(this,"filePaste",this.paste);
    Director.getInstance().addObserver(this,"fileCopy",this.copy);
    Director.getInstance().addObserver(this,"fileCut",this.cut);

    Director.getInstance().addObserver(this,"fileUndo",this.undo);
    Director.getInstance().addObserver(this,"fileRedo",this.redo);
}

UIProject.instance = null;

UIProject.getInstance = function(){
    if(UIProject.instance === null){
        UIProject.instance = new UIProject();
    }
    return UIProject.instance;
};

function UIData(){
    this.id = 0;
    this.elmJsonMap = {};
    this.actionList = [new UIAction()];
    this.actionIndex = 0;
    this.bindClassName = "";


    this.autoResize = 0;
    this.width = 600;
    this.height = 400;
    this.backcolor = "FFFFFF";

    this.getViewXValue = function(value,type){
        var res = value;
        switch (type){
            case PosTypeX_Right:
                res = this.width - value;
                break;

            case PosType_Percentage:
                if(value>100){
                    value = 100;
                }
                if(value<0){
                    value=0;
                }
                res = this.width*value/100;
                break;
        }

        return res;
    };

    this.getViewYValue = function(value,type){
        var res = value;
        switch (type){
            case PosTypeY_Bottom:
                res = this.height - value;
                break;

            case PosType_Percentage:
                if(value>100){
                    value = 100;
                }
                if(value<0){
                    value=0;
                }
                res = this.height*value/100;
                break;
        }

        return res;
    };

    this.getPosXValue = function(value,type){
        var res = value;
        switch (type){
            case PosTypeX_Right:
                res = this.width - value;
                break;

            case PosType_Percentage:
                if(value>this.width){
                    value = this.width;
                }
                if(value<0){
                    value=0;
                }
                res = Math.round(100*value/this.width);
                break;
        }

        return res;
    };

    this.getPosYValue = function(value,type){
        var res = value;
        switch (type){
            case PosTypeY_Bottom:
                res = this.height - value;
                break;
            case PosType_Percentage:
                if(value>this.height){
                    value = this.height;
                }
                if(value<0){
                    value=0;
                }
                res = Math.round(100*value/this.height);
                break;
        }
        return res;
    };

    this.loadJson = function(obj){
        this.id = obj.id;
        this.elmJsonMap = obj.elmJsonMap;
        this.actionList = obj.actionList;
        this.actionIndex = obj.actionIndex;
        this.bindClassName = obj.bindClassName;
        this.fileName = obj.fileName;
        if(obj.width || obj.height || obj.backcolor){
            if(obj.width) {
                this.width = obj.width;
            }
            if(obj.height) {
                this.height = obj.height;
            }
            if(obj.backcolor){
                this.backcolor = obj.backcolor;
            }
        }
        if(obj.autoResize){
            this.autoResize = obj.autoResize;
        }
    };
}

function UIFile(){
    UIData.call(this);
    UIProject.getInstance().uiFileNum++;
    this.id = UIProject.getInstance().uiFileNum;
    this.fileName = "uiFile"+this.id;

    this.getCurrentAction = function(){
        return this.actionList[this.actionIndex];
    }
    this.getHtml = function(){
        var res = "<table>";
        res += "<tr><td>uiId:</td><td>"+this.id+"</td></tr>";
        res += "<tr><td>名称:</td><td><input type='text' id='fileName' value='"+this.fileName+"' onchange='UIProject.getInstance().changeFile(this);'/></td></tr>";
        res += "<tr><td>class:</td><td><input type='text' id='bindClassName' value='"+this.bindClassName+"' onchange='UIProject.getInstance().changeFile(this);'/></td></tr>";

        if(this.autoResize===false){

            res += "<tr><td>自适应:</td><td><input type='checkbox' id='autoResize' onchange='UIProject.getInstance().changeFile(this);'/></td></tr>";

            res += "<tr><td>宽:</td><td><input type='text' id='width' value='"+this.width+"' onchange='UIProject.getInstance().changeFile(this);'/></td></tr>";
            res += "<tr><td>高:</td><td><input type='text' id='height' value='"+this.height+"' onchange='UIProject.getInstance().changeFile(this);'/></td></tr>";


        }else{
            res += "<tr><td>自适应:</td><td><input type='checkbox' id='autoResize' checked onchange='UIProject.getInstance().changeFile(this);'/></td></tr>";
        }



        res += "<tr><td>颜色:</td><td><input type='text' id='backcolor' value='"+this.backcolor+"' onchange='UIProject.getInstance().changeFile(this);'/></td></tr>";

        res += "</table>";

        return res;
    };

    this.getChange = function(divObj){

        if(divObj.id=="autoResize") {
            this[divObj.id]=document.getElementById("autoResize").checked;

        }else{
            this[divObj.id] = divObj.value;

            if(divObj.id=="width" || divObj.id=="height" || divObj.id=="backcolor"){
                Director.getInstance().postMsg("updateSceneSize");
            }
        }

    };
    this.destroy = function(){
        UIProject.getInstance().currentEditor.removeAll();
    };
}
function UIAction(){
    this.actionName = "default";
    this.actionTime = 65;
    this.interval = 1;
}

