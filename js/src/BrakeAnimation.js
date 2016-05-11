var Animation, Easing, Type, getArgProp, type;

Animation = require("Animated").Animation;

getArgProp = require("getArgProp");

Easing = require("easing");

Type = require("Type");

type = Type("BrakeAnimation");

type.optionTypes = {
  velocity: Number,
  duration: Number,
  easing: Function,
  maxValue: Number.Maybe
};

type.optionDefaults = {
  easing: Easing("linear")
};

type.defineFrozenValues({
  startVelocity: getArgProp("velocity"),
  finalTime: getArgProp("duration"),
  easing: getArgProp("easing"),
  maxValue: getArgProp("maxValue")
});

type.defineValues({
  progress: 0,
  time: null,
  value: null,
  velocity: null,
  frames: null,
  _lastTime: null,
  _lastValue: null,
  _lastVelocity: null
});

type.defineMethods({
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

module.exports = type.build();

//# sourceMappingURL=../../map/src/BrakeAnimation.map
