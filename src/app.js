import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import i18next from 'i18next';
import { isEqual, noop } from 'lodash';
import { enableCorsAnywhere } from './cors-anywhere.js';
import { renderForm, renderFeedback, renderFeeds } from './view.js';
import { initAutoUpdate } from './auto-update';
import { parseToFeed } from './rss-parser';
import resources from './locales';

const updateInterval = 5000;

const schema = yup
  .string()
  .url(i18next.t('errorMessages.invalidUrl'))
  .required(i18next.t('errorMessages.rssRequired'));

const validateRssLink = (watchedState) => {
  try {
    schema
      .notOneOf(watchedState.loadedLinks, i18next.t('errorMessages.alreadyLoaded'))
      .validateSync(watchedState.form.fields.rssLink);
    return [];
  } catch (validationError) {
    return validationError.errors;
  }
};

const updateValidationState = (watchedState) => {
  const errors = validateRssLink(watchedState);
  watchedState.form.validationErrors = errors;
  return errors.length === 0;
};

const updateLoadedFeedsState = (watchedState, rssData) => {
  const { feed, articles } = parseToFeed(rssData, watchedState.form.fields.rssLink);
  watchedState.processErrors = [];
  watchedState.loadedArticles.push(...articles);
  watchedState.loadedFeeds.push(feed);
  watchedState.loadedLinks.push(watchedState.form.fields.rssLink);
  watchedState.form.fields.rssLink = '';
  watchedState.processStatus = 'loaded';
};

const handleLoadingError = (watchedState, error) => {
  watchedState.processErrors = [error.message];
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

const updateStatusActions = {
  updating: noop,
  updated: renderFeeds,
  unchanged: noop,
};

const runApp = () => {
  enableCorsAnywhere();

  const state = {
    form: {
      validationErrors: [],
      fields: {
        rssLink: '',
      },
    },
    processStatus: 'filling',
    processErrors: [],
    updateStatus: '',
    loadedLinks: [],
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

  const watchedState = onChange(state, (path, newValue, oldValue) => {
    switch (path) {
      case 'form.validationErrors':
        if (isEqual(newValue, oldValue)) break;
        renderForm(watchedState, elements);
        renderFeedback(watchedState, elements);
        break;
      case 'processStatus':
        processStatusActions[newValue](watchedState, elements);
        break;
      case 'updateStatus':
        updateStatusActions[newValue](watchedState, elements);
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
    const isValid = updateValidationState(watchedState);
    if (isValid) {
      watchedState.processStatus = 'loading';
      axios.get(state.form.fields.rssLink)
        .then((response) => {
          updateLoadedFeedsState(watchedState, response.data);
          if (watchedState.loadedFeeds.length === 1) {
            initAutoUpdate(watchedState, updateInterval);
          }
        })
        .catch((error) => handleLoadingError(watchedState, error));
    }
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
