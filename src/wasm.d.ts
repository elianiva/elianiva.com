// Bundler-provided precompiled WASM modules (Cloudflare `CompiledWasm` semantics:
// static `.wasm` imports arrive as WebAssembly.Module, never URLs or bytes).
declare module "*.wasm" {
  const module: WebAssembly.Module;
  export default module;
}
declare module "@takumi-rs/wasm/takumi_wasm_bg.wasm?module" {
  const module: WebAssembly.Module;
  export default module;
}
