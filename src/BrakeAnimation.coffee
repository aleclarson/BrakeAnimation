
{ Animation } = require "Animated"

fromArgs = require "fromArgs"
Easing = require "easing"
Type = require "Type"

type = Type "BrakeAnimation"

type.inherits Animation

type.optionTypes =
  velocity: Number
  duration: Number
  easing: Function
  maxValue: Number.Maybe

type.optionDefaults =
  easing: Easing "linear"

type.defineFrozenValues

  startVelocity: fromArgs "velocity"

  finalTime: fromArgs "duration"

  easing: fromArgs "easing"

  maxValue: fromArgs "maxValue"

type.defineValues

  progress: 0

  time: null

  value: null

  velocity: null

  frames: null

  _lastTime: null

  _lastValue: null

  _lastVelocity: null

type.defineMethods

  # The result of the easing function must be inversed to flip the
  # curve by the y-axis. This creates a 1 -> 0 progression.
  _velocityAtProgress: (progress) ->
    return @startVelocity * (1 - @easing progress)

  # When a specific duration is desired, we reduce velocity based
  # on how much time has passed since the animation started.
  _slowByTime: ->
    @time = Math.min @finalTime, Date.now() - @startTime
    @value = @_lastValue + @_lastVelocity * (@time - @_lastTime)
    @progress = @time / @finalTime
    @velocity = @_velocityAtProgress @progress
    return

  _clampAtMaxValue: ->
    if @value isnt @maxValue
      movingUp = @startVelocity < 0
      underMax = @value < @maxValue
      return if movingUp is underMax
    @value = @maxValue
    @progress = 1
    @velocity = 0

type.overrideMethods

  __didStart: ->

    @time = 0
    @value = @startValue
    @velocity = @startVelocity

    @_requestAnimationFrame()

  __computeValue: ->

    @_lastTime = @time
    @_lastValue = @value
    @_lastVelocity = @velocity

    @_slowByTime()

    if @maxValue isnt undefined
      @_clampAtMaxValue()

    return @value

  __didUpdate: ->
    if @progress is 1
      @finish()

  __captureFrame: -> {
    @progress
    @value
    @time
    @velocity
  }

module.exports = type.build()
