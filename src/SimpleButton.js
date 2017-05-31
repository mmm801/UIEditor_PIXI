function SimpleButton(title,func){
  PIXI.Graphics.call(this);
  
  var style = {
    font:"bold 12pt Arial",
    fill:'#fff',
    align:'center'
  };

  this.txtTitle = new PIXI.Text(title,style);
  this.txtTitle.x = 10;
  this.txtTitle.y = 10;
  this.addChild(this.txtTitle);

  this.setTitle = function(title){
    this.txtTitle.text = title;
    this.updateView();
  };

  this.updateView = function(){
    //this.beginFill(0x000000,1);
    //this.drawRect(0,0,this.txtTitle.width+20,35);
    //this.endFill();
  };
  this.updateView();

  if(func) {
    this.interactive = true;
    this.buttonMode = true;
    this.on("click", func);
  }
}
SimpleButton.prototype = Object.create(PIXI.Graphics.prototype);

