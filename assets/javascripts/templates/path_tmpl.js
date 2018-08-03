import {
  addTemplates
} from './base';

const arrow = "<svg class=\"_path-arrow\"><use xlink:href=\"#icon-dir\"/></svg>";

export let path = function (doc, type, entry) {
  let html = `<a href="${doc.fullPath()}" class="_path-item _icon-${doc.icon}">${doc.fullName}</a>`;
  if (type) {
    html += `${arrow}<a href="${type.fullPath()}" class="_path-item">${type.name}</a>`;
  }
  if (entry) {
    html += `${arrow}<span class="_path-item">${$.escape(entry.name)}</span>`;
  }
  return html;
};

addTemplates({path});
