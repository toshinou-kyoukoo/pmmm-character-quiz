/* quiz.js
   Drop this file into the same folder and add:
   <script src="quiz.js"></script>
   just before </body>.
*/

(function(){

  // Helper to load jQuery if missing, then run init
  function ensureJQuery(cb){
    if (window.jQuery) return cb(window.jQuery);
    var s = document.createElement('script');
    s.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    s.onload = function(){ cb(window.jQuery); };
    s.onerror = function(){ console.error('Failed to load jQuery'); cb(null); };
    document.head.appendChild(s);
  }

  ensureJQuery(function($){
    if (!$){
      // Minimal vanilla fallback if jQuery fails (limited).
      console.warn('jQuery not available; limited fallback active.');
      // Simple fallback: enable basic anchor navigation by hash
      document.querySelectorAll('a.areabtn').forEach(function(a){
        a.addEventListener('click', function(e){
          e.preventDefault();
          var to = a.getAttribute('to');
          if (!to) return;
          // hide everything
          document.querySelectorAll('.q_wrapper, .q_wrapper2').forEach(function(el){ el.style.display='none'; });
          var target = document.getElementById(to);
          if (target) target.style.display = '';
          location.hash = to;
        });
      });
      document.querySelectorAll('.q_close a').forEach(function(c){
        c.addEventListener('click', function(e){
          e.preventDefault();
          var box = c.closest('.madoka_q');
          if (box) box.style.display = 'none';
        });
      });
      // show element from hash on load
      if (location.hash){
        var id = location.hash.replace(/^#/, '');
        var el = document.getElementById(id);
        if (el){
          document.querySelectorAll('.q_wrapper, .q_wrapper2').forEach(function(node){ node.style.display='none'; });
          el.style.display = '';
        }
      }
      return;
    }

    // jQuery present: full behavior
    $(function(){

      var $allScreens = $('.q_wrapper, .q_wrapper2');
      function showScreenById(id, animate){
        if (!id) return;
        var $target = $('#' + id);
        if (!$target.length) return;
        // hide all and show target
        if (animate){
          $allScreens.filter(':visible').fadeOut(180, function(){
            $target.fadeIn(180).attr('tabindex', '-1').focus();
          });
        } else {
          $allScreens.hide();
          $target.show().attr('tabindex','-1').focus();
        }
        // update hash without adding duplicate history entry
        try {
          if (history && history.replaceState){
            history.replaceState(null, '', '#' + id);
          } else {
            location.hash = id;
          }
        } catch(e){ location.hash = id; }
      }

      // click handler for quiz navigation
      $(document).on('click', 'a.areabtn, a.radi5', function(e){
        e.preventDefault();
        var $a = $(this);
        var from = $a.attr('from'); // optional
        var to   = $a.attr('to');
        if (!to) return;
        // (Optionally) record analytics here, e.g. ga('send','event',...)
        showScreenById(to, true);
      });

      // close button logic (colorbox_close)
      $(document).on('click', '.q_close a, .colorbox_close', function(e){
        e.preventDefault();
        var $wrap = $(this).closest('.madoka_q');
        if ($wrap.length){
          // hide the whole quiz container (similar to closing a modal)
          $wrap.fadeOut(150);
        }
      });

      // Hashchange support (back/forward)
      $(window).on('hashchange', function(){
        var id = (location.hash || '').replace(/^#/, '');
        if (id){
          // show the element if exists
          if ($('#' + id).length) {
            showScreenById(id, true);
          }
        } else {
          // if no hash, show start
          showScreenById('start', true);
        }
      });

      // On first load, show the panel indicated by hash (or start)
      (function initialShow(){
        var id = (location.hash || '').replace(/^#/, '');
        if (id && $('#' + id).length){
          showScreenById(id, false);
        } else {
          // some HTML uses display:yes on start; normalize that
          $('#start').show();
          $allScreens.not('#start').hide();
        }
      })();

      // Initialize social widgets once final/result screen is shown:
      // - Twitter: twttr.widgets.load()
      // - Facebook: FB.XFBML.parse()
      // We'll call them whenever a result-screen becomes visible.
      function initSocialWidgets(){
        if (window.twttr && twttr.widgets && typeof twttr.widgets.load === 'function'){
          try { twttr.widgets.load(); } catch(e){ /* ignore */ }
        } else {
          // lazy load Twitter widgets script if not present
          if (!document.getElementById('twitter-wjs')){
            var s = document.createElement('script');
            s.id = 'twitter-wjs';
            s.src = 'https://platform.twitter.com/widgets.js';
            document.head.appendChild(s);
          }
        }
        if (window.FB && typeof FB.XFBML === 'object' && typeof FB.XFBML.parse === 'function'){
          try { FB.XFBML.parse(); } catch(e){ /* ignore */ }
        } else {
          // lazy load the Facebook SDK if an element with fb-like exists
          if (document.querySelector('.fb-like') && !document.getElementById('facebook-jssdk')){
            var fbRoot = document.createElement('div'); fbRoot.id = 'fb-root';
            document.body.insertBefore(fbRoot, document.body.firstChild);
            var s = document.createElement('script');
            s.id = 'facebook-jssdk';
            s.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0";
            document.head.appendChild(s);
          }
        }
      }

      // Call initSocialWidgets whenever a result (a1..a6) is shown
      $(document).on('click', 'a.areabtn, a.radi5', function(){
        var to = $(this).attr('to') || '';
        if (/^a[1-6]$/.test(to)) {
          // small timeout to let animation complete
          setTimeout(initSocialWidgets, 300);
        }
      });

      // Accessibility: allow Enter/Space on choices that are not anchors
      $(document).on('keydown', '.areabtn', function(e){
        if (e.key === 'Enter' || e.key === ' ') { $(this).trigger('click'); }
      });

    }); // DOM ready
  }); // ensureJQuery

})();