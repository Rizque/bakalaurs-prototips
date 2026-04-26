import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { contractFilesService } from "@/services/contract-files";
import { Asset } from "expo-asset";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDF_JS_MODULE = require("../../../../assets/pdfjs/pdf.js.txt");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDF_WORKER_MODULE = require("../../../../assets/pdfjs/pdf.worker.js.txt");
const buildHtml = (
  signedUrl: string,
  pdfJsUri: string,
  workerUri: string,
) => `<!DOCTYPE html>
<html lang="lv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4, user-scalable=yes">
<style>
  html, body { margin: 0; padding: 0; background: #2b2b2b; height: 100%; -webkit-user-select: none; user-select: none; }
  #status { color: #fff; font-family: -apple-system, system-ui, sans-serif; font-size: 14px; padding: 16px; text-align: center; }
  #pages { padding: 12px 0 24px; }
  canvas { display: block; margin: 8px auto; max-width: 96%; height: auto; box-shadow: 0 2px 12px rgba(0,0,0,0.4); background: #fff; }
</style>
</head>
<body>
<div id="status">Ielādē PDF...</div>
<div id="pages"></div>
<script src="${pdfJsUri}"></script>
<script>
(function() {
  var status = document.getElementById('status');
  function fail(msg) { status.textContent = msg; }

  if (typeof pdfjsLib === 'undefined') {
    fail('PDF skatītājs nav pieejams.');
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = ${JSON.stringify(workerUri)};

  pdfjsLib.getDocument({
    url: ${JSON.stringify(signedUrl)},
    disableAutoFetch: true,
    disableStream: true
  }).promise.then(function(pdf) {
    status.parentNode.removeChild(status);
    var container = document.getElementById('pages');
    var dpr = window.devicePixelRatio || 1;
    var width = window.innerWidth - 24;

    function renderPage(pageNum) {
      return pdf.getPage(pageNum).then(function(page) {
        var unscaled = page.getViewport({ scale: 1 });
        var scale = (width / unscaled.width);
        var viewport = page.getViewport({ scale: scale * dpr });
        var canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = (viewport.width / dpr) + 'px';
        canvas.style.height = (viewport.height / dpr) + 'px';
        container.appendChild(canvas);
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
      });
    }

    var chain = Promise.resolve();
    for (var p = 1; p <= pdf.numPages; p++) {
      (function(num){ chain = chain.then(function(){ return renderPage(num); }); })(p);
    }
    chain.catch(function() {
      var s = document.createElement('div');
      s.id = 'status';
      s.textContent = 'Renderēšanas kļūda.';
      document.body.appendChild(s);
    });

    document.addEventListener('contextmenu', function(e) { e.preventDefault(); });
  }).catch(function() {
    fail('Neizdevās atvērt PDF.');
  });
})();
</script>
</body>
</html>`;

export default function ViewFileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [pdfJsUri, setPdfJsUri] = useState<string | null>(null);
  const [workerUri, setWorkerUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    (async () => {
      try {
        const [pdfJsAsset, workerAsset, file] = await Promise.all([
          Asset.fromModule(PDF_JS_MODULE).downloadAsync(),
          Asset.fromModule(PDF_WORKER_MODULE).downloadAsync(),
          contractFilesService.getByContract(id),
        ]);

        if (cancelledRef.current) return;

        if (!file) {
          setError("Failu nav.");
          return;
        }

        const url = await contractFilesService.createSignedUrl(file, 60);

        if (cancelledRef.current) return;

        setSignedUrl(url);
        setPdfJsUri(pdfJsAsset.localUri || pdfJsAsset.uri);
        setWorkerUri(workerAsset.localUri || workerAsset.uri);
      } catch (e) {
        if (!cancelledRef.current) {
          setError(e instanceof Error ? e.message : "Neizdevās ielādēt failu.");
        }
      } finally {
        if (!cancelledRef.current) setLoading(false);
      }
    })();

    return () => {
      cancelledRef.current = true;
      setSignedUrl(null);
      setPdfJsUri(null);
      setWorkerUri(null);
    };
  }, [id]);

  const html = useMemo(() => {
    if (!signedUrl || !pdfJsUri || !workerUri) return null;
    return buildHtml(signedUrl, pdfJsUri, workerUri);
  }, [signedUrl, pdfJsUri, workerUri]);

  return (
    <ScreenContainer>
      <ScreenHeader showBack title="Līguma fails" />
      <Text style={styles.notice}>
        Fails tiek rādīts tieši lietotnē atmiņā un netiek glabāts ierīces failu
        sistēmā.
      </Text>
      <ErrorBanner message={error} />
      <View style={styles.viewer}>
        {loading || !html ? (
          <LoadingIndicator />
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html }}
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
            incognito
            javaScriptEnabled
            domStorageEnabled={false}
            allowFileAccess
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs={false}
            mixedContentMode="never"
            setSupportMultipleWindows={false}
            style={styles.webview}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notice: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  viewer: {
    flex: 1,
    backgroundColor: "#2b2b2b",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  webview: {
    flex: 1,
    backgroundColor: "#2b2b2b",
  },
});
