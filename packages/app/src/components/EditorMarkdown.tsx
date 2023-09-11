import { marked } from "marked";
import { useEffect, useRef } from "preact/hooks";
import { Tabs } from "./Tab";
import type { MailEditorProps } from "./types";



export function EditorMarkdown({ accessor, switcher }: MailEditorProps) {
  const refText = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    accessor({
      getBody() {
        const text = refText.current?.value?.trim();
        if (!text) return;

        return {
          text,
          html: mdToHtml(text)
        };
      },
      clear() {
        if (refText.current) {
          refText.current.value = "";
        }
      }
    })
  }, []);

  return (
    <Tabs tabs={["Markdown", "Preview"]} slots={{ sideHeader: switcher }}>
      <div class="panel-text"><textarea ref={refText} /></div>
      {() => <div class="panel-preview md" dangerouslySetInnerHTML={{ __html: mdToHtml(refText.current?.value || "") }} />}
    </Tabs>
  );
}

function mdToHtml(md: string): string {
  return marked(md, {
    gfm: true,
    mangle: false,
    headerIds: false,
  });
}
