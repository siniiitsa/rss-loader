import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales';
import { renderForm, renderFeedback, renderFeeds } from './view.js';
import { parseRssToFeed } from './parser';

const schema = yup
  .string()
  .url(i18next.t('feedback.invalidUrl'))
  .required(i18next.t('feedback.rssRequired'));

const validateRssLink = (watchedState) => {
  try {
    schema.test(
      'check if already added',
      i18next.t('feedback.alreadyLoaded'),
      (link) => !watchedState.loadedLinks.includes(link),
    ).validateSync(watchedState.form.fields.rssLink);
    return [];
  } catch (validationError) {
    return validationError.errors;
  }
};

const updateValidationState = (watchedState) => {
  const [error] = validateRssLink(watchedState);
  watchedState.form.isValid = !error;
  watchedState.feedback = {
    message: error || '',
    type: error ? 'error' : 'success',
  };
};

const updateLoadedFeedsState = (watchedState, rssData) => {
  const { feed, articles } = parseRssToFeed(rssData);
  watchedState.loadedArticles = [...watchedState.loadedArticles, ...articles];
  watchedState.loadedFeeds = [...watchedState.loadedFeeds, feed];
  watchedState.loadedLinks = [...watchedState.loadedLinks, watchedState.form.fields.rssLink];
  watchedState.processStatus = 'filling';
  watchedState.form.fields.rssLink = '';
  watchedState.feedback = {
    message: i18next.t('feedback.feedLoaded'),
    type: 'success',
  };
};

const handleLoadingError = (watchedState, error) => {
  watchedState.processStatus = 'failed';
  watchedState.feedback = {
    message: error.message,
    type: 'error',
  };
};

const app = () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    const state = {
      form: {
        isValid: true,
        fields: {
          rssLink: '',
        },
      },
      processStatus: 'filling',
      feedback: {
        message: '',
        type: 'success',
      },
      loadedLinks: [],
      loadedFeeds: [],
      loadedArticles: [],
    };

    const elements = {
      form: document.querySelector('form[data-form="load-rss-form"]'),
      rssLinkField: document.querySelector('input[name="rss-link"]'),
      feedbackContainer: document.querySelector('.feedback'),
      feedsContainer: document.querySelector('.feeds'),
    };

    const watchedState = onChange(state, (path) => {
      switch (path) {
        case 'form.isValid':
          renderForm(watchedState, elements);
          break;
        case 'feedback':
          renderFeedback(watchedState, elements);
          break;
        case 'loadedFeeds':
          renderFeeds(watchedState, elements);
          break;
        default:
          break;
      }
    });

    elements.rssLinkField.addEventListener('input', (e) => {
      watchedState.form.fields.rssLink = e.target.value.trim();
    });

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      updateValidationState(watchedState);
      if (state.form.isValid) {
        watchedState.processStatus = 'requesting';
        axios.get(state.form.fields.rssLink)
          .then((response) => updateLoadedFeedsState(watchedState, response.data))
          .catch((error) => handleLoadingError(watchedState, error));
      }
    });
  });
};

export default app;
