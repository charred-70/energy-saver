
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

function PulseRing({
  delay,
  size,
  opacity,
}: {
  delay: number;
  size: number;
  opacity: number;
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const alpha = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.15,
            duration: 2400,
            useNativeDriver: true,
          }),
          Animated.timing(alpha, {
            toValue: 0,
            duration: 2400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(alpha, {
            toValue: opacity,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: 'rgba(96, 165, 250, 0.5)',
        transform: [{ scale }],
        opacity: alpha,
      }}
    />
  );
}

// Small floating stat badge
function FloatingBadge({
  value,
  label,
  color,
  style,
  fadeAnim,
}: {
  value: string;
  label: string;
  color: string;
  style: object;
  fadeAnim: Animated.Value;
}) {
  return (
    <Animated.View style={[styles.badge, style, { opacity: fadeAnim }]}>
      <ThemedView style={[styles.badgeDot, { backgroundColor: color }]} />
      <ThemedView>
        <ThemedText style={styles.badgeValue}>{value}</ThemedText>
        <ThemedText style={styles.badgeLabel}>{label}</ThemedText>
      </ThemedView>
    </Animated.View>
  );
}


export default function HomeScreen() {
  const router = useRouter();

  // Staggered entrance animations
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;
  const badge1Fade = useRef(new Animated.Value(0)).current;
  const badge2Fade = useRef(new Animated.Value(0)).current;
  const badge3Fade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.stagger(120, [
        Animated.timing(badge1Fade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(badge2Fade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(badge3Fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btnSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient layers */}
      <ThemedView style={styles.bgTop} />
      <ThemedView style={styles.bgBottom} />

      {/* Diagonal accent stripe */}
      <ThemedView style={styles.diagonalStripe} />

      {/* Hero orb section */}
      <Animated.View
        style={[
          styles.heroSection,
          { opacity: heroFade, transform: [{ translateY: heroSlide }] },
        ]}
      >
        {/* Pulse rings */}
        <PulseRing delay={0} size={220} opacity={0.5} />
        <PulseRing delay={800} size={280} opacity={0.3} />
        <PulseRing delay={1600} size={340} opacity={0.15} />

        {/* Center bolt circle */}
        <ThemedView style={styles.orbOuter}>
          <ThemedView style={styles.orbInner}>
            <ThemedText style={styles.orbIcon}>⚡</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Floating stat badges */}
        <FloatingBadge
          value="2.4 kW"
          label="Live Usage"
          color="#3B82F6"
          style={styles.badgeTopRight}
          fadeAnim={badge1Fade}
        />
        <FloatingBadge
          value="$127"
          label="This Month"
          color="#F59E0B"
          style={styles.badgeLeft}
          fadeAnim={badge2Fade}
        />
        <FloatingBadge
          value="12 kg"
          label="CO₂ Saved"
          color="#22C55E"
          style={styles.badgeBottomRight}
          fadeAnim={badge3Fade}
        />
      </Animated.View>

      {/* Text content */}
      <Animated.View
        style={[
          styles.textSection,
          {
            opacity: contentFade,
            transform: [{ translateY: contentSlide }],
          },
        ]}
      >
        <ThemedText style={styles.eyebrow}>SMART HOME ENERGY</ThemedText>
        <ThemedText style={styles.headline}>Know Every{'\n'}Watt You Use</ThemedText>
        <ThemedText style={styles.subtext}>
          Real-time monitoring, cost insights, and carbon tracking — all in one place.
        </ThemedText>
      </Animated.View>

      {/* CTA buttons */}
      <Animated.View
        style={[
          styles.btnSection,
          {
            opacity: btnFade,
            transform: [{ translateY: btnSlide }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => router.replace('/(tabs)')}
        >
          <ThemedText style={styles.primaryBtnText}>Get Started</ThemedText>
          <ThemedText style={styles.primaryBtnArrow}>→</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
          <ThemedText style={styles.secondaryBtnText}>Learn more</ThemedText>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom indicator dots */}
      <Animated.View style={[styles.dots, { opacity: btnFade }]}>
        <ThemedView style={[styles.dot, styles.dotActive]} />
        <ThemedView style={styles.dot} />
        <ThemedView style={styles.dot} />
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    position: 'absolute',
  },
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },

  // Background layers
  bgTop: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#1E3A5F',
    opacity: 0.7,
  },
  bgBottom: {
    position: 'absolute',
    bottom: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#064E3B',
    opacity: 0.5,
  },
  diagonalStripe: {
    position: 'absolute',
    top: height * 0.38,
    left: -width * 0.3,
    width: width * 1.6,
    height: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    transform: [{ rotate: '-12deg' }],
  },

  // Hero orb
  heroSection: {
    width: 340,
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  orbOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  orbInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  orbIcon: {
    fontSize: 40,
  },

  // Floating badges
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  badgeLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  badgeTopRight: {
    top: 32,
    right: 0,
  },
  badgeLeft: {
    left: 0,
    top: '50%',
  },
  badgeBottomRight: {
    bottom: 48,
    right: 8,
  },

  // Text content
  textSection: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#3B82F6',
    marginBottom: 10,
  },
  headline: {
    fontSize: 40,
    fontWeight: '800',
    color: '#F1F5F9',
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 14,
  },
  subtext: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
    maxWidth: 300,
  },

  // Buttons
  btnSection: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  primaryBtnArrow: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  // Dots
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: -8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#3B82F6',
  },
});
