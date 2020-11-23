$(function() { 
    // checkForm(); // 头部搜索 表单验证
    navMenu(); // 导航 PC二级菜单下拉
    textCut(); // 截取文本字数，超出省略
    rotate(); // 列表页 侧边栏的箭头
    ewemaPosition(); // 二维码的位置

    $(window).resize(function() {
        ewemaPosition(); // 二维码的位置
    });

    // 友情链接
    $('select[name=subSite]').each(function () {
        $(this).on('change', function () {
            var url = this.options[this.selectedIndex].value;
            $('.am-selected-list .am-icon-check').css('opacity', '0');
            $('.am-selected-list .am-checked').removeClass('am-checked')
                .find('.am-icon-check').css({'opacity': '1', 'color': '#fe9705'});
            window.open(url , "_blank");
        });
    });

    // 列表页内容宽度
    if( $(".hj-list-sidebar").length === 0 ) {
        $(".hj-list-con").css({"width":"100%", "padding-left":"20px", "padding-right":"20px"});
    }

    // 页面内容高度 < 窗口，固定底部
    /*if ($(document).height() + 110 <= $(window).height()) {
        $(".hj-footer").css({"position": "fixed", "bottom": "0", "width": "100%"});
        $(".hj-quick-link").css({"position": "fixed", "bottom": "140px", "width": "100%"});
    }*/

});

// 头部搜索 表单验证
function checkForm() {
    $(".hj-search button").click(function() {
        var inputEle = $(".hj-search input");
        // 验证空和空格
        if (inputEle.val().replace(/(^\s*)|(\s*$)/g, '') === '') {
            inputEle.popover({
                content: '请输入搜索内容'
            });
            inputEle.popover("open");
            return false;
        }
    });
}

//设为首页
function SetHome(url) {
    if (document.all) {
        document.body.style.behavior = 'url(#default#homepage)';
        document.body.setHomePage(url);
    } else {
        alert("您的浏览器不支持自动设置页面为首页功能，请您手动在浏览器里设置该页面为首页！");
    }
}

// 列表页 侧边栏的箭头
function rotate() {
    $(".am-nav > li").click(function() {
        if ($(this).hasClass("rotate")) {
            $(this).removeClass("rotate");
        } else {
            $(this).addClass("rotate");
        }
    });
}

// 导航 PC二级菜单高度
function navMenu() {
    var $ul = $(".hj-menu2");
    var maxHeight = 0;
    for (var i = 0; i < $ul.length; i++) {
        var newHeight = $ul.eq(i).height();
        var menu3Height = $ul.find(".hj-menu3").height() + 47*(i+1);
        // 算上三级菜单高度
        newHeight =  newHeight < menu3Height ? menu3Height : newHeight;
        maxHeight = maxHeight < newHeight ? newHeight : maxHeight;
    }
    $ul.css("height", maxHeight);
    $(".hj-menu-pc .am-nav").css("height", maxHeight + 47);
}

// 二维码的位置
function ewemaPosition() {
    var right = ($(window).width() - $(".hj-con").width()) / 2 - 135;
    $(".hj-ewm").css("right", right + "px");
}

// 截取文本字数，超出省略
// data-row = 行数
// data-ellipsis = 结尾省略字数
function textCut(){
    var textbody = '.textbody', // 包裹层
        textcon = '.textcon'; // 容器
    //页面中所有的textbody都截取
    for (var i = 0; i < $(textbody).length; i++) {
        var fnum = parseInt( parseFloat($(textbody).eq(i).css("width")) / parseFloat($(textbody).eq(i).css("font-size")) ); //行字数
        var fstr = fnum * $(textbody).eq(i).data("row"); //所需长度
        var str = $(textbody).eq(i).find(textcon).text(); //原始长度
        var feps = $(textbody).eq(i).data("ellipsis"); //结尾省略字数
        str = str.substr( 0, fstr-feps );
        $(textbody).eq(i).find(textcon).text(str);
    }
}

//无缝滚动
//参数 滚动外层 滚动间隔
function fMarquee(e,interval){
    var element = $(e);
    var width = 10; //总宽度 + 10
    var timer = null;
    interval = interval || 20; //默认滚动间隔

    //设置滚动层外层宽度
    for (var i = 0; i < element.find("li").length; i++) {
        var li = element.find("li");
        width += parseInt(li.eq(i).css("width"));
    }
    var div = '<div class="clone-wrap">' + element.html() + '</div>'; //创造clone包裹层
    element.html(div).css({"height":element.find("li").css("height"),"position":"relative"}); //设置外层高度

    var maxWidth = parseInt(element.css("width")); //滚动栏目宽度
    //长度够到需要滚动
    if ( maxWidth < width ) {
        element.find("ul").css({"width":width+'px', "position":"absolute", "left":"0", "display":"inline-block"});
        //clone
        var cloneNode = element.find("ul").clone(true);//复制节点
        element.find("ul").addClass("clone1");
        cloneNode.addClass("clone2").css("margin-left",width+'px');//新节点属性设置

        element.find(".clone-wrap").append(cloneNode) //添加新节点
            .css("width",width*2+10+'px'); //总宽度*2
        element.find(".clone2").css("left","-10px");

        timer = setTimeout(sliderFunc,0); //滚动

        //鼠标悬停停止
        element.on("mouseover",function(){
            clearTimeout(timer);
        });
        element.on("mouseout",function(){
            timer = setTimeout(sliderFunc,0); //滚动
        });

    }
    //滚动函数
    function sliderFunc(){
        clearTimeout(timer);
        var clone1 = element.find(".clone1");
        var clone2 = element.find(".clone2");

        //向左滚动
        clone1.css("margin-left" ,parseInt(clone1.css("margin-left"))-1 + 'px');
        clone2.css("margin-left" ,parseInt(clone2.css("margin-left"))-1 + 'px');

        //右边界到达左边界，添加到最后面
        if ( Math.abs(parseInt(clone1.css("margin-left"))) > width ) {
            clone1.css("margin-left",width-10);
        }
        if ( Math.abs(parseInt(clone2.css("margin-left"))) > width ) {
            clone2.css("margin-left",width-10);
        }
        timer = setTimeout(sliderFunc,interval); //循环滚动
    }
}