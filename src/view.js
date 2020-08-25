import i18next from 'i18next';

const renderForm = (watchedState, elements) => {
  const isValid = watchedState.form.validationErrors.length === 0;
  elements.rssLinkField.classList[isValid ? 'remove' : 'add']('is-invalid');
  // eslint-disable-next-line no-param-reassign
  elements.submitButton.disabled = watchedState.processStatus === 'loading';
  if (watchedState.processStatus === 'loaded') {
    // eslint-disable-next-line no-param-reassign
    elements.rssLinkField.value = '';
  }
};

const feedbackStyleActions = {
  neutral: (feedbackContainer) => {
    feedbackContainer.classList.remove('text-danger', 'text-success');
  },
  success: (feedbackContainer) => {
    feedbackContainer.classList.add('text-success');
    feedbackContainer.classList.remove('text-danger');
  },
  error: (feedbackContainer) => {
    feedbackContainer.classList.remove('text-success');
    feedbackContainer.classList.add('text-danger');
  },
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
  } else if (watchedState.processStatus === 'loading') {
    message = i18next.t('successMessages.feedLoading');
    styleType = 'neutral';
  } else if (watchedState.processStatus === 'loaded') {
    message = i18next.t('successMessages.feedLoaded');
  } else if (watchedState.processStatus === 'failed') {
    message = watchedState.processErrors[0];
    styleType = 'error';
  }
  feedbackContainer.innerHTML = message;
  feedbackStyleActions[styleType](feedbackContainer);
};

const buildFeedsHTML = (watchedState) => {
  if (watchedState.loadedFeeds.length === 0) {
    return undefined;
  }

  return watchedState.loadedFeeds
    .map((feed) => {
      const articlesHTML = watchedState.loadedArticles
        .filter(({ feedId }) => feedId === feed.id)
        .map(({ link, title }) => `<li><a href="${link}">${title}</a></li>`)
        .join('');

      return `
        <ul class="feed list-unstyled">
          <h2>${feed.title}</h2>
          ${articlesHTML}
        </ul>
      `;
    })
    .join('');
};

const renderFeeds = (watchedState, elements) => {
  const feedsHTML = buildFeedsHTML(watchedState);
  // eslint-disable-next-line no-param-reassign
  elements.feedsContainer.innerHTML = feedsHTML;
};

export {
  renderForm,
  renderFeedback,
  renderFeeds,
};
