const assert = require("node:assert/strict");
const { Readable } = require("node:stream");
const { test, afterEach } = require("node:test");

const objectStorage = require("../src/integrations/objectStorage");

afterEach(() => {
  objectStorage.setS3ClientForTests(undefined);
});

test("resume object keys are scoped below the resume prefix", () => {
  assert.equal(
    objectStorage.getResumeObjectKey("/candidate-resume.pdf"),
    "resumes/candidate-resume.pdf",
  );
});

test("storage config defaults to local Docker MinIO outside production", () => {
  assert.deepEqual(objectStorage.getStorageConfig({ NODE_ENV: "development" }), {
    endpoint: "http://127.0.0.1:9000",
    region: "us-east-1",
    bucket: "hirenova-resumes",
    accessKeyId: "hirenova",
    secretAccessKey: "hirenova-minio-secret",
    forcePathStyle: true,
  });
});

test("uploadResumeObject writes S3 object metadata", async () => {
  const calls = [];
  objectStorage.setS3ClientForTests({
    async send(command) {
      calls.push(command.input);
      return {};
    },
  });

  await objectStorage.uploadResumeObject({
    buffer: Buffer.from("resume"),
    contentType: "application/pdf",
    filename: "user-1-resume.pdf",
    originalName: "Resume.pdf",
    userId: "user-1",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].Bucket, "hirenova-resumes");
  assert.equal(calls[0].Key, "resumes/user-1-resume.pdf");
  assert.equal(calls[0].ContentType, "application/pdf");
  assert.deepEqual(calls[0].Metadata, {
    originalName: "Resume.pdf",
    userId: "user-1",
  });
});

test("getResumeObjectBuffer reads S3 streams into buffers", async () => {
  objectStorage.setS3ClientForTests({
    async send() {
      return {
        Body: Readable.from(["parsed ", "resume"]),
      };
    },
  });

  const buffer = await objectStorage.getResumeObjectBuffer("user-1-resume.pdf");

  assert.equal(buffer.toString("utf8"), "parsed resume");
});

test("missing resume objects return a domain not found error", async () => {
  objectStorage.setS3ClientForTests({
    async send() {
      const error = new Error("missing");
      error.name = "NoSuchKey";
      throw error;
    },
  });

  await assert.rejects(
    () => objectStorage.getResumeObject("missing.pdf"),
    /Resume not found/,
  );
});
