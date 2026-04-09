import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SwipeableMessageProps {
  children: React.ReactNode;
  onSwipe: () => void;
}

export default function SwipeableMessage({ children, onSwipe }: SwipeableMessageProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Allow swiping to the right to reply
      if (event.translationX > 0 && event.translationX < 80) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value > 50) {
        runOnJS(onSwipe)();
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const scale = interpolate(translateX.value, [20, 50], [0, 1], Extrapolation.CLAMP);
    const opacity = interpolate(translateX.value, [20, 50], [0, 1], Extrapolation.CLAMP);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={{ width: '100%', justifyContent: 'center' }}>
      <Animated.View style={[styles.replyIconContainer, iconStyle]}>
        <Text style={styles.replyIconText}>↩</Text>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  replyIconContainer: {
    position: 'absolute',
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyIconText: {
    fontSize: 18,
    color: '#475569',
  },
});
