
function ScrollDragManager(){
  this.maxID = 1;
  this.dragPool= [];
  

  this.enabled = true;

  this.checkDragObj = function(target){
    for(var key in this.dragPool){
      if(this.dragPool[key].target == target){
        return this.dragPool[key];
      }
    }
    return null;
  };
  this.addDragObj = function(target,dragWidth,dragHeight){

    
    var dragObj = this.checkDragObj(target);
    
    
    if(dragObj===null){
      dragObj = new DragObject();
      dragObj.id = this.maxID;
      dragObj.target = target;
      dragObj.dragWidth = dragWidth;
      dragObj.dragHeight = dragHeight;

      dragObj.sourceX = target.x;
      dragObj.sourceY = target.y;
      this.dragPool.push(dragObj);
      this.maxID++;
  
      this.packageEvent(dragObj);
    }else{
      dragObj.sourceX = target.x;
      dragObj.sourceY = target.y;
    }
    if(dragObj.dragMask===null) {
      dragObj.dragMask = new PIXI.Graphics();
      dragObj.dragMask.beginFill(0xff0000, 1);
      dragObj.dragMask.drawRect(0, 0, dragWidth, dragHeight);
      dragObj.dragMask.endFill();
      dragObj.target.parent.addChild(dragObj.dragMask);
      dragObj.target.mask = dragObj.dragMask;

    }else{
      dragObj.dragMask.clear();
      dragObj.dragMask.drawRect(0, 0, dragWidth, dragHeight);
      dragObj.dragMask.endFill();
    }
    dragObj.dragMask.x = target.x;
    dragObj.dragMask.y = target.y;
    
  };
  this.removeDrag = function(target){
      var dragObj = null;
      for(var key in this.dragPool){
        if(this.dragPool[key].target==target){
          dragObj = this.dragPool[key];
          if(dragObj.dragMask && dragObj.dragMask.parent){
            dragObj.dragMask.parent.removeChild(dragObj.dragMask);
          }
          dragObj.dragMask = null;
          this.dragPool.splice(key,1);
          this.removeEvent(dragObj);
          break;
        }
      }
  };
  this.removeEvent = function(dragObj){
    dragObj.target.interactive = false;
    dragObj.target.buttonMode = false;
    dragObj.target.removeListener('mouseup');
    dragObj.target.removeListener('mousedown');
  };
  var zindex = -1;
  this.packageEvent = function(dragObj){
    var self = dragObj;

    dragObj.target.interactive = true;
    dragObj.target.buttonMode = true;




    dragObj.target.on('mousedown',function onMouseDown(event){
      event.stopPropagation();

    
      if(self.enabled===false){
        return ;
      }
      //zindex = self.target.parent.getChildIndex(self.target);
      //self.target.parent.addChild(self.target);
      var pt = event.data.getLocalPosition(self.target.parent);
			//self.target.alpha=0.8;
   		self.posX = self.target.x;
	   	self.posY = self.target.y;
   		self.eventData = event.data;

   		self.mouseX = pt.x;
	   	self.mouseY = pt.y;
      self.scrollSpdx=0;
      self.scrollSpdy=0;

      self.downTime = new Date().getTime();
      self.maxWidth = self.target.width - self.dragWidth;
      self.maxHeight = self.target.height - self.dragHeight;


      self.target.on('mousemove',onMove);

    });

    dragObj.target.on('mouseup',function onMouseUp(event){
        event.stopPropagation();

        self.eventData = null;
        self.target.removeListener('mousemove',onMove);
        //self.target.parent.addChildAt(self.target,zindex);
        var pt = event.data.getLocalPosition(this.parent);
        
        var dx = self.mouseX-pt.x;
        var dy = self.mouseY-pt.y;

        var time = (new Date().getTime()-self.downTime)/20;
        if(time<100){
        //console.log(dx,dy,time);

          self.scrollSpdx=dx/time;
          self.scrollSpdy=dy/time;
          scrollAnimate();
        }
    });
    
    dragObj.target.on('mouseout',function onMouseUp(event){
        event.stopPropagation();
        self.target.alpha = 1;
        self.eventData = null;
        self.target.removeListener('mousemove',onMove);
        //self.target.parent.addChildAt(self.target,zindex);
      }
    );

    function onMove(event){
      event.stopPropagation();
      

      var pt = event.data.getLocalPosition(this.parent);
      if(self.eventData){
        self.target.x = self.posX+pt.x - self.mouseX;
        self.target.y = self.posY+pt.y - self.mouseY;

        

        if(self.target.y<dragObj.sourceY-self.maxHeight){
          self.target.y=dragObj.sourceY-self.maxHeight;
        }
        if(self.target.y>dragObj.sourceY){
          self.target.y=dragObj.sourceY;
        }

        if(self.target.x<dragObj.sourceX-self.maxWidth){
          self.target.x=dragObj.sourceX-self.maxWidth;
        }
        if(self.target.x>dragObj.sourceX){
          self.target.x=dragObj.sourceX;
        }
      }
    }

    function scrollAnimate(){

      self.target.y-=self.scrollSpdy;
      if(self.scrollSpdy>0){
        self.scrollSpdy-=0.1;
      }else{
        self.scrollSpdy+=0.1;
      }

      self.target.x-=self.scrollSpdx;
      if(self.scrollSpdx>0){
        self.scrollSpdx-=0.1;
      }else{
        self.scrollSpdx+=0.1;
      }
      
      var isOver = false;
      if(self.target.y<dragObj.sourceY-self.maxHeight){
        self.target.y=dragObj.sourceY-self.maxHeight;
        isOver = true;
      }
      if(self.target.y>dragObj.sourceY){
         self.target.y=dragObj.sourceY;
         isOver = true;
      }

      if(self.target.x<dragObj.sourceX-self.maxWidth){
        self.target.x=dragObj.sourceX-self.maxWidth;
        isOver = true;
      }
      if(self.target.x>dragObj.sourceX){
        self.target.x=dragObj.sourceX;
        
        isOver = true;
      }
      if((Math.abs(self.scrollSpdx)+Math.abs(self.scrollSpdy))<1){
        isOver = true;
      }
      if(isOver === false){
        requestAnimationFrame(scrollAnimate);
      }
    }
  };
}

ScrollDragManager.instance = null;

ScrollDragManager.getInstance = function(){
  if(ScrollDragManager.instance===null){
    ScrollDragManager.instance = new ScrollDragManager();
  }
  return ScrollDragManager.instance;
};