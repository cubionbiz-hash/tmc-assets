/* ═══ TMC PROJECTS 공통 동작 ═══
   글자·사진은 전부 페이지 HTML에 이미 들어 있다(검색엔진이 읽게). 이 파일은 움직임만 붙인다.
   - 목록: 카드가 화면에 들어오면 떠오르기, 「더보기」로 12편씩 더 보이기
   - 현장: 스크롤하면 다음 카드가 올라와 쌓이고, 도착한 카드는 글자가 차례로 켜짐 */
(function(){
  var root = document.querySelector('.tmc-pj');
  if (!root) return;
  root.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 헤더 높이: 사이트 공통 헤더 스크립트가 --tmc-hdr 를 넣어준다. 없을 때만 직접 잰다 */
  function hdr(){
    var cur = getComputedStyle(document.documentElement).getPropertyValue('--tmc-hdr');
    if (cur && cur.trim() && cur.trim() !== '0px') return;
    var h = 0;
    ['tmc-pc-header', 'tmc-mo-header'].forEach(function(id){
      var e = document.getElementById(id); if (!e) return;
      var c = getComputedStyle(e);
      if (c.display === 'none' || c.visibility === 'hidden') return;
      h = Math.max(h, Math.round(e.getBoundingClientRect().height));
    });
    if (h) document.documentElement.style.setProperty('--tmc-hdr', h + 'px');
  }
  hdr(); addEventListener('load', hdr);

  /* 떠오르기 */
  var rv = root.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold: .15});
    rv.forEach(function(el){ io.observe(el); });
    root._io = io;
  } else {
    rv.forEach(function(el){ el.classList.add('in'); });
  }

  /* 목록: 더보기 (숨겨둔 카드도 HTML에는 있으므로 검색엔진은 전부 읽는다) */
  var moreB = root.querySelector('.moreb');
  if (moreB){
    var PAGE = 12;
    var sync = function(){ moreB.parentNode.style.display = root.querySelector('.cvrs .is-more') ? '' : 'none'; };
    moreB.addEventListener('click', function(){
      var hid = root.querySelectorAll('.cvrs .is-more');
      for (var i = 0; i < hid.length && i < PAGE; i++){
        hid[i].classList.remove('is-more');
        if (root._io) root._io.observe(hid[i]); else hid[i].classList.add('in');
      }
      sync();
    });
    sync();
  }

  /* 현장: 카드 스택 */
  var cards = [].slice.call(root.querySelectorAll('.stack .scard'));
  if (!cards.length) return;
  var sws = [].slice.call(root.querySelectorAll('.stack .sw'));
  function activate(c){
    c.classList.add('act');
    [].forEach.call(c.querySelectorAll('.w'), function(w, j){
      if (reduce) w.classList.add('lit');
      else setTimeout(function(){ w.classList.add('lit'); }, 200 + j * 55);
    });
  }
  var ticking = false;
  function stack(){
    ticking = false;
    var vh = innerHeight;
    cards.forEach(function(c, i){
      if (!c.classList.contains('act') && c.getBoundingClientRect().top < vh * .55) activate(c);
      if (!reduce && i < sws.length - 1){
        var nt = sws[i + 1].getBoundingClientRect().top;
        var p = Math.max(0, Math.min(1, (vh - nt) / (vh * .92)));
        c.style.transform = 'scale(' + (1 - .05 * p) + ') translateY(' + (-16 * p) + 'px)';
      }
    });
  }
  function req(){ if (!ticking){ ticking = true; requestAnimationFrame(stack); } }
  addEventListener('scroll', req, {passive: true});
  addEventListener('resize', req);
  stack();
})();
