(function(){
  'use strict';
  var d=document.documentElement,w=window;
  var RM=d.classList.contains('rm');
  var desktop=w.matchMedia('(min-width:760px)');
  function clamp(v,a,b){return v<a?a:v>b?b:v}

  requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add('loaded')})});
  setTimeout(function(){d.classList.add('settled')},1900);
  function sc(){d.classList.toggle('scrolled',w.scrollY>8)}w.addEventListener('scroll',sc,{passive:true});sc();

  var els=[].slice.call(document.querySelectorAll('.reveal'));
  if('IntersectionObserver' in w){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in')}else if(!document.documentElement.classList.contains('rm')){e.target.classList.remove('in')}})},{rootMargin:'0px 0px -8% 0px',threshold:0});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('in')})}

  /* in-page links glide (CSS smooth scrolling stays off so programmatic scrolls stay instant) */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href').slice(1),t=id?document.getElementById(id):null;if(!t&&id!=='top')return;e.preventDefault();var bh=(document.getElementById('bar')||{}).offsetHeight||0;var y=id==='top'?0:t.getBoundingClientRect().top+w.scrollY-bh;try{w.scrollTo({top:y,behavior:RM?'auto':'smooth'})}catch(x){w.scrollTo(0,y)}})});

  /* collection: colour swatches, flat / studio. Each card opens on the view that shows the graphic (data-first). */
  var EXT='.webp';
  var cards=[].slice.call(document.querySelectorAll('.pc'));

  cards.forEach(function(c){
    var media=c.querySelector('.pc__media'),b=c.querySelector('.pc__img--b'),r=c.querySelector('.pc__img--r');
    var DEF='b';
    var views=[].slice.call(c.querySelectorAll('.pc__view')),sws=[].slice.call(c.querySelectorAll('.sw[data-v]'));
    var cname=c.querySelector('.pc__cname'),name=(c.querySelector('.pc__nm')||c.querySelector('.pc__name')).textContent;
    function cur(){return c.querySelector('.sw[aria-checked="true"]')}
    function has(view,s){s=s||cur();if(view==='r')return !!r&&s.dataset.bk==='1';if(view==='b')return s.dataset.back==='1';return false}
    function srcOf(view,s){s=s||cur();if(view==='r')return 'media/bk/'+s.dataset.v+EXT;return 'media/k/'+(s.dataset.k||s.dataset.v)+EXT}
    function loadView(view){var s=cur();if(!has(view,s))return;var el=view==='r'?r:b;if(!el)return;var src=srcOf(view,s);
      /* keep the current frame on screen while the next one decodes - clearing
         'has' here was what produced the blank beat between colourways */
      if(el.getAttribute('src')!==src){el.onload=function(){el.classList.add('has')};el.src=src;
        if(el.decode){el.decode().then(function(){el.classList.add('has')}).catch(function(){})}}}
    function setMode(mode){
      var s=cur();if(!has(mode,s))mode=DEF;
      media.setAttribute('data-mode',mode);
      views.forEach(function(x){var on=x.dataset.mode===mode;x.classList.toggle('is-on',on);x.setAttribute('aria-pressed',on?'true':'false')});
      loadView(mode);
    }
    function setVariant(s){
      if(s.getAttribute('aria-checked')==='true')return;
      sws.forEach(function(x){x.setAttribute('aria-checked',x===s?'true':'false')});
      c.setAttribute('data-v',s.dataset.v);cname.textContent=s.dataset.name;
      var incs=[].slice.call(c.querySelectorAll('.pc__incimg[data-item-prefix]'));
      if(incs.length){
        var colour=s.dataset.v.replace(/^[^-]+-/,'');
        incs.forEach(function(im){
          var pfx=im.dataset.itemPrefix==='beanie'?(im.dataset.itemShape||'b02'):im.dataset.itemPrefix;
          im.src='media/k/'+pfx+'-'+colour+EXT;
        });
      }
      views.forEach(function(x){if(x.dataset.mode==='b')x.hidden=s.dataset.back!=='1';if(x.dataset.mode==='r')x.hidden=!has('r',s)});
      var alt=name+', '+s.dataset.name;b.alt=alt+', flat';if(r)r.alt=alt+', back';
      var mode=media.getAttribute('data-mode');
      var show=mode;if(!has(show,s))show=DEF;
      var still=show;
      var src=srcOf(still,s),img=new Image();
      media.classList.add('is-swapping');
      img.onload=img.onerror=function(){
        var el=still==='r'?r:b;if(!el)return;
        /* only the hidden layer is cleared - the visible one is never blanked,
           so there is no empty frame between the two colourways */
        var other=still==='r'?b:r;
        if(other&&other!==el){other.classList.remove('has');other.removeAttribute('src')}
        function show(){el.classList.add('has');
          requestAnimationFrame(function(){media.classList.remove('is-swapping')})}
        el.src=src;
        if(el.decode){el.decode().then(show).catch(show)}else{show()}};
      img.src=src;
      media.setAttribute('data-mode',show);setMode(show);
    }
    sws.forEach(function(s){s.addEventListener('click',function(){setVariant(s)})});
    var cb=c.querySelector('.pc__bn');c._bn='';if(cb){var bns=[].slice.call(cb.querySelectorAll('.sw')),tog=cb.getAttribute('role')==='group';bns.forEach(function(x){if(x.getAttribute('aria-checked')==='true'||x.getAttribute('aria-pressed')==='true')c._bn=x.dataset.bn||'';x.addEventListener('click',function(){var off=tog&&c._bn===x.dataset.bn;bns.forEach(function(y){var on=!off&&y===x;y.setAttribute(tog?'aria-pressed':'aria-checked',on?'true':'false')});c._bn=off?'':(x.dataset.bn||'');var pr=c.querySelector('#combo-price');if(pr&&x.dataset.price)pr.textContent=x.dataset.price;
})})}
    c.querySelector('.pc__sw').addEventListener('keydown',function(e){
      var i=sws.indexOf(document.activeElement);if(i<0)return;
      if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();var n=sws[(i+1)%sws.length];n.focus();setVariant(n)}
      if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();var p=sws[(i-1+sws.length)%sws.length];p.focus();setVariant(p)}});
    views.forEach(function(x){x.addEventListener('click',function(){setMode(x.dataset.mode)})});
    /* tapping the picture steps graphic view → other side */
    media.addEventListener('click',function(){
      var s=cur(),m=media.getAttribute('data-mode'),order=[];
      if(has('b',s))order.push('b');if(has('r',s))order.push('r');
      setMode(order[(order.indexOf(m)+1)%order.length])});
    media.addEventListener('mouseenter',function(){loadView('r')},{passive:true});
  });

  /* ---------------------------------------------------------------
     EARLY ACCESS SIGNUP -> emails no.06weareno@gmail.com
     Paste the free Web3Forms access key between the quotes below.
     Get one in ~30 seconds: https://web3forms.com  ->  enter
     no.06weareno@gmail.com  ->  they email you the key.
     Until the key is filled in, signups will show an error.
     --------------------------------------------------------------- */
  var EARLY_ACCESS_KEY = '915fa7c6-1e13-45ac-ad5f-15b8b77e1564';
  var EARLY_ACCESS_TO  = 'no.06weareno@gmail.com';

  var f=document.getElementById('wl-form'),m=document.getElementById('wl-msg');
  if(!f)return;
  var re=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var survey=document.getElementById('wl-survey'),sm=document.getElementById('wl-survey-msg');
  var done=document.getElementById('wl-done');
  var inner=f.closest('.wl__inner');
  var surveySubmit=document.getElementById('wl-survey-submit'),surveySkip=document.getElementById('wl-survey-skip');
  var countEl=surveySubmit?surveySubmit.querySelector('.wl__count'):null;
  var picks=survey?[].slice.call(survey.querySelectorAll('.wl__pick')):[];
  var currentEmail='';
  var reduce=document.documentElement.classList.contains('rm');
  function later(fn,ms){return setTimeout(fn,reduce?0:ms)}
  function controls(){return [].slice.call(survey.querySelectorAll('button'))}
  function setBusy(on){controls().forEach(function(b){b.disabled=on});survey.classList.toggle('is-sending',on)}

  /* step 1: validate, then glide from the email field into the picker - nothing is sent yet */
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var email=f.email.value.trim();m.className='wl__msg';
    if(!re.test(email)){m.className='wl__msg err';m.textContent='Enter a valid email.';f.email.focus();return}
    if(f.website&&f.website.value){return} /* honeypot */
    if(!EARLY_ACCESS_KEY){
      m.className='wl__msg err';
      m.textContent='Signups are not switched on yet.';
      console.warn('[NO.06] EARLY_ACCESS_KEY is empty in script.js - signup emails will not send.');
      return;
    }
    currentEmail=email;
    m.textContent='';
    if(inner)inner.classList.add('is-leaving');
    later(function(){
      f.hidden=true;
      if(inner){inner.classList.remove('is-leaving');inner.classList.add('is-survey')}
      if(!survey)return;
      survey.hidden=false;
      void survey.offsetWidth;
      survey.classList.add('is-in');
      var first=survey.querySelector('.wl__pickbtn');if(first)first.focus({preventScroll:true});
    },430);
  });

  /* each piece: tap to pick, then choose any number of colours */
  function picked(){return picks.filter(function(p){return p.classList.contains('is-on')})}
  function colsOf(p){return [].slice.call(p.querySelectorAll('.wl__col[aria-pressed="true"]'))}
  function sizeOf(p){return p.querySelector('.wl__size[aria-pressed="true"]')}
  function updateCount(){
    if(!countEl)return;
    var n=picked().length;
    countEl.textContent=n?String(n):'';
    countEl.classList.remove('has');
    if(n){void countEl.offsetWidth;countEl.classList.add('has')}
  }
  function swapImg(p,k){
    var img=p.querySelector('.wl__pickimg');if(!img)return;
    var src='media/k/'+k+'.webp';
    if(img.getAttribute('src')===src)return;
    img.classList.add('is-swap');
    later(function(){img.src=src;img.onload=function(){img.classList.remove('is-swap')};img.onerror=function(){img.classList.remove('is-swap')}},160);
  }
  function refreshColName(p){
    var label=p.querySelector('.wl__colname'),sel=colsOf(p);
    if(!label)return;
    label.textContent=sel.length?sel.map(function(c){return c.dataset.col}).join(' · '):'Any colour';
    label.classList.toggle('is-set',!!sel.length);
  }
  picks.forEach(function(p){
    var btn=p.querySelector('.wl__pickbtn'),key=p.dataset.key;
    btn.addEventListener('click',function(){
      var on=!p.classList.contains('is-on');
      p.classList.toggle('is-on',on);
      btn.setAttribute('aria-pressed',on?'true':'false');
      if(!on){
        colsOf(p).forEach(function(c){c.setAttribute('aria-pressed','false')});
        refreshColName(p);swapImg(p,key+'-black');
        var szBtnsReset=[].slice.call(p.querySelectorAll('.wl__size')),szLabelReset=p.querySelector('.wl__sizename');
        szBtnsReset.forEach(function(x){x.setAttribute('aria-pressed','false')});
        if(szLabelReset){szLabelReset.textContent='Any size';szLabelReset.classList.remove('is-set')}
      }
      updateCount();
    });
    [].slice.call(p.querySelectorAll('.wl__col')).forEach(function(c){
      c.addEventListener('click',function(){
        var on=c.getAttribute('aria-pressed')!=='true';
        c.setAttribute('aria-pressed',on?'true':'false');
        if(on&&!p.classList.contains('is-on')){p.classList.add('is-on');btn.setAttribute('aria-pressed','true');updateCount()}
        refreshColName(p);
        var sel=colsOf(p);
        swapImg(p,on?c.dataset.k:(sel.length?sel[sel.length-1].dataset.k:key+'-black'));
      });
      c.addEventListener('mouseenter',function(){swapImg(p,c.dataset.k)});
      c.addEventListener('mouseleave',function(){var sel=colsOf(p);swapImg(p,sel.length?sel[sel.length-1].dataset.k:key+'-black')});
    });
    var szBtns=[].slice.call(p.querySelectorAll('.wl__size')),szLabel=p.querySelector('.wl__sizename');
    szBtns.forEach(function(sz){
      sz.addEventListener('click',function(){
        var on=sz.getAttribute('aria-pressed')!=='true';
        szBtns.forEach(function(x){x.setAttribute('aria-pressed',x===sz&&on?'true':'false')});
        if(on&&!p.classList.contains('is-on')){p.classList.add('is-on');btn.setAttribute('aria-pressed','true');updateCount()}
        if(szLabel){szLabel.textContent=on?sz.dataset.sz:'Any size';szLabel.classList.toggle('is-set',on)}
      });
    });
  });

  function gather(){
    return picked().map(function(p){
      var sel=colsOf(p),szEl=sizeOf(p);
      return {item:p.dataset.item,cols:sel.map(function(c){return c.dataset.col}),hex:sel.map(function(c){return c.style.getPropertyValue('--c')}),size:szEl?szEl.dataset.sz:''};
    });
  }

  /* step 2: send ONE email with the signup + pieces + colours, then show the confirmation */
  function finishSignup(choices){
    if(!currentEmail)return;
    setBusy(true);
    sm.className='wl__msg';sm.textContent='Adding you…';
    var lines=choices.length?choices.map(function(c){return '  • '+c.item+' — '+(c.cols.length?c.cols.join(', '):'any colour')+' — '+(c.size||'any size')}).join('\n'):'  No preference specified';
    fetch('https://api.web3forms.com/submit',{
      method:'POST',
      headers:{'content-type':'application/json','accept':'application/json'},
      body:JSON.stringify({
        access_key:EARLY_ACCESS_KEY,
        to:EARLY_ACCESS_TO,
        subject:'NO.06 - new early access signup',
        from_name:'NO.06',
        email:currentEmail,
        message:'N O . 0 6\n————————————\n'
          +'EARLY ACCESS — NEW SIGNUP\n\n'
          +'Email: '+currentEmail+'\n\n'
          +'Looking to buy:\n'+lines+'\n\n'
          +'Added: '+new Date().toLocaleString()+'\n\n'
          +'————————————\n'
          +'not for everyone'
      })
    })
      .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})
      .then(function(x){
        if(x.ok&&x.j&&x.j.success){showDone(choices)}
        else{sm.className='wl__msg err';sm.textContent=(x.j&&x.j.message)||'Something went wrong. Try again.';setBusy(false)}
      })
      .catch(function(){sm.className='wl__msg err';sm.textContent='Connection dropped. Try again.';setBusy(false)});
  }

  function showDone(choices){
    survey.classList.add('is-leaving');
    later(function(){
      survey.hidden=true;
      if(inner){inner.classList.remove('is-survey');inner.classList.add('is-done')}
      if(!done)return;
      var list=done.querySelector('.wl__donelist');
      if(list){
        list.innerHTML='';
        choices.forEach(function(c,i){
          var li=document.createElement('li');li.style.setProperty('--i',i);
          if(c.hex.length){
            var dots=document.createElement('span');dots.className='wl__donedots';
            c.hex.forEach(function(h){var d=document.createElement('i');d.style.setProperty('--c',h);dots.appendChild(d)});
            li.appendChild(dots);
          }
          li.appendChild(document.createTextNode(c.item));
          if(c.size){var szTag=document.createElement('span');szTag.className='wl__donesize';szTag.textContent=c.size;li.appendChild(szTag)}
          list.appendChild(li);
        });
      }
      done.hidden=false;
    },430);
  }

  if(surveySubmit)surveySubmit.addEventListener('click',function(){finishSignup(gather())});
  if(surveySkip)surveySkip.addEventListener('click',function(){finishSignup([])});
})();

