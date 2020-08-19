import axios from 'axios';
import { buildArticle, parseRss } from './rss-parser.js';
import { addCorsAnywhere } from './cors-anywhere.js';

const buildArticles = (watchedState, promises) => promises
  .flatMap((result, index) => {
    if (result.status !== 'fulfilled') return null;
    const feedId = watchedState.loadedFeeds[index].id;
    const xmlDocument = parseRss(result.value.data);
    const items = [...xmlDocument.getElementsByTagName('item')];
    return items.map((item) => buildArticle(item, feedId));
  })
  .filter(Boolean);

const getNewArticles = (watchedState, articles) => articles.filter((art) => {
  const isAlreadyPresent = watchedState.loadedArticles
    .some(({ title, feedId }) => art.title === title && art.feedId === feedId);
  return !isAlreadyPresent;
});

const initAutoUpdate = (watchedState, updateInterval) => {
  const updateFeeds = () => setTimeout(() => {
    // eslint-disable-next-line no-param-reassign
    watchedState.updateStatus = 'updating';
    const updateResults = watchedState.loadedFeeds
      .map((feed) => axios.get(addCorsAnywhere(feed.link)));
    Promise.allSettled(updateResults)
      .then((promises) => {
        const articles = buildArticles(watchedState, promises);
        const newArticles = getNewArticles(watchedState, articles);
        if (newArticles.length > 0) {
          // eslint-disable-next-line no-param-reassign
          watchedState.loadedArticles = [...watchedState.loadedArticles, ...newArticles];
          // eslint-disable-next-line no-param-reassign
          watchedState.updateStatus = 'updated';
        } else {
          // eslint-disable-next-line no-param-reassign
          watchedState.updateStatus = 'unchanged';
        }
        updateFeeds();
      })
      .catch(() => {
        // eslint-disable-next-line no-param-reassign
        watchedState.updateStatus = 'updated';
        updateFeeds();
      });
  }, updateInterval);

  updateFeeds();
};

export { initAutoUpdate };
