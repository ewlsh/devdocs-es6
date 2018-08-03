import {
  addTemplates
} from '../base';


export let typePageEntry = entry => `<li><a href="${entry.fullPath()}">${$.escape(entry.name)}</a></li>`;

export let typePage = type =>
  ` <h1>${type.doc.fullName} / ${type.name}</h1>
<ul class="_entry-list">${typePageEntry(type.entries())}</ul> `;

addTemplates({typePage, typePageEntry});