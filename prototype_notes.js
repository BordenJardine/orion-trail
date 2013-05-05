var Entity = function() {
    this.x = 'Hello world!';
    
    this.f = function() {
        alert(this.x);
    };
};

var Cat = function() {
    this.x = 'meow';    
};

var newEntity = function(object) {
    object.prototype = new Entity();
    return new object();
};
   
ramsdell = newEntity(Cat);
ramsdell.f();

e = new Entity();
e.f();
