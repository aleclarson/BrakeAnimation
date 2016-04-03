
{ Animation } = require "Animated"

Factory = require "factory"
Easing = require "easing"

module.exports = Factory "BrakeAnimation",

  kind: Animation

  optionTypes:
    velocity: Number
    duration: Number
    easing: Function

  optionDefaults:
    easing: Easing "linear"

  initValues: (options) ->

    _startVelocity: options.velocity

    _duration: options.duration

    _easing: options.easing

    _curTime: @__startTime

    _curValue: @__startValue

    _curVelocity: options.velocity

  init: ->
    GLOBAL.brakeAnim = [
      { startValue: @_curValue, startVelocity: @_curVelocity }
    ]

  __computeValue: ->

    now = Date.now()

    @_lastTime = @_curTime
    @_lastValue = @_curValue
    @_lastVelocity = @_curVelocity

    @_curTime = Math.min @_duration, now - @__startTime
    @_curVelocity = @_easing @_curTime / @_duration
    @_curValue = @_lastValue + @_lastVelocity * (@_curTime - @_lastTime)

    assertType @_curValue, Number

    GLOBAL.brakeAnim.push {
      value: @_curValue
      velocity: @_curVelocity
    }

    return @_curValue

  __didComputeValue: ->
    return if @_curTime < @_duration
    @__debouncedOnEnd yes
