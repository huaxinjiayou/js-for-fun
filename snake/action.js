(function() {
        var isIE = (document.all) ? true : false; //是否为IE浏览器
        var speed = (isIE) ? 25 : 150;  //速度
        var frontdistance = 0; //保存前一个运动方向的键值

        //地图大小
        var countX = 81;
        var countY = 31;

        //当前位置=下一个位置的前一个位置
        var positionX = Math.floor(countX / 2);
        var positionY = Math.floor(countY / 2);

        //蛇身坐标
        var snake = new Array(new Array(), new Array());
        snake[0][0] = positionY;
        snake[1][0] = positionX;

        //保存前一个的方向信息，防止往相反方向前进0：上，1：下，2：左，3：右
        var operate = new Array();
        operate[0] = operate[1] = operate[2] = operate[3] = 0;

        //保存每个方向的setInterval信息，防止同时往几个方向前进0：上，1：下，2：左，3：右
        var turn = new Array();

        //保存蛇豆的位置
        var beanX;
        var beanY;
        var isEnd = 0; //是否结束
        var isPause = -1; //是否暂停

        //缓存元素
        var lis = {};

        var $ = function (id) { return document.getElementById(id); }

        function htmlInner(content, id) {
            $(id).innerHTML = content;
        }

        //建立场地
        function createCanvas() {
            var str = [];
            str.push("<ul>");
            for (var y = 0; y < countY; y++) {
                for (var x = 0; x < countX; x++) {
                    if (x == 0 || x == countX - 1 || y == 0 || y == countY - 1) {
                        str.push("<li id=\"site" + y + "_" + x + "\" class=\"wall\"></li>");
                    }
                    else {
                        str.push("<li id=\"site" + y + "_" + x + "\"></li>");
                    }
                }
            }
            str.push("</ul><div style=\"clear:both;\"></div>");
            $("canvas").style.width = 10 * countX + "px";
            htmlInner(str.join(""), "canvas");
        }

        //缓存元素
        function liCache() {
            var id;
            for (var y = 0; y < countY; y++) {
                for (var x = 0; x < countX; x++) {
                    id = "site" + y + "_" + x
                    lis[id] = $(id);
                }
            }
        }

        //获取元素
        function getLi(y, x) {
            return lis["site" + y + "_" + x];
        }

        //监听键盘
        function distanceKey(select) {
            if (select.keyCode == 32 && operate[0] + operate[1] + operate[2] + operate[3] != 0) {
                isPause *= -1;
                if (isPause == 1) {
                    htmlInner("游戏暂停中！", "point");
                }
                else {
                    htmlInner(snake[0].length-1, "point");
                }
            }
            if ((select.keyCode == 37 || select.keyCode == 38 || select.keyCode == 39 || select.keyCode == 40) && isPause == -1) {
                run(select.keyCode);
            }
        }

        //主程序
        function run(distance) {
            //向左
            if (distance == 37 && frontdistance != 39 && frontdistance != 37 && isEnd == 0) {
                clearInfo();
                operate[2] = 1;
                frontdistance = 37;
                turn[2] = setInterval(function () {
                    if (isPause == -1) {
                        positionX--;
                        snakeRun(37);
                    }

                    if (positionX == 0) {
                        clearInterval(turn[2]);
                        isEnd = 1;
                        htmlInner("游戏结束！请按F5重新开始！", "point");
                    }
                }, speed);
            }
            //向右
            else if (distance == 39 && frontdistance != 37 && frontdistance != 39 && isEnd == 0) {
                clearInfo();
                operate[3] = 1;
                frontdistance = 39;
                turn[3] = setInterval(function () {
                    if (isPause == -1) {
                        positionX++;
                        snakeRun(39);
                    }
                    if (positionX == countX - 1) {
                        clearInterval(turn[3]);
                        isEnd = 1;
                        htmlInner("游戏结束！请按F5重新开始！", "point");
                    }
                }, speed);
            }
            //向上
            else if (distance == 38 && frontdistance != 40 && frontdistance != 38 && isEnd == 0) {
                clearInfo();
                operate[0] = 1;
                frontdistance = 38;
                turn[0] = setInterval(function () {
                    if (isPause == -1) {
                        positionY--;
                        snakeRun(38);
                    }
                    if (positionY == 0) {
                        clearInterval(turn[0]);
                        isEnd = 1;
                        htmlInner("游戏结束！请按F5重新开始！", "point");
                    }
                }, speed);
            }
            //向下
            else if (distance == 40 && frontdistance != 38 && frontdistance != 40 && isEnd == 0) {
                clearInfo();
                operate[1] = 1;
                frontdistance = 40;
                turn[1] = setInterval(function () {
                    if (isPause == -1) {
                        positionY++;
                        snakeRun(40);
                    }
                    if (positionY == countY - 1) {
                        clearInterval(turn[1]);
                        isEnd = 1;
                        htmlInner("游戏结束！请按F5重新开始！", "point");
                    }
                }, speed);
            }
        }

        //蛇移动
        function snakeRun(distance) {
            var length = snake[0].length;
            var newsnake = new Array(new Array(), new Array());
            newsnake[0][0] = snake[0][0];
            newsnake[1][0] = snake[1][0];
            if (distance == 37) {
                newsnake[1][0]--;
            }
            else if (distance == 38) {
                newsnake[0][0]--;
            }
            else if (distance == 39) {
                newsnake[1][0]++;
            }
            else if (distance == 40) {
                newsnake[0][0]++
            }
            //撞到自己
            for (var i = 0; i < length - 1; i++) {
                if (newsnake[0][0] == snake[0][i] && newsnake[1][0] == snake[1][i]) {
                    isEnd = 1;
                    clearInfo();
                    htmlInner("游戏结束！请按F5重新开始！", "point");
                    return;
                }
            }

            getLi(snake[0][length - 1], snake[1][length - 1]).className = "";
            for (var i = 0; i < length - 1; i++) {
                newsnake[0][i + 1] = snake[0][i];
                newsnake[1][i + 1] = snake[1][i];
            }

            //吃到豆
            if (newsnake[0][0] == beanY && newsnake[1][0] == beanX) {
                newsnake[0][length] = snake[0][length - 1];
                newsnake[1][length] = snake[1][length - 1];
                createBean();
                htmlInner(length, "point");
            }

            snake = newsnake; //定义新蛇
            length = snake[0].length;
            for (var i = 0; i < length; i++) {
                if (i == 0) {
                    getLi(snake[0][i], snake[1][i]).className = "head"
                }
                else {
                    getLi(snake[0][i], snake[1][i]).className = "body"
                }
            }

        }

        //生成蛇豆
        function createBean() {
            beanX = parseInt(Math.random() * (countX - 3) + 1);
            beanY = parseInt(Math.random() * (countY - 3) + 1);
            isSame = 0;
            for (var i = 0; i < snake[1].length; i++) {
                if (beanX == snake[1][i] && beanY ==snake[0][i]) {
                    isSame = 1;
                    break;
                }
            }
            if (isSame == 0) {
                getLi(beanY, beanX).className = "bean";
            }
            else {
                createBean();
            }
        }


        //取消定时
        function clearInfo() {
            for (var i = 0; i < 4; i++) {
                if (operate[i] == 1) {
                    clearInterval(turn[i]);
                }
            }
        }

        window.onload = function () { 
            createCanvas();
            liCache();
            getLi(positionY, positionX).className = "head"; 
            createBean();
        };

        document.documentElement.onkeydown = function (e) {
            e = e || window.event;
            distanceKey(e);
        }
})()