import {
  addTemplates
} from './base';

export let tipKeyNav = `\
<p class="_notif-text">
  <strong>ProTip</strong>
  <span class="_notif-info">(click to dismiss)</span>
<p class="_notif-text">
  Hit <code class="_label">&darr;</code> <code class="_label">&uarr;</code> <code class="_label">&larr;</code> <code class="_label">&rarr;</code> to navigate the sidebar.<br>
  Hit <code class="_label">space / shift space</code>, <code class="_label">alt &darr;/&uarr;</code> or <code class="_label">shift &darr;/&uarr;</code> to scroll the page.
<p class="_notif-text">
  <a href="/help#shortcuts" class="_notif-link">See all keyboard shortcuts</a>\
`;

addTemplates({
  tipKeyNav
});
