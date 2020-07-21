import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import onChange from 'on-change';
import { renderForm, renderFeedback } from './view.js';

const validateRssLink = (watchedState) => {
  const schema = yup
    .string()
    .url('This needs to be a valid URL.')
    .required('You need to provide an rss link.')
    .test(
      'check if already added',
      'This feed has already been loaded.',
      (link) => !watchedState.addedLinks.includes(link),
    );

  try {
    schema.validateSync(watchedState.form.rssLink);
    return [];
  } catch (validationError) {
    return validationError.errors;
  }
};

const updateValidationState = (watchedState) => {
  const [error] = validateRssLink(watchedState);
  watchedState.form.isValid = !error;
  watchedState.feedback = error || '';
};

const app = () => {
  const state = {
    form: {
      isValid: true,
      fields: {
        rssLink: '',
      },
    },
    processingStatus: 'filling',
    feedback: '',
    addedLinks: ['https://ru.hexlet.io/lessons.rss'],
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
  });
};

app();
