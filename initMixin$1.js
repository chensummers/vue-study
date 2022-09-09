function initMixin$1(Vue) {
  Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid++;
      var startTag, endTag;
      /* istanbul ignore if */
      if (config.performance && mark) {
          startTag = "vue-perf-start:".concat(vm._uid);
          endTag = "vue-perf-end:".concat(vm._uid);
          mark(startTag);
      }
      // a flag to mark this as a Vue instance without having to do instanceof
      // check
      vm._isVue = true;
      // avoid instances from being observed
      vm.__v_skip = true;
      // effect scope
      vm._scope = new EffectScope(true /* detached */);
      vm._scope._vm = true;
      // merge options
      if (options && options._isComponent) {
          // optimize internal component instantiation
          // since dynamic options merging is pretty slow, and none of the
          // internal component options needs special treatment.
          initInternalComponent(vm, options);
      }
      else {
          vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
      }
      /* istanbul ignore else */
      {
          initProxy(vm);
      }
      // expose real self
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm);
      callHook$1(vm, 'beforeCreate', undefined, false /* setContext */);
      initInjections(vm); // resolve injections before data/props
      initState(vm);
      initProvide(vm); // resolve provide after data/props
      callHook$1(vm, 'created');
      /* istanbul ignore if */
      if (config.performance && mark) {
          vm._name = formatComponentName(vm, false);
          mark(endTag);
          measure("vue ".concat(vm._name, " init"), startTag, endTag);
      }
      if (vm.$options.el) {
          vm.$mount(vm.$options.el);
      }
  };
}