import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number; // Percentage from 0 to 100
  size?: number; // Diameter of the circle
  strokeWidth?: number; // Thickness of the progress bar
  color?: string; // Progress stroke color
  backgroundColor?: string; // Background circle color
  duration?: number; // Animation duration
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color = "blue",
  backgroundColor = "lightgray",
  duration = 2000,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration,
      easing: Easing.out(Easing.exp),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value / 100),
  }));

  return (
    <View className="flex justify-center items-center">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`} // Rotates the circle to start at 12 o’clock
        />
      </Svg>
    </View>
  );
};

export default CircularProgress;
