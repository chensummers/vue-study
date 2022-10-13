
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

// 正则表达式，用以解析堆栈split后得到的字符串
const FULL_MATCH =
  /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

// 限制只追溯10个
const STACKTRACE_LIMIT = 1000;

// 解析每一行
function parseStackLine(line) {
  const lineMatch = line.match(FULL_MATCH);
  if (!lineMatch) return {};
  const filename = lineMatch[2];
  const functionName = lineMatch[1] || '';
  const lineno = parseInt(lineMatch[3], 10) || undefined;
  const colno = parseInt(lineMatch[4], 10) || undefined;
  return {
    filename,
    functionName,
    lineno,
    colno,
  };
}

// 解析错误堆栈
function parseStackFrames(error) {
  const { stack } = error;
  // 无 stack 时直接返回
  if (!stack) return [];
  const frames = [];
  for (const line of stack.split('\n').slice(1)) {
    const frame = parseStackLine(line);
    if (frame) {
      frames.push(frame);
    }
  }
  return frames.slice(0, STACKTRACE_LIMIT);
}
// 初始化 静态资源异常 的数据获取和上报
const initResourceError = () => {
  const handler = (event) => {
    console.log(event,'event')
    event.preventDefault(); // 阻止向上抛出控制台报错
    // 如果不是跨域脚本异常,就结束
    if (getErrorKey(event) !== mechanismType.RS) return;
    const target = event.target
    const exception = {
      // 上报错误归类
      mechanism: {
        type: mechanismType.RS,
      },
      // 错误信息
      value: '',
      // 错误类型
      type: 'ResourceError',
      // 用户行为追踪 breadcrumbs 在 errorSendHandler 中统一封装
      // 页面基本信息 pageInformation 也在 errorSendHandler 中统一封装
      // 错误的标识码
      errorUid: getErrorUid(`${mechanismType.RS}-${target.src}-${target.tagName}`),
      // 附带信息
      meta: {
        url: target.src,
        html: target.outerHTML,
        type: target.tagName,
      },
    };
    console.log('exception ===',exception.type,exception)
    // 一般错误异常立刻上报，不用缓存在本地
    // this.errorSendHandler(exception);
  };
  window.addEventListener('error', (event) => handler(event), true);
};

// 初始化 JS异常 的数据获取和上报
const initJsError = () => {
  const handler = (event) => {
    // 阻止向上抛出控制台报错
    event.preventDefault();
    // 如果不是 JS异常 就结束
    if (getErrorKey(event) !== mechanismType.JS) return;
    const exception = {
      // 上报错误归类
      mechanism: {
        type: mechanismType.JS,
      },
      // 错误信息
      value: event.message,
      // 错误类型
      type: (event.error && event.error.name) || 'UnKnowun',
      // 解析后的错误堆栈
      stackTrace: {
        frames: parseStackFrames(event.error),
      },
      // 用户行为追踪 breadcrumbs 在 errorSendHandler 中统一封装
      // 页面基本信息 pageInformation 也在 errorSendHandler 中统一封装
      // 错误的标识码
      errorUid: getErrorUid(`${mechanismType.JS}-${event.message}-${event.filename}`),
      // 附带信息
      meta: {
        // file 错误所处的文件地址
        file: event.filename,
        // col 错误列号
        col: event.colno,
        // row 错误行号
        row: event.lineno,
      },
    }
    console.log('exception ===',exception.type,exception)
    // 一般错误异常立刻上报，不用缓存在本地
    // this.errorSendHandler(exception);
  };
  window.addEventListener('error', (event) => handler(event), true);
};

// 初始化 Promise异常 的数据获取和上报
const initPromiseError = () => {
  const handler = (event) => {
    event.preventDefault(); // 阻止向上抛出控制台报错
    const value = event.reason.message || event.reason;
    const type = event.reason.name || 'UnKnowun';
    const exception = {
      // 上报错误归类
      mechanism: {
        type: mechanismType.UJ,
      },
      // 错误信息
      value,
      // 错误类型
      type,
      // 解析后的错误堆栈
      stackTrace: {
        frames: parseStackFrames(event.reason),
      },
      // 用户行为追踪 breadcrumbs 在 errorSendHandler 中统一封装
      // 页面基本信息 pageInformation 也在 errorSendHandler 中统一封装
      // 错误的标识码
      errorUid: getErrorUid(`${mechanismType.UJ}-${value}-${type}`),
      // 附带信息
      meta: {},
    };
    console.log('exception ===',exception.type,exception)
    // 一般错误异常立刻上报，不用缓存在本地
    // this.errorSendHandler(exception);
  };

  window.addEventListener('unhandledrejection', (event) => handler(event), true);
};

// 初始化 HTTP请求异常 的数据获取和上报
const initHttpError = () => {
  const loadHandler = (metrics) => {
    // 如果 status 状态码小于 400,说明没有 HTTP 请求错误
    if (metrics.status < 400) return;
    const value = metrics.response;
    const exception = {
      // 上报错误归类
      mechanism: {
        type: mechanismType.HP,
      },
      // 错误信息
      value,
      // 错误类型
      type: 'HttpError',
      // 错误的标识码
      errorUid: getErrorUid(`${mechanismType.HP}-${value}-${metrics.statusText}`),
      // 附带信息
      meta: {
        metrics,
      },
    };
    console.log('exception ===',exception.type,exception)
    // 一般错误异常立刻上报，不用缓存在本地
    // this.errorSendHandler(exception);
  };
  // proxyXmlHttp(null, loadHandler);
  // proxyFetch(null, loadHandler);
};

// 初始化 跨域异常 的数据获取和上报
const initCorsError = () => {
  const handler = (event) => {
    // 阻止向上抛出控制台报错
    // event.preventDefault();
    console.log(getErrorKey(event),'getErrorKey(event)')
    // 如果不是跨域脚本异常,就结束
    if (getErrorKey(event) !== mechanismType.CS) return;
    const exception = {
      // 上报错误归类
      mechanism: {
        type: mechanismType.CS,
      },
      // 错误信息
      value: event.message,
      // 错误类型
      type: 'CorsError',
      // 错误的标识码
      errorUid: getErrorUid(`${mechanismType.JS}-${event.message}`),
      // 附带信息
      meta: {},
    };
    console.log('exception ===',exception.type,exception)
    // 自行上报异常，也可以跨域脚本的异常都不上报;
    // this.errorSendHandler(exception);
  };
  window.addEventListener('error', (event) => handler(event), true);
};