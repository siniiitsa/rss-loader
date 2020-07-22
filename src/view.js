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
  const { message, type } = watchedState.feedback;
  switch (type) {
    case 'success':
      feedbackContainer.classList.remove('text-danger');
      break;
    case 'error':
      feedbackContainer.classList.add('text-danger');
      break;
    default:
      throw new Error(`Unknown feedback type: ${type}`);
  }
  feedbackContainer.innerHTML = message;
};
