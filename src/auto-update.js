import axios from 'axios';
import { uniqueId } from 'lodash';
import { parseRss } from './rss-parser.js';
import { addCorsProxy } from './cors-proxy.js';

const buildArticle = (item, feedId) => ({
  id: uniqueId(),
  feedId,
  title: item.title,
  link: item.link,
});

const buildArticles = (watchedState, promises) => promises
  .flatMap((result, index) => {
    if (result.status !== 'fulfilled') return null;

    const feedId = watchedState.loadedFeeds[index].id;
    const rssString = result.value.data;
    const { items } = parseRss(rssString);
    const articles = items.map((item) => buildArticle(item, feedId));
    return articles;
  })
  .filter(Boolean);

const getNewArticles = (alreadyLoadedArticles, articles) => articles.filter((art) => {
  const isAlreadyLoaded = alreadyLoadedArticles.some(
    ({ title, feedId }) => art.title === title && art.feedId === feedId,
  );
  return !isAlreadyLoaded;
});

const initAutoUpdate = (watchedState, updateInterval) => {
  const updateFeeds = () => setTimeout(() => {
    // eslint-disable-next-line no-param-reassign
    watchedState.feedsAutoUpdateStatus = 'updating';
    const updateResults = watchedState.loadedFeeds
      .map(({ link }) => addCorsProxy(link))
      .map(axios.get);

    Promise.allSettled(updateResults)
      .then((promises) => {
        const articles = buildArticles(watchedState, promises);
        const newArticles = getNewArticles(watchedState.loadedArticles, articles);
        if (newArticles.length > 0) {
          watchedState.loadedArticles.push(...newArticles);
          // eslint-disable-next-line no-param-reassign
          watchedState.feedsAutoUpdateStatus = 'updated';
        } else {
          // eslint-disable-next-line no-param-reassign
          watchedState.feedsAutoUpdateStatus = 'unchanged';
        }
      })
      .finally(updateFeeds);
  }, updateInterval);

  updateFeeds();
};

export { initAutoUpdate };
