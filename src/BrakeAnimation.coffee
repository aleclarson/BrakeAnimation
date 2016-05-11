
{ Animation } = require "Animated"

Factory = require "factory"
Easing = require "easing"

module.exports = Factory "BrakeAnimation",

  kind: Animation

  optionTypes:
    velocity: Number
    duration: Number
    easing: Function
    maxValue: Number.Maybe

  optionDefaults:
    easing: Easing "linear"

  initFrozenValues: (options) ->

    startVelocity: options.velocity

    finalTime: options.duration

    easing: options.easing

    maxValue: options.maxValue

  initValues: ->

    progress: 0

    time: null

    value: null

    velocity: null

    frames: null

    _lastTime: null

    _lastValue: null

    _lastVelocity: null

  # The result of the easing function must be inversed to flip the
  # curve by the y-axis. This creates a 1 -> 0 progression.
  _velocityAtProgress: (progress) ->
    return @startVelocity * (1 - @easing progress)

  # When a specific duration is desired, we reduce velocity based
  # on how much time has passed since the animation started.
  _slowByTime: ->
    @time = Math.min @finalTime, Date.now() - @__startTime
    @value = @_lastValue + @_lastVelocity * (@time - @_lastTime)
    @progress = @time / @finalTime
    @velocity = @_velocityAtProgress @progress
    return

  _clampAtMaxValue: ->
    if @value isnt @maxValue
      movingUp = @__startVelocity < 0
      underMax = @value < @maxValue
      return if movingUp is underMax
    @value = @maxValue
    @progress = 1
    @velocity = 0

  __onStart: ->

    @time = 0
    @value = @__startValue
    @velocity = @startVelocity

    @__requestAnimationFrame()

  __computeValue: ->

    @_lastTime = @time
    @_lastValue = @value
    @_lastVelocity = @velocity

    @_slowByTime()

    if @maxValue isnt undefined
      @_clampAtMaxValue()

    return @value

  __didComputeValue: ->
    if @progress is 1
      @__debouncedOnEnd yes

  __captureFrame: -> {
    @progress
    @time
    @value
    @velocity
  }
