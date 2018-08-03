// TODO This was an erb template.

import {
  addTemplates
} from '../base';

export let newsList = function (news, options) {
  if (options == null) {
    options = {};
  }
  let year = new Date().getUTCFullYear();
  let result = '';

  for (let value of Array.from(news)) {
    const date = new Date(value[0]);
    if ((options.years !== false) && (year !== date.getUTCFullYear())) {
      year = date.getUTCFullYear();
      result += `<h2 class="_block-heading">${year}</h2>`;
    }
    result += newsItem(date, value.slice(1));
  }

  return result;
};

export let newsPage = () =>
  ` <h1 class="_lined-heading">Changelog</h1>
<p class="_note">
  For the latest news, follow <a href="https://twitter.com/DevDocs">@DevDocs</a>.<br>
  For development updates, follow the project on <a href="https://github.com/freeCodeCamp/devdocs">GitHub</a>.
<div class="_news">${newsList(App.news)}</div> `;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

var newsItem = function (date, news) {
  date = `<span class="_news-date">${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}</span>`;
  let result = '';

  for (let i = 0; i < news.length; i++) {
    let text = news[i];
    text = text.split("\n");
    const title = `<span class="_news-title">${text.shift()}</span>`;
    result += `<div class="_news-row">${i === 0 ? date : ''} ${title} ${text.join('<br>')}</div>`;
  }

  return result;
};

addTemplates({newsPage, newsItem, newsList});

// TODO

// App.news = "<%= App.news.to_json %>";
