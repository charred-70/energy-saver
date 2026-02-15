import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';


type DeviceName = keyof typeof DEVICE_ICONS;

interface Device {
    id: number;
    name: DeviceName;
    customName: string;
    watts: number;
    hoursPerDay: number;
    category: string;
    active: boolean;
}

interface PresetDevice {
    name: DeviceName;
    watts: number;
    category: string;
}

const { width } = Dimensions.get('window');

const DEVICE_ICONS: Record<string, string> = {
    Refrigerator: '🧊',
    Washer: '🫧',
    Dryer: '🌀',
    Dishwasher: '🍽️',
    'Air Conditioner': '❄️',
    Heater: '🔥',
    Television: '📺',
    Microwave: '📡',
    'Electric Oven': '🍳',
    'EV Charger': '🚗',
    'Water Heater': '💧',
    Lighting: '💡',
    Computer: '🖥️',
    Other: '⚡',
};

const PRESET_DEVICES: PresetDevice[] = [
    { name: 'Refrigerator', watts: 150, category: 'Kitchen' },
    { name: 'Washer', watts: 500, category: 'Laundry' },
    { name: 'Dryer', watts: 3000, category: 'Laundry' },
    { name: 'Dishwasher', watts: 1200, category: 'Kitchen' },
    { name: 'Air Conditioner', watts: 2000, category: 'Climate' },
    { name: 'Heater', watts: 1500, category: 'Climate' },
    { name: 'Television', watts: 120, category: 'Entertainment' },
    { name: 'Microwave', watts: 1100, category: 'Kitchen' },
    { name: 'Electric Oven', watts: 2400, category: 'Kitchen' },
    { name: 'EV Charger', watts: 7200, category: 'Charging' },
    { name: 'Water Heater', watts: 4000, category: 'Other' },
    { name: 'Lighting', watts: 60, category: 'Lighting' },
    { name: 'Computer', watts: 250, category: 'Entertainment' },
    { name: 'Other', watts: 100, category: 'Other' },
];

const RATE_PER_KWH = 0.13;


function PulseOrb({ color = '#22C55E', size = 7 }: { color?: string; size?: number }) {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scale, { toValue: 1.6, duration: 900, useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 0.2, duration: 900, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
                ]),
            ]),
        ).start();
    },);

    return (
        <Animated.View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                transform: [{ scale }],
                opacity,
            }}
        />
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string;
    sub: string;
    color: string;
}

function StatCard({ label, value, sub, color }: StatCardProps) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
                <View style={[styles.statDot, { backgroundColor: color }]} />
                <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statSub}>{sub}</Text>
        </View>
    );
}

// ─── DeviceCard ───────────────────────────────────────────────────────────────

interface DeviceCardProps {
    device: Device;
    onToggle: (id: number) => void;
    onRemove: (id: number) => void;
}

function DeviceCard({ device, onToggle, onRemove }: DeviceCardProps) {
    const kwh = (device.watts / 1000) * device.hoursPerDay;
    const monthlyCost = (kwh * 30 * RATE_PER_KWH).toFixed(2);
    const icon = DEVICE_ICONS[device.name] ?? '⚡';

    const pressAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () =>
        Animated.spring(pressAnim, { toValue: 0.97, useNativeDriver: true }).start();
    const handlePressOut = () =>
        Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();

    return (
        <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[styles.deviceCard, device.active && styles.deviceCardActive]}
            >
                {device.active && <View style={styles.deviceCardTopLine} />}

                {/* Icon */}
                <View style={[styles.deviceIconWrap, device.active && styles.deviceIconWrapActive]}>
                    <Text style={styles.deviceIcon}>{icon}</Text>
                </View>

                {/* Info */}
                <View style={styles.deviceInfo}>
                    <View style={styles.deviceNameRow}>
                        <Text style={styles.deviceName} numberOfLines={1}>
                            {device.customName || device.name}
                        </Text>
                        {device.active && <PulseOrb />}
                    </View>
                    <View style={styles.deviceMetaRow}>
                        <Text style={styles.deviceMeta}>
                            {device.watts}W · {device.hoursPerDay}h/day
                        </Text>
                        <Text style={[styles.deviceCost, device.active && styles.deviceCostActive]}>
                            ${monthlyCost}/mo
                        </Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.deviceControls}>
                    <Switch
                        value={device.active}
                        onValueChange={() => onToggle(device.id)}
                        trackColor={{ false: '#2a3a50', true: '#2563EB' }}
                        thumbColor='#FFFFFF'
                        ios_backgroundColor='#2a3a50'
                    />
                    <TouchableOpacity
                        onPress={() => onRemove(device.id)}
                        style={styles.removeBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── AddDeviceModal ───────────────────────────────────────────────────────────

interface AddDeviceModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (device: Device) => void;
}

