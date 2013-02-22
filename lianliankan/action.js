/*
 * Author:huaxin.huang
 * CreateTime:2012.5.1
 */
(function () {
    var target = [], //存储选择的方块
    targetData = [], //储存选择的方块的信息
    data = [], //存储所有方块信息
    hasCount = 0, //已经消除的方块数目
    note = [], //储存提示信息,note[0]起始点,note[1]终止点,note[2]连接路径
    lboxCount = {
        x: 0, y: 0
    },
    pboxCount = {
        x: 0, y: 0
    },
    DISTANCE = { X: 0, Y: 1, N: 2 },
    $ = function (id) {
        if (typeof id == 'string') {
            return document.getElementById(id);
        }
    },
    each = function (object, callback) {
        var i = 0,
            length = object.length,
            isArray = !(length === undefined) && object instanceof Array && object.pop;
        if (isArray) {
            for (i = length - 1; i >= 0; ) {
                if (callback.call(object, i, object[i--]) === false) {
                    break;
                }
            }
        }
    },
    addEvent = function (element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + type, handler);
        }
        else {
            element['on' + type] = handler
        }
    },
    getStyleValue = function (element, property) {
        if (document.defaultView) {
            return document.defaultView.getComputedStyle(element, null)[property];
        }
        else if (element.currentStyle) {
            return element.currentStyle[property];
        }
        else {
            return element.style[property];
        }
    },
    getEventTarget = function (e) {
        if (e.target) {
            return e.target;
        }
        else if (e.srcElement) {
            return e.srcElement;
        }
        return;
    },
    // 有bug,但够用
    addClass = function (element, name) {
        if (element.className) {
            element.className += ' ' + name;
        }
        else {
            element.className = name;
        }
    },
    removeClass = function (element, name) {
        if (element.className) {
            var all = element.className.split(' ');
            for (var i = 0; i < all.length; i++) {
                if (all[i] == name || all[i] == '') all.splice(i, 1);
            }
            element.className = all.join(' ');
        }
    },
    clearArray = function (array) {
        while (array.length) {
            array.pop();
        }
    },
    compare = {
        max: function (a, b) {
            // return a > b ? a : b;
            return Math.max(a, b);
        },
        min: function (a, b) {
            // return a < b ? a : b;
            return Math.min(a, b);
        },
        dif: function (a, b) {
            return a > b ? a - b : b - a;
        }
    },
    createUl = function (obj, ulId, isPic) {
        var ul = document.createElement('UL'),
            i = j = 0,
            li = '',
            img = '',
            temp;
        ul.id = ulId;
        if (isPic) {
            ul.style.width = obj.xCount * obj.length + 'px';
            ul.style.height = obj.yCount * obj.length + 'px';
            ul.style.left = obj.length / 2 + obj.border / 2 + 'px';
            ul.style.top = obj.length / 2 + obj.border / 2 + 'px';
        }
        else {
            ul.style.width = obj.xCount * (obj.length + obj.border) + obj.border + 'px';
            ul.style.height = obj.yCount * (obj.length + obj.border) + obj.border + 'px';
        }
        for (; j < obj.yCount; j++) {
            for (; i < obj.xCount; i++) {
                li = document.createElement('LI');
                li.id = ulId + j + '_' + i;
                if (isPic) {
                    temp = data[point2data([j, i])];
                    if (temp || temp == 0) {
                        img = document.createElement('IMG');
                        img.style.width = obj.length + 'px';
                        img.style.height = obj.length + 'px';
                        img.src = 'image/' + temp + '.gif';
                        li.appendChild(img);
                    }
                }
                else {
                    addClass(li, 'top');
                    addClass(li, 'left');
                    if (i == obj.xCount - 1) addClass(li, 'right');
                    if (j == obj.yCount - 1) addClass(li, 'bottom');
                }
                li.style.width = obj.length + 'px';
                li.style.height = obj.length + 'px';
                ul.appendChild(li);
            }
            i = 0;
        }
        li = null;
        img = null;
        return ul;
        //obj.ground.appendChild(ul);
    },
    //创建游戏所需的信息
    createData = function (total, typeCount, allTypeCount, remain) {
        var type = [], //存储方块的类型信息count=total/2,
            count = total / 3,
            temp1 = temp2 = i = 0;
        data.length = total;

        type.length = compare.min(temp1 = compare.min(count, typeCount), allTypeCount);
        if (temp1 >= allTypeCount) {
            each(type, function (i, v) { this[i] = i; });
        }
        else {
            temp1 = [];
            temp1.length = allTypeCount;
            each(temp1, function (i, v) { this[i] = i; });
            each(type, function (i, v) {
                temp2 = Math.floor(Math.random() * temp1.length)
                this[i] = temp1[temp2];
                temp1.splice(temp2, 1);
            });
            clearArray(temp1);
        }

        remain = remain || [];
        if (remain.length == 0) {
            remain.length = total;
            each(remain, function (i, v) {
                this[i] = i;
            });
        }
        if (remain.length > total) {
            remain.length = total;
        }
        //创建图片位置信息，图片总数为 MIN(位置总数,给定位置总数)
        total = compare.min(total, remain.length);
        for (; i < total && remain.length > 0; i++) {
            temp1 = Math.floor(Math.random() * remain.length);
            if (i < type.length) {
                data[remain[temp1]] = type[i];
                remain.splice(temp1, 1);

                temp1 = Math.floor(Math.random() * remain.length);
                data[remain[temp1]] = type[i];
                remain.splice(temp1, 1);
            }
            else {
                temp2 = Math.floor(Math.random() * type.length);

                data[remain[temp1]] = type[temp2];
                remain.splice(temp1, 1);

                temp1 = Math.floor(Math.random() * remain.length);
                data[remain[temp1]] = type[temp2];
                remain.splice(temp1, 1);
            }
        };
    },
    //坐标变换
    big2small = function (bPoint) {
        return [2 * (bPoint[0] + 1), 2 * (bPoint[1] + 1)];
    },
    small2big = function (sPoint) {
        var result = [];
        if (sPoint[0] > 1 && sPoint[1] > 1 && !(sPoint[0] % 2) && !(sPoint[1] % 2)) {
            result.push(sPoint[0] / 2 - 1);
            result.push(sPoint[1] / 2 - 1);
        }
        else {
            console.log('error smallPoint:' + sPoint);
        }
        return result;
    },
    point2data = function (point) {
        return point[0] * pboxCount.x + point[1];
    },
    data2point = function (index) {
        return [Math.floor(index / pboxCount.x), index % pboxCount.x]
    },
    samePoint = function (point1, point2) {
        if (point1.length != point2.length) return false;
        var result = true, i = 0;
        for (; i < point1.length && result; i++) {
            result = result && point1[i] == point2[i];
        }
        return result;
    },
    //判断该点是否可以通过，flag为true时表示从左到右/从上到下
    canCross = function (sPoint, distance, flag) {
        var result = false,
            step = flag ? 1 : -1,
            point = sPoint.slice(0),
            index;

        if (sPoint[0] == 0 || sPoint[1] == 0 || sPoint[0] == lboxCount.y || sPoint[1] == lboxCount.x) {
            return true;
        }
        switch (distance) {
            case DISTANCE.X:
                if (point[1] % 2) {
                    point[1] += step;
                    if (point[1] == 0 || point[1] == lboxCount.x) point[1] -= 2 * step;
                }
                break;
            case DISTANCE.Y:
                if (point[0] % 2) {
                    point[0] += step;
                    if (point[0] == 0 || point[0] == lboxCount.y) point[0] -= 2 * step;
                }
                break;
        }
        point = small2big(point);
        index = point2data(point);
        if (data[index] != 0) return !data[index];
        else return false;
    },

    //获取链接路径
    getCrossPoints = function (start, end) {
        var x, y;
        start = big2small(start);
        end = big2small(end);

        //同一水平线上
        if (start[0] == end[0]) {
            return solutionX(start, end).turn;
        }
        //同一垂直线上
        else if (start[1] == end[1]) {
            return solutionY(start, end).turn;
        }
        else {
            x = solutionX(start, end);
            y = solutionY(start, end);
            return x.length < y.length ? x.turn : y.turn;
        }

        function solutionX(start, end) {
            var turn = [], length = Infinity, dif = 0, y;
            for (y = 0; y <= lboxCount.y; y += 2) {
                if (canAllCross([y, start[1]], [y, end[1]], DISTANCE.X, !samePoint([y, start[1]], start), !samePoint([y, end[1]], end))) {
                    if (canAllCross([y, start[1]], start, DISTANCE.Y, true, false) && canAllCross([y, end[1]], end, DISTANCE.Y, true, false)) {
                        dif = compare.dif(y, start[0]) + compare.dif(y, end[0]);
                        if (length > dif) {
                            length = dif;
                            turn = [start, [y, start[1]], [y, end[1]], end];
                        }
                    }
                }
            }
            return { turn: turn, length: length };
        }

        function solutionY(start, end) {
            var turn = [], length = Infinity, dif = 0, x;
            for (x = 0; x <= lboxCount.x; x += 2) {
                if (canAllCross([start[0], x], [end[0], x], DISTANCE.Y, !samePoint([start[0], x], start), !samePoint([end[0], x], end))) {
                    if (canAllCross([start[0], x], start, DISTANCE.X, true, false) && canAllCross([end[0], x], end, DISTANCE.X, true, false)) {
                        dif = compare.dif(x, start[1]) + compare.dif(x, end[1]);
                        if (length > dif) {
                            length = dif;
                            turn = [start, [start[0], x], [end[0], x], end];
                        }
                    }
                }
            }
            return { turn: turn, length: length };
        }

        //判断两个坐标之间水平/垂直方向的方格是否都可以通过
        function canAllCross(start, end, distance, includeS, includeE) {
            var result = true,
                tempStart = start.slice(0),
                tempEnd = end.slice(0), //引用传递，进行深复制，避免影响外层
                tempX, tempY, from, to, temp;
            switch (distance) {
                case DISTANCE.X:
                    if (start[1] > end[1]) {
                        tempStart = end.slice(0);
                        tempEnd = start.slice(0);
                        temp = includeS;
                        includeS = includeE;
                        includeE = temp;
                    }
                    from = includeS ? tempStart[1] : tempStart[1] + 2;
                    to = includeE ? tempEnd[1] : tempEnd[1] - 2;
                    for (tempX = from; tempX <= to && result; tempX += 2) {
                        result = result && canCross([tempStart[0], tempX], distance, start[1] < end[1]);
                    }
                    break;
                case DISTANCE.Y:
                    //确保start不在end下面
                    if (start[0] > end[0]) {
                        tempStart = end.slice(0);
                        tempEnd = start.slice(0);
                        temp = includeS;
                        includeS = includeE;
                        includeE = temp;
                    }
                    from = includeS ? tempStart[0] : tempStart[0] + 2;
                    to = includeE ? tempEnd[0] : tempEnd[0] - 2;
                    for (tempY = from; tempY <= to && result; tempY += 2) {
                        result = result && canCross([tempY, tempStart[1]], distance, start[0] < end[0]);
                    }
                    break;
            }
            return result;
        }
    },

    //展现连接效果
    showLink = function (solution, points) {
        var array = solution.slice(0);
        if (samePoint(array[2], array[3])) {
            array.pop();
        }
        if (samePoint(array[0], array[1])) {
            array.shift();
        }
        var i = 0,
            distance;

        for (i = 0; i < array.length - 1; i++) {
            distance = array[i][0] == array[i + 1][0] ? DISTANCE.X : DISTANCE.Y;
            draw(array[i], array[i + 1], distance, i != 0, i != array.length - 2, points);
        }

        function draw(start, end, distance, includeS, includeE, points) {
            var x, y, startX, endX, startY, endY, step;
            switch (distance) {
                case DISTANCE.X:
                    step = start[1] < end[1] ? 1 : -1;
                    startX = includeS ? (start[1] < end[1] ? start[1] : start[1] + step) : start[1] + (start[1] < end[1] ? step : step * 2);
                    endX = includeE ? (start[1] < end[1] ? end[1] - step : end[1]) : end[1] - (start[1] < end[1] ? step * 2 : step);
                    if (start[0] < lboxCount.y) {
                        for (x = startX; x * step <= endX * step; x += step) {
                            addClass($('lineUl' + start[0] + '_' + x), 'specialTop');
                            points.push([$('lineUl' + start[0] + '_' + x), 'specialTop']);
                        }
                    }
                    else {
                        for (x = startX; x * step <= endX * step; x += step) {
                            addClass($('lineUl' + (start[0] - 1) + '_' + x), 'specialBottom');
                            points.push([$('lineUl' + (start[0] - 1) + '_' + x), 'specialBottom']);
                        }
                    }
                    break;
                case DISTANCE.Y:
                    step = start[0] < end[0] ? 1 : -1;
                    startY = includeS ? (start[0] < end[0] ? start[0] : start[0] + step) : start[0] + (start[0] < end[0] ? step : step * 2);
                    endY = includeE ? (start[0] < end[0] ? end[0] - step : end[0]) : end[0] - (start[0] < end[0] ? step * 2 : step);
                    if (start[1] < lboxCount.x) {
                        for (y = startY; y * step <= endY * step; y += step) {
                            addClass($('lineUl' + y + '_' + start[1]), 'specialLeft');
                            points.push([$('lineUl' + y + '_' + start[1]), 'specialLeft']);
                        }
                    }
                    else {
                        for (y = startY; y * step <= endY * step; y += step) {
                            addClass($('lineUl' + y + '_' + (start[1] - 1)), 'specialRight');
                            points.push([$('lineUl' + y + '_' + (start[1] - 1)), 'specialRight']);
                        }
                    }
                    break;
            }
        }
    },
    //隐藏连接效果
    hideLink = function (points, target, timer, isDisappear) {
        setTimeout(function () {
            each(points, function (i, v) {
                removeClass(v[0], v[1]);
                this.pop(); //清空points
            });
            //连接操作之后还原状态
            each(target, function (i, v) {
                removeClass(v, 'focus');
                isDisappear && addClass(v, 'disappear');
                target.pop();
            });
        }, timer);
    },
    //连接操作
    link = function (target) {
        var temp = target.slice(0), //深复制
            point1 = str2num(/(\d+)_(\d+)/.exec(temp[0].id).slice(1)),
            point2 = str2num(/(\d+)_(\d+)/.exec(temp[1].id).slice(1)),
            crossPoints = getCrossPoints(point1, point2),
            point = [],
            points = [];
        //可以连接
        if (crossPoints.length) {
            hasCount += 2;
            //如果操作中包含提示信息中的方块，则删除提示信息
            if (note.length) {
                if (samePoint(note[0], point1) || samePoint(note[0], point2) || samePoint(note[1], point1) || samePoint(note[1], point2)) {
                    each(note, function (i, v) {
                        clearArray(this[i]);
                    })
                    clearArray(note);
                }
            }
            showLink(crossPoints, points);

            //将方块信息设为undefined
            each([0, crossPoints.length - 1], function (i, v) {
                point = small2big(crossPoints[v]);
                data[point2data(point)] = undefined;
            });

            hideLink(points, temp, 100, true);

            clearArray(crossPoints);
        }
        else {
            //不能连接还原状态
            removeClass(temp[0], 'focus');
            removeClass(temp[1], 'focus');
        }

        //将数组中的元素转为Number类型
        function str2num(array) {
            each(array, function (i, v) { this[i] = parseInt(v); });
            return array;
        }
    },
    //点击效果
    action = function (element) {
        var point = /(\d+)_(\d+)/.exec(element.id).slice(1),
            pd = data[point2data([parseInt(point[0]), parseInt(point[1])])]; //获取方块信息
        switch (target.length) {
            case 0:
                if (pd != 0 && !pd) return;
                target.push(element);
                targetData.push(pd);
                addClass(element, 'focus');
                break;
            case 1:
                //如果是隐藏块
                if ((pd != 0 && !pd) || pd != targetData[0]) {
                    removeClass(target[0], 'focus');
                    target.pop();
                    targetData.pop();
                    return;
                }
                if (target[0] == element) {
                    target.pop();
                    removeClass(element, 'focus');
                }
                else {
                    target.push(element);
                    addClass(element, 'focus');
                    //连接
                    link(target);
                    //清除所选操作
                    clearArray(target);
                }
                targetData.pop();
                break;
        }
    },
    //提示
    pointOut = function () {
        if (note.length) return;
        var i = 0,
            j = 0,
            crossPoint = [];
        for (; i < data.length - 1; i++) {
            if (data[i] == undefined) continue;
            for (j = i + 1; j < data.length; j++) {
                if (data[j] == undefined) continue;
                if (data[i] == data[j]) {
                    crossPoint = getCrossPoints(data2point(i), data2point(j));
                    if (crossPoint.length) {
                        note.push(data2point(i));
                        note.push(data2point(j));
                        note.push(crossPoint);
                        return;
                    }
                }
            }
        }
    },
    isDie = function () {
        pointOut();
        return !note.length;
    };
    
    function Game(obj) {
        this.obj = obj;
    }
    Game.prototype = {
        init: function () {
            //设置默认参数
            this.obj.ground = this.obj.ground || document.body;
            this.obj.xCount = this.obj.xCount || 11;
            this.obj.yCount = this.obj.yCount || 12;
            this.obj.length = this.obj.length || 50;
            this.obj.border = this.obj.border || 2;
            this.obj.typeCount = this.obj.typeCount || 10;
            this.obj.allTypeCount = this.obj.allTypeCount || this.obj.typeCount;

            if (this.obj.xCount * this.obj.yCount % 2) {
                this.obj.yCount -= 1;
            }
            setDefaultValue(this.obj, 'xCount', 11, 5, 20, 'xCount between 5 and 20,default value 11');
            setDefaultValue(this.obj, 'yCount', 12, 5, 20, 'yCount between 5 and 20,default value 12');
            setDefaultValue(this.obj, 'length', 50, 20, 80, 'length between 20 and 80,default value 50');
            setDefaultValue(this.obj, 'border', 2, 1, 5, 'border between 1 and 5,default value 2');
            setDefaultValue(this.obj, 'typeCount', 10, 1, this.obj.xCount * this.obj.yCount / 3, 'typeCount between 1 and total/2,default value 10');


            //保存参数
            pboxCount.x = this.obj.xCount;
            pboxCount.y = this.obj.yCount;
            lboxCount.x = 2 * (this.obj.xCount + 1);
            lboxCount.y = 2 * (this.obj.yCount + 1);
            //创建数据信息
            createData(this.obj.xCount * this.obj.yCount, this.obj.typeCount, this.obj.allTypeCount);
            //创建场地
            var This = this,
                tempObj = {
                    ground: This.obj.ground,
                    xCount: 2 * (This.obj.xCount + 1),
                    yCount: 2 * (This.obj.yCount + 1),
                    border: This.obj.border,
                    length: This.obj.length / 2 - This.obj.border
                };
            this.obj.ground.appendChild(createUl(tempObj, 'lineUl', false));
            this.obj.ground.appendChild(createUl(this.obj, 'playUl', true));

            //设置默认值
            function setDefaultValue(object, key, defaultValue, min, max, message) {
                if (object[key] < min || object[key] > max) {
                    console.log(message);
                    object[key] = defaultValue;
                }
            }
        },
        start: function () {
            //事件：响应选择图片
            addEvent(this.obj.ground, 'click', function (e) {
                e = e || window.event;
                var element = getEventTarget(e),
                    nodeName = element.nodeName.toLowerCase();
                if (nodeName == 'li' && element.id.toLowerCase().indexOf('play') != -1 || nodeName == 'img') {
                    while (nodeName != 'li') {
                        element = element.parentNode;
                        nodeName = element.nodeName.toLowerCase();
                    }
                    action(element);
                }
            })
        },
        showNote: function () {
            if (hasCount == data.length) {
                alert('再来一局吧！');
                return;
            }
            if (note.length || (pointOut(), note.length)) {
                var points = [],
                    star = $('playUl' + note[0][0] + '_' + note[0][1]),
                    end = $('playUl' + note[1][0] + '_' + note[1][1]);
                showLink(note[2], points);
                addClass(star, 'focus');
                addClass(end, 'focus');
                hideLink(points, [star, end], 800, false);
            }
            else {
                alert('貌似进死胡同了!');
            }
        },
        reload: function () {
            if (hasCount == data.length) {
                alert('再来一局吧！');
                return;
            }
            //清除保存数据
            clearArray(target);
            clearArray(targetData);
            clearArray(note);
            do {
                quickReload();
            }
            while (isDie());
            //替换图片
            this.obj.ground.replaceChild(createUl(this.obj, 'playUl', true), $('playUl'));

            function quickReload() {
                var temp = [],
                    remain = [],
                    i = 0;
                for (; i < data.length; i++) {
                    remain.push(i);
                    if (!data[i] && data[i] != 0) continue;
                    temp.push(data[i]);
                    data[i] = undefined;
                }
                each(temp, function (i, v) {
                    i = Math.floor(Math.random() * remain.length);
                    data[remain[i]] = v;
                    remain.splice(i, 1);
                });
                temp = null;
                remain = null;
            }
        },
        show: function () {

        }
    }

    window.Game = Game;
})();