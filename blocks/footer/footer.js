import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;

    decorateIcons(footer);
    block.append(footer);

    const blockChildren = footer.firstElementChild.children;
    footer.firstElementChild.classList.add('footer-title');
    const footerGallery = document.createElement('div');
    footerGallery.classList.add('footer-gallery');
    const footerImpressum = document.createElement('div');
    footerImpressum.classList.add('footer-impressum');
    footer.append(footerGallery);
    footer.append(footerImpressum);

    const numChildren = blockChildren.length;
    for (let i = 0; i < numChildren; i += 1) {
      if (blockChildren[i] && blockChildren[i].tagName === 'P') {
        if (blockChildren[i].children[0]
            && blockChildren[i].children[0].tagName === 'A'
            && blockChildren[i].children[0].children[0]
            && blockChildren[i].children[0].children[0].tagName === 'PICTURE') {
          blockChildren[i].classList.add('footer-gallery-item');
          footerGallery.appendChild(blockChildren[i]);
        } else {
          blockChildren[i].classList.add('footer-impressum');
          footerImpressum.appendChild(blockChildren[i]);
        }
        i -= 1;
      } else if (blockChildren[i] && blockChildren[i].tagName === 'UL') {
        blockChildren[i].classList.add('impressum');
        footerImpressum.appendChild(blockChildren[i]);
        i -= 1;
      }
    }
  }
}
