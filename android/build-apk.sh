#!/bin/bash
# Build the Brain Challenge APK (WebView wrapper around the static Next.js export)
set -e

export JAVA_HOME=/tmp/android-sdk/jdk-21.0.13.1+2
export PATH=$JAVA_HOME/bin:$PATH
BT=/tmp/android-sdk/android-14
PLATFORM=/tmp/android-sdk/android-34/android.jar
R8=/tmp/android-sdk/r8-new.jar
OUT="/home/z/apk-build/مغزتو به چالش بکش - Brain Challenge v1.0.apk"

cd /home/z/apk-build
rm -rf build && mkdir -p build/classes build/dex

echo "[1/6] aapt2 compile resources"
$BT/aapt2 compile --dir res -o build/res.flata

echo "[2/6] aapt2 link (manifest + assets)"
$BT/aapt2 link -o build/base.apk -I $PLATFORM --manifest AndroidManifest.xml -A assets \
  --min-sdk-version 24 --target-sdk-version 34 --version-code 1 --version-name 1.0 \
  --auto-add-overlay build/res.flata

echo "[3/6] javac"
javac --release 11 -classpath $PLATFORM -d build/classes src/com/leon/brainchallenge/MainActivity.java

echo "[4/6] d8 dex"
java -cp $R8 com.android.tools.r8.D8 --release --lib $PLATFORM \
  --output build/dex build/classes/com/leon/brainchallenge/*.class

echo "[5/6] package + zipalign"
cp build/base.apk build/unsigned.apk
(cd build/dex && zip -q -j ../unsigned.apk classes.dex)
$BT/zipalign -f 4 build/unsigned.apk build/aligned.apk

echo "[6/6] sign"
if [ ! -f build/release.keystore ]; then
  keytool -genkeypair -keystore build/release.keystore -storepass brainchallenge2024 -keypass brainchallenge2024 \
    -alias brainchallenge -keyalg RSA -keysize 2048 -validity 10950 \
    -dname "CN=Brain Challenge, OU=Games, O=Leon, C=IR"
fi
$BT/apksigner sign --ks build/release.keystore --ks-pass pass:brainchallenge2024 --key-pass pass:brainchallenge2024 --out "$OUT" build/aligned.apk
$BT/apksigner verify "$OUT" && echo "APK SIGNED & VERIFIED: $OUT"
