#!/bin/bash
set -e

DEVICE_UDID="00008140-001458D83AD0801C"
WORKSPACE="ios/sooop.xcworkspace"
SCHEME="sooop"
CONFIG="Debug"
BUILD_DIR="ios/build"
APP_PATH="$BUILD_DIR/Build/Products/$CONFIG-iphoneos/$SCHEME.app"
BUNDLE_ID="com.greenonion.sooop"

cd "$(dirname "$0")/.."

echo "==> Building $SCHEME ($CONFIG)..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIG" \
  -destination "generic/platform=iOS" \
  -derivedDataPath "$BUILD_DIR" \
  build \
  2>&1 | tail -20

echo ""
echo "==> Installing on device $DEVICE_UDID..."
xcrun devicectl device install app \
  --device "$DEVICE_UDID" \
  "$APP_PATH"

echo ""
echo "==> Launching $BUNDLE_ID..."
xcrun devicectl device process launch \
  --device "$DEVICE_UDID" \
  "$BUNDLE_ID"

echo ""
echo "==> Done! App is running on device."
