

/*! ----------------------------------------------------------------------------------------------------- 
                                                                                            ZGTC OBJECT
  ----------------------------------------------------------------------------------------------------- */

var ZGTC = {
    debug : 1
};


/*! ----------------------------------------------------------------------------------------------------- 
                                                                                                 CACHE
 ----------------------------------------------------------------------------------------------------- */
ZGTC.CACHE = {
    init : function(){
        ZGTC.CACHE.W        = $(window);
        ZGTC.CACHE.HD       = $(document.getElementsByTagName("html")[0]);
        ZGTC.CACHE.BODY     = $(document.body);
        ZGTC.CACHE.UA       = navigator.userAgent.toLowerCase();
    },

    standarizeEvents : function(){
        ZGTC.CACHE.CLICK    = ('ontouchstart' in window)?"touchend":"click";
        ZGTC.CACHE.TAP      = ('ontouchstart' in window)?"touchstart":"click";
        ZGTC.CACHE.TRANS    = (!!window.webkitURL)?"webkitTransitionEnd":"transitionend";
        // webkitTransitionEnd works for chrome, safari, opera
        // elegant solution at http://stackoverflow.com/a/18106816
        // does not trigger twice, not even once for webkit since sets transitionEnd instead of webkitTransitionEnd
        // !!window.MozApplicationEvent moz16+
    }    
};


/*! ----------------------------------------------------------------------------------------------------- 
                                                                                             EXTENSIONS
  ----------------------------------------------------------------------------------------------------- */

if ( ! window.console ) console = { log: function(){} };
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        'use strict';
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
}

/*! ----------------------------------------------------------------------------------------------------- 
                                                                                                 COOKIES
   ----------------------------------------------------------------------------------------------------- */
/*!
    cookies.js, modified by zigotica.com

    A complete cookies reader/writer framework with full unicode support.

    https://developer.mozilla.org/en-US/docs/Web/API/document.cookie

    This framework is released under the GNU Public License, version 3 or later.
    http://www.gnu.org/licenses/gpl-3.0-standalone.html
/* ----------------------------------------------------------------------------------------------------- */
kookies = {
    get: function (sKey) {
        return unescape(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    set: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
          switch (vEnd.constructor) {
            case Number:
              sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
              break;
            case String:
              sExpires = "; expires=" + vEnd;
              break;
            case Date:
              sExpires = "; expires=" + vEnd.toGMTString();
              break;
          }
        }
        document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    remove: function (sKey, sPath) {
        if (!sKey || !this.exist(sKey)) { return false; }
        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
        return true;
    },
    clear: function (prefix) {
        var all = kookies.keys(),
            i = all.length;
        while(i>0) {
            if(prefix && all[i-1].indexOf(prefix) === 0 || !prefix) {
                kookies.remove( all[i-1] );
            }
            i--;
        }
    },
    exist: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },

    keys: function (prefix) {
        var tmp = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/),
            i = tmp.length,
            aKeys = [];
        while(i>0) {
            if(prefix && unescape(tmp[i]).indexOf(prefix) === 0 || !prefix) { aKeys.push( unescape(tmp[i]) ); }
            i--;
        }
        return aKeys;
    }
};

/*! -----------------------------------------------------------------------------------------------------
                                                                        REQUEST/CANCEL ANIMATION FRAME
 mod. by zigotica 2013/06 from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating
 ----------------------------------------------------------------------------------------------------- */

