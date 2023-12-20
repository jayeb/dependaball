import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

const fetchRemoteDependencyFile = async () => {
  if (!process.env.DEPENDENCIES_AWS_BUCKET)
    throw new Error('Environment variable not present: DEPENDENCIES_AWS_BUCKET');
  if (!process.env.DEPENDENCIES_AWS_ACCESS_KEY)
    throw new Error('Environment variable not present: DEPENDENCIES_AWS_ACCESS_KEY');
  if (!process.env.DEPENDENCIES_AWS_SECRET_KEY)
    throw new Error('Environment variable not present: DEPENDENCIES_AWS_SECRET_KEY');
  if (!process.env.DEPENDENCIES_FILE)
    throw new Error('Environment variable not present: DEPENDENCIES_FILE');

  const client = new S3Client({
    region: 'us-west-2',
    credentials: {
      accessKeyId: process.env.DEPENDENCIES_AWS_ACCESS_KEY,
      secretAccessKey: process.env.DEPENDENCIES_AWS_SECRET_KEY,
    },
  });

  const command = new GetObjectCommand({
    Bucket: process.env.DEPENDENCIES_AWS_BUCKET,
    Key: process.env.DEPENDENCIES_FILE,
  });

  const { Body, ContentType } = await client.send(command);
  const contents = await streamToString(Body);

  if (ContentType === 'application/json') {
    return JSON.parse(contents);
  } else {
    throw new Error('Response did not return JSON');
  }
};

export default fetchRemoteDependencyFile;
