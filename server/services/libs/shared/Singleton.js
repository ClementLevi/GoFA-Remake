function singleton(className){
    let _instance;
    const proxy = new Proxy(className, {
        construct(target, args) {
            if (_instance) { return _instance; }
            _instance = Reflect.construct(target, args);
            return _instance;
        }
    });
    proxy.prototype.constructor = proxy;
    return proxy;
}
module.exports = singleton;