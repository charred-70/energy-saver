import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";

type Msg =
  | { type: "number"; value: number }
  | { type: "error"; message: string };

export default function Tester() {
  const latestValue = useRef("shiballlll");
  const [message, setMessage] = useState("shiballlll");

  useEffect(() => {
    var ws = new WebSocket("ws://localhost:8000/api");

    ws.onmessage = (event) => {
      const numberz = JSON.parse(event.data);
      latestValue.current = numberz.value;
      console.log(typeof latestValue.current);

      console.log("Received message:", latestValue.current);
    };

    const interval = setInterval(() => {
      setMessage(latestValue.current);
    }, 1000);
    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Tester</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
        <ThemedText id="shibal">{message}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}></ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});