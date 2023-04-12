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
    footer.append(footerGallery);

    const footerImpressum = document.createElement('div');
    footerImpressum.classList.add('footer-impressum');
    footer.append(footerImpressum);

    const numChildren = blockChildren.length;
    for (let i = 0; i < numChildren; i += 1) {
      const thisBlock = blockChildren[i];
      if (thisBlock && thisBlock.tagName === 'P') {
        if (thisBlock.children[0]
            && thisBlock.children[0].tagName === 'A'
            && thisBlock.children[0].children[0]
            && thisBlock.children[0].children[0].tagName === 'PICTURE') {
          thisBlock.classList.add('footer-gallery-item');
          footerGallery.appendChild(thisBlock);
          i -= 1;
        } else {
          thisBlock.classList.add('footer-impressum');
          footerImpressum.appendChild(thisBlock);
          i -= 1;
        }
      } else if (thisBlock && thisBlock.tagName === 'UL') {
        thisBlock.classList.add('impressum');
        footerImpressum.appendChild(thisBlock);
      }
    }
  }
}
