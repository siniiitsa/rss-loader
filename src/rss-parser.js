const buildItem = (itemElem) => ({
  title: itemElem.querySelector('title').textContent,
  link: itemElem.querySelector('link').textContent,
});

const parseRss = (rssString) => {
  const domparser = new DOMParser();
  const xmlDoc = domparser.parseFromString(rssString, 'text/xml');
  return {
    title: xmlDoc.querySelector('title').textContent,
    items: [...xmlDoc.querySelectorAll('item')].map(buildItem),
  };
};

export { parseRss };
