import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// Wait for the font so the first frames are measured with the right glyph widths.
document.fonts.load('20px "0xProto"').finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
