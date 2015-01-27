/*!
 * slidePjax(ajax + history.pushState + ie8hash + slide animation(custom yourself)) for jquery
 * 用hash来兼容低版本浏览器
 * by qixiuss
 */
(function($) {
    var Util = {
        support: {
            pjax: window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/),
            storage: !!window.localStorage
        },
        toInt: function(obj) {
            return parseInt(obj);
        },
        stack: {},
        getTime: function() {
            return new Date * 1;
        },
        // 获取URL不带hash的部分,切去掉pjax=true部分
        getRealUrl: function(url) {
            url = (url || '').replace(/\#.*?$/, '');
            url = url.replace('?pjax=true&', '?').replace('?pjax=true', '').replace('&pjax=true', '');
            return url;
        },
        // 获取url的hash部分
        getUrlHash: function(url) {
            return url.replace(/^[^\#]*(?:\#(.*?))?$/, '$1');
        },
        /**
         * 获取pathname，主要是ie8、9下抽出pathname的一个小函数
         * @return {[type]} [description]
         */
        getPathname: function() {
            var pathname;

            if (Util.support.pjax) {
                pathname = location.pathname;
            } else {
                pathname = /\?/.test(location.hash) ? location.hash.split('?')[0] : location.hash;
                pathname = pathname.slice(1);
            }

            return pathname;
        },
        // 获取本地存储的key
        getLocalKey: function(src) {
            var s = 'pjax_' + encodeURIComponent(src);
            return {
                data: s + '_data',
                time: s + '_time',
                title: s + '_title'
            };
        },
        // 清除所有的cache
        removeAllCache: function() {
            if (!Util.support.storage)
                return;
            for (var name in localStorage) {
                if ((name.split('_') || [''])[0] === 'pjax') {
                    delete localStorage[name];
                }
            }
        },
        // 获取cache
        getCache: function(src, time, flag) {
            var item, vkey, tkey, tval;
            time = Util.toInt(time);
            if (src in Util.stack) {
                item = Util.stack[src], ctime = Util.getTime();
                if ((item.time + time * 1000) > ctime) {
                    return item;
                } else {
                    delete Util.stack[src];
                }
            } else if (flag && Util.support.storage) { // 从localStorage里查询
                var l = Util.getLocalKey(src);
                vkey = l.data;
                tkey = l.time;
                item = localStorage.getItem(vkey);
                if (item) {
                    tval = Util.toInt(localStorage.getItem(tkey));
                    if ((tval + time * 1000) > Util.getTime()) {
                        return {
                            data: item,
                            title: localStorage.getItem(l.title)
                        };
                    } else {
                        localStorage.removeItem(vkey);
                        localStorage.removeItem(tkey);
                        localStorage.removeItem(l.title);
                    }
                }
            }
            return null;
        },
        // 设置cache
        setCache: function(src, data, title, flag) {
            var time = Util.getTime(),
                key;
            Util.stack[src] = {
                data: data,
                title: title,
                time: time
            };
            if (flag && Util.support.storage) {
                key = Util.getLocalKey(src);
                localStorage.setItem(key.data, data);
                localStorage.setItem(key.time, time);
                localStorage.setItem(key.title, title);
            }
        },
        // 清除cache
        removeCache: function(src) {
            src = Util.getRealUrl(src || location.href);
            delete Util.stack[src];
            if (Util.support.storage) {
                var key = Util.getLocalKey(src);
                localStorage.removeItem(key.data);
                localStorage.removeItem(key.time);
                localStorage.removeItem(key.title);
            }
        },
        /**
         * slide的prev动画
         * @return {[type]} [description]
         */
        slidePrev: function(elContainer, data, callback) {
            var me = this,
                elContentNew = elContainer.find('.content-new'),
                elContentInner = elContainer.find('.content-inner');

            elContentNew.html(data || '');
            elContentNew.prependTo(elContainer);

            // 浏览器版本低于ie9
            if (!$.support.leadingWhitespace) {
                elContentInner.velocity({
                    translateZ: 0,
                    left: '100%',
                    opacity: 0
                }, {
                    complete: function() {
                        elContentInner.velocity({
                            'left': '0%'
                        }, {
                            duration: 0,
                            display: 'none'
                        });
                        elContentInner.removeClass('content-inner').addClass('content-new');
                        callback && callback();
                    }
                });

                elContentNew.css({
                    'display': 'block',
                    'left': '-100%'
                }).velocity({
                    translateZ: 0,
                    left: '0%',
                    opacity: 1
                }, {
                    complete: function() {
                        elContentNew.removeClass('content-new').addClass('content-inner');
                        callback && callback();
                    }
                });
            } else {
                elContentInner.velocity({
                    translateZ: 0,
                    translateX: '100%',
                    opacity: 0
                }, {
                    complete: function() {
                        elContentInner.velocity({
                            'translateX': '0%'
                        }, {
                            duration: 0,
                            display: 'none'
                        });
                        elContentInner.removeClass('content-inner').addClass('content-new');
                        callback && callback();
                    }
                });

                elContentNew.css({
                    'display': 'block',
                    'left': '-100%'
                }).velocity({
                    translateZ: 0,
                    translateX: '100%',
                    opacity: 1
                }, {
                    complete: function() {
                        elContentNew.velocity({
                            'translateX': '0%',
                            'left': '0%'
                        }, {
                            duration: 0
                        });
                        elContentNew.removeClass('content-new').addClass('content-inner');
                        callback && callback();
                    }
                });
            }
        },
        /**
         * slide的next动画
         * @return {[type]} [description]
         */
        slideNext: function(elContainer, data, callback) {
            var elContentNew = elContainer.find('.content-new'),
                elContentInner = elContainer.find('.content-inner');

            elContentNew.html(data || '');
            elContentNew.appendTo(elContainer);

            // 浏览器版本低于ie9
            if (!$.support.leadingWhitespace) {
                elContentInner.velocity({
                    left: '-100%',
                    opacity: 0
                }, {
                    complete: function() {
                        elContentInner.velocity({
                            'left': '0%'
                        }, {
                            duration: 0,
                            display: 'none'
                        });
                        elContentInner.removeClass('content-inner').addClass('content-new');
                        callback && callback()
                    }
                });

                elContentNew.css({
                    'display': 'block',
                    'left': '100%'
                }).velocity({
                    left: '0%',
                    opacity: 1
                }, {
                    complete: function() {
                        elContentNew.removeClass('content-new').addClass('content-inner');
                        callback && callback();
                    }
                });
            } else {
                elContentInner.velocity({
                    translateZ: 0,
                    translateX: '-100%',
                    opacity: 0
                }, {
                    complete: function() {
                        elContentInner.velocity({
                            'translateX': '0%'
                        }, {
                            duration: 0,
                            display: 'none'
                        });
                        elContentInner.removeClass('content-inner').addClass('content-new');
                        callback && callback()
                    }
                });

                elContentNew.css({
                    'display': 'block',
                    'left': '100%'
                }).velocity({
                    translateZ: 0,
                    translateX: '-100%',
                    opacity: 1
                }, {
                    complete: function() {
                        elContentNew.velocity({
                            'translateX': '0%',
                            'left': '0%'
                        }, {
                            duration: 0
                        });
                        elContentNew.removeClass('content-new').addClass('content-inner');
                        callback && callback();
                    }
                });
            }
        },
        // fade动画效果
        fade: function(elContainer, data, callback) {
            var elContentInner = elContainer.find('.content-inner');

            elContentInner.fadeOut(500, function() {
                elContentInner.html(data).fadeIn(500, function() {
                    callback && callback();
                });
            });
        }
    };
    // pjax
    var pjax = function(options) {
        options = $.extend({
            selector: '',
            container: '',
            contentInner: '',
            contentNew: '',
            pagePriority: {},
            callback: function() {},
            filter: function() {}
        }, options);
        if (!options.container || !options.contentNew || !options.selector) {
            throw new Error('container & selector & contentNew options must be set');
        }
        $('body').delegate(options.selector, 'click', function(event) {
            if (event.which > 1 || event.metaKey) {
                return true;
            }
            var me = $(this),
                href = me.attr('href');
            // 过滤
            if (typeof options.filter === 'function') {
                if (options.filter.call(this, href, this) === true) {
                    return true;
                }
            }
            if (href === location.href) {
                return true;
            }
            // 只是hash不同
            if (Util.getRealUrl(href) == Util.getRealUrl(location.href)) {
                var hash = Util.getUrlHash(href);
                if (hash) {
                    location.hash = hash;
                    options.callback && options.callback.call(this, {
                        type: 'hash'
                    });
                }
                return true;
            }
            event.preventDefault();
            options = $.extend(true, options, {
                url: href,
                element: this,
                title: '',
                push: true
            });
            // 发起请求
            pjax.request(options);
        });
    };
    pjax.xhr = null;
    pjax.options = {};
    pjax.state = {};

    // 默认选项
    pjax.defaultOptions = {
        timeout: 2000,
        element: null,
        cache: 24 * 3600, // 缓存时间, 0为不缓存, 单位为秒
        storage: true, // 是否使用localstorage将数据保存到本地
        url: '', // 链接地址
        push: true, // true is push, false is replace, null for do nothing
        show: '', // 展示的动画
        title: '', // 标题
        titleSuffix: '', // 标题后缀
        type: 'GET',
        data: {
            pjax: true
        },
        oldPathname: Util.getPathname() || '/',
        newPathname: '/',
        dataType: 'html',
        callback: null, // 回调函数
        // for jquery
        beforeSend: function(xhr) {
            $(pjax.options.contentNew).trigger('pjax.start', [xhr, pjax.options]);
            xhr && xhr.setRequestHeader('X-PJAX', true);
        },
        error: function() {
            pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
                type: 'error'
            });
            location.href = pjax.options.url;
        },
        complete: function(xhr) {
            $(pjax.options.contentNew).trigger('pjax.end', [xhr, pjax.options]);
        }
    };
    // 展现动画
    pjax.showFx = {
            "_default": function(data, callback, isCached) {
                this.html(data);
                callback && callback.call(this, data, isCached);
            },
            fade: function(data, callback, isCached) {
                var me = this;

                Util.fade($(pjax.options.container), data, function() {
                    callback && callback.call(me, data, isCached);
                });
            },
            slide: function(data, callback, isCached) {
                var me = this,
                    pagePriority = pjax.options.pagePriority,
                    oldPathname = pjax.options.oldPathname,
                    newPathname = Util.getPathname();

                if (newPathname == oldPathname) {
                    return;
                } else if (pagePriority[newPathname] > pagePriority[oldPathname]) {
                    Util.slideNext($(pjax.options.container), data, function() {
                        callback && callback.call(me, data, isCached);
                    });

                } else if (pagePriority[newPathname] < pagePriority[oldPathname]) {
                    Util.slidePrev($(pjax.options.container), data, function() {
                        callback && callback.call(me, data, isCached);
                    });
                } else {
                    // 其他效果，比如fadeIn
                }

                pjax.options.oldPathname = newPathname;
            }
        }
        // 展现函数
    pjax.showFn = function(showType, contentNew, data, fn, isCached) {
            var fx = null;
            if (typeof showType === 'function') {
                fx = showType;
            } else {
                if (!(showType in pjax.showFx)) {
                    showType = "_default";
                }
                fx = pjax.showFx[showType];
            }
            fx && fx.call(contentNew, data, function() {
                var hash = location.hash;
                if (hash != '') {
                    location.href = hash;
                    //for FF
                    if (/Firefox/.test(navigator.userAgent)) {
                        history.replaceState($.extend({}, pjax.state, {
                            url: null
                        }), document.title);
                    }
                } else {
                    window.scrollTo(0, 0);
                }
                fn && fn.call(this, data, isCached);
            }, isCached);
        }
        // success callback
    pjax.success = function(data, isCached) {
        // isCached default is success
        if (isCached !== true) {
            isCached = false;
        }
        //accept Whole html
        if (pjax.html) {
            data = $(data).find(pjax.html).html();
        }
        if ((data || '').indexOf('<html') != -1) {
            pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
                type: 'error'
            });
            location.href = pjax.options.url;
            return false;
        }
        var title = pjax.options.title || "",
            el;
        if (pjax.options.element) {
            el = $(pjax.options.element);
            title = el.attr('title') || el.text();
        }
        var matches = data.match(/<title>(.*?)<\/title>/);
        if (matches) {
            title = matches[1];
        }
        if (title) {
            if (title.indexOf(pjax.options.titleSuffix) == -1) {
                title += pjax.options.titleSuffix;
            }
        }
        document.title = title;
        pjax.state = {
            contentNew: pjax.options.contentNew,
            timeout: pjax.options.timeout,
            cache: pjax.options.cache,
            storage: pjax.options.storage,
            show: pjax.options.show,
            title: title,
            url: pjax.options.oldUrl
        };
        var query = $.param(pjax.options.data);
        if (query != "") {
            pjax.state.url = pjax.options.url + (/\?/.test(pjax.options.url) ? "&" : "?") + query;
        }
        if (pjax.options.push) {
            if (!pjax.active) {
                if (Util.support.pjax) {
                    history.replaceState($.extend({}, pjax.state, {
                        url: null
                    }), document.title);
                } else {
                    location.hash = pjax.state.url || '';
                }
                pjax.active = true;
            }

            if (Util.support.pjax) {
                history.pushState(pjax.state, document.title, pjax.options.oldUrl);
            } else {
                location.hash = pjax.state.url;
            }

        } else if (pjax.options.push === false) {
            if (Util.support.pjax) {
                history.replaceState(pjax.state, document.title, pjax.options.oldUrl);
            } else {
                location.hash = pjax.state.url;
            }
        }
        // 执行展示动画
        pjax.options.showFn && pjax.options.showFn(data, function() {
            pjax.options.callback && pjax.options.callback.call(pjax.options.element, {
                type: isCached ? 'cache' : 'success'
            });
        }, isCached);
        // 设置cache
        if (pjax.options.cache && !isCached) {
            Util.setCache(pjax.options.url, data, title, pjax.options.storage);
        }
    };

    // 发送请求
    pjax.request = function(options) {
        options = $.extend(true, pjax.defaultOptions, options);
        var cache, contentNew = $(options.contentNew);
        options.oldUrl = options.url;
        options.url = Util.getRealUrl(options.url);
        if ($(options.element).length) {
            cache = Util.toInt($(options.element).attr('data-pjax-cache'));
            if (cache) {
                options.cache = cache;
            }
        }
        if (options.cache === true) {
            options.cache = 24 * 3600;
        }
        options.cache = Util.toInt(options.cache);
        // 如果将缓存时间设为0，则将之前的缓存也清除
        if (options.cache === 0) {
            Util.removeAllCache();
        }
        // 展现函数
        if (!options.showFn) {
            options.showFn = function(data, fn, isCached) {
                pjax.showFn(options.show, contentNew, data, fn, isCached);
            };
        }
        pjax.options = options;
        pjax.options.success = pjax.success;
        if (options.cache && (cache = Util.getCache(options.url, options.cache, options.storage))) {
            options.beforeSend();
            options.title = cache.title;
            pjax.success(cache.data, true);
            options.complete();
            return true;
        }
        if (pjax.xhr && pjax.xhr.readyState < 4) {
            pjax.xhr.onreadystatechange = $.noop;
            pjax.xhr.abort();
        }
        pjax.xhr = $.ajax(pjax.options);
    };

    // popstate event
    var popped = ('state' in window.history),
        initialURL = location.href;
    $(window).bind('popstate', function(event) {
        var initialPop = !popped && location.href == initialURL;
        popped = true;
        if (initialPop) return;
        var state = event.state;
        if (state && state.contentNew) {
            if ($(state.contentNew).length) {
                var data = {
                    url: state.url,
                    contentNew: state.contentNew,
                    push: null,
                    timeout: state.timeout,
                    cache: state.cache,
                    storage: state.storage,
                    title: state.title,
                    element: null
                };
                pjax.request(data);
            } else {
                window.location = location.href;
            }
        }
    });

    // // not support
    // if (!Util.support.pjax) {
    //     // pjax = function() {
    //     // 	return true;
    //     // };
    //     // pjax.request = function(options) {
    //     // 	if (options && options.url) {
    //     // 		location.href = options.url;
    //     // 	}
    //     // };
    // }

    // pjax bind to $
    $.pjax = pjax;
    $.pjax.util = Util;

    // extra
    if ($.inArray('state', $.event.props) < 0) {
        $.event.props.push('state')
    }

})(jQuery);
