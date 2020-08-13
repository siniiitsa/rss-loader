import { uniqueId } from 'lodash';

const prefix = 'id_';

const parseRss = (rssData) => {
  const domparser = new DOMParser();
  return domparser.parseFromString(rssData, 'text/xml');
};

const buildFeed = (xmlDocument, id, link) => {
  const title = xmlDocument.getElementsByTagName('title')[0].textContent;
  return { id, link, title };
};

const buildArticle = (item, feedId) => ({
  feedId,
  id: uniqueId(prefix),
  title: item.getElementsByTagName('title')[0].textContent,
  link: item.getElementsByTagName('link')[0].textContent,
});

const parseToFeed = (rssData, rssLink) => {
  const xmlDocument = parseRss(rssData);
  const feedId = uniqueId(prefix);
  const items = [...xmlDocument.getElementsByTagName('item')];
  return {
    feed: buildFeed(xmlDocument, feedId, rssLink),
    articles: items.map((item) => buildArticle(item, feedId)),
  };
};

export { parseRss, buildArticle, parseToFeed };
