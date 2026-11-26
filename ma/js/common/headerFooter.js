$(document).ready(function () {
    //解決點擊延遲
    FastClick.attach(document.body);

  //選單滾動
    var lastScrollTop;
    var navbar = document.getElementById('header'); 
    window.addEventListener('scroll',function(){
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (document.querySelector('.nav-dropdown-toggle[aria-expanded="true"]') || navbar.classList.contains('on')) {
            navbar.style.top = '0';
        } else if(scrollTop <= 0){ 
            navbar.style.top='0';
       
        }else if(scrollTop > lastScrollTop){ 
            navbar.style.top='-70px';
        }else{
            navbar.style.top='0';
        }
        lastScrollTop = scrollTop; 
    });
   

    //gotop        
    var float_btn = $('.float_btn');
    var gotop = $('#gotop');
    gotop.click(function () {
        if (document.querySelector('script[src*="home-motion.js"]')) return; // 首頁由共用緩動接管，避免兩套滾動同時運作。
        $('html,body').animate({
            scrollTop: 0
        }, 500);
    });
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
           float_btn.fadeIn();
        } else {
           float_btn.stop().fadeOut();
        }
    });
    if ($(window).width() < 769) {
       
        $(window).scroll(function(){
             //最後一頁scrollTop=body-window，50是預留空間
     last=$("body").height()-$(window).height()-200
     if($(window).scrollTop()>=last){
        $(".float_action_group").hide()
     }
     else{
        $(".float_action_group").show()
     }
         
        })
    }

    //數位服務選單
    $('.function_ham').click(function () {
        $('.function_nav').toggleClass('function_nav_close')
    });
    if ($(window).width() > 800) {
        var function_nav = $('.function_nav');
        var nav_wrap = $('.nav_wrap');
        $(window).scroll(function () {
            if ($(this).scrollTop() > 0) {
                function_nav.addClass('function_nav_close')
                nav_wrap.addClass('nav_wrap_close')
            } else {
                function_nav.removeClass('function_nav_close')
                nav_wrap.removeClass('nav_wrap_close')
          
            }
        });
    }

    // 下拉導覽：同時只展開一組，並保留子連結的原生跳頁行為。
    var header = document.getElementById('header');
    var navigation = document.getElementById('main-navigation');
    var toggle = document.getElementById('toggle');
    var dropdowns = Array.from(header.querySelectorAll('.nav-dropdown-toggle'));
    var mobileViewport = window.matchMedia('(max-width: 800px)');

    function setDropdown(button, open) {
        button.setAttribute('aria-expanded', String(open));
        document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
    }
    function closeDropdowns() {
        dropdowns.forEach(function (button) { setDropdown(button, false); });
    }
    function setMobileMenu(open) {
        [header, navigation, toggle].forEach(function (element) { element.classList.toggle('on', open); });
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
        document.body.classList.toggle('nav-is-open', open);
        if (!open) closeDropdowns();
    }
    dropdowns.forEach(function (button) {
        button.addEventListener('click', function () {
            var open = button.getAttribute('aria-expanded') !== 'true';
            closeDropdowns();
            setDropdown(button, open);
            header.style.top = '0';
        });
        button.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                closeDropdowns();
                setDropdown(button, true);
                document.getElementById(button.getAttribute('aria-controls')).querySelector('a').focus();
            }
        });
    });
    toggle.addEventListener('click', function () {
        setMobileMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('click', function (event) {
        if (!header.contains(event.target)) closeDropdowns();
    });
    header.addEventListener('focusout', function (event) {
        if (!header.contains(event.relatedTarget)) closeDropdowns();
    });
    header.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        var active = dropdowns.find(function (button) { return button.getAttribute('aria-expanded') === 'true'; });
        if (active) { closeDropdowns(); active.focus(); }
        else if (toggle.getAttribute('aria-expanded') === 'true') { setMobileMenu(false); toggle.focus(); }
    });
    navigation.querySelectorAll('a[href]').forEach(function (link) {
        link.addEventListener('click', function () { setMobileMenu(false); });
    });
    mobileViewport.addEventListener('change', function () { setMobileMenu(false); });
});
