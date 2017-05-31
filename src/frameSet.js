function FrameSet(frame){

    this.frame = frame;
    this.width = 0;
    this.height = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.b_continue = 0;
    this.posX = 0;
    this.posY = 0;
    this.alpha = 1;
    this.visible = 1;

    this.resName = null;

    this.changeFrame = function(obj,elm){

        var value;
        switch(obj.id){
            case "f_width":
                this.width = parseInt(document.getElementById("f_width").value);
                elm.content.width = this.width;
                this.scaleX = elm.content.scale.x;
                break;
            case "f_height":
                this.height = parseInt(document.getElementById("f_height").value);
                elm.content.height = this.height;
                this.scaleY = elm.content.scale.y;
                break;
            case "f_scaleX":
                this.scaleX = parseFloat(document.getElementById("f_scaleX").value);
                elm.content.scale = new PIXI.Point(this.scaleX, this.scaleY);
                this.width = elm.content.width;
                break;
            case "f_scaleY":
                this.scaleY = parseFloat(document.getElementById("f_scaleY").value);
                elm.content.scale = new PIXI.Point(this.scaleX, this.scaleY);
                this.height = elm.content.height;
                break;
            case "f_x":
                this.posX = parseInt(document.getElementById("f_x").value);
                break;
            case "f_y":
                this.posY = parseInt(document.getElementById("f_y").value);
                break;
            case "f_alpha":
                this.alpha = parseFloat(document.getElementById("f_alpha").value);
                break;
            case "f_continue":
                value = document.getElementById("f_continue").checked;
                if(value===true) {
                    this.b_continue=1;
                }else{
                    this.b_continue=0;
                }
                break;

            case "f_visible":
                value = document.getElementById("f_visible").checked;
                if(value===true) {
                    this.visible=1;
                }else{
                    this.visible=0;
                }
                break;
            case "f_rotation":
                this.rotation = parseInt(document.getElementById("f_rotation").value);
                break;
            case "f_resName":
                var div = document.getElementById("f_resName");
                if(div){
                    this.resName = div.value;
                }
                break;
        }
    };

    this.getJson = function(){
        var obj = this.getObject();

        return JSON.stringify(obj);
    };
    this.getObject = function(elm){
        var obj = {};
        obj.frame = this.frame;
        obj.width = this.width;
        obj.height = this.height;
        obj.scaleX = this.scaleX;
        obj.scaleY = this.scaleY;
        obj.rotation = this.rotation;
        obj.b_continue = this.b_continue;
        if(elm) {
            var posX;
            var posY;
            if(UIProject.getInstance().currentUI){
                posX = UIProject.getInstance().currentUI.getViewXValue(elm.posX,elm.PosTypeX);
                posY = UIProject.getInstance().currentUI.getViewYValue(elm.posY,elm.PosTypeY);
            }else{
                posX = UIManager.getInstance().currentFile.getViewXValue(elm.posX,elm.PosTypeX);
                posY = UIManager.getInstance().currentFile.getViewYValue(elm.posY,elm.PosTypeY);

            }



            obj.posX = posX + this.posX;
            obj.posY = posY + this.posY;


        }else{
            obj.posX = this.posX;
            obj.posY = this.posY;
        }
        obj.visible = this.visible;
        obj.alpha = this.alpha;
        obj.resName = this.resName;

        return obj;

    };

    this.setJson = function(obj){
        this.width = obj.width;
        this.height = obj.height;
        this.scaleX = obj.scaleX;
        this.scaleY = obj.scaleY;
        this.rotation = obj.rotation;
        this.b_continue = obj.b_continue;
        this.posX = obj.posX;
        this.posY = obj.posY;
        this.resName = obj.resName;
        this.visible = obj.visible;
        this.alpha = obj.alpha;
    };
}