// Server-only Takumi WASM module (`.server.ts` keeps it out of client/RSC
// bundles, which cannot load `.wasm`). The Cloudflare bundler plugin
// compiles the static import into a precompiled CompiledWasm module —
// Workers BAN runtime WebAssembly.instantiate(bytes), so this must stay a
// static import and must never be fetched as bytes.
import takumiWasmModule from "@takumi-rs/wasm/takumi_wasm_bg.wasm?module";

export const ogWasmModule: WebAssembly.Module = takumiWasmModule;
