import { useState, useRef, useLayoutEffect } from "preact/hooks";
import Router from "preact-router";
import { default as Composer } from "@emailflare/app/src/App";
import { useApiCall } from "@emailflare/app/src/hooks";
import IconTwitter from "~icons/mdi/twitter";
import IconGithub from "~icons/mdi/github";
import IconEmail from "~icons/mdi/email";
import IconClose from "~icons/mdi/close";
import IconCheck from "~icons/mdi/check-bold";
import IconAlert from "~icons/mdi/alert";
import IconSettings from "~icons/mdi/gear";
import IconShare from "~icons/mdi/share-variant";
import type Config from "@emailflare/app/config.json";


export default function App() {
  return (
    <Router>
      <Composer path="/"
        slots={{
          notice: (
            <p class="notice">
              <b>Warning:</b><br />
              This is a demo. Sending email doesn't work. <br />
              You can create and deploy your own EmailFlare with the <a href="/builder">Builder</a>.
            </p>
          ),
          navLinks: (
            <NavLinks />
          ),
          footerSide: (
            <span>Try <a href="https://combustion.email" target="_blank"><b>Combustion.Email</b></a>: <span>All your mails in one place</span></span>
          )
        }}
      />

      <BuilderPage path="/builder" />
      <HelpPage path="/help" />
    </Router>
  );
}




const TWITTER = "https://twitter.com/giuseppelt";
const GITHUB = "https://github.com/giuseppelt/emailflare";
const BLOG_POST = "https://www.breakp.dev/blog/email-flare-send-from-worker-for-free/";

function NavLinks() {
  return (
    <>
      <span><a href="/help"><span class="visible-lg">What is this?</span><span class="visible-sm">Help?</span></a></span>
      <span>
        <a class="icon-link visible-lg" title="Configuration" href="/builder"><IconSettings class="icon" /></a>
        <a class="icon-link visible-lg" title="Share" href={GITHUB} target="_blank"><IconShare class="icon" /></a>
        <a class="icon-link" href={TWITTER} target="_blank"><IconTwitter class="icon" /></a>
        <a class="icon-link" title="Repository" href={GITHUB} target="_blank"><IconGithub class="icon" /></a>
      </span>
    </>
  )
}

function Navbar({ section }: { section: string }) {
  return (
    <nav id="navbar">
      <span>
        <a href="/" class="title"><IconEmail class="icon" /> EmailFlare</a>
        <span>{"/"}</span>
        <span class="visible-lg">{section}</span>
      </span>
      <span class="spacer" />
      <NavLinks />
    </nav>
  )
}

function Footer() {
  return (
    <footer id="footer">
      <span>
        <span>v{import.meta.env.VITE_APP_VERSION}</span>
        <span>|</span>
        <a href={GITHUB + "/tree/master/CHANGELOG.md"} target="_black">Changelog</a>
      </span>
      <span class="spacer" />
      <span class="flex-no-shrink">Try <a href="https://combustion.email" target="_blank"><b>Combustion.Email</b> :</a> <span>All your mails in one place</span></span>
    </footer>
  );
}


type ConfigType = typeof Config;

const REGEX_EMAIL = /(.+)@(.+)/;