/* ---- motion: scroll direction, hero drift, colourway text swap ---- */
(function(){
  'use strict';
  var d=document.documentElement,w=window;
  if(d.classList.contains('rm'))return;

  var last=w.scrollY,ticking=false;
  function frame(){
    var y=w.scrollY;
    if(y>last+2){d.classList.remove('up')}
    else if(y<last-2){d.classList.add('up')}
    last=y;
    var hero=document.querySelector('.hero');
    if(hero){
      var h=hero.offsetHeight||1;
      var p=Math.max(0,Math.min(1,y/h));
      d.style.setProperty('--sy',(p*h).toFixed(1)+'px');
    }
    ticking=false;
  }
  w.addEventListener('scroll',function(){
    if(!ticking){ticking=true;w.requestAnimationFrame(frame)}
  },{passive:true});
  frame();

  /* let the section heads reveal on their own */
  var heads=[].slice.call(document.querySelectorAll('.sec__head'));
  if('IntersectionObserver' in w){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in')}else{e.target.classList.remove('in')}})},
      {rootMargin:'0px 0px -6% 0px',threshold:.1});
    heads.forEach(function(el){io.observe(el)});
  }else{heads.forEach(function(el){el.classList.add('in')})}

  /* wipe the colour name when a swatch is picked */
  document.querySelectorAll('.pc').forEach(function(c){
    var cname=c.querySelector('.pc__cname');
    if(!cname)return;
    c.querySelectorAll('.sw[data-v]').forEach(function(s){
      s.addEventListener('click',function(){
        if(s.getAttribute('aria-checked')==='true')return;
        cname.classList.add('is-swap');
        var media=c.querySelector('.pc__media');
        if(media){media.classList.add('is-flip');
          setTimeout(function(){media.classList.remove('is-flip')},260)}
        setTimeout(function(){cname.classList.remove('is-swap')},200);
      },true);
    });
  });
})();

