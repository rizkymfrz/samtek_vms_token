export const RECOGNIZER_LIST = /^[a-z_]{1,64}(,[a-z_]{1,64})*$/;
export const recognizerList = (recognizer: string) => recognizer.split(",");
