var Animation, Easing, Factory;

Animation = require("Animated").Animation;

Factory = require("factory");

Easing = require("easing");

module.exports = Factory("BrakeAnimation", {
  kind: Animation,
  optionTypes: {
    velocity: Number,
    duration: Number,
    easing: Function
  },
  optionDefaults: {
    easing: Easing("linear")
  },
  initValues: function(options) {
    return {
      _startVelocity: options.velocity,
      _duration: options.duration,
      _easing: options.easing,
      _curTime: this.__startTime,
      _curValue: this.__startValue,
      _curVelocity: options.velocity
    };
  },
  init: function() {
    return GLOBAL.brakeAnim = [
      {
        startValue: this._curValue,
        startVelocity: this._curVelocity
      }
    ];
  },
  __computeValue: function() {
    var now;
    now = Date.now();
    this._lastTime = this._curTime;
    this._lastValue = this._curValue;
    this._lastVelocity = this._curVelocity;
    this._curTime = Math.min(this._duration, now - this.__startTime);
    this._curVelocity = this._easing(this._curTime / this._duration);
    this._curValue = this._lastValue + this._lastVelocity * (this._curTime - this._lastTime);
    assertType(this._curValue, Number);
    GLOBAL.brakeAnim.push({
      value: this._curValue,
      velocity: this._curVelocity
    });
    return this._curValue;
  },
  __didComputeValue: function() {
    if (this._curTime < this._duration) {
      return;
    }
    return this.__debouncedOnEnd(true);
  }
});

//# sourceMappingURL=../../map/src/BrakeAnimation.map
