import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadBlock,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = ['cards']; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

export async function getIndex(index, indexUrl) {
  window.pageIndex = window.pageIndex || {};
  if (!window.pageIndex[index]) {
    const resp = await fetch(indexUrl);
    if (!resp.ok) {
      // eslint-disable-next-line no-console
      console.error('loading index', resp);
      return []; // do not cache in case of error
    }
    const json = await resp.json();
    window.pageIndex[index] = json.data;
  }
  return window.pageIndex[index];
}

/**
 * Get the list of events from the query index
 *
 * @param {number} limit the number of entries to return
 * @returns the posts as an array
 */
export async function getEvents(limit) {
  const indexUrl = new URL(
    '/events/query-index-events.json',
    window.location.origin,
  );
  let index = 'events';
  if (limit) {
    indexUrl.searchParams.set('limit', limit);
    index = index.concat(`-${limit}`);
  }

  const eventEntries = await getIndex(index, indexUrl.toString());
  return eventEntries;
}

function buildSidebar(main) {
  main.querySelectorAll(':scope > div').forEach((section) => section.classList.add('main-content'));
  const sidenav = document.createElement('div');
  sidenav.classList.add('side-content');
  sidenav.append(buildBlock('sidenav', ' '));
  main.append(sidenav);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildSidebar(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    const sidenav = main.querySelector('.sidenav');
    await loadBlock(sidenav);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

const preflight = ({ detail }) => {
  const sk = detail.data;
  // your custom code from button.action goes here
  // eslint-disable-next-line no-console
  console.log(sk);
};

const sk = document.querySelector('helix-sidekick');
if (sk) {
  // sidekick already loaded
  sk.addEventListener('custom:preflight', preflight);
} else {
  // wait for sidekick to be loaded
  document.addEventListener('helix-sidekick-ready', () => {
    document.querySelector('helix-sidekick')
      .addEventListener('custom:preflight', preflight);
  }, { once: true });
}

loadPage();
