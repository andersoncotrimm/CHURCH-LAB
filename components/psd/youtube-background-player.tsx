"use client";

import * as React from "react";

// A API do YouTube não tem tipos oficiais aqui (carregada via <script>
// externo, não é um pacote instalado) — `any` é proposital.
declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: Record<string, unknown>
      ) => {
        destroy: () => void;
        getIframe: () => HTMLIFrameElement;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** O player da API substitui a div pelo iframe com width/height fixos por padrão — força ele a preencher o container via CSS, sem cortar o vídeo. */
function fillContainer(iframe: HTMLIFrameElement) {
  iframe.style.position = "absolute";
  iframe.style.inset = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
}

let apiLoadPromise: Promise<void> | null = null;

function loadYoutubeIframeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });

  return apiLoadPromise;
}

/**
 * Vídeo do YouTube "mascarado" — sem controles, sem marca do YouTube,
 * sem permitir pausar/avançar/clicar pra abrir no YouTube — pra parecer
 * um player nativo da plataforma. Começa em 5% da duração do vídeo (em
 * vez do início) e fica em loop, mudo (autoplay no navegador exige mudo).
 */
export function YoutubeBackgroundPlayer({ videoId }: { videoId: string }) {
  const reactId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerId = `yt-player-${reactId}`;

  React.useEffect(() => {
    let cancelled = false;
    let player: { destroy: () => void; getIframe: () => HTMLIFrameElement } | null = null;

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !window.YT) return;

      player = new window.YT.Player(containerId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: videoId,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: {
            target: {
              getDuration: () => number;
              seekTo: (s: number, allow: boolean) => void;
              playVideo: () => void;
              getIframe: () => HTMLIFrameElement;
            };
          }) => {
            fillContainer(event.target.getIframe());
            const duration = event.target.getDuration();
            if (duration > 0) event.target.seekTo(duration * 0.05, true);
            event.target.playVideo();
          },
        },
      });
      fillContainer(player.getIframe());
    });

    return () => {
      cancelled = true;
      player?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, containerId]);

  return (
    // Sem crop: o player preenche exatamente o container, então o
    // YouTube encaixa o vídeo inteiro sozinho (tarja preta nas bordas se
    // a proporção não bater), em vez de cortar as laterais/topo do vídeo.
    <div className="pointer-events-none absolute inset-0 bg-black">
      <div id={containerId} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
