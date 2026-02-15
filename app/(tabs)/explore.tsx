import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { IconSymbolName } from '@/components/ui/icon-symbol';

type Msg =
  | { type: "number"; value: number }
  | { type: "error"; message: string };

const { width } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

type MetricCardProps = {
  icon: IconSymbolName;
  label: string;
  value: number | string;
  unit: string;
  color: string;
  bgColor: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_DATA_POINTS = 24;



export default function EnergyDashboard() {
  const latestValue = useRef("shiballlll");
  const [timeRange, setTimeRange] = useState('24h');
  const [hourlyData, setHourlyData] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<Date[]>([]);
  const [currentUsage, setCurrentUsage] = useState(0);

  // Keep a ref to the WebSocket so we can close it in cleanup.
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/api');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event: WebSocketMessageEvent) => {
      try {
        const parsed = JSON.parse(event.data as string);

        // Expecting the server to send: { "value": 2.7 }
        // Adjust the key name below if your server uses a different field.
        const incoming: number = parseFloat(parsed.value);

        const now = new Date();

        if (isNaN(incoming)) return;

        // Update the "live" metric card immediately
        setCurrentUsage(incoming);

        // Append to the chart and keep the window to MAX_DATA_POINTS
        setHourlyData(prev => {
          const next = [...prev, incoming];
          return next.length > MAX_DATA_POINTS
            ? next.slice(next.length - MAX_DATA_POINTS)
            : next;
        });
        setTimestamps(prev => {
          const next = [...prev, now];
          return next.length > MAX_DATA_POINTS
            ? next.slice(next.length - MAX_DATA_POINTS)
            : next;
        });
      } catch (e) {
        console.warn('Failed to parse WebSocket message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed — reconnecting in 3s...');
      setTimeout(() => {
        if (wsRef.current === ws) {
          // Only reconnect if this is still the active socket
          wsRef.current = null;
        }
      }, 3000);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []); // run once on mount

  // ── Derived stats (update automatically when hourlyData changes) ─────────
  const todayConsumption = hourlyData.reduce((sum, v) => sum + v, 0);
  const monthlyCost = +(todayConsumption * 30 * 0.9).toFixed(1);
  const co2Saved = +(todayConsumption * 0.233).toFixed(1); // kg CO₂ per kWh (US avg)
  const maxValue = Math.max(...hourlyData, 0.1); // avoid division by zero

  const timeLabels: string[] = (() => {
    if (timestamps.length === 0) return ['--', '--', '--', '--', '--'];
    const fmt = (d: Date) =>
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const len = timestamps.length;
    return [
      fmt(timestamps[0]),                                        // oldest
      fmt(timestamps[Math.floor(len * 0.25)]),                  // 25%
      fmt(timestamps[Math.floor(len * 0.5)]),                   // midpoint
      fmt(timestamps[Math.floor(len * 0.75)]),                  // 75%
      'Now',                                                     // always "Now" for latest
    ];
  })();

  // ── Static data ───────────────────────────────────────────────────────────
  const breakdown = [
    { name: 'Heating/Cooling', value: 45, color: '#ef4444' },
    { name: 'Appliances', value: 25, color: '#f59e0b' },
    { name: 'Lighting', value: 15, color: '#10b981' },
    { name: 'Electronics', value: 15, color: '#3b82f6' },
  ];

  const recentActivity = [
    { device: 'Air Conditioner', status: 'on', time: '2:34 PM', power: '2.1 kW' },
    { device: 'Dishwasher', status: 'off', time: '1:15 PM', power: '0 kW' },
    { device: 'Water Heater', status: 'on', time: '12:45 PM', power: '1.8 kW' },
    { device: 'Washing Machine', status: 'off', time: '11:20 AM', power: '0 kW' },
  ];

  // ── Sub-components ────────────────────────────────────────────────────────
  const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, unit, color, bgColor }) => (
    <ThemedView style={[styles.metricCard, { backgroundColor: '#ffffff' }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <IconSymbol name={icon} size={20} color={color} />
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
    </ThemedView>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#2563eb', dark: '#1e40af' }}
      headerImage={
        <ThemedView style={styles.headerContent}>
          <ThemedView>
            <ThemedText style={styles.headerTitle}>Energy Dashboard</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Saturday, Feb 14, 2026</ThemedText>
          </ThemedView>
          <IconSymbol name="bolt.fill" size={40} color="#ffffff" />
        </ThemedView>
      }>

      {/* Metric Cards */}
      <ThemedView style={styles.section}>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="bolt.fill"
            label="Current"
            value={currentUsage.toFixed(1)}
            unit="kW"
            color="#dc2626"
            bgColor="#fee2e2"
          />
          <MetricCard
            icon="battery.100"
            label="Today"
            value={todayConsumption.toFixed(1)}
            unit="kWh"
            color="#2563eb"
            bgColor="#dbeafe"
          />
          <MetricCard
            icon="dollarsign.circle"
            label="Monthly"
            value={`$${monthlyCost}`}
            unit="this month"
            color="#ca8a04"
            bgColor="#fef3c7"
          />
          <MetricCard
            icon="leaf.fill"
            label="CO₂ Saved"
            value={co2Saved}
            unit="kg today"
            color="#16a34a"
            bgColor="#dcfce7"
          />
        </View>
      </ThemedView>

      {/* Usage Chart */}
      <ThemedView style={styles.card}>
        <View style={styles.cardHeader}>
          <ThemedText type="subtitle">Usage Today</ThemedText>
          <View style={styles.timeRangeButtons}>
            <TouchableOpacity
              style={[styles.timeButton, timeRange === '24h' && styles.timeButtonActive]}
              onPress={() => setTimeRange('24h')}>
              <Text style={[styles.timeButtonText, timeRange === '24h' && styles.timeButtonTextActive]}>
                24h
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timeButton, timeRange === '7d' && styles.timeButtonActive]}
              onPress={() => setTimeRange('7d')}>
              <Text style={[styles.timeButtonText, timeRange === '7d' && styles.timeButtonTextActive]}>
                7d
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bar Chart — re-renders on every new WS message */}
        {(() => {
          const CHART_HEIGHT = 160;
          const barCount = hourlyData.length;
          const barWidth = barCount > 0 ? (width - 120) / MAX_DATA_POINTS : 0;
          return (
            <View style={styles.chartContainer}>
              {hourlyData.length === 0 ? (
                <View style={styles.chartEmpty}>
                  <Text style={styles.chartEmptyText}>Waiting for data...</Text>
                </View>
              ) : (
                hourlyData.map((value, index) => {
                  const isLatest = index === hourlyData.length - 1;
                  const barHeight = Math.max(4, (value / maxValue) * CHART_HEIGHT);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          width: barWidth,
                        },
                        isLatest && styles.barLatest,
                      ]}
                    />
                  );
                })
              )}
            </View>
          );
        })()}

        <View style={styles.chartLabels}>
          {timeLabels.map((label, i) => (
            <Text key={i} style={[styles.chartLabel, label === 'Now' && styles.chartLabelNow]}>
              {label}
            </Text>
          ))}
        </View>
      </ThemedView>

      {/* Energy Breakdown */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          Energy Breakdown
        </ThemedText>
        <View style={styles.breakdownContainer}>
          {breakdown.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <ThemedText style={styles.breakdownLabel}>{item.name}</ThemedText>
                <ThemedText type="defaultSemiBold">{item.value}%</ThemedText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${item.value}%`, backgroundColor: item.color }]}
                />
              </View>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Recent Activity */}
      <ThemedView style={styles.card}>
        <View style={styles.activityHeader}>
          <IconSymbol name="chart.line.downtrend.xyaxis" size={20} color="#374151" />
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Recent Activity
          </ThemedText>
        </View>
        <View style={styles.activityList}>
          {recentActivity.map((item, index) => (
            <View
              key={index}
              style={[
                styles.activityItem,
                index !== recentActivity.length - 1 && styles.activityItemBorder,
              ]}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityIcon, item.status === 'on' ? styles.activityIconOn : styles.activityIconOff]}>
                  <IconSymbol
                    name="power"
                    size={16}
                    color={item.status === 'on' ? '#16a34a' : '#9ca3af'}
                  />
                </View>
                <View>
                  <ThemedText type="defaultSemiBold" style={styles.activityDevice}>
                    {item.device}
                  </ThemedText>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.activityStatus, item.status === 'on' ? styles.activityStatusOn : styles.activityStatusOff]}>
                  {item.status.toUpperCase()}
                </Text>
                <Text style={styles.activityPower}>{item.power}</Text>
              </View>
            </View>
          ))}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerContent: {
    position: 'absolute',
    top: 50,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  section: {
    marginTop: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 12,
    color: '#9ca3af',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 0,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  timeButtonActive: {
    backgroundColor: '#2563eb',
  },
  timeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  timeButtonTextActive: {
    color: '#ffffff',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    height: 160,
    marginBottom: 12,
  },
  bar: {
    width: (width - 120) / MAX_DATA_POINTS,
    backgroundColor: '#2563eb',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  // The newest bar is highlighted in a brighter colour so live updates are obvious
  barLatest: {
    backgroundColor: '#60a5fa',
  },
  chartEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartEmptyText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chartLabelNow: {
    color: '#2563eb',
    fontWeight: '600',
  },
  breakdownContainer: {
    marginTop: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  activityList: {
    marginTop: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    padding: 8,
    borderRadius: 20,
  },
  activityIconOn: {
    backgroundColor: '#dcfce7',
  },
  activityIconOff: {
    backgroundColor: '#f3f4f6',
  },
  activityDevice: {
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityStatusOn: {
    color: '#16a34a',
  },
  activityStatusOff: {
    color: '#9ca3af',
  },
  activityPower: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});