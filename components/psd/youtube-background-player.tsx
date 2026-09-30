"use client";

import * as React from "react";
import Image from "next/image";

// A API do YouTube não tem tipos oficiais aqui (carregada via <script>
// externo, não é um pacote instalado) — `any` é proposital.
declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: Record<string, unknown>
      ) => YtPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        UNSTARTED: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YtPlayer {
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
  getDuration: () => number;
  seekTo: (s: number, allow: boolean) => void;
  playVideo: () => void;
}

/** O player da API substitui a div pelo iframe com width/height fixos por padrão — força ele a preencher o container via CSS, sem cortar o vídeo. */
function fillContainer(iframe: HTMLIFrameElement) {
  iframe.style.position = "absolute";
  iframe.style.inset = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.style.pointerEvents = "none";
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
 *
 * O YouTube mostra um cartão próprio (título, canal, sugestões, logo)
 * sempre que o vídeo não está tocando — controls=0 só esconde a barra de
 * controles, não esse cartão. Como não dá pra estilizar por dentro do
 * iframe (cross-origin), a defesa é: nunca deixar ele parar (relança
 * playVideo() em qualquer estado que não seja "tocando") e manter o
 * iframe invisível (mostrando a capa por baixo) até confirmar que está
 * tocando de verdade.
 */
export function YoutubeBackgroundPlayer({ videoId, posterUrl }: { videoId: string; posterUrl?: string | null }) {
  const reactId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const containerId = `yt-player-${reactId}`;
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    let player: YtPlayer | null = null;

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !window.YT) return;

      const YT = window.YT;

      function resumePlayback(target: YtPlayer) {
        const duration = target.getDuration();
        if (duration > 0) target.seekTo(duration * 0.05, true);
        target.playVideo();
      }

      player = new YT.Player(containerId, {
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
          onReady: (event: { target: YtPlayer }) => {
            fillContainer(event.target.getIframe());
            resumePlayback(event.target);
          },
          onStateChange: (event: { data: number; target: YtPlayer }) => {
            if (cancelled) return;
            if (event.data === YT.PlayerState.PLAYING) {
              setPlaying(true);
              return;
            }
            // Qualquer coisa que não seja "tocando" (pausado, encerrado,
            // não iniciado) é onde o YouTube mostra o cartão com
            // título/canal/sugestões — relança na hora pra nunca aparecer.
            setPlaying(false);
            if (event.data === YT.PlayerState.ENDED) {
              resumePlayback(event.target);
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED) {
              event.target.playVideo();
            }
          },
        },
      });
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
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      {posterUrl && (
        <Image
          src={posterUrl}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}
          priority
        />
      )}
      <div
        id={containerId}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
