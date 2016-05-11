var Animation, Easing, Factory;

Animation = require("Animated").Animation;

Factory = require("factory");

Easing = require("easing");

module.exports = Factory("BrakeAnimation", {
  kind: Animation,
  optionTypes: {
    velocity: Number,
    duration: Number,
    easing: Function,
    maxValue: Number.Maybe
  },
  optionDefaults: {
    easing: Easing("linear")
  },
  initFrozenValues: function(options) {
    return {
      startVelocity: options.velocity,
      finalTime: options.duration,
      easing: options.easing,
      maxValue: options.maxValue
    };
  },
  initValues: function() {
    return {
      progress: 0,
      time: null,
      value: null,
      velocity: null,
      frames: null,
      _lastTime: null,
      _lastValue: null,
      _lastVelocity: null
    };
  },
  _velocityAtProgress: function(progress) {
    return this.startVelocity * (1 - this.easing(progress));
  },
  _slowByTime: function() {
    this.time = Math.min(this.finalTime, Date.now() - this.__startTime);
    this.value = this._lastValue + this._lastVelocity * (this.time - this._lastTime);
    this.progress = this.time / this.finalTime;
    this.velocity = this._velocityAtProgress(this.progress);
  },
  _clampAtMaxValue: function() {
    var movingUp, underMax;
    if (this.value !== this.maxValue) {
      movingUp = this.__startVelocity < 0;
      underMax = this.value < this.maxValue;
      if (movingUp === underMax) {
        return;
      }
    }
    this.value = this.maxValue;
    this.progress = 1;
    return this.velocity = 0;
  },
  __onStart: function() {
    this.time = 0;
    this.value = this.__startValue;
    this.velocity = this.startVelocity;
    return this.__requestAnimationFrame();
  },
  __computeValue: function() {
    this._lastTime = this.time;
    this._lastValue = this.value;
    this._lastVelocity = this.velocity;
    this._slowByTime();
    if (this.maxValue !== void 0) {
      this._clampAtMaxValue();
    }
    return this.value;
  },
  __didComputeValue: function() {
    if (this.progress === 1) {
      return this.__debouncedOnEnd(true);
    }
  },
  __captureFrame: function() {
    return {
      progress: this.progress,
      time: this.time,
      value: this.value,
      velocity: this.velocity
    };
  }
});

//# sourceMappingURL=../../map/src/BrakeAnimation.map