function BuilderPage() {
  const [config, setConfig] = useState<Partial<ConfigType>>({});
  const [isDeploy, setDeploy] = useState(false);
  const refSender = useRef<HTMLInputElement>(null);

  const addSender = () => {
    const sender = refSender.current?.value?.trim();
    if (sender && sender.match(REGEX_EMAIL)) {
      setConfig(x => ({ ...x, senders: [...new Set([...x.senders || [], sender])] }));
      refSender.current!.value = "";
    }
  }

  const removeSender = (index: number) => {
    setConfig(x => ({ ...x, senders: x.senders?.filter((_, i) => i !== index) }));
  }

  const [localError, setLocalError] = useState("");
  const { isLoading, isSuccess, isError, errorMessage, call } = useApiCall(isDeploy ? deployWorker : downloadWorker);

  const onSubmit = (ev: Event) => {
    ev.preventDefault();
    ev.stopPropagation();

    setLocalError("");
    if (!config || Object.keys(config).length === 0) {
      return;
    }

    const {
      isDeploy,
      accountId,
      workerName,
      apiToken,
      domain,
      password: secret,
      dkimKey,
    } = Object.fromEntries(new FormData(ev.target as any)) as Record<string, string>;

    if (isDeploy && (!accountId || !workerName || !apiToken)) {
      return;
    }


    call(config, {
      accountId,
      workerName,
      apiToken,
      bindings: { domain, secret, dkimKey }
    });
  }

  useLayoutEffect(() => {
    if (refSender.current) {
      refSender.current.addEventListener("keypress", ev => {
        if (ev.code === "Enter") {
          ev.preventDefault();
          addSender();
        }
      });
    }
  }, [refSender.current]);

  return (
    <>
      <Navbar section="Builder" />

      <main>
        <h2>Configuration</h2>
        <p>Fill the form to setup up your own EmailFlare. <a href={BLOG_POST}>Tutorial</a></p>

        <form id="form-builder" onSubmit={onSubmit}>
          <span class="hint">Your email domain, example: <span style="font-weight: 500">{"domain.com"}</span></span>
          <div class="field mb-3">
            <label for="domain">Domain</label>
            <input id="domain" name="domain" type="text" />
          </div>

          <h4 class="visible-sm">Senders</h4>
          <span class="hint">Email or use the format: <span style="font-weight: 500">{"Name <email@domain.com>"}</span></span>
          <div class="field">
            <label for="sender" class="visible-lg">Senders</label>
            <input type="text" id="sender" ref={refSender} />
            <button type="button" class="action-btn btn btn-primary" onClick={addSender}>Add</button>
          </div>
          {config && config.senders && config.senders.length > 0 &&
            <div>
              {config.senders.map((x, i) =>
                <p class="d-flex gap-1"><button type="button" class="btn btn-sm btn-icon btn-ghost" onClick={() => removeSender(i)} ><IconClose class="icon-sm" /></button> {x}</p>
              )}
            </div>
          }
          <div class="field items-center" style="min-height: 35px">
            <input type="checkbox" id="custom-sender" name="customSender" checked={!!config.customSender} onChange={ev => setConfig(x => ({ ...x, customSender: !!(ev.target as HTMLInputElement).checked }))} />
            <label class="flex-grow ms-1 static" for="custom-sender">Allow custom sender <small class="color-dim">You will type the address manually</small></label>
          </div>

          <div class="field mt-4 items-center" style="min-height: 35px">
            <label for="deploy" class="visible-lg">Deploy</label>
            <input type="checkbox" id="deploy" name="deploy" checked={isDeploy} onChange={ev => setDeploy((ev.target as HTMLInputElement).checked)} />
            <label class="flex-grow ms-1 static" for="deploy">You want to directly deploy to your Cloudflare worker</label>
          </div>
          {isDeploy &&
            <>
              <h4>Your Cloudflare information</h4>
              <div class="field">
                <label for="account-id">Account Id</label>
                <input type="text" id="account-id" name="accountId" />
              </div>
              <div class="field">
                <label for="worker-name">Worker name</label>
                <input type="text" id="worker-name" name="workerName" />
              </div>
              <div class="field">
                <label for="api-token">Api Token</label>
                <input type="password" id="api-token" name="apiToken" />
              </div>


              <h4>Authentication, leave black to use previous data</h4>
              <span class="hint">The password you'll use to send emails. Required the first time.</span>
              <div class="field">
                <label for="password">Secret</label>
                <input type="password" id="password" name="password" />
              </div>
              <div class="field">
                <label for="dkim-key">DKIM Private</label>
                <input type="password" id="dkim-key" name="dkimKey" />
              </div>
            </>
          }

          <div class="form-footer mt-5">
            {isLoading ? <span class="loader" /> : null}
            {isSuccess ? <p class="status success"><IconCheck /> Done! {isDeploy ? "Your worker is live!" : "Wait for download..."}</p> : null}
            {(isError || localError) ? <p class="status error"><IconAlert /> {errorMessage || localError}</p> : null}
            <div class="form-buttons">
              <button class="btn btn-secondary" type="reset" onClick={() => { setConfig({}); setDeploy(false); }}>Reset</button>
              <button class="btn btn-primary" type="submit">{isDeploy ? "Deploy" : "Download"}</button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </>
  );
}


async function buildWorker(config: Partial<ConfigType>) {
  const response = await fetch("/assets/emailflare.js.txt");
  const content = await response.text();

  const snippet = `globalThis.ASSET_CONFIG = {
    path: "/assets/config.js",
    contentType: "application/javascript",
    encoding: "utf8",
    data: \`export default ${JSON.stringify(config)}\`
  };`

  return snippet + content;
}

async function downloadWorker(config: Partial<ConfigType>) {
  const content = await buildWorker(config);

  const a = document.createElement("a");
  a.href = `data:text/plain;base64,${btoa(content)}`;
  a.download = "worker.js";
  a.click();
}

async function deployWorker(config: Partial<ConfigType>, params: any) {
  const response = await fetch("/api/deploy", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ config, ...params })
  });

  if (response.status >= 400) {
    throw new Error(`[HTTP-${response.status}] ${(await response.json().catch(() => null))?.message}`);
  }
}



function HelpPage() {
  return (
    <>
      <Navbar section="Help" />

      <main>
        <h2>What is EmailFlare?</h2>
        <p>Send emails from your domain through Cloudflare for free.</p>

        <div class="md">
          <h3>How it works?</h3>
          <p>EmailFlare is an open-source webapp, you can use to create your own version of EmailFlare for your domain.</p>
          <p>You can use the <b>deploy wizard</b> to host EmailFlare on your Cloudflare account. You can make it available to a subdomain of your choice, for example: <i>email.your-domain.com</i>. And from there, you can send emails for your domain.</p>

          <h3>Step by step tutorial</h3>
          <p>Read the <a href={BLOG_POST} target="_blank">complete guide blog post</a> for an introduction about <b>EmailFlare</b> and a step by step tutorial on how to use EmailFlare for your own domain.</p>

          <h3>Updates and Requests</h3>
          <p>Follow <a href={TWITTER} target="_blank">@giuseppelt</a> or head to the <a href={GITHUB} target="_blank">GitHub repository</a>.</p>
        </div>
      </main>

      <Footer />
    </>
  );
}
