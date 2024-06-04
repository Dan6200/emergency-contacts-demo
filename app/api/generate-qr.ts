import { type NextApiRequest, type NextApiResponse } from "next";
import * as crypto from "crypto";

const generateQR = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = crypto.randomBytes(64).toString("hex");
  let channel_data =
    new Date().getDate() +
    "-" +
    new Date().getMonth() +
    "-" +
    new Date().getMinutes();
  let channel_data_hash = crypto
    .createHash("md5")
    .update(channel_data + "||" + token)
    .digest("hex");

  return res.status(200).json({
    success: true,
    msg: "QR DATA Created",
    data: {
      channel: channel_data_hash,
    },
  });
};
