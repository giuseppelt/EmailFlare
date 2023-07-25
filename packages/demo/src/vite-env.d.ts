/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="unplugin-icons/types/preact" />


interface ImportMeta {
    readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
    readonly VITE_APP_VERSION: string
}

declare var config: typeof import("@email-email/app/config.json");

namespace preact {
    namespace JSX {
        interface IntrinsicAttributes {
            path?: string
        }
    }
}
