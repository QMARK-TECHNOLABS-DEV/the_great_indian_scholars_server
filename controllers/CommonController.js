const { upload } = require('../middlewares/multerToS3');
const commonCtrl = {};
const endpoint = process.env.DO_SPACES_ENDPOINT;
const Bucket = process.env.DO_SPACES_BUCKET;

commonCtrl.uploadSingleFile = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "File upload failed",
                data: null,
                errors: {
                    code: "INTERNAL_SERVER_ERROR",
                    details: "An unexpected error occurred. Please try again later."
                }
            })
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient Data',
                data: null,
                errors: {
                    code: "INSUFFICIENT_DATA",
                    details: "Insufficient Data."
                }
            })
        }

        const file = {
            name: req.file.originalname,
            key: req.file.key,
            location: `${endpoint}/${Bucket}/${req.file.key}`,
            size: req.file.size,
        }

        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: { result: file },
            errors: null
        })
    });
};

commonCtrl.uploadMultipleFile = (req, res) => {
    upload.array('files')(req, res, (err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "File upload failed",
                data: null,
                errors: {
                    code: "INTERNAL_SERVER_ERROR",
                    details: "An unexpected error occurred. Please try again later."
                }
            })
        }

        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient Data',
                data: null,
                errors: {
                    code: "INSUFFICIENT_DATA",
                    details: "Insufficient Data."
                }
            })
        }

        const files = [];
        for (const file of req.files) {
            const temp = {
                name: file.originalname,
                key: file.key,
                location: `${endpoint}/${Bucket}/${file.key}`,
                size: file.size,
            }

            files.push(temp)
        }

        return res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            data: { result: files },
            errors: null
        })
    });
};

module.exports = { commonCtrl };