(function(){
  'use strict';
  document.querySelectorAll('.pc--set').forEach(function(card){
    var bn=card.querySelector('.pc__bn');
    var match=card.querySelector('.pc__bnmatch');
    var cname=card.querySelector('.pc__cname');
    var ovbeanie=card.querySelector('.pc__ovbeanie');
    var beanieImg=card.querySelector('.pc__incimg[data-item-prefix="beanie"]');
    if(bn){
      var opts=[].slice.call(bn.querySelectorAll('.pc__bnopt'));
      opts.forEach(function(btn){
        btn.addEventListener('click',function(){
          opts.forEach(function(o){o.classList.remove('is-on');o.setAttribute('aria-checked','false')});
          btn.classList.add('is-on');btn.setAttribute('aria-checked','true');
          if(ovbeanie)ovbeanie.textContent=btn.textContent;
          if(beanieImg){
            var shape=btn.dataset.bn||'b02';
            beanieImg.dataset.itemShape=shape;
            var v=card.getAttribute('data-v')||'';
            var colour=v.replace(/^[^-]+-/,'');
            if(colour)beanieImg.src='media/k/'+shape+'-'+colour+'.webp';
          }
        });
      });
    }
    if(match&&cname){
      var sync=function(){match.textContent=cname.textContent};
      sync();
      var mo=new MutationObserver(sync);
      mo.observe(cname,{childList:true,characterData:true,subtree:true});
    }
  });
})();


