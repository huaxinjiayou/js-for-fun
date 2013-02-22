(function() {
    var width = 10; //游戏区域的横向方格数
    var height = 20; //游戏区域的纵向方格数

    var oldarrayX = new Array(); //存储方块上一步的子块x坐标信息
    var oldarrayY = new Array(); //存储方块上一步的子块y坐标信息
    oldarrayX[0] = oldarrayX[1] = oldarrayX[2] = oldarrayX[3] = 0;
    oldarrayY[0] = oldarrayY[1] = oldarrayY[2] = oldarrayY[3] = 0;

    var myX = 4; //方块刚开始下落时的横坐标
    var myY = 3; //方块刚开始下落时的纵坐标
    var mytype; //方块的状态，1,2,3,4，后者为前者的逆时针状态
    var mycategory; //方块的种类，共6种
    var typeNext;//下一个方块的形状
    var categoryNext;//下一个方块的种类
    var oldmyX = myX;//方块变形前的x坐标值
    var oldmyY = myY; //方块变形前的y坐标值
    var oldmytype = 1; //方块变形前的形状
    var myInterval; //方块自动下落的定时
    var speed = 200; //方块下路速度
    var maxR; //方块x坐标的最大值

    var hasblockdown = 0; //判断是否是第一块方块
    var reborn = 1; //判断是否可以进行下一轮方块
    var isCanContinue; // 方块是否可以继续下落
    var isStar = 0; //游戏是否开始
    var isPause = -1; //游戏是否暂停
    var isEnd = 0;//游戏是否结束
    var tatalscore = 0;//分数
    var lis = {};//缓存元素

    var $ = function (id) { return document.getElementById(id); }
    var getLi = function (x, y) { return lis["li" + x + y]; }

    //创建游戏场地
    function createArea() {
        $("area").style.width = (21 * width + 1) + "px";
        var areaStr = "<ul class=\"ulblock\">";
        for (var i = 0; i < height + 3; i++) {
            for (var j = 0; j < width; j++) {
                if (i < 3) {
                    areaStr += "<li class=\"liblock\" id=\"li" + i + j + "\" style=\"display:none;\"></li>"
                    continue;
                }
                if (i == height + 2 && j == width - 1) {
                    areaStr += "<li class=\"liblock\" id=\"li" + i + j + "\" style=\"border-right:1px solid #666; border-bottom:1px solid #666;\"></li>";
                    continue;
                }
                if (j == width - 1) {
                    areaStr += "<li class=\"liblock\" id=\"li" + i + j + "\" style=\"border-right:1px solid #666;\"></li>";
                    continue;
                }
                if (i == height + 2) {
                    areaStr += "<li class=\"liblock\" id=\"li" + i + j + "\" style=\"border-bottom:1px solid #666;\"></li>";
                    continue;
                }
                areaStr += "<li class=\"liblock\" id=\"li" + i + j + "\"></li>"
            }
        }
        $("area").innerHTML = areaStr;
    }

    //创建下一块方块显示元素
    function createNextArea() {
        $("next").style.width = (21 * 4 + 1) + "px";
        var areaStr = "<span><strong>下一方块：</strong></span><br /><ul class=\"ulblock\">";
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                areaStr += "<li class=\"liblock\" id=\"nextli" + i + j + "\"></li>"
            }
        }
        areaStr += "</ul>";
        $("next").innerHTML = areaStr;
    }

    //元素缓存
    function liCache() {
        for (var i = 0; i < height + 3; i++) {
            for (var j = 0; j < width; j++) {
                lis["li" + i + j] = $("li" + i + j);
            }
        }
    }

    //注册事件 && 启动程序
    window.onload = function() {
        createArea();
        createNextArea();
        liCache();
        $("start").onclick = function () {
            isStar = 1;
            blockGo();
            $("start").style.display = "none";
        }
    }
    document.documentElement.onkeydown = function(e) {
        e = e || window.event;
        distanceKey(e);
    }

    //键盘按键中转处理
    function distanceKey(select) {
        if (select.keyCode == 32 && isStar == 1 && isEnd == 0) {
            isPause *= -1;
            if (isPause == -1) {
                $("note").innerHTML = "上：逆时针变换方块形状、下：使方块快速向下、空格：暂停或继续";
            }
            else {
                $("note").innerHTML = "游戏暂停中，按空格继续！";
            }
        }
        if (isStar == 1 && isPause==-1) {
            run(select.keyCode);
        }
    }

    //根据键盘按键执行相应的动作
    function run(distance) {
        //向上
        if (distance == 38) {
            var test = (mytype + 4) % 4 + 1;
            if (change(test) < 0 || nextRight(test) > width - 1) {
                return;
            }
            else {
                mytype = test;
                myX = change(mytype);
            }
        }
        //向左
        else if (distance == 37 && canLeft() == 1) {
            myX = (myX > 0) ? myX - 1 : myX;
        }
        //向右
        else if (distance == 39 && canRight() == 1) {
            myX = (GetMax(block(myX, myY, mycategory, mytype)[0]) < width - 1) ? myX + 1 : myX;
        }
        //向下
        else if (distance == 40) {
            clearInterval(myInterval);
            speed = 1;
            mysetTime();
        }
    }


    //方块自动下落
    function blockGo() {
        if (hasblockdown == 0) {
            mytype = parseInt(Math.random() * 4 + 1);
            mycategory = parseInt(Math.random() * 7 + 1);
            typeNext = parseInt(Math.random() * 4 + 1);
            categoryNext = parseInt(Math.random() * 7 + 1);
            var array = block(0, 3, categoryNext, typeNext);
            nextblockColor(array[0], array[1]);
            hasblockdown = 1;
        }
        else {
            mytype = typeNext;
            mycategory = categoryNext;
            typeNext = parseInt(Math.random() * 4 + 1);
            categoryNext = parseInt(Math.random() * 7 + 1);
            var array = block(0, 3, categoryNext, typeNext);
            nextblockColor(array[0], array[1]);
        }
        if (reborn == 1) {
            reborn = 0;
            mysetTime();
        }
    }

    //方块自动循环下落
    function mysetTime() {
        myInterval = setInterval(function () {
            if (isPause == -1) {
                move();
                oldmyY = myY;
                oldmyX = myX;
                oldmytype = mytype;
                myY++;
            }
            if (myY == height + 3 || isCanContinue == 0) {
                clearInterval(myInterval);
                createNextArea();
                speed = 200;
                var lines = Disappear();
                tatalscore = (lines == 0) ? tatalscore : tatalscore + 20 * lines - 10;
                $("score").innerHTML = tatalscore;
                isEnd = isFinished();
                if (isEnd != 1) {
                    myX = 4;
                    myY = 3;
                    oldmyX = myX;
                    oldmyY = myY;
                    clear();
                    reborn = 1;
                    blockGo();
                }
                else {
                    $("note").innerHTML = "游戏结束，按F5重新开始！";
                    $("note").style.display = "block";
                    alert("游戏结束，按F5重新开始！");
                }
            }
        }, speed);
    }

    //1:白色（方块的颜色），2：黑色
    function blockColor(color, arrayx, arrayy) {
        var color;
        switch (color) {
            case 1:
                color = "liblock blockbg";
                break;
            case 2:
                color = "liblock";
                break;
        }
        for (var i = 0; i < 4; i++) {
            getLi(arrayy[i], arrayx[i]).className = color;
        }
    }

    //下一个方块
    function nextblockColor(arrayx, arrayy) {
        for (var i = 0; i < 4; i++) {
            $("nextli" + arrayy[i] + arrayx[i]).className = "liblock blockbg";
        }
    }

    //方块移动
    function move() {
        var oldarray = block(oldmyX, oldmyY, mycategory, oldmytype);
        oldarrayX = oldarray[0];
        oldarrayY = oldarray[1];
        blockColor(2, oldarrayX, oldarrayY);
        var array = block(myX, myY, mycategory, mytype);
        blockColor(1, array[0], array[1]);
        isCanContinue = canContinue();
    }

    //清除数组存储的方块信息
    function clear() {
        var array = block(myX, myY, mycategory, mytype);
        arrayX = array[0];
        arrayY = array[1];
        arrayX[0] = arrayX[1] = arrayX[2] = arrayX[3] = 0;
        arrayY[0] = arrayY[1] = arrayY[2] = arrayY[3] = 0;
        oldarrayX[0] = oldarrayX[1] = oldarrayX[2] = oldarrayX[3] = 0;
        oldarrayY[0] = oldarrayY[1] = oldarrayY[2] = oldarrayY[3] = 0;
    }

    //获取数组中的最大值
    function GetMax(array) {
        var length = array.length;
        var max = array[0];
        for (var i = 1; i < length; i++) {
            max = Math.max(array[i], max);
        }
        return max;
    }

    //type：方块变换后的形状
    function change(type) {
        var test;
        switch (type) {
            case 2:
                test = (mycategory == 1) ? myX - 2 : (mycategory == 2 || mycategory == 5 || mycategory == 6 || mycategory == 7) ? myX : myX + 1;
                break;
            case 3:
                test = (mycategory == 1) ? myX + 1 : (mycategory == 2 || mycategory == 3 || mycategory == 4 || mycategory == 6 || mycategory == 7) ? myX : myX - 1;
                break;
            case 4:
                test = (mycategory == 1 || mycategory == 2 || mycategory == 7) ? myX - 1 : (mycategory == 3 || mycategory == 4 || mycategory == 6) ? myX : myX + 1;
                break;
            case 1:
                test = (mycategory == 1) ? myX + 2 : (mycategory == 2 || mycategory == 7) ? myX + 1 : (mycategory == 3 || mycategory == 4) ? myX - 1 : myX;
                break;
        }
        return test;
    }

    //方块变形后的最右边横坐标值，type为变形后的方块类型
    function nextRight(type) {
        var test;
        switch (type) {
            case 2:
                test = (mycategory == 1 || mycategory == 2 || mycategory == 7) ? maxR + 1 : (mycategory == 3 || mycategory == 4 || mycategory == 6) ? maxR : maxR - 1;
                break;
            case 3:
                test = (mycategory == 1) ? maxR - 2 : (mycategory == 2 || mycategory == 7) ? maxR - 1 : (mycategory == 3 || mycategory == 4) ? maxR + 1 : maxR;
                break;
            case 4:
                test = (mycategory == 1) ? maxR + 2 : (mycategory == 2 || mycategory == 5 || mycategory == 6 || mycategory == 7) ? maxR : maxR - 1;
                break;
            case 1:
                test = (mycategory == 1) ? maxR - 1 : (mycategory == 2 || mycategory == 3 || mycategory == 4 || mycategory == 6 || mycategory == 7) ? maxR : maxR + 1;
                break;
        }
        return test;
    }

    //判断方块下方是否已有方块
    function canContinue() {
        var test = 1;
        var array = nextblock(myX, myY, mycategory, mytype);
        var nextarrayX = array[0];
        var nextarrayY = array[1];
        for (var i = 0; i < nextarrayX.length; i++) {
            if (nextarrayY[i] < height + 3) {
                var mybackground = getLi(nextarrayY[i], nextarrayX[i]).className;
                if (colorTest(mybackground) == 1) {
                    test = 0;
                    break;
                }
            }
        }
        return test;
    }

    //判断方块左边是否已有方块
    function canLeft() {
        var test = 1;
        var array = Leftblock(myX, myY, mycategory, mytype);
        var leftarrayX = array[0];
        var leftarrayY = array[1];
        for (var i = 0; i < leftarrayX.length; i++) {
            if (myX > 0) {
                var mybackground = getLi(leftarrayY[i], leftarrayX[i]).className;
                if (colorTest(mybackground) == 1) {
                    test = 0;
                    break;
                }
            }
        }
        return test;
    }

    //判断方块右边是否已有方块
    function canRight() {
        var test = 1;
        var array = rightblock(myX, myY, mycategory, mytype);
        var rightarrayX = array[0];
        var rightarrayY = array[1];
        for (var i = 0; i < rightarrayX.length; i++) {
            if (rightarrayX[0] < width) {
                var mybackground = getLi(rightarrayY[i], rightarrayX[i]).className;
                if (colorTest(mybackground) == 1) {
                    test = 0;
                    break;
                }
            }
        }
        return test;
    }

    //消掉行
    function Disappear() {
        var isnessary = 0;
        var linecount = 0;
        var myarray = new Array();
        for (var i = 0; i < height + 3; i++) {
            myarray[i] = 0;
        }
        for (var i = 3; i < height + 3; i++) {
            var value = 0;
            for (var j = 0; j < width; j++) {
                var mybackground = getLi(i, j).className;
                value += colorTest(mybackground);
            }
            if (value == width) {
                myarray[i] = 1;
                isnessary = 1;
                linecount++;
            }
        }

        if (isnessary == 1) {
            var p = height + 2;
            var count = height + 3;
            for (var i = height + 2; i >= 0; i--) {
                if (myarray[i] == 0) {
                    for (var j = 0; j < width; j++) {
                        getLi(p, j).className = getLi(i, j).className;
                    }
                    p--;
                    count--;
                } //if
            } //for
            for (var i = 0; i < count; i++) {
                for (var j = 0; j < width; j++) {
                    getLi(i, j).className = "liblock";
                }
            }
        }
        return linecount;
    }

    //判断游戏是否结束
    function isFinished() {
        var test = 0;
        var value = 0;
        for (var i = height + 2; i > 2; i--) {
            for (var j = 0; j < width; j++) {
                var mybackground = getLi(i, j).className;
                if (colorTest(mybackground) == 1) {
                    value++;
                    break;
                }
            }
        }
        if (value == height) {
            test = 1;
        }
        return test;
    }



    //判断color是否为白色
    function colorTest(color) {
        return color.toLowerCase().indexOf('blockbg') == -1 ? 0 : 1;
    }



    //创建方块
    //x：最左边的x坐标，y：最下边的y坐标，category：方块1~7种类型，type：4种方块变形
    var block = function (x, y, category, type) {
        var arrayX = new Array();
        var arrayY = new Array();
        var array = new Array(new Array(), new Array());
        switch (category) {
            case 1:
                switch (type) {
                    case 1:
                    case 3:
                        maxR = x;
                        arrayX[0] = x;
                        arrayX[1] = x;
                        arrayX[2] = x;
                        arrayX[3] = x;
                        arrayY[0] = y;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 2;
                        arrayY[3] = y - 3;
                        break;
                    case 2:
                    case 4:
                        maxR = x + 3;
                        arrayX[0] = x;
                        arrayX[1] = x + 1;
                        arrayX[2] = x + 2;
                        arrayX[3] = x + 3;
                        arrayY[0] = y;
                        arrayY[1] = y;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                }
                break;
            case 2:
                switch (type) {
                    case 1:
                        maxR = x + 1;
                        arrayX[0] = x;
                        arrayX[1] = x + 1;
                        arrayX[2] = x + 1;
                        arrayX[3] = x + 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 2;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                    case 2:
                        maxR = x + 2;
                        arrayX[0] = x;
                        arrayX[1] = x + 1;
                        arrayX[2] = x + 2;
                        arrayX[3] = x;
                        arrayY[0] = y - 1;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                    case 3:
                        maxR = x + 1;
                        arrayX[0] = x;
                        arrayX[1] = x;
                        arrayX[2] = x;
                        arrayX[3] = x + 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                    case 4:
                        maxR = x + 2;
                        arrayX[0] = x + 2;
                        arrayX[1] = x;
                        arrayX[2] = x + 1;
                        arrayX[3] = x + 2;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                }
                break;
            case 3:
                switch (type) {
                    case 1:
                    case 3:
                        maxR = x + 2;
                        arrayX[0] = x;
                        arrayX[1] = x + 1;
                        arrayX[2] = x + 1;
                        arrayX[3] = x + 2;
                        arrayY[0] = y - 1;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                    case 2:
                    case 4:
                        maxR = x + 1;
                        arrayX[0] = x + 1;
                        arrayX[1] = x;
                        arrayX[2] = x + 1;
                        arrayX[3] = x;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                }
                break;
            case 4:
                switch (type) {
                    case 1:
                    case 3:
                        maxR = x + 2;
                        arrayX[0] = x + 1;
                        arrayX[1] = x + 2;
                        arrayX[2] = x;
                        arrayX[3] = x + 1;
                        arrayY[0] = y - 1;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                    case 2:
                    case 4:
                        maxR = x + 1;
                        arrayX[0] = x;
                        arrayX[1] = x;
                        arrayX[2] = x + 1;
                        arrayX[3] = x + 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                }
                break;
            case 5:
                switch (type) {
                    case 1:
                        maxR = x + 2;
                        arrayX[0] = x + 1;
                        arrayX[1] = x;
                        arrayX[2] = x + 1;
                        arrayX[3] = x + 2;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                    case 2:
                        maxR = x + 1;
                        arrayX[0] = x + 1;
                        arrayX[1] = x;
                        arrayX[2] = x + 1;
                        arrayX[3] = x + 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                    case 3:
                        maxR = x + 2;
                        arrayX[0] = x;
                        arrayX[1] = x + 1;
                        arrayX[2] = x + 2;
                        arrayX[3] = x + 1;
                        arrayY[0] = y - 1;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                    case 4:
                        maxR = x + 1;
                        arrayX[0] = x;
                        arrayX[1] = x;
                        arrayX[2] = x + 1;
                        arrayX[3] = x;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                }
                break;
            case 6:
                switch (type) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        maxR = x + 1;
                        arrayX[0] = x;
                        arrayX[1] = x + 1;
                        arrayX[2] = x;
                        arrayX[3] = x + 1;
                        arrayY[0] = y - 1;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                }
                break;
            case 7:
                switch (type) {
                    case 1:
                        maxR = x + 1;
                        arrayX[0] = x;
                        arrayX[1] = x + 1;
                        arrayX[2] = x;
                        arrayX[3] = x;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 2;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                    case 2:
                        maxR = x + 2;
                        arrayX[0] = x;
                        arrayX[1] = x;
                        arrayX[2] = x + 1;
                        arrayX[3] = x + 2;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                    case 3:
                        maxR = x + 1;
                        arrayX[0] = x + 1;
                        arrayX[1] = x + 1;
                        arrayX[2] = x;
                        arrayX[3] = x + 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        arrayY[3] = y;
                        break;
                    case 4:
                        maxR = x + 1;
                        arrayX[0] = x;
                        arrayX[1] = x + 1;
                        arrayX[2] = x + 2;
                        arrayX[3] = x + 2;
                        arrayY[0] = y - 1;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 1;
                        arrayY[3] = y;
                        break;
                }
                break;
        }
        array[0] = arrayX;
        array[1] = arrayY;
        return array;
    }

    //获取每种方块正下方的方块
    //x：最左边的x坐标，y：最下边的y坐标，category：方块1~7种类型，type：4种方块变形
    var nextblock = function (x, y, category, type) {
        var nextarrayX = new Array();
        var nextarrayY = new Array();
        var array = new Array(new Array(), new Array());
        switch (category) {
            case 1:
                switch (type) {
                    case 1:
                    case 3:
                        nextarrayX[0] = x;
                        nextarrayY[0] = y + 1;
                        break;
                    case 2:
                    case 4:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayX[3] = x + 3;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y + 1;
                        nextarrayY[2] = y + 1;
                        nextarrayY[3] = y + 1;
                        break;
                }
                break;
            case 2:
                switch (type) {
                    case 1:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y - 1;
                        nextarrayY[1] = y + 1;
                        break;
                    case 2:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y;
                        nextarrayY[2] = y;
                        break;
                    case 3:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y + 1;
                        break;
                    case 4:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y + 1;
                        nextarrayY[2] = y + 1;
                        break;
                }
                break;
            case 3:
                switch (type) {
                    case 1:
                    case 3:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayY[0] = y;
                        nextarrayY[1] = y + 1;
                        nextarrayY[2] = y + 1;
                        break;
                    case 2:
                    case 4:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y;
                        break;
                }
                break;
            case 4:
                switch (type) {
                    case 1:
                    case 3:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y + 1;
                        nextarrayY[2] = y;
                        break;
                    case 2:
                    case 4:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y;
                        nextarrayY[1] = y + 1;
                        break;
                }
                break;
            case 5:
                switch (type) {
                    case 1:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y + 1;
                        nextarrayY[2] = y + 1;
                        break;
                    case 2:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y;
                        nextarrayY[1] = y + 1;
                        break;
                    case 3:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayY[0] = y;
                        nextarrayY[1] = y + 1;
                        nextarrayY[2] = y;
                        break;
                    case 4:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y;
                        break;
                }
                break;
            case 6:
                switch (type) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y + 1;
                        break;
                }
                break;
            case 7:
                switch (type) {
                    case 1:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y - 1;
                        break;
                    case 2:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y + 1;
                        nextarrayY[2] = y + 1;
                        break;
                    case 3:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayY[0] = y + 1;
                        nextarrayY[1] = y + 1;
                        break;
                    case 4:
                        nextarrayX[0] = x;
                        nextarrayX[1] = x + 1;
                        nextarrayX[2] = x + 2;
                        nextarrayY[0] = y;
                        nextarrayY[1] = y;
                        nextarrayY[2] = y + 1;
                        break;
                }
                break;
        }
        array[0] = nextarrayX;
        array[1] = nextarrayY;
        return array;
    }

    //获取方块左边的方块
    //x：最左边的x坐标，y：最下边的y坐标，category：方块1~7种类型，type：4种方块变形
    var Leftblock = function (x, y, category, type) {
        var arrayX = new Array();
        var arrayY = new Array();
        var array = new Array(new Array(), new Array());
        switch (category) {
            case 1:
                switch (type) {
                    case 1:
                    case 3:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayX[2] = x - 1;
                        arrayX[3] = x - 1;
                        arrayY[0] = y;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 2;
                        arrayY[3] = y - 3;
                        break;
                    case 2:
                    case 4:
                        arrayX[0] = x - 1;
                        arrayY[0] = y;
                        break;
                }
                break;
            case 2:
                switch (type) {
                    case 1:
                        arrayX[0] = x - 1;
                        arrayY[0] = y - 2;
                        break;
                    case 2:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        break;
                    case 3:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayX[2] = x - 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        break;
                    case 4:
                        arrayX[0] = x - 1;
                        arrayY[0] = y;
                        break;
                }
                break;
            case 3:
                switch (type) {
                    case 1:
                    case 3:
                        arrayX[0] = x - 1;
                        arrayY[0] = y - 1;
                        break;
                    case 2:
                    case 4:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        break;
                }
                break;
            case 4:
                switch (type) {
                    case 1:
                    case 3:
                        arrayX[0] = x - 1;
                        arrayY[0] = y;
                        break;
                    case 2:
                    case 4:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        break;
                }
                break;
            case 5:
                switch (type) {
                    case 1:
                        arrayX[0] = x - 1;
                        arrayY[0] = y;
                        break;
                    case 2:
                        arrayX[0] = x - 1;
                        arrayY[0] = y - 1;
                        break;
                    case 3:
                        arrayX[0] = x - 1;
                        arrayY[0] = y - 1;
                        break;
                    case 4:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayX[2] = x - 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        break;
                }
                break;
            case 6:
                switch (type) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayX[2] = x;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        arrayY[2] = y;
                        break;
                }
                break;
            case 7:
                switch (type) {
                    case 1:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayX[2] = x - 1;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        break;
                    case 2:
                        arrayX[0] = x - 1;
                        arrayX[1] = x - 1;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        break;
                    case 3:
                        arrayX[0] = x - 1;
                        arrayY[0] = y;
                        break;
                    case 4:
                        arrayX[0] = x - 1;
                        arrayY[0] = y - 1;
                        break;
                }
                break;
        }
        array[0] = arrayX;
        array[1] = arrayY;
        return array;
    }

    //获取方块右边的方块
    //x：最左边的x坐标，y：最下边的y坐标，category：方块1~7种类型，type：4种方块变形
    var rightblock = function (x, y, category, type) {
        var arrayX = new Array();
        var arrayY = new Array();
        var array = new Array(new Array(), new Array());
        switch (category) {
            case 1:
                switch (type) {
                    case 1:
                    case 3:
                        arrayX[0] = x + 1;
                        arrayX[1] = x + 1;
                        arrayX[2] = x + 1;
                        arrayX[3] = x + 1;
                        arrayY[0] = y;
                        arrayY[1] = y - 1;
                        arrayY[2] = y - 2;
                        arrayY[3] = y - 3;
                        break;
                    case 2:
                    case 4:
                        arrayX[0] = x + 4;
                        arrayY[0] = y;
                        break;
                }
                break;
            case 2:
                switch (type) {
                    case 1:
                        arrayX[0] = x + 2;
                        arrayX[1] = x + 2;
                        arrayX[2] = x + 2;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        break;
                    case 2:
                        arrayX[0] = x + 3;
                        arrayY[0] = y - 1;
                        break;
                    case 3:
                        arrayX[0] = x + 2;
                        arrayY[0] = y;
                        break;
                    case 4:
                        arrayX[0] = x + 3;
                        arrayX[1] = x + 3;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        break;
                }
                break;
            case 3:
                switch (type) {
                    case 1:
                    case 3:
                        arrayX[0] = x + 3;
                        arrayY[0] = y;
                        break;
                    case 2:
                    case 4:
                        arrayX[0] = x + 2;
                        arrayX[1] = x + 2;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        break;
                }
                break;
            case 4:
                switch (type) {
                    case 1:
                    case 3:
                        arrayX[0] = x + 3;
                        arrayY[0] = y - 1;
                        break;
                    case 2:
                    case 4:
                        arrayX[0] = x + 2;
                        arrayX[1] = x + 2;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        break;
                }
                break;
            case 5:
                switch (type) {
                    case 1:
                        arrayX[0] = x + 3;
                        arrayY[0] = y;
                        break;
                    case 2:
                        arrayX[0] = x + 2;
                        arrayX[1] = x + 2;
                        arrayX[2] = x + 2;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        break;
                    case 3:
                        arrayX[0] = x + 3;
                        arrayY[0] = y - 1;
                        break;
                    case 4:
                        arrayX[0] = x + 2;
                        arrayY[0] = y - 1;
                        break;
                }
                break;
            case 6:
                switch (type) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        arrayX[0] = x + 2;
                        arrayX[1] = x + 2;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        break;
                }
                break;
            case 7:
                switch (type) {
                    case 1:
                        arrayX[0] = x + 2;
                        arrayY[0] = y - 2;
                        break;
                    case 2:
                        arrayX[0] = x + 3;
                        arrayY[0] = y;
                        break;
                    case 3:
                        arrayX[0] = x + 2;
                        arrayX[1] = x + 2;
                        arrayX[2] = x + 2;
                        arrayY[0] = y - 2;
                        arrayY[1] = y - 1;
                        arrayY[2] = y;
                        break;
                    case 4:
                        arrayX[0] = x + 3;
                        arrayX[1] = x + 3;
                        arrayY[0] = y - 1;
                        arrayY[1] = y;
                        break;
                }
                break;
        }
        array[0] = arrayX;
        array[1] = arrayY;
        return array;
    }
})();