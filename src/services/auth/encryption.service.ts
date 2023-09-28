import { generateKeyPairSync, privateDecrypt, publicEncrypt } from 'node:crypto'

const encryptWithPublicKey = (publicKey: string, data: string) => {
  const buffer = Buffer.from(data)
  const encrypted = publicEncrypt(publicKey, buffer)
  return encrypted.toString('base64')
}

const decryptWithPrivateKey = (privateKey: string, data: string) => {
  const buffer = Buffer.from(data, 'base64')
  const decrypted = privateDecrypt(privateKey, buffer)
  return decrypted.toString('utf8')
}

const generateKeys = () => {
  const {
    publicKey,
    privateKey,
  } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: 'top secret',
    },
  })
  
  return { publicKey, privateKey }
}

export default {
  generateKeys, 
  encryptWithPublicKey,
  decryptWithPrivateKey,
}
