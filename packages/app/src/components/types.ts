import { VNode } from "preact"

export type MailBodyEditorRef = {
    getBody(): { text?: string, html?: string } | undefined
    clear(): void
}

export type MailEditorProps = Readonly<{
    accessor: (accessor: MailBodyEditorRef) => void
    switcher?: VNode
}>

export type MailEditorType =
    | "markdown"
    | "raw"
