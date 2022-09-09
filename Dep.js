var Dep = /** @class */ (function () {
  function Dep() {
      this.id = uid$2++;
      this.subs = [];
  }
  Dep.prototype.addSub = function (sub) {
      this.subs.push(sub);
  };
  Dep.prototype.removeSub = function (sub) {
      remove$2(this.subs, sub);
  };
  Dep.prototype.depend = function (info) {
      if (Dep.target) {
          Dep.target.addDep(this);
          if (info && Dep.target.onTrack) {
              Dep.target.onTrack(__assign({ effect: Dep.target }, info));
          }
      }
  };
  Dep.prototype.notify = function (info) {
      // stabilize the subscriber list first
      var subs = this.subs.slice();
      if (!config.async) {
          // subs aren't sorted in scheduler if not running async
          // we need to sort them now to make sure they fire in correct
          // order
          subs.sort(function (a, b) { return a.id - b.id; });
      }
      for (var i = 0, l = subs.length; i < l; i++) {
          if (info) {
              var sub = subs[i];
              sub.onTrigger &&
                  sub.onTrigger(__assign({ effect: subs[i] }, info));
          }
          subs[i].update();
      }
  };
  return Dep;
}());