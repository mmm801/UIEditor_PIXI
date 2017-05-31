function DragObject(){
  this.target=null;
  this.callBack = null;
  this.moveCallBack = null;
  this.posX =-1;
  this.posY = -1;
  this.eventData = null;
  this.mouseX = -1;
  this.mouseY = -1;

  this.dragWidth = -1;
  this.dragHeight = -1;
  this.maxWidth = -1;
  this.maxHeight = -1;
  this.downTime = 0;

  this.sourceX = -1;
  this.sourceY = -1;
  this.scrollSpdx = 0;
  this.scrollSpdy = 0;

  this.dragMask = null;
  

  this.dragComplete = function(){
    if(this.callBack){
      this.callBack(this.target);
    }
  }
  
}
