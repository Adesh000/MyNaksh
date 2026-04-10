# MyNaksh Astrologer Chat Application

A cutting-edge, high-performance React Native application built for seamless and interactive consultations between users and AI/Human Astrologers. This project heavily prioritizes 60fps local UI interactions, buttery smooth physics-based animations, and strict state decoupling.

## 🏗 Architecture & Technical Decisions

### 1. Animations (React Native Reanimated 3)
We heavily leveraged **Reanimated 3** to offload complex UI thread animations natively without JS-bridging bottlenecks:
* **Layout Transitions (`LinearTransition`)**: The custom `Animated.FlatList` gracefully calculates and coordinates Y-offset shifts using `LinearTransition.duration(300).easing(Easing.inOut(Easing.ease))` universally across children. Whenever an inline element (like the feedback chips) renders, the surrounding UI behaves like a fluidly controlled accordion.
* **Physics & Springs (`withSpring`)**: Physical elastic bounds are strictly enforced on UI components. For instance, the swipe-to-reply message bubbles natively return to their localized rest states upon release bounds using `translateX.value = withSpring(0)`.
* **Entry/Exit Bindings**: Elements like popup emoji menus, context feedback grids, and modal rating blocks mount using performant out-of-the-box wrappers like `FadeInDown` and `SlideInDown`, ensuring a premium application flow with zero layout jumping.

### 2. Gesture Handling
We bypassed the legacy React Native gesture responder system and built interactions using the performant **`react-native-gesture-handler`** package.
* **Swipe-to-Reply Logic**: A custom `Gesture.Pan()` declarative detector is securely wrapped around each chat bubble (`<SwipeableMessage>`). It strictly observes continuous X-axis translations by filtering out arbitrary vertical scrolls (`activeOffsetX([-10, 10])`). 
* **Direct UI Memory Pipeline**: As the user drags the message bubble, numeric `translateX` values natively augment an underlying `useSharedValue()`. Upon release, if passing a defined mathematical threshold (>50 local pixels), a fast `runOnJS` worklet bridge safely hands the payload back over to React to trigger the active reply payload.

### 3. State Management (Redux Toolkit)
Given the intrinsic complexity of managing a diverse matrix of chat origins (spanning User queries, dynamic AI Astrologer responses, System logs, and Human Astrologer interventions), we adopted **Redux Toolkit (`@reduxjs/toolkit`)** for state management instead of brittle Context APIs.
* **Decoupled Business Logic**: All mutating data configurations (Appending strings, saving Emoji reactions, and persisting Liked/Disliked feedback markers natively attached to IDs) are efficiently orchestrated isolated inside `src/store/chatSlice.ts`. 
* **Performance & Integrity**: Any nested leaf component can cleanly trigger localized updates like `dispatch(toggleReaction({...}))` without prop-drilling or forcing massive DOM redraws. This maintains absolute source-of-truth reliability over the local database mapping.

---
## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
npm start
```

### Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

#### Android
```sh
npm run android
```

#### iOS
For iOS, install native pods first:
```sh
bundle install
bundle exec pod install
npm run ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device!
