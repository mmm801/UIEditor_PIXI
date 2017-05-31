
function EditController() {


    var actionList = [];
    var actionIndex = 0;

    this.rollBack = function(){
        actionIndex--;
    }

    this.rollNext = function(){
        actionIndex++;
    }

    this.addAction = function(json){
        if(actionList.length!=actionIndex) {
            actionList.splice(actionIndex , actionList.length - actionIndex);
        }

        actionList.push(json);
        actionIndex++;

    }
    function keyDown(event) {
        var keycode = event.keyCode;


        if((event.ctrlKey || event.metaKey) && keycode ==83){
            
            Director.getInstance().postMsg("fileSave");
            event.preventDefault();
            return false;
        }

        if((event.ctrlKey || event.metaKey) && event.shiftKey==false && keycode ==90){
            if(actionIndex>0){
                actionIndex--;
                Director.getInstance().postMsg("fileUndo",actionList[actionIndex]);
            }

            event.preventDefault();
            return false;
        }

        if((event.ctrlKey || event.metaKey) && event.shiftKey && keycode ==90){

            if(actionIndex<actionList.length){
                Director.getInstance().postMsg("fileRedo",actionList[actionIndex]);
                actionIndex++;
            }

            event.preventDefault();
            return false;
        }


    }

    document.onkeydown = keyDown;

    window.onload = function(){
        document.body.addEventListener('paste',function(event){
            var event = event || window.event;

            Director.getInstance().postMsg("filePaste",event);
            event.preventDefault();
            return false;
        });

        document.body.addEventListener('cut',function(event){
            var event = event || window.event;

            Director.getInstance().postMsg("fileCut",event);
            event.preventDefault();
            return false;
        });
        document.body.addEventListener('copy',function(event){
            var event = event || window.event;

            Director.getInstance().postMsg("fileCopy",event);
            event.preventDefault();
            return false;
        });
    }

}

EditController.instance = null;

EditController.getInstance = function(){
    if(EditController.instance===null){
        EditController.instance = new EditController();
    }
    return EditController.instance;
}