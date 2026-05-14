import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// TODO: criar um ad unit do tipo INTERSTITIAL no console do AdMob e colar o id aqui.
// O id atual (terminado em /2331668376) é de um banner — usar o mesmo viola a policy do AdMob.
const PROD_INTERSTITIAL_ID = Platform.select({
  ios: 'REPLACE_WITH_IOS_INTERSTITIAL_UNIT_ID',
  android: 'REPLACE_WITH_ANDROID_INTERSTITIAL_UNIT_ID',
}) as string;

let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;

if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    InterstitialAd = ads.InterstitialAd;
    AdEventType = ads.AdEventType;
    TestIds = ads.TestIds;
  } catch {
    // module not linked — interstitial will be a no-op
  }
}

type Options = {
  cooldownMs?: number;
};

export function useInterstitial({ cooldownMs = 60_000 }: Options = {}) {
  const adRef = useRef<any>(null);
  const lastShownRef = useRef<number>(0);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!InterstitialAd) return;

    const unitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL_ID;
    if (!unitId || unitId.startsWith('REPLACE_WITH_')) return;
    const ad = InterstitialAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      isLoadedRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      isLoadedRef.current = false;
      ad.load();
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      isLoadedRef.current = false;
    });

    adRef.current = ad;
    ad.load();

    return () => {
      unsubLoaded();
      unsubClosed();
      unsubError();
      adRef.current = null;
    };
  }, []);

  const show = useCallback(() => {
    if (!adRef.current || !isLoadedRef.current) return false;
    const now = Date.now();
    if (now - lastShownRef.current < cooldownMs) return false;
    lastShownRef.current = now;
    adRef.current.show();
    return true;
  }, [cooldownMs]);

  return { show };
}
