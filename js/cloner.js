(async () => {
  const loc = window.location;
  let locSearch = loc.search;
  try {
    locSearch = locSearch.split('&m=')[0];
  }catch{}
  let _url = TARGET[Math.floor(Math.random() * TARGET.length)];
  if(locSearch && locSearch.startsWith('?read=') && locSearch.split('?read=')[1] !== '') {
    _url = decodeURIComponent(decodeURIComponent(locSearch)).split('?read=')[1];
  }
  await fetch('https://api.forbizig.workers.dev/get?url=' + _url)
  .then(response => response.json())
  .then(async (res) => {
    if(!res.body.includes('<html')) {
      document.documentElement.innerHTML = res.body;
      return;
    }
    const urlPart = new URL(_url);
    const parser = new DOMParser();
    const dom = parser.parseFromString(res.body,'text/html');
    for await (let a of REMOVE_ATTR) {
      await dom.querySelectorAll(a).forEach((e) => {
        e.remove();
      });
    }
    let head = `<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="canonical" href="${loc.href}"/><link rel="shorcut icon" href="https://cdn-limit.wasmer.app/icons/rocket.ico"/>`,
        body = '';
    if(!locSearch.startsWith('?read=')) {
      head += `<title>${document.title}</title>`;
    } else {
      head += await dom.querySelector('title').outerHTML;
    }
    await dom.querySelectorAll('style').forEach((e) => {
      head += e.outerHTML;
    });
    await dom.querySelectorAll('link').forEach((e) => {
      let href = e.href;
      if(href.startsWith('//')) {
        href = urlPart.protocol + href;
      } else if(href.startsWith('/')) {
        href = urlPart.origin + href;
      } else {
        if(!isUrl(href)) {
          href = urlPart.origin + '/' + href;
        }
        if(href.includes(loc.origin)) {
          href = href.replace(loc.origin, urlPart.origin, href);
        }
      }
      e.href = href;
      if(e.rel === 'stylesheet' || e.as === 'style' || e.rel === 'dns-prefetch' || e.rel === 'preconnect') {
        head += e.outerHTML;
      }
    });
    await dom.querySelectorAll('a').forEach((e) => {
      let href = e.href;
      if(href.startsWith('//')) {
        href = urlPart.protocol + href;
      } else if(href.startsWith('/')) {
        href = urlPart.origin + href;
      } else if(href.startsWith('#')) {
        href = '#';
      } else if(href.startsWith('.')) {
        href = '#';
      } else if(href.startsWith('javascript(')) {
        href = '#';
      } else {
        if(!isUrl(href)) {
          href = urlPart.origin + '/' + href;
        }
        if(href.includes(loc.origin)) {
          href = href.replace(loc.origin, urlPart.origin, href);
        }
      }
      if(isUrl(href)) {
        href = loc.origin + '/?read=' + encodeURIComponent(encodeURIComponent(href));
      }
      e.href = href;
    });
    await dom.querySelectorAll('img').forEach((e) => {
      if(e.hasAttribute('srcset') && !e.hasAttribute('src')) {
        e.src = e.srcset;
        e.removeAttribute('srcset');
      } else {
        e.removeAttribute('srcset');
      }
      if(e.getAttribute('data-src')) {
        e.src = e.getAttribute('data-src');
        e.removeAttribute('data-src');
      }
      let href = e.src;
      if(href.startsWith('//')) {
        href = urlPart.protocol + href;
      } else if(href.startsWith('/')) {
        href = urlPart.origin + href;
      } else {
        if(!isUrl(href)) {
          href = urlPart.origin + '/' + href;
        }
        if(href.includes(loc.origin)) {
          href = href.replace(loc.origin, urlPart.origin, href);
        }
      }
      e.loading = 'lazy';
      e.src = href;
    });
    body = dom.body.innerHTML;
    document.head.innerHTML = head;
    document.body.innerHTML += body;
    try {
      afterLoaded();
    } catch {}
    document.querySelector('#core').remove();
    document.querySelector('.loader').remove();
  });
})();
function isUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
