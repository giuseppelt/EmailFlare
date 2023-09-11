import { useState } from "preact/hooks";
import { MailBodyEditorRef, MailEditorType } from "./types";
import { EditorMarkdown } from "./EditorMarkdown";
import { EditorRawHtml } from "./EditorRawHtml";
import IconDown from "~icons/mdi/chevron-down";




export function BodyEditor({ accessor }: { accessor: (accessor: MailBodyEditorRef) => void }) {
  const [editor, setEditor] = useState<MailEditorType>("markdown");

  const switcher = <Switcher onChange={setEditor} />;

  return (
    editor === "markdown"
      ? <EditorMarkdown accessor={accessor} switcher={switcher} />
      : <EditorRawHtml accessor={accessor} switcher={switcher} />
  );
}


function Switcher({ onChange }: { onChange: (type: MailEditorType) => void }) {
  return (
    <div class="dropdown">
      <button type="button" class="dropdown-btn">
        <span>Change Editor</span>
        <IconDown class="icon-sm" />
      </button>
      <ul class="dropdown-content">
        <li><button type="button" onClick={() => onChange("markdown")} >Markdown</button></li>
        <li><button type="button" onClick={() => onChange("raw")} >Raw HTML</button></li>
      </ul>
    </div>
  );
}
