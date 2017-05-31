function  SelectDragManager(){
  this.maxID = 1;
  
  this.enabled = true;

  this.addDragObj = function(event,target,cb){
    var dragObj = new DragObject();
    dragObj.id = this.maxID;
    dragObj.target = target;
    dragObj.callBack = cb;
    
    this.maxID++;
  
    this.packageEvent(dragObj,event);
  };
  this.removeEvent = function(dragObj){
    dragObj.target.interactive = false;
    dragObj.target.buttonMode = false;
    dragObj.target.removeListener('mouseup');
  };

  this.packageEvent = function(dragObj,event){
    var self = dragObj;

    dragObj.target.interactive = true;
    dragObj.target.buttonMode = true;
    
		
		dragObj.target.alpha=0.8;
   	dragObj.posX = dragObj.target.x;
	  dragObj.posY = dragObj.target.y;
   	dragObj.eventData = event.data;
    var pt = event.data.getLocalPosition(self.target.parent);
   	dragObj.mouseX = pt.x;
	  dragObj.mouseY = pt.y;
     

		dragObj.target.on('mousemove',onMove);


    dragObj.target.on('mouseup',function onMouseUp(event){
        self.target.alpha = 1;
        self.eventData = null;
        self.target.removeListener('mousemove',onMove);
        SelectDragManager.getInstance().removeEvent(self);
        self.dragComplete();
        dragObj = null;
    });
    
    function onMove(event){
			var pt = event.data.getLocalPosition(this.parent);

			if(self.eventData){
				self.target.x = self.posX+pt.x - self.mouseX;
				self.target.y = self.posY+pt.y - self.mouseY;
      }

    }
  };
}
SelectDragManager.instance = null;

SelectDragManager.getInstance = function(){
  if(SelectDragManager.instance===null){
    SelectDragManager.instance = new SelectDragManager();
  }
  return SelectDragManager.instance;
};