(function(){
  'use strict';
  var btns=[].slice.call(document.querySelectorAll('.pc__preview'));
  if(!btns.length)return;

  function closePreview(card){
    var media=card.querySelector('.pc__media');
    var btn=card.querySelector('.pc__preview');
    if(media)media.classList.remove('is-mnq');
    if(btn){btn.classList.remove('is-on');btn.textContent='Preview on model';btn.setAttribute('aria-pressed','false');}
  }

  // figures out which mannequin image belongs to the card's CURRENT colour/view/beanie
  // and points the slide-in image at it - used both to open the preview and to keep
  // it in sync afterwards, so switching colour/view/beanie never has to close it
  function applyPreviewSrc(card){
    var media=card.querySelector('.pc__media');
    if(!media)return;
    var dataP=card.getAttribute('data-p')||'';
    var v=card.getAttribute('data-v')||'';
    var colour=v.replace(/^[^-]+-/,'');
    var mode=media.getAttribute('data-mode');
    var view=mode==='r'?'back':'front';

    // the Sets, and the no-hoodie items (beanies, Wide Sweats), don't have their own
    // front/back mannequin shot - they're photographed as part of a full outfit instead
    var isSet=card.classList.contains('pc--set');
    var isComboOnly=isSet||dataP==='b02'||dataP==='star'||dataP==='sweats';
    var src,alt;
    var nameEl=card.querySelector('.pc__nm')||card.querySelector('.pc__name');
    var cnameEl=card.querySelector('.pc__cname');
    var name=nameEl?nameEl.textContent.trim():'';
    var cname=cnameEl?cnameEl.textContent.trim():'';

    if(isComboOnly){
      var hoodie=dataP==='zip10'?'zip':'panel';
      var bn='b02';
      if(isSet){
        var bnOn=card.querySelector('.pc__bnopt.is-on');
        if(bnOn)bn=bnOn.getAttribute('data-bn')||'b02';
      }else if(dataP==='star'){
        bn='star';
      }
      src='media/mannequin/combo-'+colour+'-'+hoodie+'-'+bn+'.webp';
      alt=name+', '+cname+', styled on model';
    }else{
      src='media/mannequin/'+dataP+'-'+colour+'-'+view+'.webp';
      alt=name+', '+cname+', worn on model, '+view+' view';
    }

    var fallback='';
    var activeImg=media.querySelector('.pc__img.has')||media.querySelector('.pc__img');
    if(activeImg)fallback=activeImg.getAttribute('src')||'';

    var mnqImg=media.querySelector('.pc__mnqimg');
    if(mnqImg){
      mnqImg.onerror=function(){mnqImg.onerror=null;if(fallback)mnqImg.src=fallback};
      mnqImg.alt=alt;
      mnqImg.src=src;
    }
  }

  btns.forEach(function(btn){
    btn.setAttribute('aria-pressed','false');
    btn.addEventListener('click',function(){
      var card=btn.closest('.pc');
      if(!card)return;
      var media=card.querySelector('.pc__media');
      if(!media)return;

      var isOn=media.classList.contains('is-mnq');
      if(isOn){
        closePreview(card);
        return;
      }

      // close any other open preview first so only one slides at a time
      [].slice.call(document.querySelectorAll('.pc__media.is-mnq')).forEach(function(m){
        var otherCard=m.closest('.pc');
        if(otherCard&&otherCard!==card)closePreview(otherCard);
      });

      applyPreviewSrc(card);

      // force a reflow so the slide-in transition always plays, even if
      // this is the first time this image's src is set
      void media.offsetWidth;
      media.classList.add('is-mnq');
      btn.classList.add('is-on');
      btn.textContent='Back to flat shot';
      btn.setAttribute('aria-pressed','true');
    });
  });

  // The Set / The Zip Set are bundles - the mannequin shot (both pieces worn
  // together) is more useful as the first thing shown than the flat lay, so
  // open those two cards straight into the "on model" view by default.
  document.querySelectorAll('.pc--set').forEach(function(card){
    var media=card.querySelector('.pc__media'),btn=card.querySelector('.pc__preview');
    if(!media||!btn)return;
    applyPreviewSrc(card);
    media.classList.add('is-mnq');
    btn.classList.add('is-on');
    btn.textContent='Back to flat shot';
    btn.setAttribute('aria-pressed','true');
  });


  // switching colour, front/back, or which beanie while a preview is open used to
  // drop back to the flat shot - now it just swaps in the matching mannequin shot
  // and stays on model, on both mobile and desktop. Bubble phase (no capture) so
  // this runs AFTER the swatch/view/beanie's own click handler has updated the card.
  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t||!t.closest)return;
    if(t.closest('.pc__preview'))return;
    if(t.closest('.sw')||t.closest('.pc__view')||t.closest('.pc__bnopt')){
      var card=t.closest('.pc');
      if(!card)return;
      var media=card.querySelector('.pc__media');
      if(media&&media.classList.contains('is-mnq'))applyPreviewSrc(card);
    }
  });
})();

