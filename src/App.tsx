import { Player, PlayerRef } from "@remotion/player";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Deck, DeckProps } from "./Deck";
import { SLIDES } from "./slides";
import type { Lang } from "./lib/i18n";

const initialLang = (): Lang =>
  new URLSearchParams(location.search).get("lang") === "es" ? "es" : "en";

const FPS = 30;
// The player just keeps time; six hours is longer than any talk.
const DURATION = FPS * 60 * 60 * 6;
const DONE = 100000;

const fromHash = () => {
  const n = parseInt(location.hash.replace("#", ""), 10);
  return Number.isFinite(n) ? Math.min(SLIDES.length - 1, Math.max(0, n - 1)) : 0;
};

export const App: React.FC = () => {
  const player = useRef<PlayerRef>(null);
  const [state, setState] = useState<Omit<DeckProps, "lang">>(() => ({ index: fromHash(), step: 0, frames: [0], entry: 0 }));
  const [lang, setLang] = useState<Lang>(initialLang);
  const [notes, setNotes] = useState(false);
  const [pointer, setPointer] = useState(false);
  const [help, setHelp] = useState(true);

  const now = () => player.current?.getCurrentFrame() ?? 0;

  const goto = useCallback((index: number, atEnd = false) => {
    const f = now();
    const steps = SLIDES[index].steps;
    setState({
      index,
      step: atEnd ? steps - 1 : 0,
      frames: atEnd ? Array(steps).fill(f - DONE) : [f],
      entry: f,
    });
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      const f = now();
      if (s.step < SLIDES[s.index].steps - 1) {
        const frames = [...s.frames];
        frames[s.step + 1] = f;
        return { ...s, step: s.step + 1, frames };
      }
      if (s.index < SLIDES.length - 1) return { index: s.index + 1, step: 0, frames: [f], entry: f };
      return s;
    });
  }, []);

  const prev = useCallback(() => {
    setState((s) => {
      const f = now();
      if (s.step > 0) return { ...s, step: s.step - 1 };
      if (s.index > 0) {
        const steps = SLIDES[s.index - 1].steps;
        return { index: s.index - 1, step: steps - 1, frames: Array(steps).fill(f - DONE), entry: f };
      }
      return s;
    });
  }, []);

  useEffect(() => {
    history.replaceState(null, "", `${lang === "es" ? "?lang=es" : location.pathname}#${state.index + 1}`);
    document.documentElement.lang = lang;
    document.title = lang === "es" ? "Máquinas que sueñan" : "Machines That Dream";
  }, [state.index, lang]);

  useEffect(() => {
    const id = setTimeout(() => setHelp(false), 5000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!player.current?.isPlaying()) player.current?.play();
      const k = e.key;
      if (["ArrowRight", "ArrowDown", " ", "PageDown", "Enter"].includes(k)) next();
      else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) prev();
      else if (k === "Home") goto(0);
      else if (k === "End") goto(SLIDES.length - 1, true);
      else if (k === "n" || k === "N") setNotes((v) => !v);
      else if (k === "l" || k === "L") setLang((l) => (l === "en" ? "es" : "en"));
      else if (k === "f" || k === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      } else if (/^[1-9]$/.test(k) && Number(k) <= SLIDES.length) goto(Number(k) - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goto]);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    const onMove = () => {
      setPointer(true);
      clearTimeout(id);
      id = setTimeout(() => setPointer(false), 1500);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const def = SLIDES[state.index];

  return (
    <div
      className={`stage ${pointer ? "pointer" : ""}`}
      onClick={(e) => {
        if (!player.current?.isPlaying()) player.current?.play();
        if (e.clientX < window.innerWidth * 0.25) prev();
        else next();
      }}
    >
      <Player
        ref={player}
        component={Deck}
        inputProps={{ ...state, lang }}
        durationInFrames={DURATION}
        fps={FPS}
        compositionWidth={1920}
        compositionHeight={1080}
        style={{ width: "100%", height: "100%" }}
        autoPlay
        loop
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        acknowledgeRemotionLicense
      />
      {notes && (
        <div className="notes" onClick={(e) => e.stopPropagation()}>
          <b>
            {state.index + 1}/{SLIDES.length} · {def.label[lang]} · {lang === "es" ? "paso" : "step"} {state.step + 1}/{def.steps}
          </b>
          {"\n"}
          {def.notes[lang]}
        </div>
      )}
      {help && <div className="help">→ / space next · ← back · N notes · L español/english · F fullscreen</div>}
    </div>
  );
};
