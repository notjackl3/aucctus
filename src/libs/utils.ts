
/** Validate Email
 * 
 * @param email 
 * @returns 
 */
export const validEmail = (email: string) => {
  return email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};


/** Validate Domain
 * 
 * @param domain 
 * @returns 
 */
export const validDomain = (domain: string) => {
  return domain.toLowerCase().match(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
}


/** Generate Random String
 * 
 * @param length 
 * @returns 
 */
export function generateRandomString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function differenceInHours(firstDate: Date, secondDate: Date) {
  let difference = (firstDate.getTime() - secondDate.getTime()) / 1000;
  difference /= (60 * 60);
  return Math.abs(Math.round(difference));

}