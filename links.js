/* Outbound clicks as Umami events, so the stats show which project links
   people actually follow (App Store, GitHub, project sites), not just which
   pages they read. Page views need nothing here: the tracker records those.

   Not called track.js or analytics.js on purpose -- ad-block lists match those
   names. The tracker's fetch uses keepalive, so an event still lands when the
   click navigates away from the page. */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href]');
  if (!a || !window.umami) return;

  var url;
  try { url = new URL(a.href, location.href); } catch (_) { return; }

  if (url.protocol === 'mailto:') {
    window.umami.track('email-click');
    return;
  }
  if (url.hostname === location.hostname) return;

  // The project card the link sits in, if any: "mDone", "ChukkaTimer", ...
  var card = a.closest('article');
  var title = card && card.querySelector('h3');

  window.umami.track('outbound-link', {
    url: url.href,
    host: url.hostname,
    project: title ? title.textContent.trim() : '',
    page: location.pathname
  });
});
