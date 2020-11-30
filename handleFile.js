require('dotenv').config();

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const uploadFile = async (directory, name, type, buffer) => {
  let params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${directory}/${name}.${type}`,
    Body: buffer,
  };
  if (directory === 'public') {
    params = {
      ...params,
      ACL: 'public-read',
    };
  }
  if (type === 'pdf') params.ContentType = 'application/pdf';
  if (type === 'txt') params.ContentType = 'text/plain';

  const result = await new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    s3.upload(params, (error, data) => {
      if (error) return reject(error);
      return resolve(
        `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${directory}/${name}.${type}`,
      );
    });
  });

  return result;
};

const deleteFile = async (directory, name, type) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${directory}/${name}.${type}`,
  };

  const result = await new Promise((resolve, reject) => {
    // eslint-disable-next-line no-unused-vars
    s3.deleteObject(params, (error, _data) => {
      if (error) return reject(error);
      return resolve('Successfully deleted file');
    });
  });

  return result;
};

const download = async (file, type) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `private/${file}.${type}`,
  };

  const result = await new Promise((resolve, reject) => {
    s3.getObject(params, (error, data) => {
      if (error) return reject(error);
      return resolve(data.Body);
    });
  });

  return result;
};

module.exports = {
  uploadFile,
  deleteFile,
  download,
};