(function() {
    var lastTime    = 0,
        vendors     = ['webkit', 'moz'],
        len         = vendors.length,
        // slower constant is preferrable to faster but jankier
        FPS         = Modernizr.touch?40:60,
        timeframe   = Math.floor(1000/FPS);

    for(var x = 0; x < len && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    // call rAF *before* the render()
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime    = new Date().getTime(),
                timeToCall  = Math.max(0, timeframe - (currTime - lastTime)),
                id          = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
})();


/*! ----------------------------------------------------------------------------------------------------- 
                                                                                          UTILS MODULE
 ----------------------------------------------------------------------------------------------------- */

ZGTC.Utils = {
    scrolled : false,
    resized  : false,
    drawing  : false,

    // --------- decoupled resizes
    RAFresizeCallbacks : function(){
        // set resizedFired to true and execute drawResize if it's not already running
        if (ZGTC.Utils.drawing === false) {
            ZGTC.Utils.resized = true;
            ZGTC.Utils.drawOnResize();
        }
    },

    drawOnResize : function(){
        // render friendly resize loop
        if (ZGTC.Utils.resized === true) {
            ZGTC.Utils.resized = false;
            ZGTC.Utils.drawing = true;

            /* jank code: draw, request layout, … */
            ZGTC.Utils.setOrientationBreakpoints();

            requestAnimationFrame(ZGTC.Utils.drawOnResize);
        } else {
            ZGTC.Utils.drawing = false;
        }
    },

    // --------- decoupled window scrolls
    RAFscrollCallbacks : function(){
        // set resizedFired to true and execute drawResize if it's not already running
        if (ZGTC.Utils.drawing === false) {
            ZGTC.Utils.scrolled = true;
            ZGTC.Utils.drawOnScroll();
        }
    },

    drawOnScroll : function(){
        // render friendly resize loop
        if (ZGTC.Utils.scrolled === true) {
            ZGTC.Utils.scrolled = false;
            ZGTC.Utils.drawing = true;

            /* jank code: draw, request layout, … */

            requestAnimationFrame(ZGTC.Utils.drawOnScroll);
        } else {
            ZGTC.Utils.drawing = false;
        }
    },

    setOrientationBreakpoints : function(){
        var W   = ZGTC.CACHE.W,
            HD  = ZGTC.CACHE.HD,
            // we should be using parseFloat($("body").css("font-size")),
            // but CSS mediaqueries are triggered with 16px base even if set in EM…
            FS  = 16,
            w   = W.width(),
            h   = W.height(),
            EM  = w / FS,
            BP, OR;

        // orientation
        HD.removeClass("orientation-land orientation-vert bp-mobile bp-tablet");
        if(w>h) OR = "orientation-land";
        else OR = "orientation-vert";

        // breakpoints. must be sync'ed manually with CSS MQ
        if(EM > 0 && EM < 46.5) BP = "bp-mobile";
        if(EM >= 46.5) BP = "bp-tablet";
        
        // set
        HD.addClass(" "+OR+" "+BP+" ");
    },

    getElmId : function( elm ){
        // utility that gets an objet and checks if it has ID, adds if needed and returns ID;
        var ID      = elm[0].id,
            seed    = parseInt(10000 * Math.random(), null);
        if(ID === "") {
            elm[0].id = "randomid-"+seed;
        }
        return elm[0].id;
    },

    toggleState : function(elem, a, b) {
        var E   = $(elem),
            isA = E.hasClass(a);
        
        if(isA){
            E.removeClass(a).addClass(b);
        }
        else {
            E.removeClass(b).addClass(a);
        }
    },

    getFileType : function(src){
        return src.split('.').pop();
    },

    injectFile : function(src){
        if(this.getFileType(src) === "css"){
            this.injectCSS(src);
        }
        if(this.getFileType(src) === "js"){
            this.injectJS(src);
        }
    },

    injectCSS : function(src){
        var link = document.createElement("link");
            link.href = src;
            link.type = "text/css";
            link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);
    },

    injectJS : function(src, body){
        var script = document.createElement('script');
            script.src = src;
        if(body) document.body.appendChild(script);
        else  document.getElementsByTagName("head")[0].appendChild(script);
    }
};

/*! ----------------------------------------------------------------------------------------------------- 
                                                                                                  MENU
 ----------------------------------------------------------------------------------------------------- */
ZGTC.Menu = {
    setup : function(){
        //
    }
};

/*! ----------------------------------------------------------------------------------------------------- 
                                                                                              LAZYLOAD
 ----------------------------------------------------------------------------------------------------- */
ZGTC.Lazy = {
    setup : function(){
        // delegated
        ZGTC.CACHE.BODY.on("click", "[data-replace]", function(e){
            e.preventDefault(); 
            var $triggr = $(this),
                url     = this.href;

            ZGTC.Lazy.load( url, $triggr );
        });
    },

    load : function( url, $from ){
        $from.after('<div class="spinner whileloading"></div>');
        $.get(url, function( data ) {
            $from.after( data );
            $(".whileloading").fadeToggle().remove();
            $from.fadeToggle().remove();
        }).fail(function() {
            $from.after('<div class="error-msg">We had a problem, please try again later</div>');
        });
    }
};


/*! ----------------------------------------------------------------------------------------------------- 
                                                                                       MODERNIZR TESTS
 ----------------------------------------------------------------------------------------------------- */

