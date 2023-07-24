const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  try {
    const imagesJsonData = await getImagesJsonData(bucket);

    const imageMetadata = {
      name: key,
      size: event.Records[0].s3.object.size,
      type: event.Records[0].s3.object.contentType,
      // Add more metadata fields as needed
    };

    const existingImageIndex = imagesJsonData.findIndex((image) => image.name === key);
    if (existingImageIndex !== -1) {
      imagesJsonData[existingImageIndex] = imageMetadata;
    } else {
      imagesJsonData.push(imageMetadata);
    }

    await uploadImagesJson(bucket, imagesJsonData);

    console.log('images.json updated successfully.');
  } catch (error) {
    console.log('Error updating images.json:', error);
  }
};

async function getImagesJsonData(bucket) {
  try {
    const response = await s3.getObject({ Bucket: bucket, Key: 'images.json' }).promise();
    return JSON.parse(response.Body.toString());
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return [];
    }
    throw error;
  }
}

async function uploadImagesJson(bucket, data) {
  await s3.putObject({
    Bucket: bucket,
    Key: 'images.json',
    Body: JSON.stringify(data),
  }).promise();
}