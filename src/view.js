import i18next from 'i18next';

const renderForm = (watchedState, elements) => {
  const isValid = watchedState.form.validationErrors.length === 0;
  elements.rssLinkField.classList[isValid ? 'remove' : 'add']('is-invalid');
  elements.submitButton.disabled = watchedState.processStatus === 'loading';
  if (watchedState.processStatus === 'loaded') {
    elements.rssLinkField.value = '';
  }
};

const renderFeedback = (watchedState, elements) => {
  const { feedbackContainer } = elements;
  const { form } = watchedState;
  const isValid = form.validationErrors.length === 0;
  let message = '';
  let styleType = 'success';
  if (!isValid) {
    message = form.validationErrors[0];
    styleType = 'error';
  } else if (watchedState.processStatus === 'loaded') {
    message = i18next.t('successMessages.feedLoaded');
  } else if (watchedState.processStatus === 'failed') {
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
        .filter(({ feedId }) => feedId === feed.id)
        .map(({ link, title }) => `<li><a href="${link}">${title}</a></li>`)
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
};

export {
  renderForm,
  renderFeedback,
  renderFeeds,
};
