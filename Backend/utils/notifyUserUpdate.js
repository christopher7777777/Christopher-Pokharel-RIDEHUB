const sendEmail = require('./sendEmail');

const notifyUserUpdate = async (bike, subject, message, targetEmail = null) => {
    const emailToUse = targetEmail || (bike && bike.seller && bike.seller.email);

    if (bike && emailToUse) {
        try {
            let attachments = [];
            let imageHtml = '';

            if (bike.images && bike.images.length > 0) {
                const imagePath = bike.images[0];
                const isUrl = imagePath.startsWith('http');

                if (!isUrl) {
                    attachments.push({
                        filename: 'bike.jpg',
                        path: imagePath,
                        cid: 'bikeimage'
                    });
                    imageHtml = `<img src="cid:bikeimage" alt="Bike Image" style="width: 100%; max-width: 600px; border-radius: 10px; margin-bottom: 20px;" />`;
                } else {
                    imageHtml = `<img src="${imagePath}" alt="Bike Image" style="width: 100%; max-width: 600px; border-radius: 10px; margin-bottom: 20px;" />`;
                }
            }

            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #ea580c; text-align: center;">RIDEHUB Update</h2>
                        <div style="background-color: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
                            ${imageHtml}
                            <h3 style="margin-top: 0;">${subject}</h3>
                            <p style="white-space: pre-wrap; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                            
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                                <h4 style="margin: 0 0 10px 0;">Bike Details:</h4>
                                <table style="width: 100%; font-size: 14px;">
                                    <tr>
                                        <td style="padding: 5px 0; color: #666;">Model:</td>
                                        <td style="padding: 5px 0; font-weight: bold;">${bike.model} (${bike.modelYear})</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666;">Brand:</td>
                                        <td style="padding: 5px 0; font-weight: bold;">${bike.brand}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #666;">Ref ID:</td>
                                        <td style="padding: 5px 0; font-family: monospace;">${bike._id.toString().slice(-8).toUpperCase()}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                            © ${new Date().getFullYear()} RIDEHUB. All rights reserved.
                        </p>
                    </div>
                </div>
            `;

            await sendEmail({
                email: emailToUse,
                subject: subject,
                message: message,
                html: htmlMessage,
                attachments: attachments
            });
        } catch (err) {
            console.error('Email notification error:', err);
        }
    }
};

module.exports = notifyUserUpdate;
