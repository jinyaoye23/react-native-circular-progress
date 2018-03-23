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
    // preHandlerFillAndColor;
    let fillAndColor = this.preHandlerFillAndColor(props.fill, props.tintColor);
    this.tintColor = fillAndColor.color;
    this.fill = fillAndColor.fill;
    this.state = {
      appState: AppState.currentState,
      chartFillAnimation: this.getChartFillAnimation(this.fill, props.prefill),
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.fill !== this.props.fill || nextProps.tintColor !== this.props.tintColor) {
      let fillAndColor = this.preHandlerFillAndColor(props.fill, props.tintColor);
      this.tintColor = fillAndColor.color;
      this.fill = fillAndColor.fill;
      this.setState({
        chartFillAnimation: this.getChartFillAnimation(this.fill, props.prefill),
      })
    }
  }
  /**
   * 预先处理fill值，如果存在两个相同的值，则只取第一个
   * @param {*} fill 
   * @param {*} color 
   */
  preHandlerFillAndColor(fill, color) {
    let retFill = fill, retColor = color;
    if (Array.isArray(fill)) {
      retFill = []; retColor = [];
      fill.forEach((value, index, array) => {
        if (index == 0 || index !== 0 && value != array[index - 1]) {
          retFill.push(value);
          retColor.push(color[index]);
        }
      })
    }
    return {
      fill: retFill,
      color: retColor
    }
  }


  handleAppStateChange = nextAppState => {
    if (this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active') {
      // Fix bug on Android where the drawing is not displayed after the app is
      // backgrounded / screen is turned off. Restart the animation when the app
      // comes back to the foreground.
      this.setState({
        chartFillAnimation: this.getChartFillAnimation(this.fill, this.props.prefill),
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
      fill.forEach((value, index, array) => {
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
    const { tension, friction, onAnimationComplete } = this.props;

    if (Array.isArray(this.fill)) {
      // 如果是数组
      let animatedArray = this.fill.map((value, index) => {
        // let startValue = this.state.chartFillAnimation[index];
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
    let animatedFill = Array.isArray(chartFillAnimation) ? chartFillAnimation[0] : chartFillAnimation;
    return (
      <AnimatedProgress
        {...other}
        tintColor={this.tintColor}
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
