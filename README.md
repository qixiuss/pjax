# slidePjax
pjax with slide animation, fade/slide, you can also custom your own animation
degrade to ie8 with hash, ie8 alse can animate
thanks velocityjs for perfect animation



# 依赖
	jquery.js
	velocity.js
# 使用方法
	// html结构
	<div class="container-selector">
		<div class="contentNew-selector"></div>
		<div class="contentInner-selector"></div>
	</div>

	// pjax初始化
    $.pjax({
        container: '.swiper-container',  // 组件初始化的container-selector
        selector: 'a[data-ajax="true"]',  // 触发异步请求的selector，一般是a标签
        contentNew: '.swiper-container .content-new', // 新加载的内容容器
        contentInner: '.swiper-container .content-inner', // 原始内容容器，新内容加载完成后，即变成了原始内容
        pagePriority: { 
        	// 由于slide需要确定左右方向，所以根据pagePriority参数来判断
        	// 如果page优先级一样，默认使用fade切换
        	// 如果page优先级一样，且page都一样，不做任何切换
            '/': 1,
            '/page1.html': 1,
            '/page1-1.html': 1,

            '/page2.html': 2,
            '/page2-2.html': 2,

            '/page3.html': 3,
            '/page3-2.html': 3
        },
        show: 'slide', // 页面替换动画类型，可以自定义
        cache: false, // 是否使用缓存
        storage: false, // 是否使用本地存储，谨慎使用，除非本地app
        titleSuffix: '', // 标题后缀
        filter: function() {}, // 过来selector，用来构建更复杂的长青
        callback: function() {} // 回调函数
    })