// 根目录
var root = 'http://125.77.252.211:820/';

// 资源中心数据
$(function () {
    setAllTabs(); // 初始化资源类型
    
    // 学段 最新资源 最热资源
    $(".channelTab").eq(0).find("li a").click(function() {
        var id = $(this).attr("data-id");
        setAllResouse(root + 'open/api/resources?pageSize=7&schoolType=' + id); // 最新资源
        setHotResouse(root + 'open/api/resources?pageSize=7&orderBy=4&schoolType=' + id); // 最热资源
    });
    // 学科 最新资源 最热资源
    $(".channelTab").eq(1).find("li a").click(function() {
        var id = $(this).attr("data-id");
        setAllResouse(root + 'open/api/resources?pageSize=7&course=' + id); // 最新资源
        setHotResouse(root + 'open/api/resources?pageSize=7&orderBy=4&course=' + id); // 最热资源
    });
    // 类型 最新资源 最热资源
    $(".channelTab").eq(2).find("li a").click(function() {
        var id = $(this).attr("data-id");
        setAllResouse(root + 'open/api/resources?pageSize=7&type=' + id); // 最新资源
        setHotResouse(root + 'open/api/resources?pageSize=7&orderBy=4&type=' + id); // 最热资源
    });

    // 默认第一个tab
    setAllResouse(root + 'open/api/resources?pageSize=7&schoolType=1'); // 最新资源
    setHotResouse(root + 'open/api/resources?pageSize=7&orderBy=4&schoolType=1'); // 最热资源
});

// 全部的tab项
function setAllTabs() {
    var schoolType = getData(root + 'open/api/schoolType');
    var course = getData(root + 'open/api/course');
    var classify = getData(root + 'open/api/classify');

    setSchoolType($("#schoolType"), schoolType);
    setCourse($("#course"), course);
    setClassify($("#classify"), classify);
}

/**
 * 加载学段
 * @param {Object} $container 容器jq对象
 * @param {json} dataObj
 */
function setSchoolType($container, dataObj) {
    var $template = $("#tabsTemplate"); // 模板
    $container.html('');
    if (dataObj) {
        // 获取模板，编译
        var tpl = $template.html();
        var tabsTemplate = Handlebars.compile(tpl);
        for (var i = 0; i < dataObj.data.length; i++) {
            var node = dataObj.data[i];
            var data = {
                title: node.label,
                id: node.value,
                isFirst: false
            };
            data.isFirst = ( i === 0 ? true : false);
            // 匹配内容，输入模板
            $container.append(tabsTemplate(data));
        }
    } else {
        $container.append('没有查询到资源。');
    }
}
/**
 * 加载学科
 * @param {Object} $container 容器jq对象
 * @param {json} dataObj
 */
function setCourse($container, dataObj) {
    var $template = $("#tabsTemplate"); // 模板
    $container.html('');
    if (dataObj) {
        // 获取模板，编译
        var tpl = $template.html();
        var tabsTemplate = Handlebars.compile(tpl);
        for (var i = 0; i < dataObj.data.length; i++) {
            var node = dataObj.data[i];
            var data = {
                title: node.name,
                id: node.id,
                isFirst: false
            };
            data.isFirst = ( i === 0 ? true : false);
            // 匹配内容，输入模板
            $container.append(tabsTemplate(data));
        }
    } else {
        $container.append('没有查询到资源。');
    }
}
/**
 * 加载类型
 * @param {Object} $container 容器jq对象
 * @param {json} dataObj
 */
function setClassify($container, dataObj) {
    var $template = $("#tabsTemplate"); // 模板
    $container.html('');
    if (dataObj) {
        // 获取模板，编译
        var tpl = $template.html();
        var tabsTemplate = Handlebars.compile(tpl);
        for (var i = 0; i < dataObj.data.length; i++) {
            var node = dataObj.data[i];
            var data = {
                title: node.name,
                id: node.id,
                isFirst: false
            };
            data.isFirst = ( i === 0 ? true : false);
            // 匹配内容，输入模板
            $container.append(tabsTemplate(data));
        }
    } else {
        $container.append('没有查询到资源。');
    }
}

/**
 * 加载全部资源
 * @param {string} url 请求地址
 */
function setAllResouse(url) {
    var $container = $('#resource-all'); // 容器
    var $template = $("#resAllTemplate"); // 模板
    var dataObj = getData(url);
    $container.html('');
    if (dataObj) {
        // 获取模板，编译
        var tpl1 = $template.html();
        var allTemplate = Handlebars.compile(tpl1);
        for (var i = 0; i < dataObj.data.length; i++) {
            var node = dataObj.data[i];
            var data = {
                title: node.title,
                date: node.createDate,
                url: root + 'f/resource/' + node.id,
            };
            // 匹配内容，输入模板
            $container.append(allTemplate(data));
        }
    } else {
        $container.append('没有查询到资源。');
    }
}

/**
 * 加载最热资源
 * @param {string} url 请求地址
 */
function setHotResouse(url) {
    var $container = $('#resource-hot'); // 容器
    var $template = $("#resHotTemplate"); // 模板
    var dataObj = getData(url);
    $container.html('');
    if (dataObj) {
        var tpl2 = $template.html();
        var hotTemplate = Handlebars.compile(tpl2);
        for (var i = 0; i < dataObj.data.length; i++) {
            var node = dataObj.data[i];
            var data = {
                rank: i + 1,
                title: node.title,
                url: root + 'f/resource/' + node.id,
                view: node.readNum
            };
            // 匹配内容，输入模板
            $container.append(hotTemplate(data));
        }
    } else {
        $container.append('没有查询到资源。');
    }
}


/**
 * 请求API
 * @param {string} url 请求地址
 */
function getData(url) {
    var result = "";
    // IE9 $.ajax support
    jQuery.support.cors = true;
    // 请求
    $.ajax({
        type: "post",
        url: url,
        data: {},
        async: false,
        success: function (data) {
            result = data;
        },
        error:function(e) {
            console.log("请求失败");
        }
    });
    return result;
}