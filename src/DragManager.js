
function DragManager(){

  this.maxID = 1;
  this.dragPool = [];
  

  this.enabled = true;

  this.addDragObj = function(target,cb,dragWidth,dragHeight){
    var dragObj = new DragObject();
    dragObj.id = this.maxID;
    dragObj.target = target;
    dragObj.callBack = cb;

    if(dragWidth!=undefined){
      dragObj.dragWidth = dragWidth;
    }
    if(dragHeight!=undefined){
      dragObj.dragHeight = dragHeight;
    }

    this.maxID++;
    this.dragPool.push(dragObj);
    this.packageEvent(dragObj);
    return dragObj;
  };
  this.removeDrag = function(target){
      var dragObj = null;
      for(var key in this.dragPool){
        if(this.dragPool[key].target==target){
          dragObj = this.dragPool[key];
          this.dragPool.splice(key,1);
          this.removeEvent(dragObj);
          break;
        }
      }
      
  };



  this.removeEvent = function(dragObj){
    dragObj.target.interactive = false;
    dragObj.target.buttonMode = false;

    dragObj.target.removeListener('mousedown');
  };
  
  this.packageEvent = function(dragObj){
    var self = dragObj;

    dragObj.target.interactive = true;
    dragObj.target.buttonMode = true;

    var zindex = -1;
    dragObj.target.on('mousedown',function onMouseDown(event){
      event.stopPropagation();

    
      if(self.enabled==false){
        return ;
      }
      zindex = self.target.parent.getChildIndex(self.target);

      self.target.parent.addChild(self.target);
      var pt = event.data.getLocalPosition(self.target.parent);
      self.target.alpha=0.5;
   		self.posX = self.target.x;
	   	self.posY = self.target.y;
   		self.eventData = event.data;

   		self.mouseX = pt.x;
	   	self.mouseY = pt.y;
      

        self.target.on('mousemove',onMove);
        self.target.on('mouseup',onMouseUp);
        document.body.addEventListener("mouseup", onMouseUp);


    });


    //dragObj.target.on('mouseout',onMouseUp);
    function onMouseUp(event){
      event.stopPropagation();
      dragObj.target.alpha = 1;
      dragObj.eventData = null;
      dragObj.target.removeListener('mousemove',onMove);
      dragObj.target.removeListener('mouseup',onMouseUp);
      document.body.removeEventListener("mouseup",onMouseUp);
      dragObj.target.parent.addChildAt(self.target,zindex);

      dragObj.dragComplete();
    }


    function onMove(event){
      event.stopPropagation();
      var pt = event.data.getLocalPosition(this.parent);
      if(self.eventData){
        if(self.dragWidth == -1 || self.dragHeight == -1) {
          self.target.x = self.posX + pt.x - self.mouseX;
          self.target.y = self.posY + pt.y - self.mouseY;
        }else{
          var xx = pt.x - self.mouseX;
          var yy = pt.y - self.mouseY;


          self.target.x = self.posX+xx;
          self.target.y = self.posY+yy;

          if(self.target.x>self.dragWidth){
            self.target.x = self.dragWidth;
          }else if(self.target.x<0){
            self.target.x=0;
          }
          if(self.target.y>self.dragHeight){
            self.target.y = self.dragHeight;
          }else if(self.target.y<0){
            self.target.y=0;
          }
        }
      }
      if(self.moveCallBack!=null){
        self.moveCallBack(self.target);
      }
    }
  }
}

DragManager.instance = null;

DragManager.getInstance = function(){
  if(DragManager.instance==null){
    DragManager.instance = new DragManager();
  }
  return DragManager.instance;
}
