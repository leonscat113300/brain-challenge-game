#!/bin/bash
# Build the Brain Challenge APK variants (fa / en)
# Usage: ./build-apk.sh fa|en
set -e

VARIANT="${1:-fa}"
export JAVA_HOME=/tmp/android-sdk/jdk-21.0.13.1+2
export PATH=$JAVA_HOME/bin:$PATH
BT=/tmp/android-sdk/android-14
PLATFORM=/tmp/android-sdk/android-34/android.jar
R8=/tmp/android-sdk/r8-new.jar
BUILD=/home/z/apk-build
WORK=$BUILD/work-$VARIANT

if [ "$VARIANT" = "fa" ]; then
  PKG="com.leon.brainchallenge"
  APPNAME="مغزتو به چالش بکش!"
  OUT="$BUILD/مغزتو به چالش بکش - Brain Challenge v1.1 (FA).apk"
else
  PKG="com.leon.brainchallenge.en"
  APPNAME="Brain Challenge!"
  OUT="$BUILD/Brain Challenge v1.1 (EN).apk"
fi

rm -rf "$WORK" && mkdir -p "$WORK/gen" "$WORK/classes" "$WORK/dex" "$WORK/res/values"

echo "== [$VARIANT] manifest + strings =="
sed "s|package=\"com.leon.brainchallenge\"|package=\"$PKG\"|" "$BUILD/AndroidManifest.xml" > "$WORK/AndroidManifest.xml"
cat > "$WORK/res/values/strings.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">$APPNAME</string>
</resources>
EOF

echo "== [$VARIANT] aapt2 compile + link =="
rm -rf "$WORK/res"
cp -r "$BUILD/res" "$WORK/res"
cat > "$WORK/res/values/strings.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">$APPNAME</string>
</resources>
EOF
$BT/aapt2 compile --dir "$WORK/res" -o "$WORK/res.flata"
$BT/aapt2 link -o "$WORK/base.apk" -I $PLATFORM --manifest "$WORK/AndroidManifest.xml" \
  -A "$BUILD/assets-$VARIANT" \
  --min-sdk-version 24 --target-sdk-version 34 --version-code 2 --version-name 1.1 \
  --auto-add-overlay "$WORK/res.flata"

echo "== [$VARIANT] javac + d8 =="
javac --release 11 -classpath $PLATFORM -d "$WORK/classes" "$BUILD/src/com/leon/brainchallenge/MainActivity.java"
java -cp $R8 com.android.tools.r8.D8 --release --lib $PLATFORM \
  --output "$WORK/dex" "$WORK"/classes/com/leon/brainchallenge/*.class

echo "== [$VARIANT] package + align + sign =="
cp "$WORK/base.apk" "$WORK/unsigned.apk"
(cd "$WORK/dex" && zip -q -j ../unsigned.apk classes.dex)
$BT/zipalign -f 4 "$WORK/unsigned.apk" "$WORK/aligned.apk"
if [ ! -f "$BUILD/build/release.keystore" ]; then
  keytool -genkeypair -keystore "$BUILD/build/release.keystore" -storepass brainchallenge2024 -keypass brainchallenge2024 \
    -alias brainchallenge -keyalg RSA -keysize 2048 -validity 10950 \
    -dname "CN=Brain Challenge, OU=Games, O=Leon, C=IR"
fi
$BT/apksigner sign --ks "$BUILD/build/release.keystore" --ks-pass pass:brainchallenge2024 --key-pass pass:brainchallenge2024 --out "$OUT" "$WORK/aligned.apk"
$BT/apksigner verify "$OUT" && echo "== [$VARIANT] SIGNED & VERIFIED: $OUT"
