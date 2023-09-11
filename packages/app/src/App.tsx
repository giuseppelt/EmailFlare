import type { VNode } from "preact";
import { useRef, useState } from "preact/hooks";
import { api, setSecret } from "./api";
import { useApiCall } from "./hooks";
import { BodyEditor, MailBodyEditorRef } from "./components";
import IconCheck from "~icons/mdi/check-bold";
import IconAlert from "~icons/mdi/alert";
import IconSettings from "~icons/mdi/gear";
import IconGithub from "~icons/mdi/github";
import IconEmail from "~icons/mdi/email";
import config from "../config.json";

type AppProps = {
  section?: string
  slots?: {
    navLinks?: VNode
    footerSide?: VNode
    notice?: VNode
  }
}

export default function App({ slots, section = "Compose" }: AppProps) {
  const [refBody, setRefBody] = useState<MailBodyEditorRef>();
  const [senderMode, setSenderMode] = useState<"preset" | "manual">("preset");

  const hasPresetSenders = (config?.senders?.length || 0) > 0;
  const isCustomSender = senderMode === "manual" || !hasPresetSenders;

  const [localError, setLocalError] = useState("");
  const { isLoading, isSuccess, isError, errorMessage, call: send } = useApiCall(api.sendEmail);

  const onSubmit = (ev: Event) => {
    setLocalError("");
    ev.preventDefault();
    ev.stopPropagation();

    if (!refBody) return;

    const { text, html } = refBody.getBody() || {};
    if (!text && !html) {
      setLocalError("Missing Body");
      return;
    }

    const {
      secret,
      from,
      to,
      subject,
    } = Object.fromEntries(new FormData(ev.target as any)) as Record<string, string>; // force string as no file is present

    setSecret(secret);

    send({
      from,
      to,
      subject,
      bodyText: text,
      bodyHtml: html,
    });
  };


  return (
    <>
      <nav id="navbar">
        <span>
          <a href="/" class="title"><IconEmail class="icon" /> EmailFlare</a>
          <span>{"/"}</span>
          <span class="visible-lg">{section}</span>
        </span>
        <span class="spacer" />
        {slots?.navLinks || (
          <span>
            <a class="icon-link" href={BUILDER} target="_blank"><IconSettings class="icon" /></a>
            <a class="icon-link" href={GITHUB} target="_blank"><IconGithub class="icon" /></a>
          </span>
        )}
      </nav>

      <main style={{ pointerEvents: isLoading ? "none" : undefined }}>
        {slots?.notice}
        <form id="form-compose" method="POST" action="/api/send-email" onSubmit={onSubmit}>
          <div class="field">
            <label for="secret">Auth</label>
            <input id="secret" type="password" name="secret" required />
          </div>
          <div class="field">
            <label for="from">From</label>
            {isCustomSender &&
              <input id="from" name="from" type="text" required />
            }
            {!isCustomSender &&
              <select id="from" name="from" required>
                {config?.senders?.map(x => <option value={x}>{x}</option>)}
              </select>
            }
            {config.customSender && hasPresetSenders &&
              <button type="button" class="btn action-btn btn-primary" onClick={() => setSenderMode(v => v === "manual" ? "preset" : "manual")}>
                {isCustomSender ? "Presets" : "Manual"}
              </button>
            }
          </div>
          <div class="field">
            <label for="to">To</label>
            <input id="to" type="text" name="to" required />
          </div>
          <div class="field">
            <label for="subject">Subject</label>
            <input id="subject" type="subject" name="subject" required />
          </div>

          <div class="field-body">
            <BodyEditor accessor={setRefBody} />
          </div>

          <div class="form-footer">
            {isLoading ? <span class="loader" /> : null}
            {isSuccess ? <p class="status success"><IconCheck /> Sent!</p> : null}
            {(isError || localError) ? <p class="status error"><IconAlert /> {errorMessage || localError}</p> : null}
            <div class="form-buttons">
              <button class="btn btn-secondary" type="reset">Reset</button>
              <button class="btn btn-primary" type="submit">Send</button>
            </div>
          </div>
        </form>
      </main>

      <footer id="footer">
        <span>
          <span>v{import.meta.env.VITE_APP_VERSION}</span>
          <span>|</span>
          <a href={GITHUB + "/tree/master/CHANGELOG.md"} target="_black">Changelog</a>
        </span>
        <span class="spacer" />
        {slots?.footerSide}
      </footer>
    </>
  );
}

const GITHUB = "https://github.com/giuseppelt/emailflare";
const BUILDER = "https://emailflare.breakp.dev/builder";

