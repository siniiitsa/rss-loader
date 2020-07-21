export const renderForm = (watchedState, elements) => {
  const { rssLinkField } = elements;
  if (watchedState.form.isValid) {
    rssLinkField.classList.remove('is-invalid');
  } else {
    rssLinkField.classList.add('is-invalid');
  }
};

export const renderFeedback = (watchedState, elements) => {
  const { feedbackContainer } = elements;
  feedbackContainer.innerHTML = watchedState.feedback;
  if (watchedState.form.isValid) {
    feedbackContainer.classList.remove('text-danger');
  } else {
    feedbackContainer.classList.add('text-danger');
  }
};
