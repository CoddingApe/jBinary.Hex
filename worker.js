(function (define) {
    function _require(index) {
        var module = _require.cache[index];
        if (!module) {
            var exports = {};
            module = _require.cache[index] = {
                id: index,
                exports: exports
            };
            _require.modules[index].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            importScripts('//s3.amazonaws.com/es6-promises/promise-1.0.0.min.js');
            var msgHandlers = _require(1);
            addEventListener('message', function (event) {
                var message = event.data;
                Promise.resolve(message.data).then(msgHandlers[message.type]).then(function (data) {
                    postMessage({
                        id: message.id,
                        data: data
                    });
                }, function (error) {
                    postMessage({
                        id: message.id,
                        error: {
                            name: error.name,
                            message: error.message,
                            stack: error.stack
                        }
                    });
                });
            });
        },
        function (module, exports) {
            importScripts('//jdataview.github.io/dist/jdataview.js', '//jdataview.github.io/dist/jbinary.js');
            var whenBinary;
            exports.handleFile = function (file) {
                whenBinary = jBinary.load(file);
                return whenBinary.then(function (binary) {
                    return binary.read('blob');
                });
            };
            exports.parse = function (sourceCode) {
                var module = {};
                new Function('require', 'module', 'exports', sourceCode)(function (name) {
                    return {
                        jdataview: jDataView,
                        jbinary: jBinary
                    }[name];
                }, module, module.exports = {});
                return whenBinary.then(function (binary) {
                    return binary.as(module.exports).readAll();
                });
            };
            exports.cleanUp = function () {
                whenBinary = undefined;
            };
        }
    ];
    _require(0);
}());