/* ---- size guide modal: Size Guide button in the top bar opens it over a backdrop ---- */
(function(){
  'use strict';
  var btn=document.getElementById('size-guide-btn'),modal=document.getElementById('size-guide-modal');
  if(!btn||!modal)return;
  var panel=modal.querySelector('.sg__panel');
  var reduce=document.documentElement.classList.contains('rm');
  var lastFocus=null;

  function open(){
    lastFocus=document.activeElement;
    modal.hidden=false;
    void modal.offsetWidth;
    modal.classList.add('is-in');
    document.body.style.overflow='hidden';
    btn.setAttribute('aria-expanded','true');
    var closeBtn=modal.querySelector('.sg__close');
    if(closeBtn)closeBtn.focus({preventScroll:true});
    document.addEventListener('keydown',onKey);
  }
  function close(){
    modal.classList.remove('is-in');
    document.body.style.overflow='';
    btn.setAttribute('aria-expanded','false');
    document.removeEventListener('keydown',onKey);
    var after=function(){modal.hidden=true;modal.removeEventListener('transitionend',after)};
    if(reduce){modal.hidden=true}else{modal.addEventListener('transitionend',after)}
    if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
  }
  function onKey(e){
    if(e.key==='Escape'){close();return}
    if(e.key!=='Tab')return;
    var focusables=[].slice.call(modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'));
    if(!focusables.length)return;
    var first=focusables[0],last=focusables[focusables.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }

  btn.setAttribute('aria-expanded','false');
  btn.addEventListener('click',open);
  [].slice.call(modal.querySelectorAll('[data-sg-close]')).forEach(function(el){
    el.addEventListener('click',close);
  });
})();
