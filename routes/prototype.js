const Parent = (function(){
    function Parent(name){
        this.name = name;
    }

    Parent.prototype.sayHi = function(){
        console.log('Hi! ' + this.name);
    }

    return Parent;
}());


let child = Object.create(Parent.prototype);
child.name = 'child';
child.sayHi();

console.log(child instanceof Parent);