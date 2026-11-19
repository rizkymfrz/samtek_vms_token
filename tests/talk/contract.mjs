import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const HERE = dirname(fileURLToPath(import.meta.url));

const CONTRACT_DIR =
  process.env.SAMTEK_CONTRACT_DIR ??
  resolve(HERE, "../../../samtek_edge_new/contract");

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const ajv = new Ajv2020({ strict: false, allErrors: true });
const schemaDir = join(CONTRACT_DIR, "schema");

for (const file of ["common.json", "envelope.json"]) {
  ajv.addSchema(read(join(schemaDir, file)));
}

for (const file of readdirSync(join(schemaDir, "messages"))) {
  ajv.addSchema(read(join(schemaDir, "messages", file)));
}

export const validatorFor = (type) => {
  const validate = ajv.getSchema(
    `https://schemas.samtek.local/contract/v1/messages/${type}.json`,
  );
  if (!validate) throw new Error(`No schema for ${type}`);
  return validate;
};

export const exampleNames = () =>
  readdirSync(join(CONTRACT_DIR, "examples", "valid")).filter((name) =>
    name.includes("talk"),
  );

export const readExample = (name) =>
  read(join(CONTRACT_DIR, "examples", "valid", name));

export const errorsOf = (validate) =>
  (validate.errors ?? []).map((e) => `${e.instancePath} ${e.message}`);
