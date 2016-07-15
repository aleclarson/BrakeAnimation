var Animation, Easing, Type, fromArgs, type;

Animation = require("Animated").Animation;

fromArgs = require("fromArgs");

Easing = require("easing");

Type = require("Type");

type = Type("BrakeAnimation");

type.inherits(Animation);

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
  startVelocity: fromArgs("velocity"),
  finalTime: fromArgs("duration"),
  easing: fromArgs("easing"),
  maxValue: fromArgs("maxValue")
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
    this.time = Math.min(this.finalTime, Date.now() - this.startTime);
    this.value = this._lastValue + this._lastVelocity * (this.time - this._lastTime);
    this.progress = this.time / this.finalTime;
    this.velocity = this._velocityAtProgress(this.progress);
  },
  _clampAtMaxValue: function() {
    var movingUp, underMax;
    if (this.value !== this.maxValue) {
      movingUp = this.startVelocity < 0;
      underMax = this.value < this.maxValue;
      if (movingUp === underMax) {
        return;
      }
    }
    this.value = this.maxValue;
    this.progress = 1;
    return this.velocity = 0;
  }
});

type.overrideMethods({
  __didStart: function() {
    this.time = 0;
    this.value = this.startValue;
    this.velocity = this.startVelocity;
    return this._requestAnimationFrame();
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
  __didUpdate: function() {
    if (this.progress === 1) {
      return this.finish();
    }
  },
  __captureFrame: function() {
    return {
      progress: this.progress,
      value: this.value,
      time: this.time,
      velocity: this.velocity
    };
  }
});

module.exports = type.build();

//# sourceMappingURL=map/BrakeAnimation.map