function AddDeviceModal({ visible, onClose, onAdd }: AddDeviceModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [selected, setSelected] = useState<PresetDevice | null>(null);
    const [customName, setCustomName] = useState('');
    const [watts, setWatts] = useState('');
    const [hours, setHours] = useState(4);

    const slideAnim = useRef(new Animated.Value(500)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                damping: 20,
                stiffness: 200,
                useNativeDriver: true,
            }).start();
        } else {
            slideAnim.setValue(500);
            setStep(1);
            setSelected(null);
            setCustomName('');
            setWatts('');
            setHours(4);
        }
    }, [visible]);

    const handleSelectPreset = (preset: PresetDevice) => {
        setSelected(preset);
        setWatts(String(preset.watts));
        setStep(2);
    };

    const handleAdd = () => {
        if (!selected || !watts) return;
        onAdd({
            id: Date.now(),
            name: selected.name,
            customName: customName.trim() || selected.name,
            watts: parseInt(watts, 10),
            hoursPerDay: hours,
            category: selected.category,
            active: true,
        });
        onClose();
    };

    const monthlyCost = watts
        ? ((parseFloat(watts) / 1000) * hours * 30 * RATE_PER_KWH).toFixed(2)
        : '0.00';
    const dailyKwh = watts
        ? ((parseFloat(watts) / 1000) * hours).toFixed(2)
        : '0.00';

    const HOUR_STEPS = [0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24];

    return (
        <Modal
            visible={visible}
            transparent
            animationType='none'
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
                <Animated.View
                    style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}
                >
                    {/* Handle */}
                    <View style={styles.sheetHandle} />

                    {/* Header */}
                    <View style={styles.sheetHeader}>
                        <View>
                            <Text style={styles.sheetStep}>
                                {step === 1 ? 'STEP 1 OF 2' : 'STEP 2 OF 2'}
                            </Text>
                            <Text style={styles.sheetTitle}>
                                {step === 1 ? 'Choose Device' : 'Configure'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.sheetCloseBtn}>
                            <Text style={styles.sheetCloseBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Step 1: Choose */}
                    {step === 1 && (
                        <FlatList
                            data={PRESET_DEVICES}
                            keyExtractor={(item) => item.name}
                            numColumns={2}
                            columnWrapperStyle={styles.presetRow}
                            showsVerticalScrollIndicator={false}
                            style={styles.presetGrid}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.presetCard}
                                    onPress={() => handleSelectPreset(item)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.presetIcon}>
                                        {DEVICE_ICONS[item.name] ?? '⚡'}
                                    </Text>
                                    <Text style={styles.presetName}>{item.name}</Text>
                                    <Text style={styles.presetWatts}>~{item.watts}W</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    {/* Step 2: Configure */}
                    {step === 2 && selected && (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps='handled'
                        >
                            {/* Selected preview */}
                            <View style={styles.selectedPreview}>
                                <Text style={styles.selectedPreviewIcon}>
                                    {DEVICE_ICONS[selected.name] ?? '⚡'}
                                </Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.selectedPreviewName}>{selected.name}</Text>
                                    <Text style={styles.selectedPreviewCategory}>{selected.category}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setStep(1)}>
                                    <Text style={styles.changeBtn}>Change</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Nickname */}
                            <Text style={styles.inputLabel}>NICKNAME (OPTIONAL)</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={selected.name}
                                placeholderTextColor='#475569'
                                value={customName}
                                onChangeText={setCustomName}
                                returnKeyType='next'
                            />

                            {/* Wattage */}
                            <Text style={[styles.inputLabel, { marginTop: 14 }]}>WATTAGE</Text>
                            <View style={styles.wattsInputWrap}>
                                <TextInput
                                    style={[styles.textInput, { flex: 1 }]}
                                    keyboardType='numeric'
                                    placeholder='150'
                                    placeholderTextColor='#475569'
                                    value={watts}
                                    onChangeText={setWatts}
                                    returnKeyType='done'
                                />
                                <Text style={styles.wattsUnit}>W</Text>
                            </View>

                            {/* Hours picker */}
                            <View style={styles.hoursHeader}>
                                <Text style={styles.inputLabel}>DAILY USAGE</Text>
                                <Text style={styles.hoursValue}>
                                    {hours >= 1 ? `${hours}h` : `${hours * 60}min`} / day
                                </Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.hoursPicker}
                            >
                                {HOUR_STEPS.map((h) => (
                                    <TouchableOpacity
                                        key={h}
                                        onPress={() => setHours(h)}
                                        style={[styles.hourChip, hours === h && styles.hourChipActive]}
                                    >
                                        <Text style={[styles.hourChipText, hours === h && styles.hourChipTextActive]}>
                                            {h < 1 ? `${h * 60}m` : `${h}h`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Cost preview */}
                            {!!watts && (
                                <View style={styles.costPreview}>
                                    <View>
                                        <Text style={styles.costPreviewLabel}>MONTHLY COST</Text>
                                        <Text style={styles.costPreviewValue}>${monthlyCost}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.costPreviewLabel}>DAILY kWh</Text>
                                        <Text style={[styles.costPreviewValue, { color: '#94A3B8' }]}>
                                            {dailyKwh}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Add button */}
                            <TouchableOpacity
                                style={[styles.addBtn, (!watts || !hours) && styles.addBtnDisabled]}
                                onPress={handleAdd}
                                activeOpacity={0.85}
                                disabled={!watts || !hours}
                            >
                                <Text style={styles.addBtnText}>Add Device</Text>
                                <Text style={styles.addBtnArrow}>→</Text>
                            </TouchableOpacity>

                            <View style={{ height: 32 }} />
                        </ScrollView>
                    )}
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DevicesScreen() {
    const [devices, setDevices] = useState<Device[]>([
        { id: 1, name: 'Refrigerator', customName: 'Kitchen Fridge', watts: 150, hoursPerDay: 24, category: 'Kitchen', active: true },
        { id: 2, name: 'Air Conditioner', customName: 'Living Room AC', watts: 2000, hoursPerDay: 6, category: 'Climate', active: true },
        { id: 3, name: 'Washer', customName: 'Washer', watts: 500, hoursPerDay: 1, category: 'Laundry', active: false },
        { id: 4, name: 'Television', customName: 'Main TV', watts: 120, hoursPerDay: 5, category: 'Entertainment', active: true },
    ]);
    const [showModal, setShowModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    // Entrance animations
    const headerFade = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(24)).current;
    const statsFade = useRef(new Animated.Value(0)).current;
    const statsSlide = useRef(new Animated.Value(20)).current;
    const contentFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
                Animated.timing(headerSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
            Animated.parallel([
                Animated.timing(statsFade, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(statsSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
            Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const allCategories = ['All', ...Array.from(new Set(devices.map((d) => d.category)))];
    const filteredDevices = activeFilter === 'All'
        ? devices
        : devices.filter((d) => d.category === activeFilter);

    const activeDevices = devices.filter((d) => d.active);
    const totalWatts = activeDevices.reduce((s, d) => s + d.watts, 0);
    const totalMonthly = activeDevices.reduce(
        (s, d) => s + (d.watts / 1000) * d.hoursPerDay * 30 * RATE_PER_KWH,
        0,
    );
    const topDevice = [...devices].sort(
        (a, b) => (b.watts / 1000) * b.hoursPerDay - (a.watts / 1000) * a.hoursPerDay,
    )[0];

    const handleToggle = (id: number) =>
        setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));

    const handleRemove = (id: number) =>
        setDevices((prev) => prev.filter((d) => d.id !== id));

    const handleAdd = (device: Device) =>
        setDevices((prev) => [...prev, device]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle='light-content' backgroundColor='#0F172A' />

            {/* Background accent blobs */}
            <View style={styles.bgBlobTop} />
            <View style={styles.bgBlobBottom} />
            <View style={styles.bgStripe} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ── */}
                <Animated.View
                    style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}
                >
                    <Text style={styles.eyebrow}>SMART HOME ENERGY</Text>
                    <View style={styles.headerRow}>
                        <Text style={styles.headline}>{'My\nDevices'}</Text>
                        <View style={styles.headerKw}>
                            <Text style={styles.headerKwLabel}>ACTIVE NOW</Text>
                            <Text style={styles.headerKwValue}>
                                {(totalWatts / 1000).toFixed(1)} kW
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Stats ── */}
                <Animated.View
                    style={[
                        styles.statsRow,
                        { opacity: statsFade, transform: [{ translateY: statsSlide }] },
                    ]}
                >
                    <StatCard
                        label='Devices'
                        value={String(devices.length)}
                        sub={`${activeDevices.length} active`}
                        color='#3B82F6'
                    />
                    <StatCard
                        label='Monthly'
                        value={`$${totalMonthly.toFixed(0)}`}
                        sub='est. cost'
                        color='#F59E0B'
                    />
                    <StatCard
                        label='CO₂ Saved'
                        value={`${(activeDevices.length * 2.3).toFixed(0)}kg`}
                        sub='this month'
                        color='#22C55E'
                    />
                </Animated.View>

                {/* ── Filters ── */}
                <Animated.View style={{ opacity: contentFade }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterRow}
                    >
                        {allCategories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setActiveFilter(cat)}
                                style={[styles.filterChip, activeFilter === cat && styles.filterChipActive]}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        activeFilter === cat && styles.filterChipTextActive,
                                    ]}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* ── Device list ── */}
                    {filteredDevices.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📭</Text>
                            <Text style={styles.emptyTitle}>No devices yet</Text>
                            <Text style={styles.emptySubtitle}>Tap + to add your first device</Text>
                        </View>
                    ) : (
                        <View style={styles.deviceList}>
                            {filteredDevices.map((device) => (
                                <DeviceCard
                                    key={device.id}
                                    device={device}
                                    onToggle={handleToggle}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </View>
                    )}

                    {/* ── Energy tip ── */}
                    {topDevice && (
                        <View style={styles.energyTip}>
                            <Text style={styles.energyTipIcon}>💡</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.energyTipTitle}>Energy Tip</Text>
                                <Text style={styles.energyTipBody}>
                                    Your <Text style={{ color: '#FCD34D' }}>{topDevice.customName}</Text> uses
                                    the most energy. Try reducing its daily hours.
                                </Text>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {/* ── FAB ── */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowModal(true)}
                activeOpacity={0.85}
            >
                <Text style={styles.fabPlus}>+</Text>
                <Text style={styles.fabText}>Add Device</Text>
            </TouchableOpacity>

            {/* ── Modal ── */}
            <AddDeviceModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onAdd={handleAdd}
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 120,
    },

    // Background
    bgBlobTop: {
        position: 'absolute',
        top: -80,
        left: -60,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#1E3A5F',
        opacity: 0.85,
    },
    bgBlobBottom: {
        position: 'absolute',
        bottom: -100,
        right: -80,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#064E3B',
        opacity: 0.75,
    },
    bgStripe: {
        position: 'absolute',
        top: '40%',
        left: -width * 0.2,
        right: -width * 0.2,
        height: 1,
        backgroundColor: 'rgba(59,130,246,0.15)',
        transform: [{ rotate: '-6deg' }],
    },

    // Header
    eyebrow: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 3,
        color: '#3B82F6',
        marginBottom: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    headline: {
        fontSize: 38,
        fontWeight: '800',
        color: '#F1F5F9',
        lineHeight: 42,
        letterSpacing: -1,
    },
    headerKw: {
        alignItems: 'flex-end',
    },
    headerKwLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    headerKwValue: {
        fontSize: 26,
        fontWeight: '800',
        color: '#60A5FA',
        fontVariant: ['tabular-nums'],
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#16202f',
        borderWidth: 1,
        borderColor: '#263348',
        borderRadius: 14,
        padding: 12,
    },
    statCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    statDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statLabel: {
        fontSize: 9,
        color: '#64748B',
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    statValue: {
        fontSize: 19,
        fontWeight: '800',
        color: '#F1F5F9',
        fontVariant: ['tabular-nums'],
        marginBottom: 2,
    },
    statSub: {
        fontSize: 11,
        color: '#475569',
    },

    // Filters
    filterRow: {
        gap: 8,
        paddingVertical: 4,
        marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#263348',
        backgroundColor: '#16202f',
    },
    filterChipActive: {
        borderColor: '#4a80d4',
        backgroundColor: '#1e3a6e',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    filterChipTextActive: {
        color: '#93C5FD',
    },

    // Device list
    deviceList: {
        gap: 10,
    },
    deviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a2235',
        borderWidth: 1,
        borderColor: '#263348',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        overflow: 'hidden',
    },
    deviceCardActive: {
        backgroundColor: '#1e3a6e',
        borderColor: 'rgba(96,165,250,0.55)',
    },
    deviceCardTopLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(96,165,250,0.4)',
    },
    deviceIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1e2a3a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deviceIconWrapActive: {
        backgroundColor: '#1e3fa3',
    },
    deviceIcon: {
        fontSize: 22,
    },
    deviceInfo: {
        flex: 1,
        minWidth: 0,
    },
    deviceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 3,
    },
    deviceName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#F1F5F9',
        flexShrink: 1,
    },
    deviceMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deviceMeta: {
        fontSize: 12,
        color: '#64748B',
    },
    deviceCost: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        fontVariant: ['tabular-nums'],
    },
    deviceCostActive: {
        color: '#60A5FA',
    },
    deviceControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    removeBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#2d1515',
        borderWidth: 1,
        borderColor: '#5a2020',
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeBtnText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '700',
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyIcon: {
        fontSize: 36,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#334155',
    },

    // Energy tip
    energyTip: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        backgroundColor: '#1f1800',
        borderWidth: 1,
        borderColor: '#3d2e00',
        borderRadius: 14,
        padding: 14,
        marginTop: 20,
    },
    energyTipIcon: {
        fontSize: 18,
        marginTop: 1,
    },
    energyTipTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FCD34D',
        marginBottom: 3,
    },
    energyTipBody: {
        fontSize: 12,
        color: '#D97706',
        lineHeight: 18,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 36,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#2563EB',
        borderRadius: 30,
        paddingHorizontal: 26,
        paddingVertical: 16,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    fabPlus: {
        fontSize: 22,
        color: '#FFFFFF',
        lineHeight: 24,
        fontWeight: '300',
    },
    fabText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#1e2d4a',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: '#2a3a55',
        borderBottomWidth: 0,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '90%',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#3a4a62',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    sheetStep: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2.5,
        color: '#3B82F6',
        marginBottom: 4,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#F1F5F9',
        letterSpacing: -0.5,
    },
    sheetCloseBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#1e2d4a',
        borderWidth: 1,
        borderColor: '#334466',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetCloseBtnText: {
        fontSize: 14,
        color: '#94A3B8',
    },

    // Preset grid
    presetGrid: {
        maxHeight: 380,
    },
    presetRow: {
        gap: 10,
        marginBottom: 10,
    },
    presetCard: {
        flex: 1,
        backgroundColor: '#182535',
        borderWidth: 1,
        borderColor: '#263348',
        borderRadius: 14,
        padding: 14,
        gap: 6,
    },
    presetIcon: {
        fontSize: 26,
    },
    presetName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#E2E8F0',
    },
    presetWatts: {
        fontSize: 11,
        color: '#64748B',
        fontVariant: ['tabular-nums'],
    },

    // Step 2
    selectedPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#1a3270',
        borderWidth: 1,
        borderColor: '#3060b0',
        borderRadius: 14,
        padding: 14,
        marginBottom: 18,
    },
    selectedPreviewIcon: {
        fontSize: 28,
    },
    selectedPreviewName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#F1F5F9',
        marginBottom: 2,
    },
    selectedPreviewCategory: {
        fontSize: 12,
        color: '#60A5FA',
    },
    changeBtn: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: '#94A3B8',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#152030',
        borderWidth: 1,
        borderColor: '#263348',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#F1F5F9',
    },
    wattsInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    wattsUnit: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
        width: 16,
    },
    hoursHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 8,
    },
    hoursValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#60A5FA',
        fontVariant: ['tabular-nums'],
    },
    hoursPicker: {
        gap: 8,
        paddingVertical: 4,
        marginBottom: 16,
    },
    hourChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#182535',
        borderWidth: 1,
        borderColor: '#263348',
    },
    hourChipActive: {
        backgroundColor: '#1e3a6e',
        borderColor: '#4a80d4',
    },
    hourChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    hourChipTextActive: {
        color: '#93C5FD',
    },
    costPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#0d2b1f',
        borderWidth: 1,
        borderColor: '#155235',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    costPreviewLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#6EE7B7',
        marginBottom: 4,
    },
    costPreviewValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#10B981',
        fontVariant: ['tabular-nums'],
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2563EB',
        borderRadius: 14,
        height: 54,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
    },
    addBtnDisabled: {
        backgroundColor: '#1e2a3a',
        shadowOpacity: 0,
        elevation: 0,
    },
    addBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
    addBtnArrow: {
        fontSize: 18,
        color: '#FFFFFF',
    },
});