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
            var ChunkItem = _require(1);
            module.exports = React.createClass({
                displayName: 'exports',
                shouldComponentUpdate: function (props) {
                    var oldPosition = this.props.position, newPosition = props.position, from = props.offset, to = from + this.props.delta;
                    return oldPosition >= from && oldPosition < to || newPosition >= from && newPosition < to;
                },
                render: function () {
                    var items = [], formatter = this.props.formatter, formatterName = this.props.formatterName, position = this.props.position, data = this.props.data;
                    for (var i = this.props.offset, maxI = Math.min(this.props.data.length, i + this.props.delta); i < maxI; i++) {
                        items.push(ChunkItem({
                            data: this.props.data,
                            key: i,
                            offset: i,
                            position: position,
                            formatter: formatter,
                            formatterName: formatterName,
                            onClick: this.props.onItemClick
                        }));
                    }
                    return React.DOM.td({ className: formatterName + 'group' }, items);
                }
            });
        },
        function (module, exports) {
            module.exports = React.createClass({
                displayName: 'exports',
                shouldComponentUpdate: function (props) {
                    var oldPosition = this.props.position, newPosition = props.position, offset = this.props.offset;
                    return offset === oldPosition || offset === newPosition;
                },
                render: function () {
                    var offset = this.props.offset;
                    return React.DOM.span({
                        className: 'value ' + this.props.formatterName + (offset === this.props.position ? ' current' : ''),
                        'data-offset': offset,
                        onClick: this.props.onClick
                    }, this.props.formatter(this.props.data[offset]));
                }
            });
        },
        function (module, exports) {
            var Chunk = _require(0);
            var toHex = _require(5).toHex;
            module.exports = React.createClass({
                displayName: 'exports',
                render: function () {
                    var rows = [], data = this.props.data, position = this.props.position, delta = this.props.delta;
                    if (data) {
                        for (var i = 0, length = data.length; i < length; i += delta) {
                            rows.push(React.DOM.tr({ key: i }, React.DOM.td({ className: 'offset' }, toHex(i, 8)), Chunk({
                                data: data,
                                position: position,
                                offset: i,
                                delta: delta,
                                formatter: function (data) {
                                    return toHex(data, 2);
                                },
                                formatterName: 'hex',
                                onItemClick: this.props.onItemClick
                            }), Chunk({
                                data: data,
                                position: position,
                                offset: i,
                                delta: delta,
                                formatter: function (data) {
                                    return data <= 32 ? ' ' : String.fromCharCode(data);
                                },
                                formatterName: 'char',
                                onItemClick: this.props.onItemClick
                            })));
                        }
                    }
                    return React.DOM.div({ className: 'binary-wrapper' }, React.DOM.table({
                        className: 'binary',
                        cols: delta
                    }, React.DOM.tbody(null, rows)));
                }
            });
        },
        function (module, exports) {
            var DataTable = _require(2);
            var toHex = _require(5).toHex;
            module.exports = React.createClass({
                displayName: 'exports',
                getInitialState: function () {
                    return {
                        data: null,
                        position: 0
                    };
                },
                handleItemClick: function (event) {
                    this.setState({ position: Number(event.target.dataset.offset) });
                },
                handleFile: function (event) {
                    this.setState(this.getInitialState());
                    jBinary.load(event.target.files[0]).then(function (binary) {
                        this.setState({
                            data: binary.read('blob'),
                            position: 0
                        });
                    }.bind(this));
                },
                render: function () {
                    var data = this.state.data, position = this.state.position;
                    return React.DOM.div({ className: 'editor' }, React.DOM.div({ className: 'toolbar' }, React.DOM.input({
                        type: 'file',
                        onChange: this.handleFile
                    }), React.DOM.div({
                        className: 'position',
                        style: { display: data ? 'block' : 'none' }
                    }, 'Position:' + ' ' + '0x', React.DOM.span(null, toHex(position, 8)), '(', React.DOM.span(null, position), ')')), DataTable({
                        data: data,
                        position: position,
                        delta: this.props.delta,
                        onItemClick: this.handleItemClick
                    }));
                }
            });
        },
        function (module, exports) {
            var Editor = _require(3);
            React.renderComponent(Editor({ delta: 32 }), document.body);
        },
        function (module, exports) {
            exports.toHex = function (number, length) {
                var s = number.toString(16).toUpperCase();
                while (s.length < length) {
                    s = '0' + s;
                }
                return s;
            };
        }
    ];
    _require(4);
}());