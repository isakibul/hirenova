const {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const { NodeHttpHandler } = require("@smithy/node-http-handler");

const { notFound, serviceUnavailable } = require("../../utils/error");

const defaultRegion = "us-east-1";
const defaultRequestTimeoutMs = 5000;
const localEndpoint = "http://127.0.0.1:9000";
const localAccessKey = "hirenova";
const localSecretKey = "hirenova-minio-secret";
const resumePrefix = "resumes";

const getBooleanEnv = (value) => String(value ?? "").toLowerCase() === "true";
const getPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getStorageConfig = (env = process.env) => ({
  endpoint:
    env.S3_ENDPOINT ||
    (env.NODE_ENV === "production" ? undefined : localEndpoint),
  region: env.S3_REGION || defaultRegion,
  bucket: env.S3_BUCKET || "hirenova-resumes",
  accessKeyId:
    env.S3_ACCESS_KEY ||
    (env.NODE_ENV === "production" ? undefined : localAccessKey),
  secretAccessKey:
    env.S3_SECRET_KEY ||
    (env.NODE_ENV === "production" ? undefined : localSecretKey),
  forcePathStyle:
    env.S3_FORCE_PATH_STYLE === undefined
      ? env.NODE_ENV !== "production"
      : getBooleanEnv(env.S3_FORCE_PATH_STYLE),
  requestTimeoutMs: getPositiveInteger(
    env.S3_REQUEST_TIMEOUT_MS,
    defaultRequestTimeoutMs,
  ),
});

const isStorageConnectionError = (error) =>
  [
    "AbortError",
    "ECONNREFUSED",
    "ECONNRESET",
    "EHOSTUNREACH",
    "ENOTFOUND",
    "ETIMEDOUT",
    "TimeoutError",
  ].includes(error?.name) ||
  [
    "ECONNREFUSED",
    "ECONNRESET",
    "EHOSTUNREACH",
    "ENOTFOUND",
    "ETIMEDOUT",
  ].includes(error?.code);

const handleStorageError = (error) => {
  if (error?.name === "NoSuchKey" || error?.name === "NotFound" || error?.$metadata?.httpStatusCode === 404) {
    throw notFound("Resume not found");
  }

  if (isStorageConnectionError(error)) {
    throw serviceUnavailable("Resume storage is unavailable. Please try again shortly.");
  }

  throw error;
};

let s3Client;

const getS3Client = () => {
  if (s3Client) {
    return s3Client;
  }

  const config = getStorageConfig();
  s3Client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    requestHandler: new NodeHttpHandler({
      connectionTimeout: config.requestTimeoutMs,
      requestTimeout: config.requestTimeoutMs,
    }),
    credentials:
      config.accessKeyId && config.secretAccessKey
        ? {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          }
        : undefined,
  });

  return s3Client;
};

const setS3ClientForTests = (client) => {
  s3Client = client;
};

const getResumeObjectKey = (filename) =>
  `${resumePrefix}/${String(filename ?? "").replace(/^\/+/, "")}`;

const streamToBuffer = async (stream) => {
  if (typeof stream?.transformToByteArray === "function") {
    return Buffer.from(await stream.transformToByteArray());
  }

  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

const uploadResumeObject = async ({
  buffer,
  contentType,
  filename,
  originalName,
  userId,
}) => {
  const config = getStorageConfig();
  const key = getResumeObjectKey(filename);

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType || "application/octet-stream",
        Metadata: {
          originalName: originalName || filename,
          userId: String(userId),
        },
      }),
    );
  } catch (error) {
    handleStorageError(error);
  }

  return {
    bucket: config.bucket,
    key,
  };
};

const getResumeObject = async (filename) => {
  const config = getStorageConfig();
  const key = getResumeObjectKey(filename);

  try {
    return await getS3Client().send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
    );
  } catch (error) {
    handleStorageError(error);
  }
};

const getResumeObjectBuffer = async (filename) => {
  const object = await getResumeObject(filename);
  return streamToBuffer(object.Body);
};

const assertResumeObjectExists = async (filename) => {
  const config = getStorageConfig();

  try {
    await getS3Client().send(
      new HeadObjectCommand({
        Bucket: config.bucket,
        Key: getResumeObjectKey(filename),
      }),
    );
  } catch (error) {
    handleStorageError(error);
  }
};

module.exports = {
  assertResumeObjectExists,
  getResumeObject,
  getResumeObjectBuffer,
  getResumeObjectKey,
  getStorageConfig,
  setS3ClientForTests,
  uploadResumeObject,
};
