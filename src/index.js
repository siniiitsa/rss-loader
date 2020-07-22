import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import { renderForm, renderFeedback } from './view.js';

const schema = yup
  .string()
  .url('This needs to be a valid URL')
  .required('You need to provide an rss link');

const validateRssLink = (watchedState) => {
  try {
    schema.test(
      'check if already added',
      'This feed has already been loaded',
      (link) => !watchedState.addedLinks.includes(link),
    ).validateSync(watchedState.form.rssLink);
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

const app = () => {
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
    addedLinks: ['https://mobile-review.com/rss.xml'],
  };

  const elements = {
    form: document.querySelector('form[data-form="load-rss-form"]'),
    rssLinkField: document.querySelector('input[name="rss-link"]'),
    feedbackContainer: document.querySelector('.feedback'),
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.isValid':
        renderForm(watchedState, elements);
        break;
      case 'feedback':
        renderFeedback(watchedState, elements);
        break;
      default:
        break;
    }
  });

  elements.rssLinkField.addEventListener('input', (e) => {
    watchedState.form.rssLink = e.target.value.trim();
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    updateValidationState(watchedState);
    if (!state.form.isValid) {
      return;
    }

    watchedState.processStatus = 'requesting';
    axios.get(state.form.rssLink)
      .then((res) => {
        watchedState.processStatus = 'filling';
        console.log(res.data);
      })
      .catch((err) => {
        watchedState.processStatus = 'failed';
        watchedState.feedback = {
          message: err.message,
          type: 'error',
        };
        // TODO finish error handling with status code message
      });
  });
};

app();
