const buildItem = (itemElem) => ({
  title: itemElem.getElementsByTagName('title')[0].textContent,
  link: itemElem.getElementsByTagName('link')[0].textContent,
});

const parseRss = (rssString) => {
  const domparser = new DOMParser();
  const xmlDoc = domparser.parseFromString(rssString, 'text/xml');
  return {
    title: xmlDoc.getElementsByTagName('title')[0].textContent,
    items: [...xmlDoc.getElementsByTagName('item')].map(buildItem),
  };
};

export { parseRss };
