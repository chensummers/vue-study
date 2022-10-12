
const  mechanismType = {
  JS : 'js',
  RS : 'resource',
  UJ : 'unhandledrejection',
  HP : 'http',
  CS : 'cors',
  VUE : 'vue',
}

const getErrorKey = (event) => {
  const isJsError = event instanceof ErrorEvent;
  if (!isJsError) return mechanismType.RS;
  return event.message === 'Script error.' ? mechanismType.CS : mechanismType.JS;
};

const getErrorUid = (input) => {
  return window.btoa(encodeURIComponent(input));
};