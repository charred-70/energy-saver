import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { Button, Platform, StyleSheet, TextInput } from "react-native";

type Msg =
  | { type: "number"; value: number }
  | { type: "error"; message: string };

export default function Tester() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [username2, setUsername2] = useState("");
  const [password2, setPassword2] = useState("");
  const latestValue = useRef("shiballlll");
  const [message, setMessage] = useState("shiballlll");

  useEffect(() => {
    var ws = new WebSocket("ws://localhost:8000/api");

    ws.onmessage = (event) => {
      const numberz = JSON.parse(event.data);
      latestValue.current = numberz.value;
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

  async function handleSubmit() {
    //add code to call backend api
    //feed in username and password
    //backend api should return whether or not the login was successful
    const response = await fetch("http://localhost:8000/attempt_login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    });
    const data = await response.json();

    if (data.success) {
      alert("Login successful!");
    } else {
      alert("Login failed: " + data.message);
    }
  }

  async function handleSignup() {
    //add code to call backend api
    //feed in username and password
    //backend api should return whether or not the signup was successful
    const response = await fetch("http://localhost:8000/attempt_signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username2, password: password2 }),
    });
    const data = await response.json();

    if (data.success) {
      alert("Sign up successful!");
    } else {
      alert("Sign up failed: " + data.message);
    }
  }

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
      <ThemedText type="subtitle">Login</ThemedText>

      <TextInput
        placeholder="username"
        onChangeText={(text) => setUsername(text)}
        value={username}
      />
      <TextInput
        placeholder="password"
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
      <Button title="Submit" onPress={handleSubmit} />
      <ThemedText type="subtitle">Sign Up</ThemedText>
      <TextInput
        placeholder="enter username here"
        onChangeText={(text) => setUsername2(text)}
        value={username2}
      />
      <TextInput
        placeholder="enter password here"
        onChangeText={(text) => setPassword2(text)}
        value={password2}
      />
      <Button title="Submit" onPress={handleSignup} />
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
