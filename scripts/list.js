import { createOptimizedPicture, loadCSS, toClassName } from './lib-franklin.js';

function getSelectionFromUrl(field) {
  return (
    toClassName(new URLSearchParams(window.location.search).get(field)) || ''
  );
}

function createPaginationLink(page, label) {
  const newUrl = new URL(window.location);
  const listElement = document.createElement('li');
  const link = document.createElement('a');
  newUrl.searchParams.set('page', page);
  link.href = newUrl.toString();
  link.innerText = label || page;
  listElement.append(link);
  return listElement;
}

export function renderPagination(entries, page, limit) {
  const listPagination = document.createElement('div');
  listPagination.className = 'pagination';

  if (entries.length > limit) {
    const maxPages = Math.ceil(entries.length / limit);

    const listSize = document.createElement('div');
    listSize.classList.add('size');
    if (entries.length > 10) {
      listSize.textContent = `Seite ${page} von ${maxPages}`;
    }

    const listPageLinks = document.createElement('div');
    listPageLinks.classList.add('pages');
    const list = document.createElement('ol');
    listPageLinks.append(list);
    if (page > 1) {
      list.append(createPaginationLink(page - 1, 'Vorherige'));
      list.append(createPaginationLink(1));
    }
    if (page > 3) {
      const dots = document.createElement('li');
      dots.innerText = '...';
      list.append(dots);
    }
    if (page === maxPages) {
      list.append(createPaginationLink(page - 2));
    }
    if (page > 2) {
      list.append(createPaginationLink(page - 1));
    }

    const currentPage = document.createElement('li');
    currentPage.classList.add('current');
    currentPage.innerText = page;
    list.append(currentPage);

    if (page < maxPages - 1) {
      list.append(createPaginationLink(page + 1));
    }
    if (page === 1) {
      list.append(createPaginationLink(page + 2));
    }
    if (page + 2 < maxPages) {
      const dots = document.createElement('li');
      dots.innerText = '...';
      list.append(dots);
    }
    if (page < maxPages) {
      list.append(createPaginationLink(maxPages));
      list.append(createPaginationLink(page + 1, 'Nächste'));
    }

    listPagination.append(listSize, listPageLinks);
  }
  return listPagination;
}

function renderListItem({
  path, title, image, description,
}) {
  const imageElement = createOptimizedPicture(image, title, false, [
    { width: '500' },
  ]);

  const listItemElement = document.createElement('li');
  listItemElement.innerHTML = `
      <div class="cards-card-image">
        <a href="${path}" title="${title}">
          ${imageElement.outerHTML}
        </a>
      </div>    
      <div class="cards-card-body">
        <h2><a title="${title}" href="${path}">${title}</a></h2>
        <p>${description}</p>
        <p class="button-container">
          <a href="${path}" title="Weiter lesen" class="button primary">Weiter lesen</a>
        </p>
      </div>
    `;

  return listItemElement;
}

function addItemsToList(data, customListItemRenderer, container) {
  data.forEach((item) => {
    const listItemElement = customListItemRenderer && typeof customListItemRenderer === 'function'
      ? customListItemRenderer(item, renderListItem)
      : renderListItem(item);
    container.appendChild(listItemElement);
  });
}

export default function createList(
  data,
  limitPerPage,
  root,
  customListItemRenderer,
) {
  loadCSS('../styles/list.css', () => {});

  let page = parseInt(getSelectionFromUrl('page'), 10);
  page = Number.isNaN(page) ? 1 : page;

  // get data for display
  const start = (page - 1) * limitPerPage;
  const dataToDisplay = data.slice(start, start + limitPerPage);

  if (dataToDisplay) {
    const container = document.createElement('ul');
    container.className = 'list';
    addItemsToList(dataToDisplay, customListItemRenderer, container);
    root.append(container);
  }
}
