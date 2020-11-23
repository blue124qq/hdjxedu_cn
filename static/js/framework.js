/**
 * @module 底层平台框架[BaseFramework]
 * @description 底层平台框架，整个系统全局唯一
 *
 * @author 陈谋坤
 * @version 1.0 @Date: 2013-05-29 下午2:25
 */

//如果父窗口已经定义了该变量，就使用父窗口的，保证sharedInstance对于整个应用是唯一的
sharedInstance = {};
//解决跨域问题 add by chenmk 2016.03.19
try {
    //集成平台（门户）和项目如果都用平台客户端开发，而项目中的组织用户跟平台不是一致的，那么就在客户端配置文件中显示指定不共享该实例 add by chenmk 2017.12.19
    var isSharedInstance = typeof (EULER_CONFIG) == "object" ? EULER_CONFIG["sharedInstance"] !== false : true;
    if (isSharedInstance && typeof (parent.sharedInstance) != 'undefined') {
        sharedInstance = parent.sharedInstance;
    }

} catch (e) {
}


require = null;

BaseFramework = {
    /**
     * 获取框架的国际化信息。
     *
     * @default zh-CN
     */
    locale: "zh-CN",

    layout: "",

    layoutSkin: "",

    /**
     * 获取框架的主题库名称。
     *
     * @default
     */
    theme: "",
    /**
     * Web的根路径
     */
    webContextPath: null,

    /**
     * 框架的版本号
     */
    frameworkVersion: null,

    /**
     * 工程的版本号
     */
    projectVersion: null,

    /**
     * db中的配置信息
     */
    dbEulerConfig: null,

    /**
     * js中的配置信息
     */
    jsEulerConfig: null,

    /**
     * 默认customUi参数名称
     */
    customUi: "custom.ui",

    init: function () {
        var sysParamMap, webContextPath;
        //允许在入口框架页中预先定义一个全局变量WECHAT_MOBILE_VERSION，设置平台的版本号，避免向服务端发送同步请求,提高效率 add by chenmk 2016.01.09
        if (typeof CLIENT_SYS_PARAM == "object") {
            sysParamMap = CLIENT_SYS_PARAM;
            webContextPath = sysParamMap["webContextPath"];
        }

        this.webContextPath = webContextPath == null ? this.getWebContextPath() : webContextPath;
        //多个页面配置，通过地址解析uiCode
        //http://localhost:8090/aa_index.html http://localhost:8090/bb_index.html,
        //http://localhost:8090/index.html 默认为custom.ui add by chenjm 2018.02.08
        var uiCode = this.getUiCode(window.location);
        var para = "framework.version,project.version,framework.name,project.name," +
            "rop.encryptEnable,locale.lang,file.default.allow.types,err.detail.show," + this.customUi;
        if (uiCode) {
            para = para + "," + this.customUi + "." + uiCode;
        }
        sysParamMap = sysParamMap || this.getSystemParameters(para) || {};

        var frameworkVersion = sysParamMap["framework.version"] || "1.0.0";
        var frameworkName = sysParamMap["framework.name"] || "euler";
        var projectVersion = sysParamMap["project.version"] || "";
        var projectName = sysParamMap["project.name"] || "";
        var ropEncryptEnable = sysParamMap["rop.encryptEnable"] || 'false';
        var i18nLanguage = sysParamMap["locale.lang"] || 'zh';
        var fileDefaultAllowTypes = sysParamMap["file.default.allow.types"] || null;
        if (!frameworkVersion) {
            alert("请在euler-framework配置文件[version/euler-version.properties,spring/euler-web.xml]中指定平台的版本号[framework.version]，否则系统无法使用！");
            return;
        }

        this.frameworkVersion = this.trim(frameworkVersion);
        this.frameworkName = this.trim(frameworkName);
        this.projectVersion = this.trim(projectVersion);
        this.projectName = this.trim(projectName);
        this.ropEncryptEnable = ropEncryptEnable;
        this.i18nLanguage = i18nLanguage;
        this.fileDefaultAllowTypes = fileDefaultAllowTypes;
        if (uiCode) {
            var dbEulerConfigStr = sysParamMap[this.customUi + "." + uiCode];
            if (dbEulerConfigStr) {
                this.dbEulerConfig = eval('(' + dbEulerConfigStr + ')');
            } else {
                dbEulerConfigStr = sysParamMap[this.customUi];
                if (dbEulerConfigStr) {
                    this.dbEulerConfig = eval('(' + dbEulerConfigStr + ')');
                }
            }
        } else {
            dbEulerConfigStr = sysParamMap[this.customUi];
            if (dbEulerConfigStr) {
                this.dbEulerConfig = eval('(' + dbEulerConfigStr + ')');
            }
        }

        var mappingPath = this.getMappingPath();  //映射路径;
        var that = this;
        //保证 require-config.js先加载，add by chenwy 15-3-18
        this._loadScript(mappingPath + "core/js/require-config.js", null, function () {   //加载require的配置信息
            that._loadEulerConf();   //加载平台配置文件
        })
    },
    trim: function (str) {
        if (!str) {
            return str;
        }
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    },
    /**
     * 解析地址，返回uicode
     * http://localhost:6401/aa_index.html
     * 返回 aa
     * @param location
     * @returns {*}
     */
    getUiCode: function (location) {
        if (location == null)
            return false;
        var pathName = location.pathname;
        if (pathName == null)
            return false;
        pathName = location.protocol + "//" + location.host + pathName;  //完整的路径 add by chenmk 2015.05.14
        pathName = pathName.replace(this.webContextPath, "");
        if (!pathName)
            return "";
        if (pathName.indexOf("_index.html") != -1) {
            pathName = pathName.substring(pathName.lastIndexOf("/"));
            return pathName.substring(1, pathName.indexOf("_index.html"));
        }
        return "";
    },
    getWebContextPath: function () {
        var result = this.webContextPath;
        if (result)
            return result;

        var jsArray = document.getElementsByTagName("script");

        if (jsArray.length == 0) {
            return result;
        }
        for (var i = 0; i < jsArray.length; i++) {
            var jsSrc = jsArray[i].src;
            if (jsSrc.indexOf("framework.js") >= 0) {
                result = jsSrc;
                break;
            }
        }
        result = result.substring(0, result.lastIndexOf("/"));  //先获取当前JS文件所在的路径
        result = result.substring(0, result.lastIndexOf("/"));  //然后往上退一层，因为framework.js的路径是<应用上下文>/core_js/framework.js

        return result;
    },
    loadCss: function (cssSrc) {
        this._includeCss(cssSrc, false);
    },
    unloadCss: function (cssSrc) {
        this._includeCss(cssSrc, true);
    },
    getJSEulerConfig: function () {
        return this.jsEulerConfig;
    },
    getDBEulerConfig: function () {
        return this.dbEulerConfig;
    },
    getFrameworkName: function () {
        return this.frameworkName;
    },
    getFrameworkVersion: function () {
        return this.frameworkVersion;
    },
    getRopEncryptEnable: function () {
        return this.ropEncryptEnable;
    },
    getI18nLanguage: function () {
        return this.i18nLanguage;
    },
    /**
     * [可选][String]允许上传的文件类型，多个值用逗号分隔；为空就不限制文件类型
     * 格式如：’doc,pdf,rar’--
     */
    getFileDefaultAllowTypes: function () {
        return this.fileDefaultAllowTypes || null;
    },
    getMappingPath: function () {
        return [this.webContextPath, "/", this.frameworkName, "/", this.frameworkVersion, "/"].join("");  //映射路径;
    },
    getRequireConfig: function () {
        return this.requireConfig;
    },
    /**
     * 根据系统参数的键来获取系统参数的值
     * @param sysParamKeys
     * @returns {*}
     */
    getSystemParameters: function (sysParamKeys) {
        var url = this.webContextPath + "/ctxAttrGet";
        var params = {
            attrNames: sysParamKeys
        };
        var result;
        var callback = function (responseText) {
            if (responseText) {
                result = eval('(' + responseText + ')');
            }
        };
        this.ajax("post", url, params, false, callback);  //同步请求
        return result;
    },
    ajax: function (method, url, params, async, callback) {
        var xmlHttpRequest;
        method = (method || "get").toUpperCase();
        var isPost = method == "POST";
        if (window.XMLHttpRequest) {// code for Firefox, Opera, IE7, etc.
            xmlHttpRequest = new XMLHttpRequest();
        } else {
            if (window.ActiveXObject) {// code for IE6, IE5
                xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        if (xmlHttpRequest != null) {
            callback = callback || function () {
            };
            if (typeof params == "object") {
                var strArray = [], key, paramValue;
                var split = "";
                for (key in params) {
                    paramValue = params[key];
                    paramValue = isPost ? encodeURIComponent(paramValue) : paramValue;

                    strArray.push(split);
                    strArray.push(key);
                    strArray.push("=");
                    strArray.push(paramValue);
                    split = "&";
                }
                params = strArray.join("");
            }

            xmlHttpRequest.open(method, url, async);

            if (typeof params == "string") {
                params = params + "&" + (new Date()).getTime();
                if (isPost) {
                    xmlHttpRequest.setRequestHeader("CONTENT-TYPE", "application/x-www-form-urlencoded");
                } else {
                    url = url + "?" + params;
                }
            }

            xmlHttpRequest.onreadystatechange = function () {
                // 4 = "loaded"
                if (xmlHttpRequest.readyState != 4)
                    return;
                //如果找不到请求服务，就直接返回，不报错，为了保证客户端能够正常跑 add by chenmk 2015.05.15
                if (xmlHttpRequest.status == 404) {

                    return;
                }
                if (xmlHttpRequest.status != 200) {
                    alert("请求服务[ " + url + " ]失败，请与管理员联系！");
                    return;
                }
                callback(xmlHttpRequest.responseText);                //执行服务请求成功的回调函数
            };

            xmlHttpRequest.send(params);
        } else {
            alert("Your browser does not support XMLHTTP.");
        }
    },
    _loadEulerConf: function () {
        //如果已经存在该对象，就直接返回（支持多个配置文件，允许覆盖）
        if (typeof EULER_CONFIG == "object") {
            BaseFramework._loadEulerConfCallBack(true);
            return;
        }


        this._loadScript(this._getEulerConfPath(), null, function () {
            BaseFramework._loadEulerConfCallBack(true);
        }, function () {
            BaseFramework._loadEulerConfCallBack(false);
        });
    },
    _getEulerConfPath: function () {
        var result = [this.getWebContextPath()];
        var projectVersion = this.projectVersion;
        var projectName = this.projectName;
        if (projectVersion) {
            result.push(projectName);
            result.push(projectVersion);
        }
        result.push("js/euler-conf.js");

        return result.join("/");
    },
    _loadEulerConfCallBack: function (isSuccessful) {
        if (!isSuccessful || typeof EULER_CONFIG == "undefined") {
            alert("请确定工程中存在js/euler-conf.js文件，否则系统无法使用！");
            return;
        }

        //因为配置文件有可能是在framework中加载的，因此需要在这里再判断一下，如果不共享，就把值清空add by chenmk 2018.09.07
        //集成平台（门户）和项目如果都用平台客户端开发，而项目中的组织用户跟平台不是一致的，那么就在客户端配置文件中显示指定不共享该实例
        if (EULER_CONFIG["sharedInstance"] === false) {
            $global.sharedInstance = sharedInstance = {
                BaseFramework: BaseFramework
            };
        }

        var jsEulerConfig = EULER_CONFIG;  //设置euler-conf.js中的配置值
        this.jsEulerConfig = jsEulerConfig;

        var eulerConfig = this.dbEulerConfig || jsEulerConfig;  //如果有数据库中有配置，那么就取数据库；否则就取js中的配置
        var uiConfig = eulerConfig["ui"];

        var currentModuleName = jsEulerConfig["currentModuleName"],
            appCnName = eulerConfig["appCnName"],
            theme = uiConfig["project"]["theme"] || "default",
            layout = uiConfig["framework"]["layout"] || "default",
            layoutSkin = uiConfig["framework"]["layoutSkin"] || "default",
            prjRequireConfig = jsEulerConfig["require"];

        //如果非平台的模块，而是工程的项目，又没有指定工程版本，就报错
        if (!currentModuleName && !this.projectVersion) {
            alert("请在工程配置文件[conf/euler-conf.properties,spring/<projectName>-web.xml]中指定工程的版本号[project.version]，否则系统无法使用！");
            return;
        }

        this.theme = theme;
        this.layout = layout;
        this.layoutSkin = layoutSkin;

        //针对于弹窗（不包含框架页），需要额外添加框架页的一些样式
        var pathName = document.location.pathname;
        var isMainPage = pathName.indexOf("/main.html") > -1;
        if (isMainPage) {
            var mappingPath = this.getMappingPath();  //映射路径;
            this._loadCss(mappingPath + "core/resources/themes/" + theme + "/global.css");
            this._loadCss(mappingPath + "dcresources/framework/icons/action/icon-action.css");
            this._loadCss(mappingPath + "dcresources/framework/icons/tree/icon-tree.css");
        }

        this._initRequireConfig(currentModuleName, theme, layout, layoutSkin, prjRequireConfig);

        //启动requireJS的入口文件
        var entryPoint = jsEulerConfig["entry"]["point"] || this._getDefaultEntryPoint();  //启动文件，即按照requireJS的规范指定data-main属性值，即requireJS的入口点

        appCnName = appCnName || "";
        document.title = appCnName.replace(/<[^>]*>/g, "");
        this._loadScript(this._getRequireJSPath(), {"data-main": entryPoint});
    },
    _includeCss: function (cssSrc, exInclude) {
        if (!cssSrc)
            return;
        var cssSrcArray = null;
        if (typeof cssSrc == "string") {
            cssSrcArray = [cssSrc];
        }
        if (typeof cssSrc == "object") {
            cssSrcArray = cssSrc;
        }
        if (cssSrcArray == null)
            return;
        var src;
        for (var i = 0, count = cssSrcArray.length; i < count; i++) {
            src = cssSrcArray[i];
            if (exInclude) {
                this._unloadCss(src);
            } else {
                this._loadCss(src);
            }
        }
    },
    _loadCss: function (cssSrc) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = cssSrc;
        head.appendChild(link);
    },
    _unloadCss: function (cssSrc) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var linkArray = head.getElementsByTagName("link");
        if (linkArray == null || linkArray.length == 0)
            return;
        var link;
        for (var i = 0, count = linkArray.length; i < count; i++) {
            link = linkArray[i];
            if (link.href == cssSrc) {
                head.removeChild(link);
                break;
            }
        }
    },
    _loadScript: function (scriptSrc, attrMap, loadCallback, errorCallback) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = scriptSrc;
        script.type = "text/javascript";
        if (attrMap) {
            for (var key in attrMap) {
                var att = document.createAttribute(key);
                att.value = attrMap[key];
                script.setAttributeNode(att);
            }
        }
        loadCallback = loadCallback || function () {
        };
        errorCallback = errorCallback || function () {
        };
        script.onload = script.onreadystatechange = function () {
            if (!this.readyState || 'loaded' === this.readyState || 'complete' === this.readyState) {
                loadCallback();
                this.onload = this.onreadystatechange = null;
            }
        };
        script.onerror = function () {
            errorCallback();
        };
        head.appendChild(script);
    },
    /**
     * 初始化requireJS全局配置信息
     * @param currentModuleName
     * @param theme
     * @param layout
     * @param layoutSkin
     * @param prjRequireConfig
     * @private
     */
    _initRequireConfig: function (currentModuleName, theme, layout, layoutSkin, prjRequireConfig) {
        //It is best to use var require = {} and do not use window.require = {}, it will not behave correctly in IE.
        require = $globalRequireConfig(this.webContextPath, this.frameworkName, this.frameworkVersion, this.projectName,
            this.projectVersion, currentModuleName, theme, layout, layoutSkin, prjRequireConfig, this.i18nLanguage);  //执行该函数，并且赋值给全局变量
        //
        this.requireConfig = require;
    },
    _getRequireJSPath: function () {
        return this._getCoreJsAbsolutePath() + "lib/require/" + $getRequireJSVersion() + "/require.js"
    },
    _getDefaultEntryPoint: function () {
        return "core_js/initialize";
//        return this._getCoreJsAbsolutePath() + "initialize.js";
    },
    _getCoreJsAbsolutePath: function () {
        var moduleAbsoluteWebRoot = this.getModuleAbsoluteWebRoot();  //模块根的绝对路径;
        return moduleAbsoluteWebRoot + "core/js/";
    },
    getModuleAbsoluteWebRoot: function () {
        return [this.webContextPath, "/", this.frameworkName, "/", this.frameworkVersion, "/"].join("");
    }
};

//缓存最顶级的BaseFramework，保证ApplicationContext中能够正常获取到该对象
if (!sharedInstance["BaseFramework"]) {
    sharedInstance["BaseFramework"] = BaseFramework;
}

// 定义全局对象。
$global = {};
$global.BaseFramework = BaseFramework;
$global.sharedInstance = sharedInstance;   //$sharedInstance是整个应用唯一的，存储在入口处的框架页中

$global.BaseFramework.init();  //初始化框架信息
