function Layout(width,height){
  PIXI.Graphics.call(this);

  this.beginFill(0x9999ff,1);
  this.drawRect(0,0,width,height-500);
  this.endFill();

  this.timeLine = new PIXI.Graphics();
  this.timeLine.beginFill(0xffffff,1);
  this.timeLine.drawRect(0,0,width-250,20);
  this.timeLine.endFill();

  this.cursor = new Cursor(height-500);
  this.timeLine.addChild(this.cursor);

  this.content = new PIXI.Container();

    var self = this;
  this.timeLine.x = 250;

  this.addChild(this.content);
  this.content.y = 20;
  this.addChild(this.timeLine);
  function cursorComplete(view){
    var frame = Math.round((view.x-5)/10);
    view.x = frame*10+5;

    Director.getInstance().postMsg("selectFrame",frame);
  }
    function cursorMove(view){
        var frame = Math.round((view.x-5)/10);
        Director.getInstance().postMsg("selectFrame",frame);
    }
  function frameClick(frame){
      self.cursor.x = frame*10+5;

      Director.getInstance().postMsg("selectFrame",frame);
  }
  ScrollDragManager.getInstance().addDragObj(this.content,width,height-500-50);


    var dragObj;
    dragObj = DragManager.getInstance().addDragObj(this.cursor, cursorComplete, width - 250, 0);
    dragObj.moveCallBack = cursorMove;


    this.scrollTop = function(){
        this.content.y = 20;
    }
  this.updateView = function(arr){

    for(var key in arr){
      arr[key].layer.y = key*35;
      arr[key].updateLayer();

    }
  };

  Director.getInstance().addObserver(this,"frameClick",frameClick);
}
Layout.prototype = Object.create(PIXI.Graphics.prototype);


function Cursor(height){
  PIXI.Container.call(this);
  this.block = new PIXI.Graphics();
  this.block.beginFill(0,1);
  this.block.drawRect(-5,0,10,20);
  this.block.endFill();
  this.x = 5;
  this.line  = new PIXI.Graphics();
  this.block.beginFill(0,1);
  this.block.drawRect(-2,0,4,height);
  this.block.endFill();

  this.addChild(this.block);
  this.addChild(this.line);


}
Cursor.prototype = Object.create(PIXI.Container.prototype);

function Layer(elmObj){
  PIXI.Graphics.call(this);
  this.beginFill(0x000000,1);
  this.drawRect(0,0,850,35);
  this.endFill();


    this.setSelect = function(value){
        this.clear();
        if(value){
            this.beginFill(0xff0000,1);
        }else{
            this.beginFill(0x000000,1);
        }
        this.drawRect(0,0,850,35);
        this.endFill();
    };
  this.layerClick = function (){
      Director.getInstance().postMsg("layerClick",elmObj,1);
  };

  this.hiddenClick = function (){
      Director.getInstance().postMsg("layerClick",elmObj,2);
  };

  this.lockClick = function (){
      Director.getInstance().postMsg("layerClick",elmObj,3);
  };

  this.moveClick = function (){
      Director.getInstance().postMsg("layerClick",elmObj,4);
  };
    this.enterClick = function (){
        Director.getInstance().postMsg("layerClick",elmObj,5);
    };

  this.button = new SimpleButton("图层",this.layerClick);
  this.addChild(this.button);

  this.hiddenButton = new SimpleButton("隐藏",this.hiddenClick);
  this.addChild(this.hiddenButton);
  this.hiddenButton.x = 100;

  this.lockButton = new SimpleButton("上锁",this.lockClick);
  this.addChild(this.lockButton);
  this.lockButton.x = 150;

  this.moveButton = new SimpleButton("下移",this.moveClick);
  this.addChild(this.moveButton);
  this.moveButton.x = 200;

    /*
    var enterButton = new SimpleButton("进入",this.enterClick);
    this.addChild(enterButton);
    enterButton.x = 200;
    */

  this.timeLine = new TimeLine();
  this.addChild(this.timeLine);
  this.timeLine.x = 250;
  this.timeLine.y = 2;

  this.setTitle = function(str){
    this.button.setTitle(str);
  };
  this.removeFromParent = function(){
    if(this.parent){
      this.parent.removeChild(this);
    }
  };
  this.updateView = function(obj){
      this.button.setTitle(obj.instName);
      this.timeLine.updateKeyPoint(obj);
  };

}
Layer.prototype = Object.create(PIXI.Graphics.prototype);

function TimeLine(){
  PIXI.Container.call(this);
  this.list = [];

  for(var i=0;i<60;i++){
    var view = new FrameView(i);
      this.list.push(view);
      view.x = i*10;
      this.addChild(view);
      this.addChild(view.keyPoint);
  }

    this.updateKeyPoint = function(elm){

        for(var i=1;i<60;i++){
            this.list[i].setKeyPoint(0);
            if(i>UIProject.getInstance().currentUI.getCurrentAction().actionTime){
                this.list[i].visible=false;
            }else{
                this.list[i].visible=true;
            }
        }
        if(elm.frameSetList.hasOwnProperty(UIProject.getInstance().currentUI.actionIndex)) {
            var list = elm.frameSetList[UIProject.getInstance().currentUI.actionIndex];
            for (var key in list) {
                if(list[key].b_continue){
                    this.list[list[key].frame].setKeyPoint(2);
                }else{
                    this.list[list[key].frame].setKeyPoint(1);
                }

            }
        }
    };

}
TimeLine.prototype = Object.create(PIXI.Container.prototype);

function FrameView(frame){
    PIXI.Container.call(this);
    var back = new PIXI.Graphics();
    this.addChild(back);
    if(frame%2===0) {
        back.beginFill(0x999999, 1);
    }else{
        back.beginFill(0xeeeeee, 1);
    }
    back.drawRect(0,0,10,30);
    back.endFill();

    this.keyPoint = new PIXI.Graphics();
    this.keyPoint.beginFill(0x0,1);
    this.keyPoint.drawCircle(0,0,5);
    this.keyPoint.endFill();

    this.addChild(this.keyPoint);
    this.keyPoint.x = 5+frame*10;
    this.keyPoint.y = 5;

    this.setKeyPoint = function(value){

        this.keyPoint.clear();
        if(value===0){

            DragManager.getInstance().removeDrag(this.keyPoint);
            return ;
        }
        if(value==1){
            this.keyPoint.beginFill(0x000000,1);
        }else if(value==2){
            this.keyPoint.beginFill(0xff0000,1);
        }
        this.keyPoint.drawCircle(0,0,5);
        this.keyPoint.endFill();

        DragManager.getInstance().addDragObj(this.keyPoint,keyPointDragOver);

    };

    function keyPointDragOver(view){
        var res = view.x;
        view.x = 5+frame*10;
        view.y = 5;
        Director.getInstance().postMsg("keyPointDrag",frame,res);
    }


    this.interactive = true;
    this.on("mousedown",function(e){
        e.stopPropagation();
        Director.getInstance().postMsg("frameClick",frame);
    });

}
FrameView.prototype = Object.create(PIXI.Container.prototype);

