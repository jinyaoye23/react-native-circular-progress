
import React from 'react';
import PropTypes from 'prop-types';
import { View, ViewPropTypes, Platform, ART } from 'react-native';
const { Surface, Shape, Path, Group } = ART;
import MetricsPath from 'art/metrics/path';

export default class CircularProgress extends React.Component {

  circlePath(cx, cy, r, startDegree, endDegree) {
    let p = Path();
    p.path.push(0, cx + r, cy);
    p.path.push(4, cx, cy, r, startDegree * Math.PI / 180, endDegree * Math.PI / 180, 1);
    return p;
  }

  extractFill(fill) {
    return Math.min(100, Math.max(0, fill));
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.fill);
  }
  // 处理百分比和颜色，封装成数组对象
  handleFillAndColor(fill, color) {
    let ret = [];
    if (Array.isArray(fill) && Array.isArray(color)) {
      // 数组
      fill.forEach((value, index) => {
        ret.push({
          fill: this.extractFill(value._value),
          color: index > (color.length - 1) ? color[color.length - 1] : color[index],
        })
      })
    } else {
      ret.push({
        fill: this.extractFill(fill),
        color
      })
    }
    ret.sort((a, b) => {
      return b.fill - a.fill
    })
    return ret;
  }

  getCirclePathByFill(fill) {
    let { size, width } = this.props;
    return this.circlePath(size / 2, size / 2, size / 2 - width / 2, 0, (360 * .9999) * fill / 100);
  }
  render() {
    const {
      size,
      width,
      backgroundWidth,
      tintColor,
      backgroundColor,
      style,
      rotation,
      linecap,
      children,
      fill,
    } = this.props;
    const backgroundPath = this.circlePath(size / 2, size / 2, size / 2 - width / 2, 0, 360 * .9999);
    const offset = size - (width * 2);

    const fillArray = this.handleFillAndColor(fill, tintColor);
    const childContainerStyle = {
      position: 'absolute',
      left: width,
      top: width,
      width: offset,
      height: offset,
      borderRadius: offset / 2,
      alignItems: 'center',
      justifyContent: 'center'
    }
    return (
      <View style={style}>
        <Surface
          width={size}
          height={size}
        >
          <Group rotation={rotation - 90} originX={size / 2} originY={size / 2}>
            {backgroundColor !== 'transparent' && (
              <Shape
                d={backgroundPath}
                stroke={backgroundColor}
                strokeWidth={backgroundWidth != null ? backgroundWidth : width}
              />
            )}
            {
              fillArray.map((value, index) => {
                if (!value.fill) return null;
                return <Shape
                  key={index}
                  d={this.getCirclePathByFill(value.fill)}
                  stroke={value.color}
                  strokeWidth={width}
                  strokeCap={linecap}
                />
              })
            }
          </Group>
        </Surface>
        {children && (
          <View style={childContainerStyle}>
            {children(fill)}
          </View>
        )}
      </View>
    )
  }
}

CircularProgress.propTypes = {
  style: ViewPropTypes.style,
  size: PropTypes.number.isRequired,
  fill: PropTypes.oneOfType([PropTypes.number, PropTypes.array]).isRequired,
  // fill: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  backgroundWidth: PropTypes.number,
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  // tintColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  rotation: PropTypes.number,
  linecap: PropTypes.string,
  children: PropTypes.func
}

CircularProgress.defaultProps = {
  tintColor: 'black',
  backgroundColor: '#e4e4e4',
  rotation: 90,
  linecap: 'butt'
}
