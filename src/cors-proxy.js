const addCorsProxy = (url) => {
  const proxyUrl = 'https://cors-anywhere.herokuapp.com';
  return `${proxyUrl}/${url}`;
};

export { addCorsProxy };
