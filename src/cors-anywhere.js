const enableCorsAnywhere = () => {
  const corsApiHost = 'cors-anywhere.herokuapp.com';
  const corsApiUrl = `https://${corsApiHost}/`;
  const origin = `${window.location.protocol}//${window.location.host}`;
  const open = XMLHttpRequest.prototype.open;
  // eslint-disable-next-line func-names
  XMLHttpRequest.prototype.open = function (...args) {
    const targetOrigin = /^https?:\/\/([^/]+)/i.exec(args[1]);
    if (targetOrigin && targetOrigin[0].toLowerCase() !== origin
      && targetOrigin[1] !== corsApiHost) {
      args[1] = corsApiUrl + args[1];
    }
    return open.apply(this, args);
  };
};

export { enableCorsAnywhere };
