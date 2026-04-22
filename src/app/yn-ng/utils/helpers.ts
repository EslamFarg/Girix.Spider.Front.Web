import { FormGroup } from '@angular/forms';

export function generateCode(length: number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateNumber(length: number) {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function shakeScreen() {
  document.body.classList.add('shake');
  setTimeout(() => {
    document.body.classList.remove('shake');
  }, 1000);
}

export function getEnumMap(enumObj: any): { label: string; value: number }[] {
  return Object.keys(enumObj)
    .slice(Object.keys(enumObj).length / 2)
    .map((key) => ({ label: key, value: enumObj[key] }));
}

export function omitKeys(obj: Object, keysToOmit: string[]) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keysToOmit.includes(key)));
}

export function getFormFields(form: FormGroup, keysToGet: string[]): any {
  const raw = form.getRawValue();
  return Object.fromEntries(Object.entries(raw).filter(([key]) => keysToGet.includes(key)));
}

function isArabic(str: string): boolean {
  return localStorage.getItem('lang') === 'ar';
}

export async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  let file = new File([blob], filename + getExtensionFromMime(blob.type), { type: blob.type });
  return file;
}

function getExtensionFromMime(type: string): string {
  //map all image types
  switch (type) {
    case 'image/jpeg':
      return '.jpeg';
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/bmp':
      return '.bmp';
    case 'image/tiff':
      return '.tiff';
    case 'image/webp':
      return '.webp';
    case 'image/avif':
      return '.avif';
    case 'image/svg+xml':
      return '.svg';
    case 'image/vnd.adobe.photoshop':
      return '.psd';
    case 'image/x-icon':
      return '.ico';
    case 'image/vnd.microsoft.icon':
      return '.ico';
    case 'image/vnd.djvu':
      return '.djvu';
    case 'image/vnd.wap.wbmp':
      return '.wbmp';
    case 'image/x-xcf':
      return '.xcf';

    default:
      return ''; // fallback
  }
}

export function validateColor(value: string) {
  if (value.length > 0 && value[0] == '#') {
    return value;
  }

  return 'transparent';
}

export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function UTCToLocalInput(isoString: string) {
  console.log(isoString);
  const date = new Date(isoString);
  console.log(isoString +" --- " +date);
  date.setMinutes(date.getMinutes() - new Date().getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
export function localInputToUTC(localValue : string) {
  const date = new Date(localValue);  
  return date.toISOString();
}
