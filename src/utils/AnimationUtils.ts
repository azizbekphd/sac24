import * as TWEEN from '@tweenjs/tween.js'

class AnimationUtils {
    static animate(
        currentProperties: Record<string, unknown>,
        targetProperties: Record<string, unknown>,
        duration: number,
        easing: (k: number) => number = TWEEN.Easing.Quadratic.Out,
    ): TWEEN.Tween {
        const tween = new TWEEN.Tween(currentProperties)
            .to(targetProperties, duration)
            .easing(easing)
        return tween
    }
}

export default AnimationUtils
