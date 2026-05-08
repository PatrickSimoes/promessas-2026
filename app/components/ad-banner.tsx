import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { COLORS } from '../theme';

const PROD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-7062093966916455/2331668376',
  android: 'ca-app-pub-7062093966916455/2331668376',
}) as string;

const unitId = __DEV__ ? TestIds.BANNER : PROD_UNIT_ID;

export function AdBanner() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={styles.wrap}>
        <View style={styles.placeholder}>
          <Text style={styles.label}>Anúncio indisponível</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 8,
  },
  placeholder: {
    width: 320,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
});
