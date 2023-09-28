import EnvConfig from '@/env.config'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { PutObjectCommandInput } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: EnvConfig.AwsAccessKeyId,
    secretAccessKey: EnvConfig.AwsSecretAccessKey,
  },
})

const S3ImageBucketName = 'com.nokori.qa.cdn.images'

export const uploadFromBuffer = async (key: string, file: {buffer: Buffer; mimetype: string}): Promise<string | null> => {
  try {
    const params: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: S3ImageBucketName,
      Key: key,
      ContentType: file.mimetype,
    }

    const putObjectCommand = new PutObjectCommand(params)
    const result = await s3.send(putObjectCommand)

    if (result['$metadata'].httpStatusCode === 200) 
      return `https://images.cdn.nokori.com/${key}`
    
    return null
  }
  catch (error) {
    logger.error('Error uploading image from Buffer', error)
    return null
  }

  return null
}

export default {
  uploadFromBuffer,
}
