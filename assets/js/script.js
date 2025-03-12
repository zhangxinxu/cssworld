/**
 * @description CSS世界官网首页脚本
 * @author zhangxinxu(.com)
 * @since 2017-12-16
 */

/**
 * @author zhangxinxu(.com)
 * @description 让Tween.js缓动算法更容易理解和使用
                需要先引入Tween.js - https://github.com/zhangxinxu/Tween/blob/master/tween.js
 * @link https://github.com/zhangxinxu/Tween/blob/master/animation.js
 */
var Tween = {
    Quad: {
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t-2) - 1) + b;
        }
    }
};
// 对运动方法进行封装
Math.animation = function (from, to, duration, easing, callback) {
    var isUndefined = function (obj) {
        return typeof obj == 'undefined';
    };
    var isFunction = function (obj) {
        return typeof obj == 'function';
    };
    var isNumber = function(obj) {
        return typeof obj == 'number';
    };
    var isString = function(obj) {
        return typeof obj == 'string';
    };

    // 转换成毫秒
    var toMillisecond = function(obj) {
        if (isNumber(obj)) {
            return     obj;
        } else if (isString(obj)) {
            if (/\d+m?s$/.test(obj)) {
                if (/ms/.test(obj)) {
                    return 1 * obj.replace('ms', '');
                }
                return 1000 * obj.replace('s', '');
            } else if (/^\d+$/.test(obj)) {
                return +obj;
            }
        }
        return -1;
    };

    if (!isNumber(from) || !isNumber(to)) {
        if (window.console) {
            console.error('from和to两个参数必须且为数值');
        }
        return 0;
    }

    // 缓动算法
    var tween = Math.tween || window.Tween;

    if (!tween) {
        if (window.console) {
            console.error('缓动算法函数缺失');
        }
        return 0;
    }

    // duration, easing, callback均为可选参数
    // 而且顺序可以任意
    var options = {
        duration: 300,
        easing: 'Linear',
        callback: function() {}
    };

    var setOptions = function(obj) {
        if (isFunction(obj)) {
            options.callback = obj;
        } else if (toMillisecond(obj) != -1) {
            options.duration = toMillisecond(obj);
        } else if (isString(obj)) {
            options.easing = obj;
        }
    };
    setOptions(duration);
    setOptions(easing);
    setOptions(callback);

    // requestAnimationFrame的兼容处理
    if (!window.requestAnimationFrame) {
        requestAnimationFrame = function (fn) {
            setTimeout(fn, 17);
        };
    }

    // 算法需要的几个变量
    var start = 0;
    // during根据设置的总时间计算
    var during = Math.ceil(options.duration / 17);

    // 当前动画算法
    // 确保首字母大写
    options.easing = options.easing.slice(0, 1).toUpperCase() + options.easing.slice(1);
    var arrKeyTween = options.easing.split('.');
    var fnGetValue;

    if (arrKeyTween.length == 1) {
        fnGetValue = tween[arrKeyTween[0]];
    } else if (arrKeyTween.length == 2) {
        fnGetValue = tween[arrKeyTween[0]] && tween[arrKeyTween[0]][arrKeyTween[1]];
    }
    if (isFunction(fnGetValue) == false) {
        console.error('没有找到名为"'+ options.easing +'"的动画算法');
        return;
    }

    // 运动
    var step = function() {
        // 当前的运动位置
        var value = fnGetValue(start, from, to - from, during);

        // 时间递增
        start++;
        // 如果还没有运动到位，继续
        if (start <= during) {
            options.callback(value);
            requestAnimationFrame(step);
        } else {
            // 动画结束，这里可以插入回调...
            options.callback(to, true);
        }
    };
    // 开始执行动画
    step();
};
(function() {
	if (!window.addEventListener) {
        document.body.insertAdjacentHTML('afterbegin', '<div class="no-support">当前浏览器版本过低，本页面未对其进行支持</div>');
        return;
    }

    var ua = navigator.userAgent;
    if ((/window/i.test(ua)) && /chrome/i.test(ua)) {
        document.querySelector('.main').classList.add('modren');
    }
    
    var canvas = document.querySelector("#starCanvas");
    var context = canvas.getContext("2d");

    var stars = {},
        particleIndex = 0,
        settings = {
            r: 1400,                // 根据是设计稿确定的轨迹半径
            height: 260,            // 露出的圆弧的高度
            density: 300,
            maxLife: 100,
            groundLevel: canvas.height,
            leftWall: 0,
            rightWall: canvas.width,
            alpha: 0.0,
            maxAlpha: 1
        };

    var getMinRandom = function() {
        var rand = Math.random();
        // step的大小决定了星星靠近地球的聚拢程度，
        // step = Math.ceil(2 / (1 - rand))就聚拢很明显
        var step = Math.ceil(1 / (1 - rand));
        var arr = [];
        for (var i=0; i<step; i++) {
            arr.push(Math.random());
        }

        return Math.min.apply(null, arr);
    };

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        settings.rightWall = canvas.width;
        settings.groundLevel = canvas.height;
        // y重新分布
        for ( var i in stars ) {
            stars[i].y = getMinRandom() * canvas.height;
        }
        redraw();
        // 借用
        if (canvas.width <= 480) {
            document.body.className = 'mobile';
        } else {
            document.body.className = 'pc';
        }
    }

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    function redraw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function Star() {
        // 圆的轨迹方程式为：(x-a)²+(y-b)²=r²
        // 因此，已知x, 则y = Math.sqrt(r² - (x-a)²) + b;
        // 其中，圆心是(a, b)
        // 在本例子中
        // 圆心坐标是(canvas.width/2, canvas.height - 600 + r);
        var a = canvas.width/2, b = canvas.height;
        // 因此，已知横坐标随机
        this.x = Math.floor(Math.random() * canvas.width);
        // 纵坐标需要在圆弧以上
        // 越往上，越稀疏
        this.y = getMinRandom() * canvas.height;

        this.vx = Math.random() * 0.1 + 0.05;    // 水平偏移，也是移动速度

        // 星星的尺寸
        this.particleSize = 0.5 + (Math.random() + 0.1 / 4);
        particleIndex++;
        stars[particleIndex] = this;
        this.alpha = 0.0;
        this.maxAlpha = 0.2 + (this.y/canvas.height) * Math.random() * 0.8;
        this.alphaAction = 1;
    }

    Star.prototype.draw = function() {
        // 横坐标移动
        this.x += this.vx;
        // 根据切线方向进行偏移

        // 透明度慢慢起来
        if (this.alphaAction == 1) {
            if (this.alpha < this.maxAlpha ) {
                this.alpha += 0.005;
            } else {
                this.alphaAction = -1;
            }
        } else {
            if (this.alpha > 0.2 ) {
                this.alpha -= 0.002;
            } else {
                this.alphaAction = 1;
            }
        }

        if ( this.x + (this.particleSize*2) >= settings.rightWall ) {
            // x到左侧
            this.x = this.x - settings.rightWall;
        }

        // 绘制星星
        context.beginPath();
        context.fillStyle="rgba(255,255,255," + this.alpha.toString() + ")";
        context.arc(this.x, this.y, this.particleSize, 0, Math.PI*2, true); 
        context.closePath();
        context.fill();
    }

    function render() {

        redraw();

        // 星星的数目
        // IE下CUP性能有限，数目小
        var length = 400;
        if (!history.pushState) {
			// IE9
            length = 200;
        } else if (document.msHidden != undefined) {
			// IE10+
            length = 300;
        }

        if (screen.width < 1024) {
            length = 200;
        }
        if (screen.width < 640) {
            length = 100;
        }

        if ( Object.keys(stars).length > length ) {
            settings.density = 0;
        }

        for ( var i = 0; i < settings.density; i++ ) {
            if ( Math.random() > 0.97 ) {
                new Star();
            }
        }

        // 星星实时移动
        for ( var i in stars ) {
            stars[i].draw();
        }

        requestAnimationFrame(render);
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(fn) {
            setTimeout(fn, 17);
        };
    }

    render();

    // 鱼尾巴游动
    var eleFeMap = document.querySelector('#feMap');
    var eleFeImage = document.querySelector('#svgFeImage');
    // canvas绘制背景图
    var canvasMap = document.createElement('canvas');
    var contextMap = canvasMap.getContext('2d');
    var widthMap = 600, heightMap = 300, widthGrad = 300;
    canvasMap.width = widthMap;
    canvasMap.height = heightMap;

    // sRGB to LinearRGB
    // if LinearRGB is 0.5 
    // RGB is：1.055 * Math.pow(0.5, 1.0/2.4) - 0.055 = 0.7353569830524495
    // Math.floor(0.7353569830524495 * 256) = 188;
    var linearGray = 188;

    // 50度灰填充
    contextMap.fillStyle = 'rgb('+ [linearGray, linearGray, linearGray].join() +')';
    contextMap.fillRect(0, 0, widthMap, heightMap);
    // 渐变填充
    var gradient = contextMap.createLinearGradient(widthMap - widthGrad, 0, widthMap, 0);
    gradient.addColorStop(0, 'rgb('+ [linearGray, linearGray, linearGray].join() +')');
    gradient.addColorStop(1, 'rgb('+ [255, linearGray, 0].join() +')');
    contextMap.fillStyle = gradient;
    contextMap.fillRect(widthMap - widthGrad, 0, widthGrad, heightMap);

    eleFeImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', canvasMap.toDataURL());    

    var scaleLoop = function () {
        Math.animation(0, 60, 5000, 'Quad.easeInOut', function (value, isEnding) {
            eleFeMap.setAttribute('scale', value);
            if (isEnding == true) {
                Math.animation(60, 0, 5000, 'Quad.easeInOut', function (value, isEnding) {
                    eleFeMap.setAttribute('scale', value);
                    if (isEnding == true) {
                        scaleLoop();
                    }
                });
            }
        });
    };

    scaleLoop();


    // 屏幕切换处理
    var eleIconBuy = document.getElementById('iconBuy');
    var eleIconPageDown = document.getElementById('iconPageDown');

    var eleNavs = document.querySelectorAll('#sceneCtrl a');

    var elePages = document.querySelectorAll('.page');
    var lengthPages = elePages.length;
    var fnUiBtn = function () {
        var eleActivePage = document.querySelector('.page.active');
        if (!eleActivePage) {
            return;
        }
        var activeId = eleActivePage.id.replace(/\D/g, '') * 1;

        // 购物按钮的UI
        if (activeId == 1) {
            eleIconBuy.style.visibility = '';
        } else {
            eleIconBuy.style.visibility = 'visible';
        }

        // 右侧圈圈的UI
        var eleCur = document.querySelector('#sceneCtrl .cur');
        if (eleCur) {
            eleCur.className = eleCur.className.replace(' cur', '');
        }
        eleCur = eleNavs[activeId - 1];
        if (eleCur) {
            eleCur.className = eleCur.className + ' cur';
        }

        // 下一屏按钮的UI
        if (activeId == lengthPages) {
            eleIconPageDown.style.visibility = 'hidden';
        } else {
            eleIconPageDown.style.visibility = '';
            eleIconPageDown.setAttribute('data-index', activeId + 1);
        }
    };

    var isTransition = false;
    var fnGoPage = function (index) {
        if (typeof index == 'undefined') {
            return;
        }
        var eleTargetPage = document.getElementById('page' + index);
        var eleActivePage = document.querySelector('.page.active');
        if (eleTargetPage != eleActivePage) {
            eleActivePage.className = eleActivePage.className.replace(' active', '');
            eleTargetPage.className += ' active';
            fnUiBtn();

            eleIconPageDown.style.opacity = '0';
            isTransition = true;
            setTimeout(function () {
                eleIconPageDown.style.opacity = '';
                isTransition = false;
            }, 300);
        }
    };

    // 点击按钮
    [].slice.call(eleNavs).forEach(function (eleNav) {
        eleNav.addEventListener('click', function () {
            var index = this.getAttribute('data-index');
            fnGoPage(index);
        });
    });

    eleIconPageDown.addEventListener('click', function () {
        var index = this.getAttribute('data-index');
        fnGoPage(index);
    });

    var addEvent = (function(window, undefined) {        
        var _eventCompat = function(event) {
            var type = event.type;
            if (type == 'DOMMouseScroll' || type == 'mousewheel') {
                event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
            }
            //alert(event.delta);
            if (event.srcElement && !event.target) {
                event.target = event.srcElement;    
            }
            if (!event.preventDefault && event.returnValue !== undefined) {
                event.preventDefault = function() {
                    event.returnValue = false;
                };
            }
            return event;
        };
        if (window.addEventListener) {
            return function(el, type, fn, capture) {
                if (type === "mousewheel" && document.mozFullScreen !== undefined) {
                    type = "DOMMouseScroll";
                }
                el.addEventListener(type, function(event) {
                    fn.call(this, _eventCompat(event));
                }, capture || false);
            }
        }
        return function() {};    
    })(window);

    // 增加mousewheel滚轮
    addEvent(document, "mousewheel", function(event) {
        if (isTransition) {
            return;
        }
        var eleActivePage = document.querySelector('.page.active');
        if (!eleActivePage) {
            return;
        }
        var activeId = eleActivePage.id.replace(/\D/g, '') * 1;
        if (event.delta < 0) { 
            // 页面向上滚动 显示序号更大的页面
            if (activeId < lengthPages) {
                activeId++;
            }
        } else if (activeId > 1) {
            activeId--;
        }

        fnGoPage(activeId);
    });

    // 增加touch移动
    var data = {};
    if ('ontouchstart' in document.body) {
        document.body.addEventListener('touchstart', function (event) {
            var events = event.touches[0] || event;

            data.posY = events.pageY;

            data.touching = true;
        });

        document.addEventListener('touchmove', function (event) {
            if (data.touching !== true) {
                return;
            }
            // event.preventDefault();

            var events = event.touches[0] || event;

            data.nowY = events.pageY;
        });

        document.addEventListener('touchend', function () {
            if (data.touching === false) {
                // fix iOS fixed bug
                return;
            }
            data.touching = false;

            var distanceY = data.nowY - data.posY;

            var eleActivePage = document.querySelector('.page.active');
            if (!eleActivePage) {
                return;
            }
            var activeId = eleActivePage.id.replace(/\D/g, '') * 1;

            if (distanceY > 20) {
                // 往下滑，显示上一页
                if (activeId > 1) {
                    activeId--;
                }
            } else if (distanceY < -20 && activeId < lengthPages) {
                activeId++;
            } else {
                return;
            }

            fnGoPage(activeId);
        });
    }
})();