ZGTC.Modern = {
    setup : function(){   
        var UA = ZGTC.CACHE.UA;

        /* Modernizr test to detect android devices */
        Modernizr.addTest('android', function(){
          return UA.indexOf("android") > -1;
        });

        /* Modernizr test to detect legacy android devices */
        Modernizr.addTest('legacyandroid', function(){
          var old = UA.indexOf("android 2") > -1 || UA.indexOf("android 3") > -1;
          return old;
        });

        /* Modernizr test to detect chrome browsers */
        Modernizr.addTest('chrome', function(){
          return UA.indexOf("chrome") > -1;
        });

        /* Modernizr test to detect safari browsers */
        Modernizr.addTest('safari', function(){
          return UA.indexOf("safari") > -1;
        });

        /* Modernizr test to detect MSIE */
        Modernizr.addTest('msie', function () {
            return UA.indexOf("msie") > -1;
        });

        /* Modernizr test to detect Win Phone */
        Modernizr.addTest('iemobile', function () {
            return UA.indexOf("iemobile") > -1 && UA.indexOf("msie") > -1 && UA.indexOf("phone") > -1;
        });

        /* Modernizr test to detect legacy Win Phone (7.x) */
        Modernizr.addTest('legacyiemobile', function () {
            return Modernizr.iemobile && UA.indexOf("os 7") > -1;
        });

        /* Modernizr test to detect iOS */
        Modernizr.addTest('ios', function () {
            var ios = UA.indexOf("iphone") > -1 || UA.indexOf("ipad") > -1 || UA.indexOf("ipod") > -1;
            return ios;
        });

        /* Modernizr test to detect legacy iOS */
        Modernizr.addTest('legacyios', function () {
            var legacyios = UA.indexOf("iphone os 3") > -1 || UA.indexOf("cpu os 3") > -1 || UA.indexOf("iphone os 4") > -1 || UA.indexOf("cpu os 4") > -1 || UA.indexOf("iphone os 5") > -1 || UA.indexOf("cpu os 5") > -1 || UA.indexOf("iphone os 6") > -1 || UA.indexOf("cpu os 6") > -1;
            return legacyios;
        });

        /* Modernizr test to detect modern iOS */
        Modernizr.addTest('modernios', function () {
            return Modernizr.ios && !Modernizr.legacyios;
        });

        /* Modernizr test for retina screens, adds retina/no-retina class to html */
        Modernizr.addTest('retina', function () {
          return (window.devicePixelRatio > 1.5);
        });

        /* Modernizr test for complex transition/transform methods */
        Modernizr.addTest('transformable', function () {
          return !Modernizr.legacyandroid && !Modernizr.iemobile && Modernizr.csstransitions && Modernizr.csstransforms  && Modernizr.cssanimations;
        });
    }
};


/*! ----------------------------------------------------------------------------------------------------- 
                                                                                       INITIALIZATIONS
 ----------------------------------------------------------------------------------------------------- */

$(function() { 
    // ---------------------------------------------------------------- CACHE STUFF
    ZGTC.CACHE.init();

    // ---------------------------------------------------------------- STANDARIZE + CACHE EVENTS
    ZGTC.CACHE.standarizeEvents();

    // ---------------------------------------------------------------- ORIENTATION/MQ
    ZGTC.Utils.setOrientationBreakpoints();

    // ---------------------------------------------------------------- MODERNIZR TESTS
    ZGTC.Modern.setup();

    // ---------------------------------------------------------------- SHOW/HIDE MENU
    ZGTC.Menu.setup();

    // ---------------------------------------------------------------- LAZYLOAD
    ZGTC.Lazy.setup();

    // ---------------------------------------------------------------- rAF decoupling
    // requestAnimationFrame for smoothness
    ZGTC.CACHE.W.on("orientationchange", function(){
        ZGTC.Utils.setOrientationBreakpoints();
    });
    ZGTC.CACHE.W.on("resize", ZGTC.Utils.RAFresizeCallbacks);
    ZGTC.CACHE.W.on("scroll", ZGTC.Utils.RAFscrollCallbacks);

    // ---------------------------------------------------------------- touchstart avoid highlights
    ZGTC.CACHE.W.on("touchstart", function(){});
  
    // ---------------------------------------------------------------- DEBUG 
    if(ZGTC.debug == 1) {
        console.log( "------------ Grids visual help ------------" );
        ['../public/css/grid.js','../public/css/gridhelper.css'].forEach(function(src) {
            ZGTC.Utils.injectFile(src);
        });
    }

});
