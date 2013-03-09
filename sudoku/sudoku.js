(function() {
    
    // 数独方块的位置信息
    var BOXOFINDEX = [
        0, 0, 0, 1, 1, 1, 2, 2, 2,
        0, 0, 0, 1, 1, 1, 2, 2, 2,
        0, 0, 0, 1, 1, 1, 2, 2, 2,
        3, 3, 3, 4, 4, 4, 5, 5, 5,
        3, 3, 3, 4, 4, 4, 5, 5, 5,
        3, 3, 3, 4, 4, 4, 5, 5, 5,
        6, 6, 6, 7, 7, 7, 8, 8, 8,
        6, 6, 6, 7, 7, 7, 8, 8, 8,
        6, 6, 6, 7, 7, 7, 8, 8, 8];

    // 方块的初始index
    var BOXTOINDEX = [0, 3, 6, 27, 30, 33, 54, 57, 60];

    // 全部数字
    var ALLDIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // 迭代
    var upto = function(start, end, cb) {
        for (var i = start; i <= end; i++) {
            cb(i);
        }
    };

    // array 去掉 items 中有的元素
    var cut = function(array, items) {
        var result = array.slice(0),
        index;
        for (var i = 0; i < items.length; i++) {
            index = result.indexOf(items[i]);
            while (index != - 1) {
                result.splice(index, 1);
                index = result.indexOf(items[i]);
            }
        }
        return result;
    };


    // 拼接，但不重复
    var append = function() {
        var result = [];
        var items, item;
        var i = j = 0;
        for (; i < arguments.length; i++) {
            items = arguments[i];
            for (j = 0; j < items.length; j++) {
                item = items[j];
                if (result.indexOf(item) == - 1) {
                    result.push(item);
                }
            }
        }
        return result;
    };

    var removeClass = function(el, className) {
        var classNames = el.className.split(' ');
        for(var i = 0; i < classNames.length; i++) {
            if(classNames[i] == className) {
                classNames.splice(i, 1);
                break;
            }
        }
        el.className = classNames.join(' ');
    };

    var addClass = function(el, className) {
        removeClass(el, className);
        el.className += ' ' + className;
    };

    var addEvent = function(el, type, fn) {
        if(el.addEventListener) {
            el.addEventListener(type, fn, false);
        } else if(el.attachEvent) {
            el.attachEvent('on' + type, false);
        } else {
            // el['on' + type] = fn;
            return;
        }
    };

    var simpleDelegate = function(el, type, tagName, fn) {
        addEvent(el, type, function(e) {
            e = e || window.event;
            var el = e.srcElement || e.target;
            if(el.nodeName.toLowerCase() == tagName) {
                fn.call(el, e);
            }
        });
    };

    function Puzzle(array) {
        var result = [];
        for (var i = 0; i < array.length; i++) {
            result.push(array[i].join(''));
        }
        this.grid = result.join('').split('');
    }

    Puzzle.prototype = {
        constructor: Puzzle,

        dup: function() {
            var temp = new Puzzle([]);
            temp.grid = this.grid.slice(0);
            return temp;
        },

        getValue: function(row, col) {
            return this.grid[row * 9 + col];
        },

        setValue: function(row, col, value) {
            if ('0123456789'.indexOf(value) != - 1) {
                this.grid[row * 9 + col] = value;
            }
        },

        // 对每个未知的空格执行cb
        eachUnkown: function(cb) {
            var self = this;
            upto(0, 8, function(row) {
                upto(0, 8, function(col) {
                    index = row * 9 + col;
                    if (self.grid[index] == 0) {
                        cb(row, col, BOXOFINDEX[index]);
                    }
                });
            });
        },

        show: function() {
            var result = [];
            var self = this;
            upto(0, 8, function(i) {
                result.push(self.grid.slice(i * 9, i * 9 + 9));
            });
            return result;
        },

        hasRepeat: function(array) {
            var cache = {};
            var temp;
            for (var i = 0; i < array.length; i++) {
                temp = array.slice(0);
                temp.splice(i, 1);
                if (temp.indexOf(array[i]) != - 1) {
                    return true;
                }
            }
            return false;
        },

        // 是否错误
        hasDuplicates: function() {
            var self = this;
            this.upto(0, 8, function(index) {
                var rowdigits = this.rowdigits(index);
                var coldigits = this.coldigits(index);
                var boxdigits = this.boxdigits(index);
                if (self.hasRepeat(rowdigits) || self.hasRepeat(coldigits) || self.hasRepeat(boxdigits)) {
                    return true;
                }
            });

            return false;
        },

        // 可能的值
        possible: function(row, col, box) {
            return cut(ALLDIGITS, append(this.rowdigits(row), this.coldigits(col), this.boxdigits(box)));
        },

        // 返回指定行的值
        rowdigits: function(row) {
            var result = this.grid.slice(row * 9, row * 9 + 9);
            return cut(result, ['0']);
        },

        // 返回指定列的值
        coldigits: function(col) {
            var result = [];
            var self = this;
            upto(0, 8, function(row) {
                result.push(self.getValue(row, col));
            });
            return cut(result, ['0']);
        },

        // 返回指定块的值
        boxdigits: function(box) {
            var grid = this.grid;
            var index = BOXTOINDEX[box];
            var result = [
            grid[index], grid[index + 1], grid[index + 2], grid[index + 9], grid[index + 10], grid[index + 11], grid[index + 18], grid[index + 19], grid[index + 20]];
            return cut(result, ['0']);
        }
    }

    // 找出可能性最小的一个
    // 如果只有一个可能性，则一直循环到解决数独
    var scan = function(puzzle) {
        var change = true;

        while (change) {
            var rmin = cmin = pmin = null;
            var min = 10;
            var possible;
            change = false;

            puzzle.eachUnkown(function(row, col, box) {
                possible = puzzle.possible(row, col, box);
                switch (possible.length) {
                case 0:
                    change = false;
                    rmin = cmin = pmin = 'impossible';
                    break;
                case 1:
                    puzzle.setValue(row, col, possible[0]);
                    change = true; // 已经解决一个，可以重新开始遍历
                    break;
                default:
                    if (!change && possible.length < min) {
                        min = possible.length;
                        rmin = row;
                        cmin = col;
                        pmin = possible;
                    }
                }
            });
        }

        return [rmin, cmin, pmin];
    };

    // 解数独入口
    function solve(puzzle) {
        var puzzleDup = puzzle.dup();
        var result = scan(puzzleDup);
        return guess(puzzleDup, result[0], result[1], result[2]);
    };

    // 猜猜看
    function guess(puzzle, row, col, possible) {
        var result = [];

        if (row == 'impossible') {
            return result;
        } else if (row == null) {
            result.push(puzzle.show());
            return result;
        }

        for (var i = 0; i < possible.length; i++) {
            var puzzleDup = puzzle.dup();
            var item = possible[i];
            puzzleDup.setValue(row, col, item);
            result = append(result, solve(puzzleDup));
        }
        return result;
    };

    // 解数独
    function Sudoku(option) {
        var $ = function(id) {
            return document.getElementById(id);
        }

        this.option = {
            container: $('container'),
            selection: $('selection'),
            solution: $('solution'),
            resolve: $('resolve'),
            clear: $('clear'),
            array: ['800000000'.split(''), '003600000'.split(''), '070090200'.split(''), '050007000'.split(''), '000045700'.split(''), '000100030'.split(''), '001000068'.split(''), '008500010'.split(''), '090000400'.split('')]
        };

        for (var key in option) {
            if (option.hasOwnProperty(key)) {
                this.option[key] = option[key];
            }
        }

        this.initCanvas(this.option.container, this.option.array);
        this.puzzleItems = Array.prototype.slice.call(this.option.container.getElementsByTagName('LI'));
        this.puzzle = new Puzzle(this.option.array);
    }

    Sudoku.prototype = {
        constructor: Sudoku,

        initCanvas: function(ele, array) {
            var html = ['<ul>'];
            var className = '';
            var value;
            for (var y = 0; y < 9; y++) {
                for (var x = 0; x < 9; x++) {
                    value = getValue(x, y);
                    className = x == 8 ? y == 8 ? 'border-right border-bottom' : 'border-right' : y == 8 ? 'border-bottom' : '';
                    if (className != '' || value != '0') {
                        className = 'class="' + className + (value == 0 ? '' : ' has') + '"';
                    }
                    html.push('<li data-y="' + y + '" data-x="' + x + '" ' + className + '>' + value + '</li>');
                }
            }
            html.push('</ul>');

            function getValue(x, y) {
                return array && array[y] && array[y][x] ? array[y][x] : 0;
            }

            html = html.join('');
            if (ele) {
                ele.innerHTML = html;
            } else {
                return html;
            }
        },

        initSelection: function(ele, array) {
            if (!array || array.length == 0) {
                ele.innerHTML = '无解';
                return;
            }

            var html = ['<ul>'];
            var length = array.length;
            var v;
            upto(0, array.length - 1, function(i) {
                v = array[i];
                html.push('<li data-value="' + v + '" class="border-bottom' + (i == length - 1 ? ' border-right' : '') + '">' + v + '</li>');
            });

            ele.innerHTML = html.join('');
        },

        getSameNodes: function(x, y) {
            var items = this.puzzleItems;
            var index = BOXTOINDEX[BOXOFINDEX[y * 9 + x]];
            // 行
            var result = items.slice(y * 9, y * 9 + 9);

            // 列
            upto(0, 8, function(y) {
                result.push(items[y * 9 + x]);
            });

            // 块
            result = result.concat([
            items[index], items[index + 1], items[index + 2], items[index + 9], items[index + 10], items[index + 11], items[index + 18], items[index + 19], items[index + 20]]);

            return result;
        },

        clearAll: function() {
            var self = this;
            this.option.array = new Array(9);
            upto(0, 8, function(index) {
                self.option.array[index] = new Array(10).join('0').split('');
            });
            this.puzzle = new Puzzle(this.option.array);
            this.initCanvas(this.option.container);
            this.puzzleItems = Array.prototype.slice.call(this.option.container.getElementsByTagName('LI'));
            this.option.selection.innerHTML = '';
            this.option.solution.innerHTML = '';
        },

        addEvent: function() {
            var nodes = [];
            var x, y, last;
            var self = this;

            // 标志
            simpleDelegate(this.option.container, 'mouseover', 'li', function() {
                var x = +this.getAttribute('data-x');
                var y = +this.getAttribute('data-y');
                nodes = self.getSameNodes(x, y);
                upto(0, nodes.length - 1, function(i) {
                    addClass(nodes[i], 'special');
                });
            });

            // 取消标志
            simpleDelegate(this.option.container, 'mouseout', 'li', function() {
                upto(0, nodes.length - 1, function(i) {
                    removeClass(nodes[i], 'special');
                });
                nodes = [];
            });

            // 点击
            simpleDelegate(this.option.container, 'click', 'li', function() {
                x = +this.getAttribute('data-x');
                y = +this.getAttribute('data-y');

                // 列出可能的选项
                var possible = self.puzzle.possible(y, x, BOXOFINDEX[y * 9 + x]);
                possible.unshift('0');
                self.initSelection(self.option.selection, possible);

                // 加色
                last && removeClass(last, 'select');
                addClass(this, 'select');
                last = this;
            });

            // 选中
            simpleDelegate(this.option.selection, 'click', 'li', function() {
                if (!last || (!x && x != 0) || (!y && y != 0)) {
                    return;
                }

                // 设定值
                var value = this.getAttribute('data-value');
                last.innerHTML = value;
                self.puzzle.setValue(y, x, value);
                removeClass(last, 'select');
                if (value == '0') {
                    removeClass(last, 'has');
                } else {
                    addClass(last, 'has');
                }
            });

            // 解答
            addEvent(this.option.resolve, 'click', function() {
                var str = self.puzzle.grid.join('').replace(/0/g, '');
                if (str.length < 18) {
                    alert('至少输入18个数字');
                    return;
                }

                var result = solve(self.puzzle);
                str = result.length == 0 ? '无解,呵呵' : '';
                upto(0, result.length - 1, function(i) {
                    str += self.initCanvas(null, result[i]);
                });
                self.option.solution.innerHTML = str;
            });

            // 清空
            addEvent(this.option.clear, 'click', function() {
                self.clearAll();
            });
        }
    }

    window.Sudoku = Sudoku;
})();