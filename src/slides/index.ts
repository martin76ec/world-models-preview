import type React from "react";
import type { Text } from "../lib/i18n";
import { S0Title } from "./S0Title";
import { S1Why } from "./S1Why";
import { S2Clockwork } from "./S2Clockwork";
import { S3Mind } from "./S3Mind";
import { S4Pillars } from "./S4Pillars";
import { S5Control } from "./S5Control";
import { S6Now } from "./S6Now";
import { S7Open } from "./S7Open";
import { S8End } from "./S8End";

export type SlideDef = {
  label: Text;
  steps: number;
  Component: React.FC;
  notes: Text;
};

export const SLIDES: SlideDef[] = [
  {
    label: { en: "intro", es: "intro" },
    steps: 1,
    Component: S0Title,
    notes: {
      en: "Machines That Dream — from blind machinery to AI that simulates before it acts.",
      es: "Máquinas que sueñan — de la maquinaria ciega a una IA que simula antes de actuar.",
    },
  },
  {
    label: { en: "why imagine", es: "por qué imaginar" },
    steps: 3,
    Component: S1Why,
    notes: {
      en:
        "Why did nature give us an imagination? Prediction is cheap, but mistakes are fatal.\n" +
        "→ An animal that learns only by mistakes dies after one bad jump. Imagination lets us test dangerous choices in a safe mental simulator first.\n" +
        "→ [next] the real jump follows the arc that survived.\n" +
        "→ [next] Perception → Simulation → Action. For decades AI only reacted; world models give it an internal sandbox to predict first.",
      es:
        "¿Por qué la naturaleza nos dio imaginación? Predecir es barato, pero equivocarse es fatal.\n" +
        "→ Un animal que solo aprende de sus errores muere tras un mal salto. La imaginación permite probar decisiones peligrosas primero en un simulador mental seguro.\n" +
        "→ [sig.] el salto real sigue el arco que sobrevivió.\n" +
        "→ [sig.] Observación → Simulación → Acción. Durante décadas la IA solo reaccionaba; los modelos del mundo le dan un sandbox interno para predecir primero.",
    },
  },
  {
    label: { en: "clockwork", es: "relojería" },
    steps: 2,
    Component: S2Clockwork,
    notes: {
      en:
        "Hero of Alexandria: theatres driven by ropes and falling weights. Al-Jazari: floating musical bands, rhythms set by pegs. Vaucanson, 1739: the Digesting Duck, 400 moving parts.\n" +
        "→ [next] But they were blind. Nudge the duck half an inch and the beak snaps empty air — mechanism, zero model of the environment.",
      es:
        "Herón de Alejandría: teatros movidos por cuerdas y pesas. Al-Jazari: bandas musicales flotantes, ritmos fijados con clavijas. Vaucanson, 1739: el Pato Digestor, 400 piezas móviles.\n" +
        "→ [sig.] Pero eran ciegos. Mueve el pato un centímetro y el pico picotea el aire — mecanismo, cero modelo del entorno.",
    },
  },
  {
    label: { en: "mind's eye", es: "ojo de la mente" },
    steps: 2,
    Component: S3Mind,
    notes: {
      en:
        "1943, Kenneth Craik: the brain builds a small-scale model of reality — like an engineer's miniature bridge — and asks 'what happens if I step there?' before stepping.\n" +
        "→ [next] 1950, Alan Turing: you can't hand-code the universe. Build a Child Machine that explores, makes mistakes and builds its own map of cause and effect.",
      es:
        "1943, Kenneth Craik: el cerebro construye un modelo a escala de la realidad — como el puente en miniatura de un ingeniero — y pregunta '¿qué pasa si piso ahí?' antes de pisar.\n" +
        "→ [sig.] 1950, Alan Turing: no se puede programar el universo a mano. Construir una Máquina Niño que explore, se equivoque y construya su propio mapa de causa y efecto.",
    },
  },
  {
    label: { en: "two pillars", es: "dos pilares" },
    steps: 2,
    Component: S4Pillars,
    notes: {
      en:
        "Pillar 1, abstract representation: ignore rustling leaves and clouds — compress to my lane, the truck ahead, the pedestrian at the curb.\n" +
        "→ [next] Pillar 2, counterfactuals: see the wet floor sign, don't test it. 'If I step there → friction drops → I fall.' Change the path from predicted consequences alone.",
      es:
        "Pilar 1, representación abstracta: ignorar hojas y nubes — comprimir en mi carril, el camión de adelante, el peatón en la acera.\n" +
        "→ [sig.] Pilar 2, contrafactuales: ves el letrero de piso mojado y no lo pruebas. 'Si piso ahí → baja la fricción → me caigo.' Cambias el camino solo por las consecuencias predichas.",
    },
  },
  {
    label: { en: "control", es: "control" },
    steps: 3,
    Component: S5Control,
    notes: {
      en:
        "Engineers hit the same problem. Watt's centrifugal governor spins faster → balls fly out → valve closes. Wiener formalised feedback.\n" +
        "→ [next] 1970, Conant & Ashby, the Good Regulator Theorem: every good regulator of a system must be a model of that system.\n" +
        "→ [next] An autopilot that reacts after the wave hits is too late; it needs a model of waves, hulls, rudders and wind.",
      es:
        "Los ingenieros enfrentaron el mismo problema. El regulador centrífugo de Watt gira más rápido → las bolas se abren → la válvula se cierra. Wiener formalizó la retroalimentación.\n" +
        "→ [sig.] 1970, Conant y Ashby, el Teorema del Buen Regulador: todo buen regulador de un sistema debe ser un modelo de ese sistema.\n" +
        "→ [sig.] Un piloto automático que reacciona después de la ola llega tarde; necesita un modelo de olas, cascos, timones y viento.",
    },
  },
  {
    label: { en: "now", es: "hoy" },
    steps: 3,
    Component: S6Now,
    notes: {
      en:
        "Self-driving: a real-time world model predicting 3–5 s ahead — the pedestrian behind the parked van.\n" +
        "→ [next] Robotics: friction, weight, momentum simulated first; the robot doesn't crush the jar because it already rehearsed it.\n" +
        "→ [next] Generative video: from millions of hours of video, models implicitly learn physics — water flows down, objects follow arcs.",
      es:
        "Conducción autónoma: un modelo del mundo en tiempo real que predice 3–5 s adelante — el peatón detrás de la furgoneta estacionada.\n" +
        "→ [sig.] Robótica: fricción, peso e inercia se simulan primero; el robot no aplasta el frasco porque ya lo ensayó.\n" +
        "→ [sig.] Video generativo: con millones de horas de video, los modelos aprenden física implícitamente — el agua baja, los objetos siguen arcos.",
    },
  },
  {
    label: { en: "open source", es: "código abierto" },
    steps: 2,
    Component: S7Open,
    notes: {
      en:
        "LeRobot by Hugging Face: open datasets, pretrained policies, low-cost hardware — physical hands for digital imagination.\n" +
        "Awesome-World-Models by knightnemo: the community map of papers, code and benchmarks.\n" +
        "→ [next] Physical AI used to need multi-million-dollar labs; now independent researchers can build it.",
      es:
        "LeRobot de Hugging Face: datasets abiertos, políticas preentrenadas, hardware de bajo costo — manos físicas para la imaginación digital.\n" +
        "Awesome-World-Models de knightnemo: el mapa comunitario de papers, código y benchmarks.\n" +
        "→ [sig.] La IA física necesitaba laboratorios millonarios; hoy investigadores independientes pueden construirla.",
    },
  },
  {
    label: { en: "recap", es: "resumen" },
    steps: 2,
    Component: S8End,
    notes: {
      en:
        "Automata: action without awareness. Cybernetics: action with feedback, correcting after the change. World models: action guided by imagination.\n" +
        "→ [next] Evolution spent millions of years building brains that dream and anticipate. We are giving machines the ability to imagine the future before stepping into it. Thank you.",
      es:
        "Autómatas: acción sin conciencia. Cibernética: acción con retroalimentación, corrigiendo después del cambio. Modelos del mundo: acción guiada por la imaginación.\n" +
        "→ [sig.] La evolución tardó millones de años en crear cerebros que sueñan y anticipan. Estamos dando a las máquinas la capacidad de imaginar el futuro antes de vivirlo. Gracias.",
    },
  },
];
