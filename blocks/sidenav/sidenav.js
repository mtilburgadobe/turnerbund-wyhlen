import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the sidenav
 * @param {Element} block The sidenav block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch sidenav content
  const sidenavPath = cfg.sidenav || '/sidenav';
  const resp = await fetch(`${sidenavPath}.plain.html`, window.location.pathname.endsWith('/sidenav') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate sidenav DOM
    const sidenav = document.createElement('div');
    sidenav.innerHTML = html;

    decorateIcons(sidenav);
    block.append(sidenav);
  }
}
