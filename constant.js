import { generate } from "randomstring";
import fs from "fs";

export const SUCCESS = "Success";
export const SOMTHING_WENT_WRONG = "Somthing went wrong";
export const INTERNAL_SERVER_ERROR = "Internal server error";
export const EMAIL_ALREADY_EXIST = "Email already exist";
export const USER_DOES_NOT_EXIST = "User does not exist";
export const PASSWORD_NOT_MATCH = "Password is not match";
export const USER_REGISTERED_SUCCESSFULLY = "User registered successfully";

export const fileUpload = async (file, type) => {
  if (!Array.isArray(file)) file = [file];
  let images = Promise.all(
    file.map(async (x) => {
      let name = x.name;
      let mimeType = x.mimetype.split("/")[0];
      let ext = x.name.split(".");
      ext = ext[ext.length - 1];
      name = generate({
        length: 15,
      });
      const dirname = import.meta.dirname;
      let filePath = `${dirname}/uploads/${mimeType}/${type}/${name}.${ext}`;
      if (!fs.existsSync(`${dirname}/uploads/${mimeType}`))
        await fs.mkdir(`${dirname}/uploads/${mimeType}`, () => {});
      if (!fs.existsSync(`${dirname}/uploads/${mimeType}/${type}`))
        await fs.mkdir(`${dirname}/uploads/${mimeType}/${type}`, () => {});
      await x.mv(filePath);
      return `/uploads/${mimeType}/${type}/${name}.${ext}`;
    })
  );
  return images;
};
