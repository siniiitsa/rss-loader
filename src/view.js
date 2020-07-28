import { has } from 'lodash';

const renderForm = (watchedState, elements) => {
  const { isValid } = watchedState.form;
  elements.rssLinkField.classList[isValid ? 'remove' : 'add']('is-invalid');
};

const feedbackTypeMapping = {
  success: (elements) => {
    elements.feedbackContainer.classList.remove('text-danger');
    elements.feedbackContainer.classList.add('text-success');
  },
  error: (elements) => {
    elements.feedbackContainer.classList.remove('text-success');
    elements.feedbackContainer.classList.add('text-danger');
  },
};

const renderFeedback = (watchedState, elements) => {
  const { message, type } = watchedState.feedback;
  if (!has(feedbackTypeMapping, type)) {
    throw new Error(`Unknown feedback type: ${type}`);
  }
  feedbackTypeMapping[type](elements);
  elements.feedbackContainer.innerHTML = message;
};

const buildFeedsHTML = (watchedState) => {
  if (watchedState.loadedFeeds.length === 0) {
    throw new Error('No loaded feeds to display!');
  }

  return watchedState.loadedFeeds
    .map((feed) => {
      const articlesHTML = watchedState.loadedArticles
        .filter((article) => article.feedId === feed.id)
        .map((article) => `<li><a href="${article.link}">${article.title}</a></li>`)
        .join('');

      return `
        <ul class="feed">
          <h2>${feed.title}</h2>
          ${articlesHTML}
        </ul>
      `;
    })
    .join('');
};

const renderFeeds = (watchedState, elements) => {
  const feedsHTML = buildFeedsHTML(watchedState);
  elements.feedsContainer.innerHTML = feedsHTML;
  elements.rssLinkField.value = '';
};

export {
  renderForm,
  renderFeedback,
  renderFeeds,
};
