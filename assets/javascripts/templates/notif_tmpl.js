import {
  newsList
} from './pages/news_tmpl';

import {
  addTemplates
} from './base';

const notif = function (title, html) {
  html = html.replace(/<a /g, '<a class="_notif-link" ');
  return ` <h5 class="_notif-title">${title}</h5>
${html}
<button type="button" class="_notif-close" title="Close"><svg><use xlink:href="#icon-close"/></svg>Close</a>\
`;
};

const textNotif = (title, message) => notif(title, `<p class="_notif-text">${message}`);

export let notifUpdateReady = () =>
  textNotif("<span data-behavior=\"reboot\">DevDocs has been updated.</span>",
    "<span data-behavior=\"reboot\"><a href=\"#\" data-behavior=\"reboot\">Reload the page</a> to use the new version.</span>");

export let notifError = () =>
  textNotif(" Oops, an error occurred. ",
    ` Try <a href="#" data-behavior="hard-reload">reloading</a>, and if the problem persists,
<a href="#" data-behavior="reset">resetting the app</a>.<br>
You can also report this issue on <a href="https://github.com/freeCodeCamp/devdocs/issues/new" target="_blank" rel="noopener">GitHub</a>. `
  );

export let notifQuotaExceeded = () =>
  textNotif(" The offline database has exceeded its size limitation. ",
    " Unfortunately this quota can't be detected programmatically, and the database can't be opened while over the quota, so it had to be reset. ");

export let notifCookieBlocked = () =>
  textNotif(" Please enable cookies. ",
    " DevDocs will not work properly if cookies are disabled. ");

export let notifInvalidLocation = () =>
  textNotif(` DevDocs must be loaded from ${App.config.production_host} `,
    " Otherwise things are likely to break. ");

export let notifImportInvalid = () =>
  textNotif(" Oops, an error occurred. ",
    " The file you selected is invalid. ");

export let notifNews = news => notif('Changelog', `<div class="_notif-content _notif-news">${newsList((news || []), {years: false})}</div>`);

export let notifUpdates = function (docs, disabledDocs) {
  let doc;
  let html = '<div class="_notif-content _notif-news">';

  if (docs.length > 0) {
    html += '<div class="_news-row">';
    html += '<ul class="_notif-list">';
    for (doc of Array.from(docs)) {
      html += `<li>${doc.name}`;
      if (doc.release) {
        html += ` <code>&rarr;</code> ${doc.release}`;
      }
    }
    html += '</ul></div>';
  }

  if (disabledDocs.length > 0) {
    html += '<div class="_news-row"><p class="_news-title">Disabled:';
    html += '<ul class="_notif-list">';
    for (doc of Array.from(disabledDocs)) {
      html += `<li>${doc.name}`;
      if (doc.release) {
        html += ` <code>&rarr;</code> ${doc.release}`;
      }
      html += "<span class=\"_notif-info\"><a href=\"/settings\">Enable</a></span>";
    }
    html += '</ul></div>';
  }

  return notif('Updates', `${html}</div>`);
};

export let notifShare = () =>
  textNotif(" Hi there! ",
    ` Like DevDocs? Help us reach more developers by sharing the link with your friends on
<a href="https://out.devdocs.io/s/tw" target="_blank" rel="noopener">Twitter</a>, <a href="https://out.devdocs.io/s/fb" target="_blank" rel="noopener">Facebook</a>,
<a href="https://out.devdocs.io/s/re" target="_blank" rel="noopener">Reddit</a>, etc.<br>Thanks :) `
  );

export let notifUpdateDocs = () =>
  textNotif(" Documentation updates available. ",
    " <a href=\"/offline\">Install them</a> as soon as possible to avoid broken pages. ");

addTemplates({
  notifCookieBlocked,
  notifError,
  notifImportInvalid,
  notifInvalidLocation,
  notifNews,
  notifQuotaExceeded,
  notifShare,
  notifShare,
  notifUpdateDocs,
  notifUpdateReady,
  notifUpdates
});
