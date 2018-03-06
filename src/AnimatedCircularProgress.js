import React from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  AppState,
  Easing,
  View,
  ViewPropTypes
} from 'react-native';
import CircularProgress from './CircularProgress';
const AnimatedProgress = Animated.createAnimatedComponent(CircularProgress);

export default class AnimatedCircularProgress extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      chartFillAnimation: this.getChartFillAnimation(props.fill, props.prefill),
      // chartFillAnimation: new Animated.Value(props.prefill || 0)
    }
  }

  componentDidMount() {
    this.animateFill();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    if (this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active') {
      // Fix bug on Android where the drawing is not displayed after the app is
      // backgrounded / screen is turned off. Restart the animation when the app
      // comes back to the foreground.
      this.setState({
        chartFillAnimation: this.getChartFillAnimation(this.props.fill, this.props.prefill),
        // chartFillAnimation: new Animated.Value(this.props.prefill || 0)
      });
      this.animateFill();
    }
    this.setState({ appState: nextAppState });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fill !== this.props.fill) {
      this.animateFill();
    }
  }

  getChartFillAnimation(fill, prefill) {
    if (Array.isArray(fill)) {
      // 如果是数组
      let ret = [];
      fill.forEach((value, index) => {
        let val = 0;
        ret.push(new Animated.Value(val));
      })
      return ret;
      // return new Array(fill.length).fill(new Animated.Value(prefill || 0));
    } else {
      return new Animated.Value(prefill || 0);
    }
  }
  animateFill() {
    const { tension, friction, onAnimationComplete, fill } = this.props;

    if (Array.isArray(fill)) {
      // 如果是数组
      let animatedArray = fill.map((value, index) => {
        let startValue = this.state.chartFillAnimation[index];
        return Animated.spring(this.state.chartFillAnimation[index], {
          toValue: value,
          tension,
          friction
        })
      })
      Animated.parallel(animatedArray, { stopTogether: false }).start(onAnimationComplete);
    } else {
      Animated.spring(
        this.state.chartFillAnimation,
        {
          toValue: this.props.fill,
          tension,
          friction
        }
      ).start(onAnimationComplete);
    }
  }

  performLinearAnimation(toValue, duration) {
    const { onLinearAnimationComplete } = this.props;

    Animated.timing(this.state.chartFillAnimation, {
      toValue: toValue,
      easing: Easing.linear,
      duration: duration
    }).start(onLinearAnimationComplete);
  }

  render() {
    const { fill, prefill, ...other } = this.props;
    let chartFillAnimation = this.state.chartFillAnimation;
    // 解决[0， 50]这样的情况，没有动画的问题
    let animatedFill = Array.isArray(chartFillAnimation) ? chartFillAnimation[chartFillAnimation.length - 1] : chartFillAnimation;
    return (
      <AnimatedProgress
        {...other}
        animatedFill={animatedFill}
        fill={chartFillAnimation}
      />
    )
  }
}

AnimatedCircularProgress.propTypes = {
  style: ViewPropTypes.style,
  size: PropTypes.number.isRequired,
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  // fill: PropTypes.number,
  prefill: PropTypes.number,
  width: PropTypes.number.isRequired,
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  // tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  backgroundColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  tension: PropTypes.number,
  friction: PropTypes.number,
  onAnimationComplete: PropTypes.func,
  onLinearAnimationComplete: PropTypes.func,
}

AnimatedCircularProgress.defaultProps = {
  tension: 7,
  friction: 10
};
