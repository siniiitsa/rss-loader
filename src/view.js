import i18next from 'i18next';

const renderForm = (watchedState, elements) => {
  const isValid = watchedState.form.validationErrors.length === 0;
  elements.rssLinkField.classList[isValid ? 'remove' : 'add']('is-invalid');
};

const renderFeedback = (watchedState, elements) => {
  const { feedbackContainer } = elements;
  const { form } = watchedState;
  const isValid = form.validationErrors.length === 0;
  let message = '';
  let styleType = 'success';
  if (!isValid) {
    // eslint-disable-next-line prefer-destructuring
    message = form.validationErrors[0];
    styleType = 'error';
  } else if (watchedState.processStatus === 'loaded') {
    message = i18next.t('successMessages.feedLoaded');
  } else if (watchedState.processStatus === 'failed') {
    // eslint-disable-next-line prefer-destructuring
    message = watchedState.processErrors[0];
    styleType = 'error';
  }
  feedbackContainer.innerHTML = message;
  feedbackContainer.classList[styleType === 'success' ? 'add' : 'remove']('text-success');
  feedbackContainer.classList[styleType === 'error' ? 'add' : 'remove']('text-danger');
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
