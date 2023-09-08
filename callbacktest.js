let Objeto = function(var1,var2,callback){
    this.var1 = var1;
    this.var2 = var2;
    this.callback = callback();
}

function miCB(a,b) {
    console.log('3');
}
// miCB(400,20);

let miObjeto = new Objeto(1,2,miCB);

miObjeto.callback;