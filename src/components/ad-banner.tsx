import Constants, { ExecutionEnvironment } from 'expo-constants';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, useThemeColors } from '../theme';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const PROD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-7062093966916455/2562292181',
  android: 'ca-app-pub-7062093966916455/2331668376',
}) as string;

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    TestIds = ads.TestIds;
  } catch {
    // module not linked in this binary — fall through to placeholder
  }
}

export function AdBanner() {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [failed, setFailed] = useState(false);

  if (!BannerAd || failed) {
    return (
      <View style={styles.wrap}>
        <View style={styles.placeholder}>
          <Text style={styles.label}>
            {isExpoGo ? 'AdMob requer development build' : 'Anúncio indisponível'}
          </Text>
        </View>
      </View>
    );
  }

  const unitId = __DEV__ ? TestIds.BANNER : PROD_UNIT_ID;

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

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingTop: 8,
    },
    placeholder: {
      width: 320,
      height: 50,
      borderRadius: 10,
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: c.muted,
      fontSize: 11,
      fontWeight: '700',
      textAlign: 'center',
      paddingHorizontal: 8,
    },
  });
}
