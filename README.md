# Bakalaura darba prototips

Šis ir RTU DITEF bakalaura darba prototips tēmai *"React Native mobilo lietotņu drošības mehānismu izpēte"*. Prototips ir mobilā lietotne nekustamā īpašuma izīrētājiem, kurā tiek pārvaldīti īpašumi, īrnieki un to līgumi ar PDF failiem.

## Tehnoloģiju kopa

- React Native ar Expo + Expo Router (file-based routing)
- TypeScript (strict)
- Supabase (Auth + PostgreSQL + Storage)
- expo-secure-store (sesijas tokenu glabāšana ar chunking)
- expo-local-authentication (biometriskā autentifikācija)
- expo-document-picker, expo-file-system (PDF augšupielādei)
- react-native-webview + PDF.js (PDF apskate atmiņā, bez disku kešēšanas)
- jail-monkey (root/jailbreak pārbaude — strādā tikai EAS development build)
- @expo/vector-icons (Feather ikonas tab bar un UI)

UI — tikai React Native StyleSheet, bez ārējām UI bibliotēkām. Minimālistisks dizains: balts fons, melns teksts, zils akcents (#0066cc).

## Vides mainīgie

Izveido `.env` failu projekta saknē (skaties `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Atkarību uzstādīšana

```
npm install
npx expo install expo-document-picker expo-file-system react-native-webview
npm install jail-monkey
```

Pēc jaunu native pakotņu uzstādīšanas (`react-native-webview`, `jail-monkey`) jāveido jauns EAS development build:

```
eas build --profile development --platform android
```

## Palaišana

```
npm run android
# vai
npm run ios
```

## Drošības mehānismi

1. **Sesijas glabāšana** — pielāgots Supabase storage adapteris (`lib/secure-store-adapter.ts`), kas izmanto `expo-secure-store` un sadala lielas vērtības (>1800 simbolu) chunkos. Sesijas tokeni nekad netiek glabāti `AsyncStorage` vai parastā atmiņā.
2. **Biometrija** — `expo-local-authentication`. Pieprasa **tikai** līguma failu apskatei un dzēšanai (`hooks/useBiometricGate.ts`). Android — `biometricsSecurityLevel: 'strong'` (Class 3). Iestatījumu var ieslēgt/izslēgt jebkurā brīdī sadaļā **Iestatījumi**.
3. **PDF apskate atmiņā** — fails tiek lejupielādēts kā `ArrayBuffer` tieši lietotnes RAM, pārvērsts par base64 un parādīts iekšējā `WebView` ar PDF.js renderētāju. Tiek izmantoti drošības karodziņi: `cacheEnabled={false}`, `cacheMode="LOAD_NO_CACHE"`, `incognito`, `domStorageEnabled={false}`, `allowFileAccess={false}`, `mixedContentMode="never"`. Lietotne **nelejupielādē** un **nesaglabā** PDF failu uz ierīces failu sistēmas; pēc ekrāna aizvēršanas atmiņa tiek atbrīvota.
4. **Ierīces integritātes pārbaude** — `jail-monkey` palaiž root/jailbreak/external-storage pārbaudes lietotnes startā. Ja kompromitēšanas pazīmes atklātas, virs lietotnes parādās sarkans brīdinājuma banneris; lietotne netiek bloķēta (atbilstoši pētnieciskā prototipa vajadzībām).
5. **Tīkla komunikācija** — visa komunikācija ar Supabase notiek caur HTTPS (Supabase noklusējums). Sertifikāta piesaiste netiek piemērota.
6. **Datu minimizācija un kļūdu apstrāde** — UI kļūdu paziņojumi nesatur servera detaļas, atslēgas vai stack trace; `console.log` netiek izmantots paroļu, tokenu vai e-pastu žurnalēšanai.
7. **RLS** — visas Supabase tabulas un Storage bucket aizsargā Row Level Security politikas, kas ļauj lietotājam piekļūt tikai saviem datiem.

## Funkcionalitāte

- E-pasta + paroles reģistrācija, pieteikšanās, e-pasta apstiprināšana, paroles atiestatīšana
- Pirmreizēja biometrijas iespējošana (vēlāk maināms iestatījumos)
- Īpašumu, īrnieku un līgumu **CRUD** (izveide, apskate, rediģēšana, dzēšana)
- Līguma PDF faila augšupielāde — gan līguma izveides brīdī, gan vēlāk no līguma detaļu ekrāna; pēc dzēšanas var augšupielādēt jaunu
- PDF faila apskate iekšējā skatītājā un dzēšana ar biometrisko apstiprinājumu

## Mapju struktūra

```
app/                Ekrāni (Expo Router)
  (auth)/           Pieteikšanās, reģistrācija, paroles atiestatīšana, e-pasta apstiprinājums
  (app)/            Aizsargātā daļa
    (tabs)/         Īpašumi · Īrnieki · Līgumi · Iestatījumi
    property/[id]/  Detail un edit ekrāni
    tenant/[id]/    Detail un edit ekrāni
    contract/[id]/  Detail, edit un view-file (atmiņā renderēts PDF)
    biometric-setup.tsx
components/         UI komponentes (Button, TextInput, ScreenHeader, Field, PickerModal, Segmented, IntegrityBanner, ...)
contexts/           AuthContext (sesija + biometrijas iestatījums), DeviceIntegrityContext
hooks/              useBiometricGate
lib/                supabase, secure-store-adapter, format
services/           Supabase CRUD funkcijas
types/              database.ts ar visiem tipiem
```

## Pieņēmumi

- E-pasta apstiprināšana — Supabase noklusējuma plūsma; lietotne tikai informē par e-pasta nosūtīšanu (bez deep link atgriezeniskās saiknes).
- Paroles atiestatīšana — tāpat tikai e-pasta nosūtīšana.
- Vienam līgumam vienlaikus var būt viens pievienots PDF fails. Pēc dzēšanas var augšupielādēt jaunu.
- PDF.js bibliotēka tiek ielādēta no Cloudflare CDN (cdnjs). PDF saturs nekad netiek nosūtīts uz CDN — pārsūtīts tiek tikai pati renderētāja bibliotēka.
