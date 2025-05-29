function singleton(className) {
    let _instance;
    const proxy = new Proxy(className, {
        construct(target, args) {
            if (!_instance) {
                _instance = Reflect.construct(target, args);
            }
            return _instance;
        }
    });
    return proxy;
}
module.exports = singleton;
