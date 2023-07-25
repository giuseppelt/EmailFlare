import fs from "node:fs";
import crypto from "node:crypto";

crypto.generateKeyPair("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "spki",
        format: "der",
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "der",
    }
}, (err, pubKey, privateKey) => {
    // fs.writeFileSync("pub.txt", pubKey.toString("base64"), "utf8");
    // fs.writeFileSync("priv.txt", privateKey.toString("base64"), "utf8");
});
