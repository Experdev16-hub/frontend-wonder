import 'dotenv/config';

export default {
  expo: {
    name: "Wonder Dating",
    slug: "wonder-dating",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FF6B9D"
    },
    assetBundlePatterns: [
      "*/"
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.wonderdating.app",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "Wonder needs access to your camera to take profile photos and find lookalikes.",
        NSPhotoLibraryUsageDescription: "Wonder needs access to your photo library to select profile photos.",
        NSLocationWhenInUseUsageDescription: "Wonder needs your location to find matches near you.",
        NSMicrophoneUsageDescription: "Wonder needs access to your microphone for voice messages.",
        NSFaceIDUsageDescription: "Wonder uses Face ID to securely log you in.",
        CFBundleDisplayName: "Wonder Dating",
        CFBundleName: "Wonder Dating",
        UIStatusBarStyle: "light-content",
        UIViewControllerBasedStatusBarAppearance: false,
        UIBackgroundModes: [
          "remote-notification",
          "background-fetch"
        ],
        UIRequiresFullScreen: true,
        UIStatusBarHidden: false,
        UISupportedInterfaceOrientations: [
          "UIInterfaceOrientationPortrait"
        ]
      },
      entitlements: {
        "com.apple.developer.applesignin": [
          "Default"
        ],
        "com.apple.developer.associated-domains": [
          "applinks:wonderdating.app"
        ]
      }
    },
    plugins: [
      "expo-apple-authentication",
      "expo-camera",
      "expo-image-picker",
      "expo-location",
      "expo-notifications"
    ],
    extra: {
      eas: {
        projectId: "your-project-id"
      },
      apiUrl: process.env.API_URL || "http://localhost:3000/api",
      socketUrl: process.env.SOCKET_URL || "http://localhost:3000"
    }
  }