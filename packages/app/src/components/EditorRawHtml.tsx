import { useEffect, useRef } from "preact/hooks";
import { Tabs } from "./Tab";
import type { MailEditorProps } from "./types";



export function EditorRawHtml({ accessor, switcher }: MailEditorProps) {
  const refText = useRef<HTMLTextAreaElement>(null);
  const refHtml = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    accessor({
      getBody() {
        const text = refText.current?.value?.trim() || undefined;
        const html = refHtml.current?.value?.trim() || undefined;
        if (!text && !html) return;

        return {
          text,
          html,
        };
      },
      clear() {
        if (refText.current) {
          refText.current.value = "";
        }
        if (refHtml.current) {
          refHtml.current.value = "";
        }
      }
    })
  }, []);

  return (
    <Tabs tabs={["HTML", "Text (optional)"]} slots={{ sideHeader: switcher }}>
      <div class="panel-html"><textarea ref={refHtml} /></div>
      <div class="panel-text"><textarea ref={refText} /></div>
    </Tabs>
  );
}
