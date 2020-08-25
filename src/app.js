import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import i18next from 'i18next';
import { noop, uniqueId } from 'lodash';
import { addCorsProxy } from './cors-proxy.js';
import { renderForm, renderFeedback, renderFeeds } from './view.js';
import { initAutoUpdate } from './auto-update';
import { parseRss } from './rss-parser';
import resources from './locales';

const updateInterval = 5000;

const schema = yup
  .string()
  .url(i18next.t('errorMessages.invalidUrl'))
  .required(i18next.t('errorMessages.rssRequired'));

const validateRssLink = (link, loadedLinks) => {
  try {
    schema
      .notOneOf(loadedLinks, i18next.t('errorMessages.alreadyLoaded'))
      .validateSync(link);
    return [];
  } catch (validationError) {
    return validationError.errors;
  }
};

const updateValidationState = (watchedState) => {
  const loadedLinks = watchedState.loadedFeeds.map((feed) => feed.link);
  const errors = validateRssLink(watchedState.form.fields.rssLink, loadedLinks);
  // eslint-disable-next-line no-param-reassign
  watchedState.form.validationErrors = errors;
  // eslint-disable-next-line no-param-reassign
  watchedState.form.isValid = errors.length === 0;
};

const buildFeed = (title, link) => ({ title, link, id: uniqueId() });

const buildArticle = (item, feedId) => ({
  id: uniqueId(),
  feedId,
  title: item.title,
  link: item.link,
});

const updateLoadedFeedsState = (watchedState, rssString) => {
  const { title, items } = parseRss(rssString);
  const feed = buildFeed(title, watchedState.form.fields.rssLink);
  const articles = items.map((item) => buildArticle(item, feed.id));
  // eslint-disable-next-line no-param-reassign
  watchedState.processErrors = [];
  watchedState.loadedArticles.push(...articles);
  watchedState.loadedFeeds.push(feed);
  // eslint-disable-next-line no-param-reassign
  watchedState.form.fields.rssLink = '';
  // eslint-disable-next-line no-param-reassign
  watchedState.processStatus = 'loaded';
};

const handleLoadingError = (watchedState, error) => {
  // eslint-disable-next-line no-param-reassign
  watchedState.processErrors = [error.message];
  // eslint-disable-next-line no-param-reassign
  watchedState.processStatus = 'failed';
};

const processStatusActions = {
  filling: noop,
  loading: (watchedState, elements) => {
    renderForm(watchedState, elements);
    renderFeedback(watchedState, elements);
  },
  loaded: (watchedState, elements) => {
    renderFeeds(watchedState, elements);
    renderFeedback(watchedState, elements);
    renderForm(watchedState, elements);
  },
  failed: (watchedState, elements) => {
    renderFeedback(watchedState, elements);
    renderForm(watchedState, elements);
  },
};

const feedsAutoUpdateStatusActions = {
  updating: noop,
  updated: renderFeeds,
  unchanged: noop,
};

const runApp = () => {
  const state = {
    form: {
      isValid: false,
      validationErrors: [],
      fields: {
        rssLink: '',
      },
    },
    processStatus: 'filling',
    processErrors: [],
    feedsAutoUpdateStatus: '',
    loadedFeeds: [],
    loadedArticles: [],
  };

  const elements = {
    form: document.querySelector('form[data-form="load-rss-form"]'),
    rssLinkField: document.querySelector('input[name="rss-link"]'),
    submitButton: document.querySelector('input[data-form="submit"]'),
    feedbackContainer: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
  };

  const watchedState = onChange(state, (path, newValue) => {
    switch (path) {
      case 'form.validationErrors':
        renderForm(watchedState, elements);
        renderFeedback(watchedState, elements);
        break;
      case 'processStatus':
        processStatusActions[newValue](watchedState, elements);
        break;
      case 'feedsAutoUpdateStatus':
        feedsAutoUpdateStatusActions[newValue](watchedState, elements);
        break;
      default:
        break;
    }
  });

  elements.rssLinkField.addEventListener('input', (e) => {
    watchedState.form.fields.rssLink = e.target.value.trim();
    watchedState.processStatus = 'filling';
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateValidationState(watchedState);

    if (!watchedState.form.isValid) return;

    watchedState.processStatus = 'loading';
    axios.get(addCorsProxy(state.form.fields.rssLink))
      .then((response) => {
        updateLoadedFeedsState(watchedState, response.data);
        if (watchedState.loadedFeeds.length === 1) {
          initAutoUpdate(watchedState, updateInterval);
        }
      })
      .catch((error) => handleLoadingError(watchedState, error));
  });
};

const app = () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(runApp);
};

export default app;
