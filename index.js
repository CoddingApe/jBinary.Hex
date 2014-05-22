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
                displayName: 'Chunk',
                render: function () {
                    var items = [], formatter = this.props.formatter, formatterName = this.props.key, position = this.props.position, data = this.props.data, start = this.props.offset, end = Math.min(data.length, start + this.props.delta), onItemClick = this.props.onItemClick;
                    for (var i = start; i < end; i++) {
                        items.push(ChunkItem({
                            data: data[i],
                            key: i - start,
                            offset: i,
                            position: position,
                            formatter: formatter,
                            formatterName: formatterName,
                            onClick: onItemClick
                        }));
                    }
                    return React.DOM.td({ className: formatterName + 'group' }, items);
                }
            });
        },
        function (module, exports) {
            module.exports = function (props) {
                var offset = props.offset;
                return React.DOM.span({
                    className: 'value ' + props.formatterName + (offset === props.position ? ' current' : ''),
                    key: props.key,
                    'data-offset': offset,
                    onClick: props.onClick
                }, props.formatter(props.data));
            };
        },
        function (module, exports) {
            var Chunk = _require(0);
            var toHex = _require(5).toHex;
            var HEIGHT = 20;
            module.exports = React.createClass({
                displayName: 'DataTable',
                getInitialState: function () {
                    return { start: 0 };
                },
                onScroll: function (event) {
                    var newStart = Math.floor(event.target.scrollTop / HEIGHT);
                    if (newStart === this.state.start) {
                        return;
                    }
                    console.time('scroll');
                    this.setState({ start: newStart }, function () {
                        console.timeEnd('scroll');
                    });
                },
                componentWillReceiveProps: function (props) {
                    if (!props.data) {
                        return;
                    }
                    var delta = props.delta, line = Math.floor(props.position / delta), start = this.state.start, totalLines = Math.ceil(props.data.length / delta), end = Math.min(start + props.lines, totalLines);
                    if (line < start) {
                        this.setState({ start: line });
                    } else if (line >= end) {
                        this.setState({ start: start + (line - end) + 1 });
                    }
                },
                render: function () {
                    var rows = [], data = this.props.data, position = this.props.position, delta = this.props.delta;
                    var totalLines = 0;
                    if (data) {
                        totalLines = Math.ceil(data.length / delta);
                        for (var i = this.state.start, maxI = Math.min(this.state.start + this.props.lines, totalLines); i < maxI; i++) {
                            rows.push(React.DOM.tr({ key: i }, React.DOM.td({ className: 'offset' }, toHex(i * delta, 8)), Chunk({
                                data: data,
                                position: position,
                                offset: i * delta,
                                delta: delta,
                                formatter: function (data) {
                                    return toHex(data, 2);
                                },
                                key: 'hex',
                                onItemClick: this.props.onItemClick
                            }), Chunk({
                                data: data,
                                position: position,
                                offset: i * delta,
                                delta: delta,
                                formatter: function (data) {
                                    return data <= 32 ? ' ' : String.fromCharCode(data);
                                },
                                key: 'char',
                                onItemClick: this.props.onItemClick
                            })));
                        }
                    }
                    return React.DOM.div({
                        className: 'binary-wrapper',
                        style: { height: this.props.lines * HEIGHT },
                        scrollTop: this.state.start * HEIGHT,
                        onScroll: this.onScroll
                    }, React.DOM.table({
                        className: 'binary',
                        cols: delta
                    }, React.DOM.tbody(null, rows)), React.DOM.div({ style: { height: totalLines * HEIGHT } }));
                }
            });
        },
        function (module, exports) {
            var DataTable = _require(2);
            var toHex = _require(5).toHex;
            module.exports = React.createClass({
                displayName: 'Editor',
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
                    return React.DOM.div({
                        className: 'editor',
                        tabIndex: 0,
                        onKeyDown: this.onKeyDown
                    }, React.DOM.div({ className: 'toolbar' }, React.DOM.input({
                        type: 'file',
                        onChange: this.handleFile
                    }), React.DOM.div({
                        className: 'position',
                        style: { display: data ? 'block' : 'none' }
                    }, 'Position:' + ' ' + '0x', React.DOM.span(null, toHex(position, 8)), '(', React.DOM.span(null, position), ')')), DataTable({
                        data: data,
                        position: position,
                        delta: this.props.delta,
                        lines: this.props.lines,
                        onItemClick: this.handleItemClick
                    }));
                },
                onKeyDown: function (event) {
                    var data = this.state.data;
                    if (!data) {
                        return;
                    }
                    var delta = this.props.delta, lines = this.props.lines, pos = this.state.position, maxPos = data.length - 1;
                    switch (event.key) {
                    case 'ArrowUp':
                        pos -= delta;
                        if (pos < 0) {
                            return;
                        }
                        break;
                    case 'ArrowDown':
                        pos += delta;
                        if (pos > maxPos) {
                            return;
                        }
                        break;
                    case 'ArrowLeft':
                        pos--;
                        if (pos < 0) {
                            return;
                        }
                        break;
                    case 'ArrowRight':
                        pos++;
                        if (pos > maxPos) {
                            return;
                        }
                        break;
                    case 'PageUp':
                        pos = Math.max(pos - lines * delta, pos % delta);
                        break;
                    case 'PageDown':
                        pos += Math.min(lines, Math.floor((maxPos - pos) / delta)) * delta;
                        break;
                    case 'Home':
                        pos = event.ctrlKey ? 0 : pos - pos % delta;
                        break;
                    case 'End':
                        pos = event.ctrlKey ? maxPos : Math.min(maxPos, (Math.floor(pos / delta) + 1) * delta - 1);
                        break;
                    default:
                        return;
                    }
                    event.preventDefault();
                    this.setState({ position: pos });
                }
            });
        },
        function (module, exports) {
            var Editor = _require(3);
            React.renderComponent(Editor({
                delta: 32,
                lines: 20
            }), document.body);
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