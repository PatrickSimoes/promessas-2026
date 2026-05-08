import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const PROD_INTERSTITIAL_ID = Platform.select({
  ios: 'ca-app-pub-7062093966916455/2331668376',
  android: 'ca-app-pub-7062093966916455/2331668376',
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
