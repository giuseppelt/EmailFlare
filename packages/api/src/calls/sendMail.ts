import { BadRequestError, httpCall, InternalServerError, useContextProperty } from "@httpc/server";
import { Authenticated } from "../middlewares";


export type Message = {
    from: string
    to: string | string[]
    subject: string
    bodyText?: string
    bodyHtml?: string
}

export const sendEmail = httpCall(
    Authenticated(),
    async (message: Message) => {
        // we can use a lib to validate input
        // but ...
        if (!message || typeof message !== "object" ||
            !message.from ||
            !message.to || !message.to.length ||
            !message.subject ||
            (!message.bodyText && !message.bodyHtml)
        ) {
            throw new BadRequestError("Missing required properties");
        }

        const from = parseEmail(message.from);
        const dkimKey = useContextProperty("DKIM_PRIVATE_KEY");

        const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                subject: message.subject.trim(),
                personalizations: [
                    {
                        to: parseMultiEmail(message.to),
                        ...dkimKey ? {
                            dkim_domain: useContextProperty("SENDER_DOMAIN"),
                            dkim_selector: "mailchannels",
                            dkim_private_key: dkimKey,
                        } : undefined,
                    }
                ],
                from,
                content: [
                    message.bodyText && { type: "text/plain", value: message.bodyText },
                    message.bodyHtml && { type: "text/html", value: message.bodyHtml },
                ].filter(x => !!x)
            })
        }).catch(() => undefined);

        if (!response || response.status >= 400) {
            throw new InternalServerError({
                message: (await response?.text().catch(() => "")) || "Unknown",
            });
        }
    }
);


const EMAIL_REGEX = /^(?:\s?(.*?)\s*<)?(.*?)>?$/;

function parseMultiEmail(email: string | string[]) {
    return (Array.isArray(email) ? email : [email])
        .flatMap(x => x.split(/,|;/).map(x => x.trim()))
        .map(parseEmail);
}

function parseEmail(text: string) {
    const [, name, email] = text.match(EMAIL_REGEX) || [];
    if (!email) {
        throw new BadRequestError();
    }

    return { name, email };
}
