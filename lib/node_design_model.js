//#Node Design Pattern
// 1. Single Tone
// 2. Factory
const HamAndMushroomPizza = () =>{
    let price = 50.8;
    this.getPrice = () => {
        return price;
    }
};

const DeluxePizza = () => {
    let price = 30.8;
    this.getPrice = () => {
        return price;
    }
};

const SeafoodPizza = () => {
    var price = 11.50;
    this.getPrice = function(){
        return price;
    }
};

//Pizza Factory
const PizzaFactory = () => {
    this.createPizza = function(type){
        switch(type){
            case "Ham and Mushroom":
                return new HamAndMushroomPizza();
            case "DeluxePizza":
                return new DeluxePizza();
            case "Seafood Pizza":
                return new SeafoodPizza();
            default:
                return new DeluxePizza();
        }
    };
};

//Usage
let pizzaPrice = new PizzaFactory().createPizza("Ham and Mushroom").getPrice();
console.log(pizzaPrice);
// 3. Proxy
// - 정의 : 다른 객체에 대한 접근을 제어하는 객체.
// 프록시는 일반적으로 다른 어떤 클래스의 인터페이스로 동작하는 클래스이다. 요컨대, 프록시는 내부적으로 "실제의 객체(Real Object)"에
// 접근할 때 호출되는 래퍼(wrapper) 또는 대리 객체이다.
// - 예시
// - 새로운 function 을 추가하고 싶지만, Side effect 때문에 쉽게 수정 불가. 그럴 경우, 대리 객체를 생성해
const PhoneBook = () => {
    this.dictionary = {
        '유진호' : '01077777777',
        '한예슬' : '01012345678',
        '전지현' : '01088888888'
    };
};

PhoneBook.prototype.get = (name, callback) =>{
    let self = this;
    setTimeout(() => {
        callback(self.dictionary[name]);
    }, 3000)
};

const PhoneBookProxy = () => {
    let phoneBook = new PhoneBook();
    let viewCount = 0;

    return {
        get : (name, callback) => {
            viewCount++;
            phoneBook.get(name,callback);
        },
        getViewCount : () => {
            return viewCount;
        }
    }
}


//4. Observer pattern
// - 정의 : 각 모듈의 중간에서 서로의 상태 변화를 관찰하는 관찰자 객체를 만드는 것
let observer = {
    handlers : {},   // 각 모듈에서 등록할 핸들러들을 담아둘 내부 변수를 선언한다.

    // 상태변화 이벤트가 발생하면 실행될 이벤트를 등록하는 함수를 작성한다.
    // 핸들러 등록 시 context를 함께 전달받아 내부에서 this를 사용 시
    // 적절한 컨텍스트에서 실행될 수 있도록 한다.
    register : (eventName, handler, context) => {
        // 해당 이벤트로 기존에 등록된 이벤트들이 있는지 확인한다.
        let handlerArray = this.handlers[eventName];
        if(handlerArray === undefined){
            // 신규 이벤트라면 새로운 배열을 할당한다.
            // 핸들러를 바로 넣지 않고 배열을 할당하는 이유는
            // 한 이벤트에 여러 개의 핸들러를 등록할 수 있도록 하기 위함.
            handlerArray = this.handlers[eventName] = [];
        }

        //전달받은 핸들러와 컨텍스트를 해당 이벤트의 핸들러배열에 추가 한다.
        handlerArray.push({
            handler : handler,
            context : context
        });
    },

    unregister : (eventName, handler, context) => {
        let handlerArray = this.handlers[eventName];
        if(handlerArray === undefined)
            return;

        // 삭제할 핸들러와 컨텍스트를 배열에서 찾는다.
        for(let hidx = 0; hidx < handlerArray.length; hidx++){
            let currentHandler = handlerArray[hidx];

            // 찾았다면 배열에서 삭제하고 함수를 종료한다.
            if(handler == currentHandler['handler']
            && context == currentHandler['context']){
                handlerArray.splice(hidx,1);
                return;
            }
        }
    },

    // 특정 상태가 변했을 때 이벤트를 통보할 함수를 작성한다.
    notify : (eventName, data) => {
        // 통보된 이벤트에 등록된 핸들러가 있는지 확인한다.
        let handlerArray = this.handlers[eventName];
        if(handlerArray === undefined)
            return;

        // 핸들러 배열에 등록 되어있는 핸들러들을 하나씩 꺼내 전달받은 데이터와 함께 호출한다.
        for(let hidx = 0; i<handlerArray.length; i++){
            let currentHandler = handlerArray[hidx];
            currentHandler['handler'].call(currentHandler['context'], data);
            // 전달받은 함수를 바로 호출하지 않고 call을 사용하여 호출하는 이유는
            // 미리 등록시 함께 전달된 context 객체를 함수 내부에서 this로 사용 할 수 있게끔
            // 함수 내부로 전달하기 위함이다.
            // javascript 에서 this 를 사용할 때는 상당히 주의해야 한다.
        }

    }
}; // Observer Object 작성한다.

const Person = () => {

};
let boss = new Person();
let manager = new Person();
let programmer = new Person();

boss.speak = (comment) => {
    console.log(comment);
    observer.notify('bossSpeak', comment);
};

manager.listen = (comment) => {
    this.bossComment = comment;
};

observer.register('bossSpeak',manager.listen, manager);

programmer.drop = (comment) => {
    return comment;
};

observer.register('bossSpeak',programmer.drop, programmer);