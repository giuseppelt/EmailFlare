import type { VNode } from "preact";
import { useState, useRef } from "preact/hooks";
import { marked } from "marked";
import { api, setSecret } from "./api";
import { useApiCall } from "./hooks";
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
  const refText = useRef<HTMLTextAreaElement>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const [localError, setLocalError] = useState("");
  const { isLoading, isSuccess, isError, errorMessage, call: send } = useApiCall(api.sendEmail);

  const onSubmit = (ev: Event) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (!refText.current) return;

    const text = refText.current.value?.trim() || undefined;
    const html = text && mdToHtml(text) || undefined;
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
            <select id="from" name="from" required>
              {config?.senders.map(x => <option value={x}>{x}</option>)}
            </select>
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
            <div class="tabs">
              <div class="tabs-header">
                <button type="button" class={tabIndex === 0 ? "active" : undefined} onClick={() => setTabIndex(0)}>Markdown</button>
                <button type="button" class={tabIndex === 1 ? "active" : undefined} onClick={() => setTabIndex(1)}>Preview</button>
              </div>
              <div class="tabs-body">
                <div class={`tabs-panel${tabIndex === 0 ? " active" : ""}`}>
                  <div class="panel-text"><textarea ref={refText} /></div>
                </div>
                {tabIndex === 1 && (
                  <div class={`tabs-panel active`}>
                    <div class="panel-preview md" dangerouslySetInnerHTML={{ __html: mdToHtml(refText.current?.value || "") }} />
                  </div>
                )}
              </div>
            </div>
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

function mdToHtml(md: string): string {
  return marked(md, {
    gfm: true,
    mangle: false,
    headerIds: false,
  });
}
