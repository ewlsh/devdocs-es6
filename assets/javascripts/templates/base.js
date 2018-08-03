import {} from './pages/about_tmpl';
import {} from './pages/help_tmpl';
import {} from './pages/news_tmpl';
import {} from './pages/offline_tmpl';
import {} from './pages/root_tmpl';
import {} from './pages/settings_tmpl';
import {} from './pages/type_tmpl';
import {} from './error_tmpl';
import {} from './notice_tmpl';
import {} from './notif_tmpl';
import {} from './path_tmpl';
import {} from './sidebar_tmpl';
import {} from './tip_tmpl'



export function addTemplates(templates) {
  if (typeof addTemplates.registry === 'undefined') addTemplates.registry = {};
  for (let name of Object.keys(templates)) {
    addTemplates.registry[name] = templates[name];
    console.log('registering: ' + name + ' to ' + templates[name]);
  }
}

export function renderTemplate(name, value, ...args) {
  console.log('name: ' + name);

  const template = addTemplates.registry[name];

  console.log('result: ' + template);

  if (Array.isArray(value)) {
    let result = '';
    for (let val of value) {
      result += template(val, ...args);
    }
    return result;
  } else if (typeof template === 'function') {
    return template(value, ...args);
  } else {
    return template;
  }
};
