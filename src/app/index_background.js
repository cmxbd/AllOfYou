/**
 * auth: miluo
 * date: 2016/09/20
 * desc: 页面背景
 */
var width = null; //页面宽
var height = null; // 页面高
var ctx = null;
var animateHeader = true;
var target = null; // 目标点
var points = [];


$(document).ready(function() {
    initialize();
});

function initialize() {
    initHeader();
    initAnimation();
    addEventListeners();
}

/**
 * 初始化header
 * @return {[type]} [description]
 */
function initHeader() {
    // 获取页面窗口文档尺寸
    width = window.innerWidth;
    height = window.innerHeight;
    // 设置目标点坐标
    target = {
        x: width / 2,
        y: height / 2
    };
    // 设置canvas
    var canvas = document.getElementById('backGround');
    canvas.width = width;
    canvas.height = height;
    // 确定浏览器是否支持<canvas>元素
    if (canvas.getContext) {
        // 取得2d上下文对象
        ctx = canvas.getContext('2d');
    }

    for (var x = 0; x < width; x = x + width / 20) {
        for (var y = 0; y < height; y = y + height / 20) {
            var px = x + Math.random() * width / 20;
            var py = y + Math.random() * height / 20;
            var p = {
                x: px,
                originX: px,
                y: py,
                originY: py
            };
            points.push(p);
        }
    }

    // 对每个点找到与之最接近的5个点
    for (var i = 0; i < points.length; i++) {
        var closest = [];
        var p1 = points[i];
        for (var j = 0; j < points.length; j++) {
            var p2 = points[j]
            if (p1 != p2) {
                var placed = false;
                for (var k = 0; k < 5; k++) {
                    if (!placed) {
                        if (!closest[k]) {
                            closest[k] = p2;
                            placed = true;
                        }
                    }
                }

                for (var k = 0; k < 5; k++) {
                    if (!placed) {
                        if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                            closest[k] = p2;
                            placed = true;
                        }
                    }
                }
            }
        }
        p1.closest = closest;
    }

    // 每个点画一个圆
    for (var i in points) {
        var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
        points[i].circle = c;
    }
}

/**
 * 初始化动画
 * @return {[type]} [description]
 */
function initAnimation() {
    animate();
    for (var i in points) {
        shiftPoint(points[i]);
    }
}

/**
 * 添加事件监听
 */
function addEventListeners() {
    // 检测是否支持ontouchstart事件
    if (!('ontouchstart' in window)) {
        window.addEventListener('mousemove', mouseMove);
    }
    window.addEventListener('scroll', scrollCheck);
    window.addEventListener('resize', resize);
}

function animate() {
    if (animateHeader) {
        // 清空矩形区域
        ctx.clearRect(0, 0, width, height);
        for (var i in points) {
            // 检测范围内的点
            if (Math.abs(getDistance(target, points[i])) < 4000) {
                points[i].active = 0.3;
                points[i].circle.active = 0.6;
            } else if (Math.abs(getDistance(target, points[i])) < 20000) {
                points[i].active = 0.1;
                points[i].circle.active = 0.3;
            } else if (Math.abs(getDistance(target, points[i])) < 40000) {
                points[i].active = 0.02;
                points[i].circle.active = 0.1;
            } else {
                points[i].active = 0;
                points[i].circle.active = 0;
            }

            drawLines(points[i]);
            // 调用Circle中的draw方法绘制
            points[i].circle.draw();
        }
    }
    window.requestAnimationFrame(animate);
}

function shiftPoint(point) {
    // TweenLite + EasePack
    TweenLite.to(point, 1 + 1 * Math.random(), {
        x: point.originX - 50 + Math.random() * 100,
        y: point.originY - 50 + Math.random() * 100,
        ease: Circ.easeInOut,
        onComplete: function() {
            shiftPoint(point);
        }
    });
}

function mouseMove(e) {
    var posX = posY = 0;
    if (e.pageX || e.pageY) {
        posX = e.pageX;
        posY = e.pageY;
    } else if (e.clientX || e.clientY) {
        posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    target.x = posX;
    target.y = posY;
}

function scrollCheck(e) {
    if (document.body.scrollTop > height) {
        animateHeader = false;
    } else {
        animateHeader = true;
    }
}

function resize(e) {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

/**
 * 画直线
 * @param  {[type]} point [description]
 * @return {[type]}       [description]
 */
function drawLines(point) {
    if (!point.active) {
        return;
    }
    for (var i in point.closest) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.closest[i].x, point.closest[i].y);
        ctx.strokeStyle = 'rgba(156,217,249,' + point.active + ')';
        ctx.stroke();
    }
}

/**
 * 获取两个点的距离
 * @param  {[type]} p1 [description]
 * @param  {[type]} p2 [description]
 * @return {[type]}    [description]
 */
function getDistance(p1, p2) {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}

function Circle(pos, rad, color) {
    var _this = this;
    (function() {
        _this.pos = pos || null;
        _this.radius = rad || null;
        _this.color = color || null;
    })();

    this.draw = function() {
        if (!_this.active) {
            return;
        }
        ctx.beginPath();
        ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(156,217,249,' + _this.active + ')';
        ctx.fill();
    };
}